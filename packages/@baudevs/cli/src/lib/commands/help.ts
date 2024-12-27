import chalk from 'chalk';
import { bauCmsAsciiArt } from '../utils/ascii-art';

interface CommandOption {
  flag: string;
  description: string;
}

interface CommandExample {
  cmd: string;
  description: string;
}

interface SubCommand {
  cmd: string;
  description: string;
}

interface BaseHelpTopic {
  title: string;
  description: string;
  usage: string;
  examples: CommandExample[];
}

interface CommandHelpTopic extends BaseHelpTopic {
  options: CommandOption[];
}

interface SubCommandHelpTopic extends BaseHelpTopic {
  subcommands: SubCommand[];
}

type HelpTopic = CommandHelpTopic | SubCommandHelpTopic;

const helpTopics: Record<string, HelpTopic> = {
  init: {
    title: 'Initialize BauCMS',
    description: 'Set up BauCMS in your Next.js project',
    usage: 'bau init [options]',
    options: [
      { flag: '-y, --yes', description: 'Skip prompts and use default values' },
      { flag: '-d, --dir <directory>', description: 'Target directory (defaults to current directory)' }
    ],
    examples: [
      { cmd: 'bau init', description: 'Interactive setup' },
      { cmd: 'bau init -y', description: 'Quick setup with defaults' },
      { cmd: 'bau init -d ./my-project', description: 'Setup in specific directory' }
    ]
  },
  migrate: {
    title: 'Database Migrations',
    description: 'Manage your database schema and content',
    usage: 'bau migrate [options]',
    options: [
      { flag: '--dry-run', description: 'Show migration plan without executing' },
      { flag: '--reset', description: 'Reset database and rerun all migrations' }
    ],
    examples: [
      { cmd: 'bau migrate', description: 'Run pending migrations' },
      { cmd: 'bau migrate --dry-run', description: 'Preview migrations' },
      { cmd: 'bau migrate --reset', description: 'Reset and recreate database' }
    ]
  },
  restore: {
    title: 'Restore Project',
    description: 'Revert BauCMS changes to your project',
    usage: 'bau restore [options]',
    options: [
      { flag: '--force', description: 'Skip confirmation prompt' }
    ],
    examples: [
      { cmd: 'bau restore', description: 'Interactive restore' },
      { cmd: 'bau restore --force', description: 'Force restore without confirmation' }
    ]
  },
  templates: {
    title: 'Template Management',
    description: 'Manage content templates and types',
    usage: 'bau templates <command>',
    subcommands: [
      { cmd: 'list', description: 'List available templates' },
      { cmd: 'create', description: 'Create a new template' }
    ],
    examples: [
      { cmd: 'bau templates list', description: 'Show all templates' },
      { cmd: 'bau templates create', description: 'Create new template' }
    ]
  },
  deploy: {
    title: 'Deployment',
    description: 'Deploy your BauCMS project',
    usage: 'bau deploy [options]',
    options: [
      { flag: '--platform <platform>', description: 'Target platform (vercel, netlify)' }
    ],
    examples: [
      { cmd: 'bau deploy', description: 'Interactive deployment' },
      { cmd: 'bau deploy --platform vercel', description: 'Deploy to Vercel' }
    ]
  }
};

function printGeneralHelp() {
  console.log(chalk.cyan(bauCmsAsciiArt));
  console.log(chalk.blue('BauCMS CLI - The opinionated CMS for Next.js\n'));

  console.log('Usage: bau <command> [options]\n');

  console.log('Commands:');
  Object.entries(helpTopics).forEach(([cmd, info]) => {
    console.log(`  ${chalk.green(cmd.padEnd(12))} ${info.description}`);
  });

  console.log('\nGlobal Options:');
  console.log(`  ${chalk.yellow('--debug'.padEnd(16))} Enable debug mode`);
  console.log(`  ${chalk.yellow('--json'.padEnd(16))} Output as JSON`);

  console.log('\nGet help for a command:');
  console.log('  bau help <command>');
  console.log('  bau <command> --help\n');
}

function isCommandHelpTopic(topic: HelpTopic): topic is CommandHelpTopic {
  return 'options' in topic;
}

function isSubCommandHelpTopic(topic: HelpTopic): topic is SubCommandHelpTopic {
  return 'subcommands' in topic;
}

function printTopicHelp(topic: string) {
  const helpInfo = helpTopics[topic];
  if (!helpInfo) {
    console.log(chalk.red(`No help available for '${topic}'`));
    console.log('Run ' + chalk.cyan('bau help') + ' to see all commands');
    return;
  }

  console.log(chalk.blue(`\n${helpInfo.title}`));
  console.log(helpInfo.description + '\n');

  console.log(chalk.yellow('Usage:'));
  console.log(`  ${helpInfo.usage}\n`);

  if (isCommandHelpTopic(helpInfo) && helpInfo.options.length) {
    console.log(chalk.yellow('Options:'));
    helpInfo.options.forEach(opt => {
      console.log(`  ${chalk.green(opt.flag.padEnd(20))} ${opt.description}`);
    });
    console.log();
  }

  if (isSubCommandHelpTopic(helpInfo) && helpInfo.subcommands.length) {
    console.log(chalk.yellow('Subcommands:'));
    helpInfo.subcommands.forEach(sub => {
      console.log(`  ${chalk.green(sub.cmd.padEnd(20))} ${sub.description}`);
    });
    console.log();
  }

  console.log(chalk.yellow('Examples:'));
  helpInfo.examples.forEach(ex => {
    console.log(`  ${chalk.cyan(ex.cmd)}`);
    console.log(`    ${ex.description}\n`);
  });
}

export function helpCommand(topic?: string) {
  if (!topic) {
    printGeneralHelp();
  } else {
    printTopicHelp(topic);
  }
}
