/**
 * Admin Dashboard - Project Memory Viewer
 * View and manage persistent memory for projects
 */

import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface ProjectSummary {
    projectId: string;
    created: number;
    totalFeatures: number;
    passingFeatures: number;
    failingFeatures: number;
    workingFeatures: number;
    lastActivity: number;
}

export class ProjectMemoryViewer {
    private projectsDir = join(process.cwd(), 'data', 'projects');

    /**
     * List all projects
     */
    async listProjects(): Promise<ProjectSummary[]> {
        if (!existsSync(this.projectsDir)) {
            return [];
        }

        const projectDirs = await readdir(this.projectsDir);
        const summaries: ProjectSummary[] = [];

        for (const projectId of projectDirs) {
            const summary = await this.getProjectSummary(projectId);
            if (summary) summaries.push(summary);
        }

        return summaries.sort((a, b) => b.lastActivity - a.lastActivity);
    }

    /**
     * Get summary for a specific project
     */
    async getProjectSummary(projectId: string): Promise<ProjectSummary | null> {
        const featuresPath = join(this.projectsDir, projectId, 'features.json');

        if (!existsSync(featuresPath)) {
            return null;
        }

        const content = await readFile(featuresPath, 'utf-8');
        const features = JSON.parse(content);

        const passing = features.f.filter((f: any) => f.s === 'P').length;
        const failing = features.f.filter((f: any) => f.s === 'F').length;
        const working = features.f.filter((f: any) => f.s === 'W').length;

        const lastActivity = Math.max(...features.f.map((f: any) => f.t));

        return {
            projectId,
            created: features.created,
            totalFeatures: features.f.length,
            passingFeatures: passing,
            failingFeatures: failing,
            workingFeatures: working,
            lastActivity
        };
    }

    /**
     * Get full project details
     */
    async getProjectDetails(projectId: string): Promise<{
        features: any;
        progress: string[];
        tests: any;
    }> {
        const projectDir = join(this.projectsDir, projectId);

        const features = JSON.parse(
            await readFile(join(projectDir, 'features.json'), 'utf-8')
        );

        const progressContent = await readFile(join(projectDir, 'progress.log'), 'utf-8');
        const progress = progressContent.split('\n').filter(l => l.trim());

        const tests = JSON.parse(
            await readFile(join(projectDir, 'test-results.json'), 'utf-8')
        );

        return { features, progress, tests };
    }

    /**
     * Get recent activity across all projects
     */
    async getRecentActivity(limit: number = 10): Promise<{
        projectId: string;
        action: string;
        bot: string;
        feature: string;
        timestamp: number;
    }[]> {
        const projects = await this.listProjects();
        const activities: any[] = [];

        for (const project of projects) {
            const details = await this.getProjectDetails(project.projectId);

            for (const line of details.progress.slice(-5)) {
                const match = line.match(/\[T:(\d+)\]\[B:(\w+)\]\[A:(\w+)\]\[F:([\w-]+)\]/);
                if (match) {
                    activities.push({
                        projectId: project.projectId,
                        timestamp: parseInt(match[1]),
                        bot: match[2],
                        action: match[3],
                        feature: match[4]
                    });
                }
            }
        }

        return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
}

// Singleton
export const projectMemoryViewer = new ProjectMemoryViewer();
