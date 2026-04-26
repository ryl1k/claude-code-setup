import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import { readSettings, writeSettings, SETTINGS_PATH } from '../settings.js';
import { section, successLine } from '../ui.js';

export async function configureSettings() {
  section('CONFIGURE SETTINGS');

  let settings = readSettings();
  let changed = false;

  const model = await select({
    message: 'Default model:',
    default: settings.model || 'claude-sonnet-4-6',
    choices: [
      { name: `claude-sonnet-4-6   ${chalk.dim('balanced · recommended')}`, value: 'claude-sonnet-4-6' },
      { name: `claude-opus-4-7     ${chalk.dim('most powerful')}`, value: 'claude-opus-4-7' },
      { name: `claude-haiku-4-5-20251001  ${chalk.dim('fastest · cheapest')}`, value: 'claude-haiku-4-5-20251001' },
    ],
  });

  const theme = await select({
    message: 'Theme:',
    default: settings.theme || 'dark',
    choices: [
      { name: 'dark', value: 'dark' },
      { name: 'light', value: 'light' },
    ],
  });

  const thinking = await confirm({
    message: 'Enable extended thinking by default?',
    default: settings.alwaysThinkingEnabled ?? true,
  });

  const effortLevel = await select({
    message: 'Default effort level:',
    default: settings.effortLevel || 'medium',
    choices: [
      { name: `low     ${chalk.dim('faster responses, less thorough')}`, value: 'low' },
      { name: `medium  ${chalk.dim('balanced (recommended)')}`, value: 'medium' },
      { name: `high    ${chalk.dim('most thorough, slower')}`, value: 'high' },
    ],
  });

  settings.model = model;
  settings.theme = theme;
  settings.alwaysThinkingEnabled = thinking;
  settings.effortLevel = effortLevel;

  writeSettings(settings);
  console.log();
  successLine(`Saved to ${SETTINGS_PATH}`);
}
