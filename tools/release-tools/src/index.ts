import { analyzeGitDiffForVersion } from './utils/real-time-version-bump';

async function main() {
  try {
    const result = await analyzeGitDiffForVersion();
    // Write result to a file that GitHub Actions can read
    if (process.env['GITHUB_OUTPUT']) {
      const fs = await import('fs');
      const resultObj = JSON.parse(result);
      const { version_type, needs_review, reasoning } = resultObj;

      fs.appendFileSync(process.env['GITHUB_OUTPUT'], `version_type=${version_type}\n`);
      fs.appendFileSync(process.env['GITHUB_OUTPUT'], `needs_review=${needs_review}\n`);
      fs.appendFileSync(process.env['GITHUB_OUTPUT'], `reasoning=${reasoning}\n`);

      // Also print for debugging
      console.log('Analysis complete. Results written to GITHUB_OUTPUT');
    } else {
      // If not in GitHub Actions, just print the result
      console.log(result);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
