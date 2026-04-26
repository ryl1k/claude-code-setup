import chalk from 'chalk';
import { ALL_MCPS, CORE_MCPS } from '../registry.js';
import { readSettings, getInstalledMcpIds, SETTINGS_PATH } from '../settings.js';

export async function showStatus() {
  const settings = readSettings();
  const installedIds = getInstalledMcpIds(settings);
  const knownIds = new Set(ALL_MCPS.map(m => m.id));
  const unknownInstalled = installedIds.filter(id => !knownIds.has(id));

  console.log();
  console.log(chalk.bold.white('Claude Code Setup — Status'));
  console.log(chalk.dim(SETTINGS_PATH));
  console.log();

  const installedKnown = ALL_MCPS.filter(m => installedIds.includes(m.id));
  const total = installedKnown.length + unknownInstalled.length;

  if (total > 0) {
    console.log(chalk.bold(`Installed MCPs (${total}):`));
    for (const mcp of installedKnown) {
      const isCore = CORE_MCPS.some(m => m.id === mcp.id);
      const tag = isCore ? chalk.cyan(' [core]') : '';
      console.log(
        `  ${chalk.green('✓')}  ${mcp.name.padEnd(22)}${chalk.dim(mcp.description)}${tag}`,
      );
    }
    for (const id of unknownInstalled) {
      console.log(`  ${chalk.green('✓')}  ${id.padEnd(22)}${chalk.dim('(custom)')}`);
    }
  } else {
    console.log(chalk.dim('  No MCPs installed. Run `claude-setup` to get started.'));
  }

  const available = ALL_MCPS.filter(m => !installedIds.includes(m.id));
  if (available.length > 0) {
    console.log();
    console.log(chalk.bold(`Available MCPs (${available.length}):`));
    for (const mcp of available) {
      const needs = mcp.env ? chalk.dim(` [needs ${mcp.env.map(e => e.name).join(', ')}]`) : '';
      console.log(`  ${chalk.dim('○')}  ${mcp.id.padEnd(22)}${chalk.dim(mcp.description)}${needs}`);
    }
    console.log();
    console.log(chalk.dim('  Add one:  claude-setup add <id>'));
    console.log(chalk.dim('  Add all:  claude-setup'));
  }

  if (settings.model || settings.theme) {
    console.log();
    console.log(chalk.bold('Settings:'));
    if (settings.model) console.log(`  Model:  ${settings.model}`);
    if (settings.theme) console.log(`  Theme:  ${settings.theme}`);
  }

  console.log();
}
