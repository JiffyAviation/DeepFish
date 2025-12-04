/**
 * DeepFish Agent Loader Service
 * Loads factory .fsh files and merges with user .user.json files at runtime
 * No permanent blending - files stay separate on disk
 */

import { AgentProfile, FishSkillFile, UserTraining } from './types';
import fs from 'fs/promises';
import path from 'path';

export class AgentLoader {
  private agentsPath: string;
  private loadedAgents: Map<string, AgentProfile> = new Map();

  constructor(agentsPath: string = 'C:\\DeepFish') {
    this.agentsPath = agentsPath;
  }

  /**
   * Load agent by combining factory .fsh + user .user.json
   * Merges at runtime only - never saves blended version
   */
  async loadAgent(agentId: string): Promise<AgentProfile> {
    // Load factory settings (read-only)
    const factoryFile = path.join(this.agentsPath, `${agentId}.fsh`);
    const factory = await this.readFSH(factoryFile);
    
    // Load user customizations (read-write, may not exist)
    const userFile = path.join(this.agentsPath, `${agentId}.user.json`);
    const userTraining = await this.readUserTraining(userFile);
    
    // Merge in memory for this runtime session
    const profile = this.mergeAgentData(factory, userTraining);
    
    this.loadedAgents.set(agentId, profile);
    return profile;
  }

  /**
   * Load all available agents from C:\DeepFish
   */
  async loadAllAgents(): Promise<AgentProfile[]> {
    const files = await fs.readdir(this.agentsPath);
    const fshFiles = files.filter(f => f.endsWith('.fsh'));
    
    const agents = await Promise.all(
      fshFiles.map(async (file) => {
        const agentId = file.replace('.fsh', '');
        return await this.loadAgent(agentId);
      })
    );
    
    return agents;
  }

  /**
   * Read factory .fsh file (DeepFish property)
   */
  private async readFSH(filepath: string): Promise<FishSkillFile> {
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      const fsh = JSON.parse(data) as FishSkillFile;
      this.validateFSH(fsh);
      return fsh;
    } catch (error) {
      throw new Error(`Failed to load agent factory file: ${filepath}`);
    }
  }

  /**
   * Read user training file (user's personal data)
   * Returns empty object if file doesn't exist (first-time use)
   */
  private async readUserTraining(filepath: string): Promise<UserTraining> {
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data) as UserTraining;
    } catch (error) {
      // File doesn't exist yet - return empty training
      return {
        version: '1.0',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        customPrompts: [],
        learnedFacts: [],
        userPreferences: {},
        conversationMemory: []
      };
    }
  }

  /**
   * Merge factory settings with user training at runtime
   * This merge ONLY happens in memory - files stay separate
   */
  private mergeAgentData(factory: FishSkillFile, user: UserTraining): AgentProfile {
    // Start with factory base prompt
    let enhancedPrompt = factory.personality.basePrompt;
    
    // Layer user customizations on top
    if (user.customPrompts.length > 0) {
      enhancedPrompt += '\n\n--- USER CUSTOMIZATIONS ---\n';
      enhancedPrompt += user.customPrompts.join('\n');
    }
    
    if (user.learnedFacts.length > 0) {
      enhancedPrompt += '\n\n--- LEARNED CONTEXT ---\n';
      enhancedPrompt += user.learnedFacts.join('\n');
    }
    
    if (user.userPreferences && Object.keys(user.userPreferences).length > 0) {
      enhancedPrompt += '\n\n--- USER PREFERENCES ---\n';
      enhancedPrompt += JSON.stringify(user.userPreferences, null, 2);
    }
    
    // Build runtime profile
    return {
      id: factory.agent.id,
      name: factory.agent.name,
      title: factory.agent.title,
      description: factory.agent.description,
      icon: factory.agent.icon,
      color: factory.agent.color,
      model: factory.capabilities.model,
      hookName: factory.capabilities.hookName,
      voiceId: factory.capabilities.voiceId,
      basePrompt: enhancedPrompt, // Enhanced with user training
      isCore: factory.agent.isCore || false,
      version: factory.agent.version,
      // User training metadata (for UI display)
      userTrainingActive: user.customPrompts.length > 0 || user.learnedFacts.length > 0
    };
  }

  /**
   * Process ephemeral training material (PDF, URL, text)
   * Extracts knowledge, adds to user.json, DISCARDS original
   */
  async trainAgent(
    agentId: string, 
    trainingMaterial: string, 
    materialType: 'pdf' | 'url' | 'text'
  ): Promise<void> {
    // 1. Extract knowledge from material (ephemeral processing)
    const extractedKnowledge = await this.extractKnowledge(trainingMaterial, materialType);
    
    // 2. Load existing user training
    const userFile = path.join(this.agentsPath, `${agentId}.user.json`);
    const userTraining = await this.readUserTraining(userFile);
    
    // 3. Add distilled knowledge to user.json
    userTraining.learnedFacts.push(...extractedKnowledge);
    userTraining.updated = new Date().toISOString();
    
    // 4. Save updated user training
    await this.saveUserTraining(userFile, userTraining);
    
    // 5. ORIGINAL MATERIAL IS NEVER SAVED - only distilled knowledge
    console.log(`Training material processed and discarded. Knowledge added to ${agentId}.user.json`);
  }

  /**
   * Extract knowledge from training material (ephemeral)
   * This is where AI processing happens to distill raw material into training data
   */
  private async extractKnowledge(material: string, type: string): Promise<string[]> {
    // TODO: Integrate with AI service to analyze and extract key concepts
    // For now, return placeholder
    return [
      `Learned from ${type}: [distilled concept 1]`,
      `Learned from ${type}: [distilled concept 2]`
    ];
  }

  /**
   * Save user training back to disk
   */
  private async saveUserTraining(filepath: string, training: UserTraining): Promise<void> {
    await fs.writeFile(filepath, JSON.stringify(training, null, 2), 'utf-8');
  }

  /**
   * Factory reset: delete user training file
   */
  async resetAgent(agentId: string): Promise<void> {
    const userFile = path.join(this.agentsPath, `${agentId}.user.json`);
    try {
      await fs.unlink(userFile);
      console.log(`${agentId} reset to factory settings`);
    } catch (error) {
      // File doesn't exist - already at factory state
    }
  }

  /**
   * Validate .fsh file structure
   */
  private validateFSH(fsh: FishSkillFile): void {
    if (!fsh.schema_version) throw new Error('Missing schema_version');
    if (!fsh.agent || !fsh.agent.id) throw new Error('Invalid agent definition');
    if (!fsh.capabilities || !fsh.capabilities.model) throw new Error('Missing capabilities');
    if (!fsh.personality || !fsh.personality.basePrompt) throw new Error('Missing personality');
  }

  /**
   * Export user training for backup (user's responsibility)
   */
  async exportUserTraining(agentId: string, exportPath: string): Promise<void> {
    const userFile = path.join(this.agentsPath, `${agentId}.user.json`);
    const training = await this.readUserTraining(userFile);
    await fs.writeFile(exportPath, JSON.stringify(training, null, 2), 'utf-8');
  }

  /**
   * Import user training from backup
   */
  async importUserTraining(agentId: string, importPath: string): Promise<void> {
    const data = await fs.readFile(importPath, 'utf-8');
    const training = JSON.parse(data) as UserTraining;
    const userFile = path.join(this.agentsPath, `${agentId}.user.json`);
    await this.saveUserTraining(userFile, training);
  }
}
