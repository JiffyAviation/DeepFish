/**
 * DeepFish Agent System Type Definitions
 * Types for .fsh (factory) and .user.json (personal training) files
 */

// ============================================================================
// FACTORY .FSH FILE TYPES (DeepFish Property - Read Only)
// ============================================================================

export interface FishSkillFile {
  schema_version: string;
  agent: AgentMetadata;
  capabilities: AgentCapabilities;
  personality: AgentPersonality;
  skills: string[];
  dependencies: AgentDependencies;
  metadata: FileMetadata;
}

export interface AgentMetadata {
  id: string;
  name: string;
  title: string;
  description: string;
  version: string;
  author: string;
  price?: number;
  icon: string;
  color: string;
  isCore?: boolean;
}

export interface AgentCapabilities {
  model: string;
  hookName: string;
  voiceId?: string;
  requiresImageGen?: boolean;
  requiresWebSearch?: boolean;
  requiresCodeExecution?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentPersonality {
  basePrompt: string;
  traits: string[];
  communicationStyle: string;
  expertise?: string[];
  restrictions?: string[];
}

export interface AgentDependencies {
  apiKeys: string[];
  minSystemVersion: string;
  requiredServices?: string[];
}

export interface FileMetadata {
  created: string;
  updated: string;
  license: string;
  supportEmail?: string;
  documentationUrl?: string;
}

// ============================================================================
// USER TRAINING .USER.JSON FILE TYPES (User Property - Read/Write)
// ============================================================================

export interface UserTraining {
  version: string;
  created: string;
  updated: string;
  customPrompts: string[];
  learnedFacts: string[];
  userPreferences: Record<string, any>;
  conversationMemory: ConversationMemory[];
  projectContext?: ProjectContext[];
}

export interface ConversationMemory {
  timestamp: string;
  summary: string;
  keyTopics: string[];
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

export interface ProjectContext {
  projectName: string;
  domain: string;
  technicalStack: string[];
  preferences: string[];
  constraints: string[];
}

// ============================================================================
// RUNTIME AGENT PROFILE (Merged in Memory Only)
// ============================================================================

export interface AgentProfile {
  // From .fsh
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  model: string;
  hookName: string;
  voiceId?: string;
  isCore: boolean;
  version: string;
  
  // Enhanced at runtime
  basePrompt: string; // Factory prompt + user customizations merged
  userTrainingActive?: boolean; // Has user training applied
  
  // Optional capabilities
  capabilities?: AgentCapabilities;
  skills?: string[];
}

// ============================================================================
// TRAINING MATERIAL TYPES (Ephemeral - Never Saved)
// ============================================================================

export interface TrainingMaterial {
  type: 'pdf' | 'url' | 'text' | 'image';
  content: string | Buffer;
  metadata?: {
    filename?: string;
    url?: string;
    uploadDate: string;
  };
}

export interface ExtractedKnowledge {
  concepts: string[];
  preferences: Record<string, string>;
  contextNotes: string[];
  technicalDetails?: string[];
}

// ============================================================================
// AGENT LOADER CONFIGURATION
// ============================================================================

export interface AgentLoaderConfig {
  agentsPath: string; // Default: C:\DeepFish
  autoBackup?: boolean;
  backupInterval?: number; // minutes
  maxMemorySize?: number; // MB for conversation memory
  enableTraining?: boolean;
}

// ============================================================================
// MARKETPLACE TYPES (Future)
// ============================================================================

export interface MarketplaceAgent {
  fshFile: FishSkillFile;
  downloads: number;
  rating: number;
  reviews: AgentReview[];
  requiredLicense?: 'personal' | 'commercial' | 'enterprise';
}

export interface AgentReview {
  userId: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

// ============================================================================
// BACKUP/EXPORT TYPES
// ============================================================================

export interface AgentBackup {
  agentId: string;
  factoryVersion: string;
  userTraining: UserTraining;
  exportDate: string;
  systemVersion: string;
}

export interface BulkBackup {
  agents: AgentBackup[];
  exportDate: string;
  systemVersion: string;
}

// ============================================================================
// EXISTING DEEPFISH TYPES (Compatibility)
// ============================================================================

export enum AgentId {
  ORACLE = 'ORACLE',
  VESPER = 'VESPER',
  MEI = 'MEI',
  ROOT = 'ROOT',
  IGOR = 'IGOR',
  HR = 'HR',
  ABACUS = 'ABACUS',
  SKILLZ = 'SKILLZ',
  MCP = 'MCP',
  SLASH = 'SLASH',
  CREATIVE = 'CREATIVE',
  SOCIAL = 'SOCIAL',
  SKIPPY = 'SKIPPY',
  QC = 'QC',
  SUBS = 'SUBS',
  SHIPPING = 'SHIPPING',
  IT = 'IT',
  CALL_CENTER = 'CALL_CENTER',
  LUNCHROOM = 'LUNCHROOM'
}

export interface Room {
  id: string;
  name: string;
  agentId: AgentId;
  description: string;
  themeColor: string;
  isBoardroom?: boolean;
  isLunchroom?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AgentLoadError extends Error {
  constructor(public agentId: string, message: string) {
    super(`Agent ${agentId}: ${message}`);
    this.name = 'AgentLoadError';
  }
}

export class TrainingError extends Error {
  constructor(public agentId: string, message: string) {
    super(`Training ${agentId}: ${message}`);
    this.name = 'TrainingError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
