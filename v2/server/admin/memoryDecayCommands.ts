/**
 * Admin CLI Commands for Memory Decay
 */

import { memoryDecay } from '../memory/memoryDecay.js';
import chalk from 'chalk';

export function registerMemoryDecayCommands(admin: any) {

    admin
        .command('dumpster')
        .description('View projects in dumpster')
        .action(async () => {
            const summary = await memoryDecay.getDumpsterSummary();

            console.log(chalk.bold('\n🗑️  Dumpster Contents\n'));

            if (summary.totalProjects === 0) {
                console.log(chalk.gray('Dumpster is empty'));
                return;
            }

            console.log(`Total projects: ${summary.totalProjects}\n`);

            for (const project of summary.projects) {
                const deleteWarning = project.willDeleteIn === 0
                    ? chalk.red('⚠️  READY FOR DELETION')
                    : `Deletes in ${project.willDeleteIn} days`;

                console.log(`${project.projectId}`);
                console.log(`  In dumpster: ${project.daysInDumpster} days`);
                console.log(`  ${deleteWarning}\n`);
            }
        });

    admin
        .command('restore <projectId>')
        .description('Restore project from dumpster')
        .action(async (projectId: string) => {
            await memoryDecay.restoreFromDumpster(projectId);
            console.log(chalk.green(`✓ Restored ${projectId} from dumpster`));
        });

    admin
        .command('empty-dumpster')
        .description('Delete all projects ready for deletion (90+ days)')
        .action(async () => {
            const expired = await memoryDecay.findExpiredDumpster();

            if (expired.length === 0) {
                console.log(chalk.gray('No projects ready for deletion'));
                return;
            }

            console.log(chalk.yellow(`\n⚠️  WARNING: About to delete ${expired.length} projects:\n`));

            for (const project of expired) {
                console.log(`  - ${project.projectId} (${project.daysOld} days old)`);
            }

            console.log(chalk.red('\nThis action cannot be undone!'));
            console.log(chalk.gray('Run with --confirm to proceed\n'));
        });

    admin
        .command('empty-dumpster-confirm')
        .description('Actually delete expired projects (DANGEROUS)')
        .action(async () => {
            const expired = await memoryDecay.findExpiredDumpster();

            let deleted = 0;
            for (const project of expired) {
                await memoryDecay.deleteFromDumpster(project.projectId);
                deleted++;
                console.log(chalk.red(`✗ Deleted ${project.projectId}`));
            }

            console.log(chalk.yellow(`\n⚠️  Deleted ${deleted} projects permanently`));
        });

    admin
        .command('cleanup-status')
        .description('View memory cleanup status')
        .action(async () => {
            const stale = await memoryDecay.findStaleProjects();
            const dumpster = await memoryDecay.getDumpsterSummary();

            console.log(chalk.bold('\n📊 Memory Cleanup Status\n'));

            console.log(chalk.cyan('Stale Projects (30+ days):'));
            if (stale.length === 0) {
                console.log(chalk.gray('  None'));
            } else {
                for (const project of stale.slice(0, 5)) {
                    console.log(`  ${project.projectId} (${project.daysOld} days old)`);
                }
                if (stale.length > 5) {
                    console.log(chalk.gray(`  ... and ${stale.length - 5} more`));
                }
            }

            console.log(chalk.cyan('\nDumpster:'));
            console.log(`  Total: ${dumpster.totalProjects} projects`);

            const readyToDelete = dumpster.projects.filter(p => p.willDeleteIn === 0);
            if (readyToDelete.length > 0) {
                console.log(chalk.red(`  ⚠️  ${readyToDelete.length} ready for deletion`));
            }

            console.log();
        });
}
