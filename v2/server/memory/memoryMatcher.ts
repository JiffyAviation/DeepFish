/**
 * Memory Matcher
 * Matches user requests to relevant project memories using keywords
 */

import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface ProjectMetadata {
    id: string;
    created: number;
    keywords: string[];
    description: string;
    domain: string;
}

interface MemoryMatch {
    projectId: string;
    score: number;
    matchedKeywords: string[];
    metadata: ProjectMetadata;
}

export class MemoryMatcher {
    private projectsDir = join(process.cwd(), 'data', 'projects');

    /**
     * Extract keywords from user request
     */
    private extractKeywords(request: string): string[] {
        // Convert to lowercase, remove punctuation
        const cleaned = request.toLowerCase().replace(/[^\w\s]/g, ' ');

        // Split into words, remove common words
        const stopWords = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'should', 'could', 'can', 'may', 'might', 'must', 'i', 'you',
            'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'
        ]);

        const words = cleaned.split(/\s+/).filter(w =>
            w.length > 2 && !stopWords.has(w)
        );

        return [...new Set(words)]; // Remove duplicates
    }

    /**
     * Calculate similarity score between request and project
     */
    private calculateScore(requestKeywords: string[], projectKeywords: string[]): {
        score: number;
        matched: string[];
    } {
        const matched: string[] = [];

        for (const reqKw of requestKeywords) {
            for (const projKw of projectKeywords) {
                // Exact match
                if (reqKw === projKw) {
                    matched.push(reqKw);
                }
                // Partial match (one contains the other)
                else if (reqKw.includes(projKw) || projKw.includes(reqKw)) {
                    matched.push(reqKw);
                }
            }
        }

        // Score: percentage of request keywords that matched
        const score = matched.length / requestKeywords.length;

        return { score, matched: [...new Set(matched)] };
    }

    /**
     * Find relevant project memories for a request
     */
    async findRelevantMemories(
        request: string,
        minScore: number = 0.3,
        maxResults: number = 3
    ): Promise<MemoryMatch[]> {
        if (!existsSync(this.projectsDir)) {
            return [];
        }

        const requestKeywords = this.extractKeywords(request);
        const matches: MemoryMatch[] = [];

        // Read all project directories
        const projectDirs = await readdir(this.projectsDir);

        for (const projectId of projectDirs) {
            const featuresPath = join(this.projectsDir, projectId, 'features.json');

            if (!existsSync(featuresPath)) continue;

            const content = await readFile(featuresPath, 'utf-8');
            const data = JSON.parse(content);

            if (!data.metadata || !data.metadata.keywords) continue;

            const { score, matched } = this.calculateScore(
                requestKeywords,
                data.metadata.keywords
            );

            if (score >= minScore) {
                matches.push({
                    projectId,
                    score,
                    matchedKeywords: matched,
                    metadata: data.metadata
                });
            }
        }

        // Sort by score (highest first) and limit results
        return matches
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    /**
     * Load memory for a specific project
     */
    async loadProjectMemory(projectId: string): Promise<{
        features: any;
        progress: string[];
        tests: any;
    } | null> {
        const projectDir = join(this.projectsDir, projectId);

        if (!existsSync(projectDir)) {
            return null;
        }

        try {
            const features = JSON.parse(
                await readFile(join(projectDir, 'features.json'), 'utf-8')
            );

            const progressContent = await readFile(
                join(projectDir, 'progress.log'),
                'utf-8'
            );
            const progress = progressContent.split('\n').filter(l => l.trim());

            const tests = JSON.parse(
                await readFile(join(projectDir, 'test-results.json'), 'utf-8')
            );

            return { features, progress, tests };
        } catch (error) {
            return null;
        }
    }

    /**
     * Format memory context for bot prompt
     */
    formatMemoryContext(matches: MemoryMatch[]): string {
        if (matches.length === 0) {
            return 'No relevant project memories found.';
        }

        let context = '📋 RELEVANT PROJECT MEMORIES:\n\n';

        for (const match of matches) {
            context += `Project: ${match.projectId}\n`;
            context += `Domain: ${match.metadata.domain}\n`;
            context += `Description: ${match.metadata.description}\n`;
            context += `Matched keywords: ${match.matchedKeywords.join(', ')}\n`;
            context += `Relevance: ${(match.score * 100).toFixed(0)}%\n\n`;
        }

        context += 'Load full memory with: loadProjectMemory(projectId)\n';

        return context;
    }
}

// Singleton
export const memoryMatcher = new MemoryMatcher();

/**
 * Example usage:
 * 
 * const matches = await memoryMatcher.findRelevantMemories(
 *   "Build a rocket engine with thrust vectoring"
 * );
 * 
 * // Returns:
 * // [
 * //   {
 * //     projectId: "rocket-001",
 * //     score: 0.75,
 * //     matchedKeywords: ["rocket", "engine", "thrust"],
 * //     metadata: { ... }
 * //   }
 * // ]
 * 
 * const memory = await memoryMatcher.loadProjectMemory("rocket-001");
 * // Full project memory loaded
 */
