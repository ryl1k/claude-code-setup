import chalk from 'chalk';
import { input, password } from '@inquirer/prompts';
import ora from 'ora';
import { ALL_MCPS } from '../registry.js';
import { readSettings, writeSettings, isInstalled, SETTINGS_PATH } from '../settings.js';

export async function addMcpCommand(mcpId) {
  const mcp = ALL_MCPS.find(m => m.id === mcpId);

  if (!mcp) {
    console.error(chalk.red(`\n  Unknown MCP: "${mcpId}"`));
    console.log(chalk.dim('  Run "claude-setup status" to see available IDs.\n'));
    process.exit(1);
  }

  const settings = readSettings();

  if (isInstalled(settings, mcpId)) {
    console.log(chalk.yellow(`\n  ${mcp.name} is already installed.\n`));
    return;
  }

  const env = {};

  if (mcp.env) {
    console.log();
    console.log(chalk.bold(`  ${mcp.name} — credentials needed:`));
    for (const envVar of mcp.env) {
      const promptFn = envVar.sensitive ? password : input;
      const value = await promptFn({
        message: `    ${envVar.name}${envVar.hint ? chalk.dim(` (${envVar.hint})`) : ''}:`,
        validate: v => (v && v.trim()) ? true : 'Required',
      });
      env[envVar.name] = value.trim();
    }
  }

  const spinner = ora({ text: `  Adding ${mcp.name}...`, color: 'cyan' }).start();

  if (!settings.mcpServers) settings.mcpServers = {};
  settings.mcpServers[mcpId] = {
    command: mcp.command,
    args: mcp.args,
    ...(Object.keys(env).length > 0 ? { env } : {}),
  };

  writeSettings(settings);
  spinner.succeed(chalk.green(`  ${mcp.name} added.`));
  console.log(chalk.dim(`  Saved to ${SETTINGS_PATH}`));
  console.log(chalk.dim('  Restart Claude Code to activate.\n'));
}
