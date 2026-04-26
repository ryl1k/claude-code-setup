import chalk from 'chalk';
import { select, checkbox } from '@inquirer/prompts';
import ora from 'ora';
import { ALL_MCPS, CORE_MCPS } from '../registry.js';
import {
  readSettings,
  writeSettings,
  isInstalled,
  addMcpToSettings,
  removeMcpFromSettings,
} from '../settings.js';
import { promptEnv } from '../utils.js';
import { section, successLine } from '../ui.js';

export async function manageMcps() {
  const action = await select({
    message: 'MCP Management',
    choices: [
      { name: 'Install MCPs', value: 'install' },
      { name: 'Remove MCPs', value: 'remove' },
      { name: '← Back', value: 'back' },
    ],
  });

  if (action === 'back') return;
  if (action === 'install') await installMcps();
  if (action === 'remove') await removeMcps();
}

async function installMcps() {
  let settings = readSettings();
  const uninstalled = ALL_MCPS.filter(m => !isInstalled(settings, m));

  if (uninstalled.length === 0) {
    console.log(chalk.green('\n  All available MCPs are already installed.\n'));
    return;
  }

  section('INSTALL MCPs');

  const selectedIds = await checkbox({
    message: 'Select MCPs to install:',
    choices: uninstalled.map(mcp => ({
      name:
        chalk.white(mcp.name.padEnd(20)) +
        chalk.dim(mcp.description) +
        (mcp.env ? chalk.yellow(` [needs ${mcp.env.map(e => e.name).join(', ')}]`) : ''),
      value: mcp.id,
      checked: mcp.recommended || CORE_MCPS.some(c => c.id === mcp.id),
    })),
    pageSize: 12,
  });

  if (selectedIds.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  console.log();
  for (const id of selectedIds) {
    const mcp = ALL_MCPS.find(m => m.id === id);
    const env = await promptEnv(mcp);
    const spinner = ora({ text: `  Installing ${mcp.name}...`, color: 'cyan' }).start();
    settings = addMcpToSettings(settings, mcp, env);
    writeSettings(settings);
    spinner.succeed(`  ${chalk.white(mcp.name.padEnd(20))}${chalk.dim(mcp.description)}`);
  }
  console.log();
  successLine(`Saved to ${(await import('../settings.js')).SETTINGS_PATH}`);
}

async function removeMcps() {
  let settings = readSettings();
  const installed = ALL_MCPS.filter(m => isInstalled(settings, m));

  if (installed.length === 0) {
    console.log(chalk.dim('\n  No registered MCPs are installed.\n'));
    return;
  }

  section('REMOVE MCPs');

  const selectedIds = await checkbox({
    message: 'Select MCPs to remove:',
    choices: installed.map(mcp => ({
      name: chalk.white(mcp.name.padEnd(20)) + chalk.dim(mcp.description),
      value: mcp.id,
    })),
    pageSize: 12,
  });

  if (selectedIds.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  console.log();
  for (const id of selectedIds) {
    const mcp = ALL_MCPS.find(m => m.id === id);
    settings = removeMcpFromSettings(settings, mcp);
    writeSettings(settings);
    console.log(`  ${chalk.red('✖')}  ${mcp.name} removed.`);
  }
  console.log();
}
