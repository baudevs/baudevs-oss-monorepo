#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './lib/commands/init';
import { migrateCommand } from './lib/commands/migrate';
import { restoreCommand } from './lib/commands/restore';

const program = new Command();

program
  .name('baucms')
  .description('BauCMS CLI tool for managing your CMS')
  .version('0.0.1');

program
  .command('init')
  .description('Initialize BauCMS in your Next.js project')
  .action(initCommand);

program
  .command('migrate')
  .description('Run database migrations')
  .action(migrateCommand);

program
  .command('restore')
  .description('Restore your project to its state before BauCMS installation')
  .action(restoreCommand);

program.parse();
