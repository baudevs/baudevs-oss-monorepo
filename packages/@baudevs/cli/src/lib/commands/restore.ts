import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { BackupManager } from '../utils/backup-manager';

export async function restoreCommand() {
  const spinner = ora('Preparing to restore...').start();

  try {
    const backupManager = new BackupManager();

    const summary = await backupManager.getChangeSummary();
    spinner.stop();

    console.log(chalk.yellow('\nWarning: This will undo all changes made by BauCMS.\n'));
    console.log('Changes to be reverted:');
    console.log(summary);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to restore your project to its previous state?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Restore cancelled'));
      return;
    }

    spinner.start('Restoring project...');
    await backupManager.restoreAll();
    spinner.succeed('Project restored successfully!');

    console.log('\nYour project has been restored to its state before BauCMS installation.');
    console.log('The backup files are still available in ' + chalk.cyan('.bau-backup') + ' if needed.');

  } catch (error) {
    spinner.fail('Failed to restore project');
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
