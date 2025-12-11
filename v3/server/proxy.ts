/**
 * DeepFish API Proxy Server
 * Keeps API keys secure on the server-side
 */

import 'dotenv/config'; // Load .env file
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images

// Serve static files from the React app build directory
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible dist paths (Railway may have different structure)
const possibleDistPaths = [
    path.join(__dirname, '../dist'),           // Normal: server/proxy.ts -> dist/
    path.join(__dirname, '../../dist'),        // If nested deeper
    path.join(process.cwd(), 'dist'),          // From current working directory
    '/app/dist'                                // Railway default app directory
];

// Find the first dist path that exists
let distPath = possibleDistPaths[0]; // default
for (const p of possibleDistPaths) {
    if (fs.existsSync(p)) {
        distPath = p;
        console.log(`✅ Found dist at: ${p}`);
        break;
    } else {
        console.log(`❌ Dist not at: ${p}`);
    }
}

// Debug logging for deployment
console.log(`📁 Server directory: ${__dirname}`);
console.log(`📁 CWD: ${process.cwd()}`);
console.log(`📁 Using dist path: ${distPath}`);
console.log(`📁 Dist exists: ${fs.existsSync(distPath)}`);
if (fs.existsSync(distPath)) {
    console.log(`📁 Dist contents: ${fs.readdirSync(distPath).join(', ')}`);
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
        console.log(`📁 Assets contents: ${fs.readdirSync(assetsPath).join(', ')}`);
    }
}

// Serve static files if dist exists - MUST come before catch-all route
if (fs.existsSync(distPath)) {
    // Log all requests to see what's happening
    app.use((req, res, next) => {
        if (req.path.startsWith('/assets/')) {
            console.log(`📦 Asset request: ${req.path}`);
            const fullPath = path.join(distPath, req.path);
            console.log(`📦 Full path: ${fullPath}`);
            console.log(`📦 File exists: ${fs.existsSync(fullPath)}`);
        }
        next();
    });

    app.use(express.static(distPath));
}

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/generate
 * Proxies requests to Google Gemini API
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, model = 'gemini-1.5-flash-latest', systemInstruction, history, tools } = req.body;

        // Validation
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt' });
        }

        if (prompt.length > 100000) {
            return res.status(400).json({ error: 'Prompt too long (max 100,000 characters)' });
        }

        // Create model with configuration
        const modelInstance = genAI.getGenerativeModel({
            model,
            systemInstruction,
            generationConfig: {
                temperature: 0.7,
            },
            tools: tools || undefined
        });

        // Generate content
        let result;
        if (history && history.length > 0) {
            // Chat mode with history
            const chat = modelInstance.startChat({
                history: history.slice(0, -1) // All but last message
            });
            result = await chat.sendMessage(prompt);
        } else {
            // Single generation
            result = await modelInstance.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        const functionCalls = response.functionCalls();

        res.json({
            text,
            functionCalls: functionCalls || [],
            candidates: response.candidates
        });

    } catch (error: any) {
        console.error('[API Proxy] Error:', error);

        if (error.message?.includes('503')) {
            return res.status(503).json({ error: 'Service temporarily unavailable' });
        }

        res.status(500).json({
            error: error.message || 'Failed to generate content'
        });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
});

// EXPLICIT route for assets - this MUST work
app.get('/assets/*', (req, res) => {
    const assetPath = path.join(distPath, req.path);
    console.log(`🔥 ASSET ROUTE: ${req.path} -> ${assetPath}`);
    if (fs.existsSync(assetPath)) {
        console.log(`✅ File exists, sending`);
        res.sendFile(assetPath);
    } else {
        console.log(`❌ File not found at ${assetPath}`);
        res.status(404).send('Asset not found');
    }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🔒 DeepFish API Proxy running on http://localhost:${PORT}`);
    console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
