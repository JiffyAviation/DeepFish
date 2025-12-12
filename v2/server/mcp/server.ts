/**
 * DeepFish MCP Server
 * 
 * Exposes DeepFish bots as MCP tools to any compatible IDE:
 * - Antigravity (Google)
 * - VSCode (with MCP extension)
 * - Cursor (built-in MCP support)
 * - Claude Desktop
 * - Any MCP-compatible editor
 * 
 * Usage:
 * 1. User configures their IDE to use this MCP server
 * 2. DeepFish bots appear as tools in the IDE sidebar
 * 3. User chats with @oracle, @hanna, etc.
 * 4. Bots generate code/documents
 * 5. Artifacts appear in editor automatically
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Bot definitions
interface BotDefinition {
    id: string;
    name: string;
    title: string;
    description: string;
}

// Load bot configurations
async function loadBots(): Promise<BotDefinition[]> {
    const botsDir = join(process.cwd(), 'server', 'world', 'bots');

    const botIds = [
        'oracle',
        'mei',
        'julie',
        'vesper',
        'gladyce',
        'hanna',
        'root',
        'igor'
    ];

    const bots: BotDefinition[] = [];

    for (const botId of botIds) {
        try {
            const botPath = join(botsDir, `${botId}.json`);
            const botData = JSON.parse(await readFile(botPath, 'utf-8'));

            bots.push({
                id: botData.id,
                name: botData.name,
                title: botData.title,
                description: botData.description
            });
        } catch (error) {
            console.error(`Failed to load bot ${botId}:`, error);
        }
    }

    return bots;
}

// Detect artifacts in LLM response
interface Artifact {
    type: 'code' | 'document' | 'config';
    language?: string;
    filename: string;
    content: string;
}

function detectArtifacts(response: string): Artifact[] {
    const artifacts: Artifact[] = [];

    // Regex for code blocks: ```language\ncode```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(response)) !== null) {
        const language = match[1] || 'text';
        const content = match[2].trim();

        // Skip empty blocks
        if (!content) continue;

        // Suggest filename based on language
        const filename = suggestFilename(content, language, index);

        artifacts.push({
            type: determineType(language),
            language,
            filename,
            content
        });

        index++;
    }

    return artifacts;
}

function determineType(language: string): 'code' | 'document' | 'config' {
    const configLanguages = ['json', 'yaml', 'yml', 'toml', 'env'];
    const documentLanguages = ['markdown', 'md', 'txt', 'text'];

    if (configLanguages.includes(language.toLowerCase())) {
        return 'config';
    }

    if (documentLanguages.includes(language.toLowerCase())) {
        return 'document';
    }

    return 'code';
}

function suggestFilename(content: string, language: string, index: number): string {
    // Try to extract filename from comments
    const filenamePatterns = [
        /\/\/\s*(?:file:|filename:)\s*(.+)/i,  // // file: example.ts
        /#\s*(?:file:|filename:)\s*(.+)/i,     // # file: example.py
        /\/\*\s*(?:file:|filename:)\s*(.+)\s*\*\//i  // /* file: example.js */
    ];

    for (const pattern of filenamePatterns) {
        const match = content.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // Default filenames based on language
    const extensions: Record<string, string> = {
        'typescript': 'ts',
        'javascript': 'js',
        'python': 'py',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rs',
        'ruby': 'rb',
        'php': 'php',
        'swift': 'swift',
        'kotlin': 'kt',
        'tsx': 'tsx',
        'jsx': 'jsx',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yml',
        'markdown': 'md',
        'md': 'md',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'sql': 'sql',
        'sh': 'sh',
        'bash': 'sh'
    };

    const ext = extensions[language.toLowerCase()] || 'txt';
    return `artifact-${index + 1}.${ext}`;
}

