import { writeFileSync } from 'fs';
import chalk from 'chalk';
import { readSettings, SETTINGS_PATH } from '../settings.js';
import { ALL_MCPS } from '../registry.js';

export async function exportProfile(outputPath = 'claude-profile.json') {
  const settings = readSettings();

  const profile = {
    version: 1,
    exported: new Date().toISOString(),
    enabledPlugins: settings.enabledPlugins || {},
    mcpServers: settings.mcpServers || {},
    model: settings.model,
    theme: settings.theme,
  };

  // Replace sensitive env values with placeholders so profiles are safe to share
  const safe = JSON.parse(JSON.stringify(profile));
  for (const [id, entry] of Object.entries(safe.mcpServers)) {
    if (!entry.env) continue;
    const def = ALL_MCPS.find(m => m.id === id);
    for (const key of Object.keys(entry.env)) {
      const envDef = def?.env?.find(e => e.name === key);
      if (envDef?.sensitive) entry.env[key] = `<${key}>`;
    }
  }

  writeFileSync(outputPath, JSON.stringify(safe, null, 2) + '\n', 'utf8');

  console.log();
  console.log(chalk.green(`  ✓  Profile exported to ${outputPath}`));
  console.log(chalk.dim('  Sensitive values replaced with placeholders — safe to share.'));
  console.log(chalk.dim(`  Apply with: npx claude-code-setup apply ${outputPath}\n`));
}
