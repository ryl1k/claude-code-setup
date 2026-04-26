import { readFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { input, password } from '@inquirer/prompts';
import { readSettings, writeSettings, SETTINGS_PATH } from '../settings.js';
import { ALL_MCPS } from '../registry.js';

export async function applyProfile(profilePath) {
  if (!existsSync(profilePath)) {
    console.error(chalk.red(`\n  Profile not found: ${profilePath}\n`));
    process.exit(1);
  }

  let profile;
  try {
    profile = JSON.parse(readFileSync(profilePath, 'utf8'));
  } catch (e) {
    console.error(chalk.red(`\n  Invalid profile JSON: ${e.message}\n`));
    process.exit(1);
  }

  const settings = readSettings();

  console.log();
  console.log(chalk.bold('Applying profile...'));

  // Plugins — just merge, no credentials needed
  if (profile.enabledPlugins) {
    settings.enabledPlugins = { ...settings.enabledPlugins, ...profile.enabledPlugins };
  }

  // Servers — fill in placeholder credentials interactively
  const mcpServers = JSON.parse(JSON.stringify(profile.mcpServers || {}));
  for (const [id, entry] of Object.entries(mcpServers)) {
    if (!entry.env) continue;
    const def = ALL_MCPS.find(m => m.id === id);
    for (const [key, value] of Object.entries(entry.env)) {
      if (!(String(value).startsWith('<') && String(value).endsWith('>'))) continue;
      console.log();
      const envDef = def?.env?.find(e => e.name === key);
      const promptFn = envDef?.sensitive ? password : input;
      const real = await promptFn({
        message: `  ${key} for ${id}:`,
        validate: v => (v && v.trim()) ? true : 'Required',
      });
      entry.env[key] = real.trim();
    }
  }
  settings.mcpServers = { ...settings.mcpServers, ...mcpServers };

  if (profile.model) settings.model = profile.model;
  if (profile.theme) settings.theme = profile.theme;

  writeSettings(settings);

  console.log();
  console.log(chalk.green(`  ✓  Profile applied. Saved to ${SETTINGS_PATH}`));
  console.log(chalk.dim('  Restart Claude Code to activate MCPs.\n'));
}