// Simulate bot call (in real implementation, this would call the actual bot)
async function callBot(botId: string, request: string): Promise<string> {
    // TODO: Integrate with actual bot system
    // For now, return a placeholder response

    const botResponses: Record<string, string> = {
        oracle: `*strokes beard thoughtfully*\n\nI've analyzed your request. Here's the proven pattern:\n\n\`\`\`typescript\n// Recommended architecture\nexport function ${request.toLowerCase().replace(/\s+/g, '')}() {\n  // Implementation based on proven patterns\n  return "Implemented";\n}\n\`\`\`\n\nThis follows the pattern used in production systems since 1990.`,

        hanna: `I'll create a beautiful design for that!\n\n\`\`\`tsx\n// ${request}\nexport function Component() {\n  return (\n    <div className="beautiful-design">\n      <h1>Created by Hanna</h1>\n    </div>\n  );\n}\n\`\`\`\n\nThe design uses modern aesthetics and follows UX best practices.`,

        mei: `*taps clipboard*\n\nLet me break this down into tasks:\n\n1. ✓ Analyzed request\n2. → Creating implementation\n3. → Testing\n\nI'll track the progress!`,

        julie: `From a financial perspective, here's the analysis:\n\n\`\`\`json\n{\n  "cost_estimate": "TBD",\n  "roi_projection": "Positive",\n  "budget_impact": "Within limits"\n}\n\`\`\`\n\nThis aligns with our financial goals.`,

        gladyce: `*adjusts glasses*\n\nLet me run the calculations:\n\n\`\`\`python\n# ${request}\ndef calculate():\n    result = 42  # Calculated value\n    return result\n\`\`\`\n\nThe math checks out!`,

        vesper: `Welcome! I'll make sure this is a great experience.\n\nHere's what I recommend:\n\n\`\`\`markdown\n# User Experience Plan\n\n- Ensure comfort\n- Optimize flow\n- Delight users\n\`\`\`\n\nYour satisfaction is my priority!`,

        root: `*checks security protocols*\n\nSecurity analysis:\n\n\`\`\`yaml\n# Security Configuration\npermissions:\n  - read: true\n  - write: false\n  - execute: false\n\`\`\`\n\nFollowing principle of least privilege.`,

        igor: `*monitors deployment pipeline*\n\nDeployment strategy:\n\n\`\`\`yaml\n# CI/CD Configuration\nsteps:\n  - build\n  - test\n  - deploy\n\`\`\`\n\nPipeline is green!`
    };

    return botResponses[botId] || `I'm ${botId}, and I'll help with: ${request}`;
}

// Create and start MCP server
async function main() {
    console.error('Starting DeepFish MCP Server...');

    // Load bot definitions
    const bots = await loadBots();
    console.error(`Loaded ${bots.length} bots:`, bots.map(b => b.name).join(', '));

    // Create MCP server
    const server = new Server(
        {
            name: 'deepfish',
            version: '2.5.0',
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // Register tools (one per bot)
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools: Tool[] = bots.map(bot => ({
            name: bot.id,
            description: `${bot.name} - ${bot.title}: ${bot.description}`,
            inputSchema: {
                type: 'object',
                properties: {
                    request: {
                        type: 'string',
                        description: 'Your request or question for this bot'
                    }
                },
                required: ['request']
            }
        }));

        return { tools };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const botId = request.params.name;
        const userRequest = request.params.arguments?.request as string;

        if (!userRequest) {
            throw new Error('Request parameter is required');
        }

        console.error(`Calling bot: ${botId} with request: ${userRequest}`);

        // Call the bot
        const response = await callBot(botId, userRequest);

        // Extract artifacts
        const artifacts = detectArtifacts(response);

        console.error(`Generated ${artifacts.length} artifacts`);

        // Return response with artifacts
        return {
            content: [
                {
                    type: 'text',
                    text: response
                },
                ...artifacts.map(artifact => ({
                    type: 'resource' as const,
                    resource: {
                        uri: `file:///${artifact.filename}`,
                        mimeType: artifact.type === 'code' ? 'text/plain' : 'text/markdown',
                        text: artifact.content
                    }
                }))
            ]
        };
    });

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('DeepFish MCP Server running!');
    console.error('Available bots:', bots.map(b => `@${b.id}`).join(', '));
}

// Run server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
