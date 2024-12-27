import chalk from 'chalk';

export const bauCmsAsciiArt = `
██████   █████  ██    ██  ██████ ███    ███ ███████
██   ██ ██   ██ ██    ██ ██      ████  ████ ██
██████  ███████ ██    ██ ██      ██ ████ ██ ███████
██   ██ ██   ██ ██    ██ ██      ██  ██  ██      ██
██████  ██   ██  ██████   ██████ ██      ██ ███████
`;

export const bauCmsSmallArt = `
 ____                _____ __  __ ____
| __ )  __ _ _   _ / ____|  \\/  / ___|
|  _ \\ / _\` | | | | |   | |\\/| \\___ \\
| |_) | (_| | |_| | |___| |  | |___) |
|____/ \\__,_|\\__,_|\\____|_|  |_|____/
`;

export function printBanner(version: string) {
  console.log(chalk.cyan(bauCmsAsciiArt));
  console.log(chalk.blue('Welcome to BauCMS - The opinionated CMS for Next.js'));
  console.log(chalk.gray(`Version: ${version}\n`));
}
