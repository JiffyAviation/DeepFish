/**
 * Priority Manager
 * Manages project priorities and reminds user of critical/important work
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

type Priority = 'A' | 'B' | 'C' | 'D';

interface ProjectWithPriority {
    projectId: string;
    priority: Priority;
    description: string;
    domain: string;
    lastUpdated: number;
}

export class PriorityManager {
    private projectsDir = join(process.cwd(), 'data', 'projects');

    /**
     * Get priority description
     */
    getPriorityDescription(priority: Priority): string {
        const descriptions = {
            A: 'CRITICAL - Must complete immediately',
            B: 'IMPORTANT - High priority, complete soon',
            C: 'NORMAL - Do when workload is slow',
            D: 'ON HOLD - Project alive but paused'
        };
        return descriptions[priority];
    }

    /**
     * Get priority color for display
     */
    getPriorityColor(priority: Priority): (text: string) => string {
        const colors = {
            A: chalk.red.bold,
            B: chalk.yellow.bold,
            C: chalk.cyan,
            D: chalk.gray
        };
        return colors[priority];
    }

    /**
     * Set project priority
     */
    async setPriority(projectId: string, priority: Priority): Promise<void> {
        const featuresPath = join(this.projectsDir, projectId, 'features.json');

        if (!existsSync(featuresPath)) {
            throw new Error(`Project ${projectId} not found`);
        }

        const content = await readFile(featuresPath, 'utf-8');
        const data = JSON.parse(content);

        data.metadata.priority = priority;
        data.metadata.priorityUpdated = Date.now();

        await writeFile(featuresPath, JSON.stringify(data, null, 2));
    }

    /**
     * Get all projects by priority
     */
    async getProjectsByPriority(): Promise<Record<Priority, ProjectWithPriority[]>> {
        if (!existsSync(this.projectsDir)) {
            return { A: [], B: [], C: [], D: [] };
        }

        const projects: Record<Priority, ProjectWithPriority[]> = {
            A: [],
            B: [],
            C: [],
            D: []
        };

        const projectDirs = await readdir(this.projectsDir);

        for (const projectId of projectDirs) {
            const featuresPath = join(this.projectsDir, projectId, 'features.json');

            if (!existsSync(featuresPath)) continue;

            const content = await readFile(featuresPath, 'utf-8');
            const data = JSON.parse(content);

            if (!data.metadata || !data.metadata.priority) continue;

            const priority = data.metadata.priority as Priority;

            projects[priority].push({
                projectId,
                priority,
                description: data.metadata.description || 'No description',
                domain: data.metadata.domain || 'unknown',
                lastUpdated: data.metadata.priorityUpdated || data.metadata.created
            });
        }

        // Sort each priority by last updated (most recent first)
        for (const priority of ['A', 'B', 'C', 'D'] as Priority[]) {
            projects[priority].sort((a, b) => b.lastUpdated - a.lastUpdated);
        }

        return projects;
    }

    /**
     * Get critical/important projects for reminder
     */
    async getCriticalProjects(): Promise<{
        critical: ProjectWithPriority[];
        important: ProjectWithPriority[];
    }> {
        const allProjects = await this.getProjectsByPriority();

        return {
            critical: allProjects.A,
            important: allProjects.B
        };
    }

    /**
     * Show end-of-session reminder
     */
    async showEndOfSessionReminder(): Promise<void> {
        const { critical, important } = await this.getCriticalProjects();

        if (critical.length === 0 && important.length === 0) {
            return; // No reminders needed
        }

        console.log(chalk.bold('\n⚠️  OUTSTANDING PROJECTS\n'));

        if (critical.length > 0) {
            console.log(chalk.red.bold('🔴 CRITICAL (A):'));
            for (const project of critical) {
                console.log(`  ${project.projectId} - ${project.description}`);
            }
            console.log();
        }

        if (important.length > 0) {
            console.log(chalk.yellow.bold('🟡 IMPORTANT (B):'));
            for (const project of important) {
                console.log(`  ${project.projectId} - ${project.description}`);
            }
            console.log();
        }

        console.log(chalk.gray('Remember to work on these projects!\n'));
    }

    /**
     * Get Mei's workload by priority
     */
    async getMeiWorkload(): Promise<{
        immediate: string[];      // Priority A
        highPriority: string[];   // Priority B
        whenSlow: string[];       // Priority C
        onHold: string[];         // Priority D
    }> {
        const projects = await this.getProjectsByPriority();

        return {
            immediate: projects.A.map(p => p.projectId),
            highPriority: projects.B.map(p => p.projectId),
            whenSlow: projects.C.map(p => p.projectId),
            onHold: projects.D.map(p => p.projectId)
        };
    }

    /**
     * Format priority for Mei's context
     */
    async formatMeiContext(): Promise<string> {
        const workload = await this.getMeiWorkload();

        let context = '📋 PROJECT PRIORITIES:\n\n';

        if (workload.immediate.length > 0) {
            context += '🔴 CRITICAL (A) - Work on these IMMEDIATELY:\n';
            for (const projectId of workload.immediate) {
                context += `  - ${projectId}\n`;
            }
            context += '\n';
        }

        if (workload.highPriority.length > 0) {
            context += '🟡 IMPORTANT (B) - High priority:\n';
            for (const projectId of workload.highPriority) {
                context += `  - ${projectId}\n`;
            }
            context += '\n';
        }

        if (workload.whenSlow.length > 0) {
            context += '🔵 NORMAL (C) - When workload is slow:\n';
            for (const projectId of workload.whenSlow) {
                context += `  - ${projectId}\n`;
            }
            context += '\n';
        }

        if (workload.onHold.length > 0) {
            context += '⚪ ON HOLD (D) - Paused:\n';
            for (const projectId of workload.onHold) {
                context += `  - ${projectId}\n`;
            }
            context += '\n';
        }

        context += 'Prioritize work accordingly. Focus on A and B projects first.\n';

        return context;
    }
}

// Singleton
export const priorityManager = new PriorityManager();

/**
 * Example usage:
 * 
 * // Set priority at end of session
 * await priorityManager.setPriority('rocket-001', 'A');
 * 
 * // Show reminder when closing
 * await priorityManager.showEndOfSessionReminder();
 * 
 * // Mei gets workload context
 * const context = await priorityManager.formatMeiContext();
 */
