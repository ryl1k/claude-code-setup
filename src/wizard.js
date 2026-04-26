import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { checkbox, select, input, password, confirm } from '@inquirer/prompts';
import ora from 'ora';
import { CORE_MCPS, OPTIONAL_MCPS } from './registry.js';
import { readSettings, writeSettings, isInstalled, getInstalledMcpIds, SETTINGS_PATH } from './settings.js';
import { banner, section, closingLine, mcpRow, successLine, infoLine } from './ui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

export async function runWizard({ yes = false, minimal = false } = {}) {
  const settings = readSettings();

  banner(version);
  console.log(chalk.dim(`  Config: ${SETTINGS_PATH}`));

  const alreadyInstalled = getInstalledMcpIds(settings);
  if (alreadyInstalled.length > 0) {
    console.log(chalk.dim(`  Already installed: ${alreadyInstalled.join(', ')}`));
  }

  const toInstall = [];

  // ── Core MCPs — always install, no prompts ─────────────────────────
  section('CORE MCPs  (always installed)');

  for (const mcp of CORE_MCPS) {
    if (isInstalled(settings, mcp.id)) {
      mcpRow(mcp.name, mcp.description, 'already installed');
    } else {
      mcpRow(mcp.name, mcp.description);
      toInstall.push({ mcp, env: {} });
    }
  }

  if (!minimal) {
    // ── Optional MCPs — checkbox ──────────────────────────────────────
    const newOptional = OPTIONAL_MCPS.filter(m => !isInstalled(settings, m.id));

    if (newOptional.length > 0) {
      section('OPTIONAL MCPs');

      let selectedIds;

      if (yes) {
        selectedIds = newOptional.filter(m => m.recommended).map(m => m.id);
        for (const mcp of newOptional.filter(m => m.recommended)) {
          mcpRow(mcp.name, mcp.description);
        }
      } else {
        selectedIds = await checkbox({
          message: 'Which MCPs do you want to add?',
          choices: newOptional.map(mcp => ({
            name:
              chalk.white(mcp.name.padEnd(18)) +
              chalk.dim(mcp.description) +
              (mcp.env ? chalk.yellow(` [needs ${mcp.env.map(e => e.name).join(', ')}]`) : ''),
            value: mcp.id,
            checked: mcp.recommended,
          })),
          pageSize: 12,
        });
      }

      for (const id of selectedIds) {
        const mcp = OPTIONAL_MCPS.find(m => m.id === id);
        const env = {};

        if (mcp.env && !yes) {
          console.log();
          console.log(chalk.bold(`  ${mcp.name} — credentials:`));
          for (const envVar of mcp.env) {
            const promptFn = envVar.sensitive ? password : input;
            const value = await promptFn({
              message: `    ${envVar.name}${envVar.hint ? chalk.dim(` (${envVar.hint})`) : ''}:`,
              validate: v => (v && v.trim()) ? true : 'Required',
            });
            env[envVar.name] = value.trim();
          }
        }

        if (mcp.extraArgs && !yes) {
          console.log();
          const paths = await input({
            message: `  ${mcp.extraArgsDescription}:`,
          });
          if (paths.trim()) {
            mcp.args = [...mcp.args, ...paths.trim().split(/\s+/)];
          }
        }

        toInstall.push({ mcp, env });
      }
    }

    // ── General settings ──────────────────────────────────────────────
    if (!yes) {
      section('GENERAL SETTINGS');

      const configureSettings = await confirm({
        message: 'Configure model and theme?',
        default: true,
      });

      if (configureSettings) {
        const model = await select({
          message: 'Default model:',
          choices: [
            { name: `claude-sonnet-4-6  ${chalk.dim('balanced · recommended')}`, value: 'claude-sonnet-4-6' },
            { name: `claude-opus-4-7    ${chalk.dim('most powerful')}`, value: 'claude-opus-4-7' },
            { name: `claude-haiku-4-5-20251001  ${chalk.dim('fastest · cheapest')}`, value: 'claude-haiku-4-5-20251001' },
          ],
        });

        const theme = await select({
          message: 'Theme:',
          choices: [
            { name: 'dark', value: 'dark' },
            { name: 'light', value: 'light' },
          ],
        });

        settings.model = model;
        settings.theme = theme;
      }
    }
  }

  // ── Write ──────────────────────────────────────────────────────────
  section('Installing');

  if (toInstall.length === 0 && !settings.model) {
    infoLine('Nothing new to install.');
  } else {
    for (const { mcp, env } of toInstall) {
      const spinner = ora({ text: `  ${mcp.name}`, color: 'cyan' }).start();

      if (!settings.mcpServers) settings.mcpServers = {};
      settings.mcpServers[mcp.id] = buildEntry(mcp, env);

      await delay(60);
      spinner.succeed(
        `  ${chalk.white(mcp.name.padEnd(22))}${chalk.dim(mcp.description)}`,
      );
    }

    writeSettings(settings);
    console.log();
    successLine(`Saved to ${SETTINGS_PATH}`);
  }

  console.log();
  infoLine('Restart Claude Code to activate MCPs.');
  console.log();
  closingLine();
}

function buildEntry(mcp, env) {
  const entry = { command: mcp.command, args: mcp.args };
  if (env && Object.keys(env).length > 0) entry.env = env;
  return entry;
}

const delay = ms => new Promise(r => setTimeout(r, ms));
