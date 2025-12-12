/**
 * Memory Decay System
 * Automatically archives old projects and cleans up stale memories
 */

import { readdir, stat, rename, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

interface StaleProject {
    projectId: string;
    lastModified: number;
    daysOld: number;
    path: string;
}

export class MemoryDecay {
    private projectsDir = join(process.cwd(), 'data', 'projects');
    private dumpsterDir = join(process.cwd(), 'data', 'dumpster');

    private readonly STALE_DAYS = 30;      // Move to dumpster after 30 days
    private readonly DUMPSTER_DAYS = 90;   // Delete from dumpster after 90 days

    /**
     * Find projects that haven't been used in 30+ days
     */
    async findStaleProjects(): Promise<StaleProject[]> {
        if (!existsSync(this.projectsDir)) {
            return [];
        }

        const now = Date.now();
        const staleProjects: StaleProject[] = [];
        const projectDirs = await readdir(this.projectsDir);

        for (const projectId of projectDirs) {
            const projectPath = join(this.projectsDir, projectId);
            const stats = await stat(projectPath);

            const daysOld = Math.floor((now - stats.mtimeMs) / (1000 * 60 * 60 * 24));

            if (daysOld >= this.STALE_DAYS) {
                staleProjects.push({
                    projectId,
                    lastModified: stats.mtimeMs,
                    daysOld,
                    path: projectPath
                });
            }
        }

        return staleProjects.sort((a, b) => b.daysOld - a.daysOld);
    }

    /**
     * Move stale projects to dumpster
     */
    async moveToDumpster(projectId: string): Promise<void> {
        const sourcePath = join(this.projectsDir, projectId);

        if (!existsSync(sourcePath)) {
            throw new Error(`Project ${projectId} not found`);
        }

        // Create dumpster if it doesn't exist
        if (!existsSync(this.dumpsterDir)) {
            await mkdir(this.dumpsterDir, { recursive: true });
        }

        const destPath = join(this.dumpsterDir, projectId);

        await rename(sourcePath, destPath);

        logger.info(`[MemoryDecay] Moved ${projectId} to dumpster (stale project)`);
    }

    /**
     * Find projects in dumpster older than 90 days
     */
    async findExpiredDumpster(): Promise<StaleProject[]> {
        if (!existsSync(this.dumpsterDir)) {
            return [];
        }

        const now = Date.now();
        const expired: StaleProject[] = [];
        const dumpsterDirs = await readdir(this.dumpsterDir);

        for (const projectId of dumpsterDirs) {
            const projectPath = join(this.dumpsterDir, projectId);
            const stats = await stat(projectPath);

            const daysOld = Math.floor((now - stats.mtimeMs) / (1000 * 60 * 60 * 24));

            if (daysOld >= this.DUMPSTER_DAYS) {
                expired.push({
                    projectId,
                    lastModified: stats.mtimeMs,
                    daysOld,
                    path: projectPath
                });
            }
        }

        return expired.sort((a, b) => b.daysOld - a.daysOld);
    }

    /**
     * Permanently delete project from dumpster
     */
    async deleteFromDumpster(projectId: string): Promise<void> {
        const projectPath = join(this.dumpsterDir, projectId);

        if (!existsSync(projectPath)) {
            throw new Error(`Project ${projectId} not in dumpster`);
        }

        await rm(projectPath, { recursive: true, force: true });

        logger.warn(`[MemoryDecay] DELETED ${projectId} from dumpster (90+ days old)`);
    }

    /**
     * Restore project from dumpster
     */
    async restoreFromDumpster(projectId: string): Promise<void> {
        const sourcePath = join(this.dumpsterDir, projectId);

        if (!existsSync(sourcePath)) {
            throw new Error(`Project ${projectId} not in dumpster`);
        }

        const destPath = join(this.projectsDir, projectId);

        await rename(sourcePath, destPath);

        logger.info(`[MemoryDecay] Restored ${projectId} from dumpster`);
    }

    /**
     * Run automatic cleanup on app startup
     */
    async runStartupCleanup(): Promise<{
        movedToDumpster: string[];
        readyToDelete: string[];
        warnings: string[];
    }> {
        const results = {
            movedToDumpster: [] as string[],
            readyToDelete: [] as string[],
            warnings: [] as string[]
        };

        // Find and move stale projects
        const staleProjects = await this.findStaleProjects();

        for (const project of staleProjects) {
            await this.moveToDumpster(project.projectId);
            results.movedToDumpster.push(project.projectId);
            results.warnings.push(
                `⚠️  ${project.projectId} (${project.daysOld} days old) → Moved to dumpster`
            );
        }

        // Find expired dumpster items (but don't delete yet - warn user)
        const expiredProjects = await this.findExpiredDumpster();

        for (const project of expiredProjects) {
            results.readyToDelete.push(project.projectId);
            results.warnings.push(
                `🗑️  ${project.projectId} (${project.daysOld} days in dumpster) → Ready for deletion`
            );
        }

        return results;
    }

    /**
     * Get dumpster summary
     */
    async getDumpsterSummary(): Promise<{
        totalProjects: number;
        projects: Array<{
            projectId: string;
            daysInDumpster: number;
            willDeleteIn: number;
        }>;
    }> {
        if (!existsSync(this.dumpsterDir)) {
            return { totalProjects: 0, projects: [] };
        }

        const now = Date.now();
        const dumpsterDirs = await readdir(this.dumpsterDir);
        const projects = [];

        for (const projectId of dumpsterDirs) {
            const projectPath = join(this.dumpsterDir, projectId);
            const stats = await stat(projectPath);

            const daysInDumpster = Math.floor((now - stats.mtimeMs) / (1000 * 60 * 60 * 24));
            const willDeleteIn = Math.max(0, this.DUMPSTER_DAYS - daysInDumpster);

            projects.push({
                projectId,
                daysInDumpster,
                willDeleteIn
            });
        }

        return {
            totalProjects: projects.length,
            projects: projects.sort((a, b) => a.willDeleteIn - b.willDeleteIn)
        };
    }
}

// Singleton
export const memoryDecay = new MemoryDecay();

/**
 * Example usage:
 * 
 * // On app startup
 * const cleanup = await memoryDecay.runStartupCleanup();
 * console.log('Moved to dumpster:', cleanup.movedToDumpster);
 * console.log('Ready to delete:', cleanup.readyToDelete);
 * 
 * // User can restore if needed
 * await memoryDecay.restoreFromDumpster('rocket-001');
 * 
 * // Or permanently delete
 * await memoryDecay.deleteFromDumpster('old-project');
 */
