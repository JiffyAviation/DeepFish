/**
 * Admin CLI Commands
 * Password-protected admin commands for managing DeepFish
 */

import { Command } from 'commander';
import { skillsMatrix } from './skillsMatrix.js';
import { trainingInbox } from './trainingInbox.js';
import { projectMemoryViewer } from './projectMemoryViewer.js';
import chalk from 'chalk';
import * as readline from 'readline';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'deepfish-admin-2025';

// Password check
async function requirePassword(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Admin password: ', (answer) => {
            rl.close();
            if (answer === ADMIN_PASSWORD) {
                console.log(chalk.green('✓ Authenticated\n'));
                resolve(true);
            } else {
                console.log(chalk.red('✗ Invalid password'));
                resolve(false);
            }
        });
    });
}

export function registerAdminCommands(program: Command) {
    const admin = program.command('admin').description('Admin dashboard commands (password required)');

    // ============================================
    // Skills Matrix Commands
    // ============================================

    admin
        .command('skills')
        .description('View skills matrix for all bots')
        .action(async () => {
            if (!await requirePassword()) return;

            const matrix = await skillsMatrix.getAllBotSkills();

            console.log(chalk.bold('\n📚 Skills Matrix\n'));

            for (const [botId, skills] of Object.entries(matrix)) {
                console.log(chalk.cyan(`\n${botId.toUpperCase()}:`));

                for (const [skillId, enabled] of Object.entries(skills)) {
                    const status = enabled ? chalk.green('✓') : chalk.red('✗');
                    console.log(`  ${status} ${skillId}`);
                }
            }
            console.log();
        });

    admin
        .command('enable-skill <botId> <skillId>')
        .description('Enable a skill for a bot')
        .action(async (botId, skillId) => {
            if (!await requirePassword()) return;

            await skillsMatrix.enableSkill(botId, skillId);
            console.log(chalk.green(`✓ Enabled ${skillId} for ${botId}`));
        });

    admin
        .command('disable-skill <botId> <skillId>')
        .description('Disable a skill for a bot')
        .action(async (botId, skillId) => {
            if (!await requirePassword()) return;

            await skillsMatrix.disableSkill(botId, skillId);
            console.log(chalk.yellow(`✗ Disabled ${skillId} for ${botId}`));
        });

    // ============================================
    // Training Inbox Commands
    // ============================================

    admin
        .command('training')
        .description('View all training materials')
        .action(async () => {
            if (!await requirePassword()) return;

            const materials = await trainingInbox.getAllTrainingMaterials();
            const stats = await trainingInbox.getTrainingStats();

            console.log(chalk.bold('\n📖 Training Inbox\n'));
            console.log(`Total materials: ${stats.totalMaterials}\n`);

            for (const [botId, botMaterials] of Object.entries(materials)) {
                if (botMaterials.length === 0) continue;

                console.log(chalk.cyan(`\n${botId.toUpperCase()} (${botMaterials.length}):`));

                for (const material of botMaterials.slice(0, 5)) {
                    const date = new Date(material.timestamp).toLocaleDateString();
                    console.log(`  ${chalk.gray(date)} [${material.type}] ${material.topic}`);
                }
            }
            console.log();
        });

    admin
        .command('training-stats')
        .description('View training statistics')
        .action(async () => {
            if (!await requirePassword()) return;

            const stats = await trainingInbox.getTrainingStats();

            console.log(chalk.bold('\n📊 Training Statistics\n'));
            console.log(`Total materials: ${stats.totalMaterials}\n`);

            console.log(chalk.cyan('By Bot:'));
            for (const [botId, count] of Object.entries(stats.byBot)) {
                if (count > 0) {
                    console.log(`  ${botId}: ${count}`);
                }
            }

            console.log(chalk.cyan('\nBy Type:'));
            for (const [type, count] of Object.entries(stats.byType)) {
                console.log(`  ${type}: ${count}`);
            }
            console.log();
        });

    admin
        .command('clear-training <botId>')
        .description('Clear all training materials for a bot')
        .action(async (botId) => {
            if (!await requirePassword()) return;

            const count = await trainingInbox.clearBotTraining(botId);
            console.log(chalk.green(`✓ Cleared ${count} training materials for ${botId}`));
        });

    // ============================================
    // Project Memory Commands
    // ============================================

    admin
        .command('projects')
        .description('List all projects')
        .action(async () => {
            if (!await requirePassword()) return;

            const projects = await projectMemoryViewer.listProjects();

            console.log(chalk.bold('\n💾 Projects\n'));

            if (projects.length === 0) {
                console.log(chalk.gray('No projects found'));
                return;
            }

            for (const project of projects) {
                const created = new Date(project.created).toLocaleDateString();
                const lastActivity = new Date(project.lastActivity).toLocaleDateString();

                console.log(chalk.cyan(`\n${project.projectId}`));
                console.log(`  Created: ${created}`);
                console.log(`  Last activity: ${lastActivity}`);
                console.log(`  Features: ${project.totalFeatures} total`);
                console.log(`    ${chalk.green('✓')} ${project.passingFeatures} passing`);
                console.log(`    ${chalk.red('✗')} ${project.failingFeatures} failing`);
                console.log(`    ${chalk.yellow('⚙')} ${project.workingFeatures} in progress`);
            }
            console.log();
        });

    admin
        .command('project <projectId>')
        .description('View project details')
        .action(async (projectId) => {
            if (!await requirePassword()) return;

            const details = await projectMemoryViewer.getProjectDetails(projectId);

            console.log(chalk.bold(`\n💾 Project: ${projectId}\n`));

            console.log(chalk.cyan('Features:'));
            for (const feature of details.features.f) {
                const status = feature.s === 'P' ? chalk.green('✓') :
                    feature.s === 'F' ? chalk.red('✗') :
                        chalk.yellow('⚙');
                console.log(`  ${status} ${feature.i} (${feature.a})`);
            }

            console.log(chalk.cyan('\nRecent Activity:'));
            for (const line of details.progress.slice(-10)) {
                console.log(`  ${chalk.gray(line)}`);
            }
            console.log();
        });

    admin
        .command('activity')
        .description('View recent activity across all projects')
        .option('-l, --limit <number>', 'Number of activities to show', '10')
        .action(async (options) => {
            if (!await requirePassword()) return;

            const limit = parseInt(options.limit);
            const activities = await projectMemoryViewer.getRecentActivity(limit);

            console.log(chalk.bold('\n⚡ Recent Activity\n'));

            for (const activity of activities) {
                const date = new Date(activity.timestamp).toLocaleString();
                console.log(`${chalk.gray(date)} ${chalk.cyan(activity.bot)} ${activity.action} ${activity.feature} (${activity.projectId})`);
            }
            console.log();
        });
}
