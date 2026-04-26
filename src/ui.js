import chalk from 'chalk';

const W = 52;

export function banner(version = '') {
  console.log();
  console.log(chalk.cyan('━'.repeat(W)));
  console.log(
    chalk.bold.white('  Claude Code Setup') +
    (version ? chalk.dim(`  ·  v${version}`) : ''),
  );
  console.log(chalk.cyan('━'.repeat(W)));
  console.log();
}

export function section(title) {
  console.log();
  console.log(chalk.dim('─'.repeat(W)));
  console.log(`  ${chalk.bold.cyan(title)}`);
  console.log(chalk.dim('─'.repeat(W)));
  console.log();
}

export function closingLine() {
  console.log(chalk.cyan('━'.repeat(W)));
  console.log();
}

export function mcpRow(name, description, badge = '') {
  const badgeStr = badge ? chalk.dim(` (${badge})`) : '';
  console.log(
    `  ${chalk.green('✓')}  ` +
    chalk.white(name.padEnd(22)) +
    chalk.dim(description) +
    badgeStr,
  );
}

export function successLine(msg) {
  console.log(`  ${chalk.green('✓')}  ${msg}`);
}

export function infoLine(msg) {
  console.log(`  ${chalk.dim(msg)}`);
}

export function warnLine(msg) {
  console.log(`  ${chalk.yellow('⚠')}  ${msg}`);
}

export function errorLine(msg) {
  console.log(`  ${chalk.red('✖')}  ${msg}`);
}
