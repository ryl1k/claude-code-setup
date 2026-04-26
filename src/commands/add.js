import chalk from 'chalk';
import ora from 'ora';
import { ALL_MCPS } from '../registry.js';
import { readSettings, writeSettings, isInstalled, addMcpToSettings, SETTINGS_PATH } from '../settings.js';
import { promptEnv } from '../utils.js';

export async function addMcpCommand(mcpId) {
  const mcp = ALL_MCPS.find(m => m.id === mcpId);

  if (!mcp) {
    console.error(chalk.red(`\n  Unknown MCP: "${mcpId}"`));
    console.log(chalk.dim('  Run "claude-setup status" to see available IDs.\n'));
    process.exit(1);
  }

  let settings = readSettings();

  if (isInstalled(settings, mcp)) {
    console.log(chalk.yellow(`\n  ${mcp.name} is already installed.\n`));
    return;
  }

  const env = await promptEnv(mcp);

  const spinner = ora({ text: `  Adding ${mcp.name}...`, color: 'cyan' }).start();

  settings = addMcpToSettings(settings, mcp, env);
  writeSettings(settings);

  spinner.succeed(chalk.green(`  ${mcp.name} added.`));
  console.log(chalk.dim(`  Saved to ${SETTINGS_PATH}`));
  console.log(chalk.dim('  Restart Claude Code to activate.\n'));
}
