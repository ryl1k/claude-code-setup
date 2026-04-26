import chalk from 'chalk';
import { ALL_MCPS, CORE_MCPS } from '../registry.js';
import { readSettings, getInstalledMcpIds, SETTINGS_PATH } from '../settings.js';

export async function showStatus() {
  const settings = readSettings();
  const { pluginIds, serverIds } = getInstalledMcpIds(settings);
  const allInstalledIds = new Set([...pluginIds, ...serverIds]);

  const knownPluginIds = new Set(
    ALL_MCPS.filter(m => m.type === 'plugin').map(m => m.pluginId),
  );
  const knownServerIds = new Set(
    ALL_MCPS.filter(m => m.type === 'server').map(m => m.id),
  );

  const unknownPlugins = pluginIds.filter(id => !knownPluginIds.has(id));
  const unknownServers = serverIds.filter(id => !knownServerIds.has(id));

  console.log();
  console.log(chalk.bold.white('Claude Code Setup — Status'));
  console.log(chalk.dim(SETTINGS_PATH));
  console.log();

  const installedKnown = ALL_MCPS.filter(m => {
    if (m.type === 'plugin') return pluginIds.includes(m.pluginId);
    return serverIds.includes(m.id);
  });

  const total = installedKnown.length + unknownPlugins.length + unknownServers.length;

  if (total > 0) {
    console.log(chalk.bold(`Installed (${total}):`));
    for (const mcp of installedKnown) {
      const isCore = CORE_MCPS.some(m => m.id === mcp.id);
      const typeTag = mcp.type === 'plugin' ? chalk.blue('[plugin]') : chalk.dim('[server]');
      const coreTag = isCore ? chalk.cyan(' [core]') : '';
      console.log(
        `  ${chalk.green('✓')}  ${mcp.name.padEnd(22)}${chalk.dim(mcp.description)}  ${typeTag}${coreTag}`,
      );
    }
    for (const id of unknownPlugins) {
      console.log(`  ${chalk.green('✓')}  ${id}  ${chalk.dim('(plugin, not in registry)')}`);
    }
    for (const id of unknownServers) {
      console.log(`  ${chalk.green('✓')}  ${id}  ${chalk.dim('(server, not in registry)')}`);
    }
  } else {
    console.log(chalk.dim('  No MCPs installed. Run `claude-setup` to get started.'));
  }

  const available = ALL_MCPS.filter(m => {
    if (m.type === 'plugin') return !pluginIds.includes(m.pluginId);
    return !serverIds.includes(m.id);
  });

  if (available.length > 0) {
    console.log();
    console.log(chalk.bold(`Available (${available.length}):`));
    for (const mcp of available) {
      const needs = mcp.env ? chalk.dim(` [needs ${mcp.env.map(e => e.name).join(', ')}]`) : '';
      const typeTag = mcp.type === 'plugin' ? chalk.blue(' [plugin]') : '';
      console.log(`  ${chalk.dim('○')}  ${mcp.id.padEnd(22)}${chalk.dim(mcp.description)}${needs}${typeTag}`);
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
