/**
 * CLI Commands for Manual Training
 */

import { manualTraining } from '../training/manualTraining.js';
import chalk from 'chalk';
import * as readline from 'readline';

export function registerManualTrainingCommands(program: any) {
    const train = program.command('train').description('Manually train bots');

    // Add file
    train
        .command('file <botId> <filePath>')
        .description('Add a file to bot\'s training inbox')
        .option('-t, --topic <topic>', 'Topic/title for the material')
        .option('-n, --notes <notes>', 'Additional notes')
        .action(async (botId: string, filePath: string, options: any) => {
            const topic = options.topic || 'Training material';
            const notes = options.notes;

            await manualTraining.addFile(botId, filePath, topic, notes);
            console.log(chalk.green(`✓ Added file to ${botId}'s training inbox`));
        });

    // Add URL
    train
        .command('url <botId> <url>')
        .description('Add a URL to bot\'s training inbox')
        .option('-t, --topic <topic>', 'Topic/title for the material')
        .option('-n, --notes <notes>', 'Additional notes')
        .action(async (botId: string, url: string, options: any) => {
            const topic = options.topic || 'Web resource';
            const notes = options.notes;

            await manualTraining.addURL(botId, url, topic, notes);

            const type = url.includes('youtube') ? 'YouTube video' : 'URL';
            console.log(chalk.green(`✓ Added ${type} to ${botId}'s training inbox`));
        });

    // Add text (interactive)
    train
        .command('text <botId>')
        .description('Add text/paste content to bot\'s training inbox')
        .option('-t, --topic <topic>', 'Topic/title for the material')
        .action(async (botId: string, options: any) => {
            const topic = options.topic || 'Text content';

            console.log(chalk.cyan('\nPaste your text (press Ctrl+D when done):\n'));

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            let text = '';

            rl.on('line', (line) => {
                text += line + '\n';
            });

            rl.on('close', async () => {
                if (text.trim()) {
                    await manualTraining.addText(botId, text.trim(), topic);
                    console.log(chalk.green(`\n✓ Added text to ${botId}'s training inbox`));
                } else {
                    console.log(chalk.yellow('\nNo text provided'));
                }
            });
        });

    // List training materials
    train
        .command('list <botId>')
        .description('List all training materials for a bot')
        .action(async (botId: string) => {
            const materials = await manualTraining.listTraining(botId);

            if (materials.length === 0) {
                console.log(chalk.gray(`\nNo training materials for ${botId}`));
                return;
            }

            console.log(chalk.bold(`\n📚 Training Materials for ${botId}\n`));

            for (const material of materials) {
                const icon = {
                    file: '📄',
                    url: '🔗',
                    youtube: '🎥',
                    pdf: '📕',
                    text: '📝'
                }[material.type] || '📄';

                const addedBy = material.addedBy === 'user'
                    ? chalk.cyan('[Manual]')
                    : chalk.gray('[Oracle]');

                console.log(`${icon} ${material.topic} ${addedBy}`);
                console.log(chalk.gray(`   ${material.type}: ${material.source.substring(0, 60)}...`));
                if (material.notes) {
                    console.log(chalk.gray(`   Notes: ${material.notes}`));
                }
                console.log();
            }
        });

    // Training stats
    train
        .command('stats <botId>')
        .description('View training statistics for a bot')
        .action(async (botId: string) => {
            const stats = await manualTraining.getTrainingStats(botId);

            console.log(chalk.bold(`\n📊 Training Stats for ${botId}\n`));
            console.log(`Total materials: ${stats.total}`);
            console.log(`  Added by user: ${chalk.cyan(stats.byUser)}`);
            console.log(`  Added by Oracle: ${chalk.gray(stats.byOracle)}`);

            console.log(chalk.cyan('\nBy type:'));
            for (const [type, count] of Object.entries(stats.byType)) {
                console.log(`  ${type}: ${count}`);
            }
            console.log();
        });

    // Quick add (interactive wizard)
    train
        .command('add <botId>')
        .description('Interactive training wizard')
        .action(async (botId: string) => {
            console.log(chalk.bold(`\n📚 Add Training Material to ${botId}\n`));
            console.log('What would you like to add?\n');
            console.log('1. File (drag & drop path)');
            console.log('2. URL (paste link)');
            console.log('3. Text (paste content)');
            console.log();

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Choose (1/2/3): ', async (choice) => {
                if (choice === '1') {
                    rl.question('File path: ', async (filePath) => {
                        rl.question('Topic: ', async (topic) => {
                            await manualTraining.addFile(botId, filePath, topic);
                            console.log(chalk.green('\n✓ File added to training inbox'));
                            rl.close();
                        });
                    });
                } else if (choice === '2') {
                    rl.question('URL: ', async (url) => {
                        rl.question('Topic: ', async (topic) => {
                            await manualTraining.addURL(botId, url, topic);
                            console.log(chalk.green('\n✓ URL added to training inbox'));
                            rl.close();
                        });
                    });
                } else if (choice === '3') {
                    rl.question('Topic: ', async (topic) => {
                        console.log(chalk.cyan('\nPaste text (Ctrl+D when done):\n'));

                        let text = '';
                        rl.on('line', (line) => {
                            text += line + '\n';
                        });

                        rl.on('close', async () => {
                            if (text.trim()) {
                                await manualTraining.addText(botId, text.trim(), topic);
                                console.log(chalk.green('\n✓ Text added to training inbox'));
                            }
                        });
                    });
                } else {
                    console.log(chalk.red('\nInvalid choice'));
                    rl.close();
                }
            });
        });
}
