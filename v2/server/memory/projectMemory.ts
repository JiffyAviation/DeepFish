/**
 * Project Memory System - Persistent Agentic Memory
 * Enables bots to remember project context across sessions
 */

import { readFile, writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

// Compact notation types
export interface Feature {
    i: string;      // id (short)
    s: 'P' | 'F' | 'W' | 'Q' | 'B' | 'S';  // status (Passing/Failing/Working/Queued/Blocked/Skipped)
    a: string;      // assigned bot
    t: number;      // timestamp
    n?: string;     // notes (optional)
}

export interface ProjectFeatures {
    p: string;      // project id
    created: number;
    f: Feature[];   // features array
}

export interface TestResult {
    s: 'P' | 'F';   // status
    t: string;      // test type (unit/integration/manual)
    ts: number;     // timestamp
    e?: string;     // error message (if failed)
}

// Action codes for progress log
export type Action =
    | 'START'
    | 'RESEARCH'
    | 'DESIGN'
    | 'IMPLEMENT'
    | 'TEST'
    | 'FIX'
    | 'COMPLETE'
    | 'FAIL'
    | 'BLOCK';

/**
 * Project Memory Manager
 */
export class ProjectMemory {
    private projectsDir = join(process.cwd(), 'data', 'projects');

    /**
     * Create a new project with initial features
     */
    async createProject(
        projectId: string,
        features: Array<{ id: string, assignedTo: string }>
    ): Promise<void> {
        const projectDir = join(this.projectsDir, projectId);

        // Create project directory
        if (!existsSync(projectDir)) {
            await mkdir(projectDir, { recursive: true });
        }

        // Create features.json
        const projectFeatures: ProjectFeatures = {
            p: projectId,
            created: Date.now(),
            f: features.map(f => ({
                i: f.id,
                s: 'Q', // Queued
                a: f.assignedTo,
                t: Date.now()
            }))
        };

        await writeFile(
            join(projectDir, 'features.json'),
            JSON.stringify(projectFeatures, null, 2)
        );

        // Create empty progress.log
        await writeFile(join(projectDir, 'progress.log'), '');

        // Create empty test-results.json
        await writeFile(join(projectDir, 'test-results.json'), '{}');

        // Log initialization
        await this.appendProgress(
            projectId,
            'mei',
            'START',
            projectId,
            `Initialized project with ${features.length} features`
        );

        logger.info(`[ProjectMemory] Created project: ${projectId}`);
    }

    /**
     * Read project features
     */
    async readFeatures(projectId: string): Promise<ProjectFeatures> {
        const path = join(this.projectsDir, projectId, 'features.json');
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    }

    /**
     * Update a specific feature
     */
    async updateFeature(
        projectId: string,
        featureId: string,
        update: Partial<Feature>
    ): Promise<void> {
        const features = await this.readFeatures(projectId);
        const feature = features.f.find(f => f.i === featureId);

        if (!feature) {
            throw new Error(`Feature ${featureId} not found in project ${projectId}`);
        }

        Object.assign(feature, update, { t: Date.now() });

        await writeFile(
            join(this.projectsDir, projectId, 'features.json'),
            JSON.stringify(features, null, 2)
        );

        logger.info(`[ProjectMemory] Updated feature ${featureId}: ${JSON.stringify(update)}`);
    }

    /**
     * Append to progress log (compact notation)
     */
    async appendProgress(
        projectId: string,
        botId: string,
        action: Action,
        featureId: string,
        note?: string,
        status?: Feature['s'],
        error?: string
    ): Promise<void> {
        const timestamp = Date.now();

        // Build compact notation entry
        let entry = `[T:${timestamp}][B:${botId}][A:${action}][F:${featureId}]`;

        if (status) entry += `[S:${status}]`;
        if (note) entry += `[N:${note}]`;
        if (error) entry += `[E:${error}]`;

        await appendFile(
            join(this.projectsDir, projectId, 'progress.log'),
            entry + '\n'
        );

        logger.info(`[ProjectMemory] Progress: ${entry}`);
    }

    /**
     * Read progress log
     */
    async readProgress(projectId: string, featureId?: string): Promise<string[]> {
        const path = join(this.projectsDir, projectId, 'progress.log');
        const content = await readFile(path, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        if (featureId) {
            return lines.filter(l => l.includes(`[F:${featureId}]`));
        }

        return lines;
    }

    /**
     * Update test results
     */
    async updateTestResult(
        projectId: string,
        featureId: string,
        result: TestResult
    ): Promise<void> {
        const path = join(this.projectsDir, projectId, 'test-results.json');
        const content = await readFile(path, 'utf-8');
        const results = JSON.parse(content);

        results[featureId] = result;

        await writeFile(path, JSON.stringify(results, null, 2));

        logger.info(`[ProjectMemory] Test result for ${featureId}: ${result.s}`);
    }

    /**
     * Get test results
     */
    async getTestResults(projectId: string): Promise<Record<string, TestResult>> {
        const path = join(this.projectsDir, projectId, 'test-results.json');
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    }

    /**
     * Get bot's assigned features
     */
    async getBotFeatures(projectId: string, botId: string): Promise<Feature[]> {
        const features = await this.readFeatures(projectId);
        return features.f.filter(f => f.a === botId);
    }

    /**
     * Get next failing feature for a bot
     */
    async getNextFailingFeature(projectId: string, botId: string): Promise<Feature | null> {
        const features = await this.getBotFeatures(projectId, botId);
        return features.find(f => f.s === 'F') || null;
    }

    /**
     * Check if project exists
     */
    projectExists(projectId: string): boolean {
        return existsSync(join(this.projectsDir, projectId));
    }

    /**
     * List all projects
     */
    async listProjects(): Promise<string[]> {
        if (!existsSync(this.projectsDir)) {
            return [];
        }
        const { readdir } = await import('fs/promises');
        return await readdir(this.projectsDir);
    }
}

// Singleton instance
export const projectMemory = new ProjectMemory();
