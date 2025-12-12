/**
 * Admin Dashboard Routes
 * Password-protected admin endpoints
 */

import express from 'express';
import { skillsMatrix } from './skillsMatrix.js';
import { trainingInbox } from './trainingInbox.js';
import { projectMemoryViewer } from './projectMemoryViewer.ts';

const router = express.Router();

// Simple password protection (use environment variable in production)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'deepfish-admin-2025';

// Middleware: Check admin password
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const password = req.headers['x-admin-password'] || req.query.password;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

// Apply password protection to all admin routes
router.use(requireAdmin);

// ============================================
// Skills Matrix Routes
// ============================================

// Get all bot skills
router.get('/skills/matrix', async (req, res) => {
    try {
        const matrix = await skillsMatrix.getAllBotSkills();
        res.json(matrix);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get skills for specific bot
router.get('/skills/:botId', async (req, res) => {
    try {
        const skills = await skillsMatrix.getBotSkills(req.params.botId);
        res.json(skills);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Enable skill for bot
router.post('/skills/:botId/:skillId/enable', async (req, res) => {
    try {
        await skillsMatrix.enableSkill(req.params.botId, req.params.skillId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Disable skill for bot
router.post('/skills/:botId/:skillId/disable', async (req, res) => {
    try {
        await skillsMatrix.disableSkill(req.params.botId, req.params.skillId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Training Inbox Routes
// ============================================

// Get all training materials
router.get('/training/all', async (req, res) => {
    try {
        const materials = await trainingInbox.getAllTrainingMaterials();
        res.json(materials);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get training for specific bot
router.get('/training/:botId', async (req, res) => {
    try {
        const materials = await trainingInbox.getBotTraining(req.params.botId);
        res.json(materials);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get training statistics
router.get('/training/stats', async (req, res) => {
    try {
        const stats = await trainingInbox.getTrainingStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete training material
router.delete('/training/:botId/:timestamp', async (req, res) => {
    try {
        await trainingInbox.deleteTrainingMaterial(
            req.params.botId,
            parseInt(req.params.timestamp)
        );
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Project Memory Routes
// ============================================

// List all projects
router.get('/projects', async (req, res) => {
    try {
        const projects = await projectMemoryViewer.listProjects();
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get project details
router.get('/projects/:projectId', async (req, res) => {
    try {
        const details = await projectMemoryViewer.getProjectDetails(req.params.projectId);
        res.json(details);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent activity
router.get('/activity/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const activity = await projectMemoryViewer.getRecentActivity(limit);
        res.json(activity);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
