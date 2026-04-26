import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import { select, Separator } from '@inquirer/prompts';
import { readSettings, getInstalledMcpIds } from './settings.js';
import { banner, section } from './ui.js';
import { manageMcps } from './actions/mcps.js';
import { configureSettings } from './actions/configure.js';
import { manageHooks } from './actions/hooks.js';
import { managePermissions } from './actions/permissions.js';
import { generateClaudeMd } from './actions/claudemd.js';
import { manageProfile } from './actions/profile.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

export async function runMenu() {
  banner(version);

  while (true) {
    const settings = readSettings();
    const { pluginIds, serverIds } = getInstalledMcpIds(settings);
    const totalMcps = pluginIds.length + serverIds.length;
    const model = settings.model ?? 'default';

    console.log(chalk.dim(`  ${totalMcps} MCPs  ·  ${model}  ·  ${settings.theme ?? 'default theme'}`));
    console.log();

    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Manage MCPs', value: 'mcps' },
        { name: 'Configure settings', value: 'settings' },
        { name: 'Manage permissions', value: 'permissions' },
        { name: 'Setup hooks', value: 'hooks' },
        { name: 'Generate CLAUDE.md', value: 'claudemd' },
        { name: 'Export / Apply profile', value: 'profile' },
        { name: 'View raw config', value: 'view' },
        new Separator('  ' + '─'.repeat(36)),
        { name: 'Exit', value: 'exit' },
      ],
    });

    if (action === 'exit') {
      console.log(chalk.dim('\n  Goodbye!\n'));
      process.exit(0);
    }

    console.log();

    try {
      switch (action) {
        case 'mcps':        await manageMcps(); break;
        case 'settings':    await configureSettings(); break;
        case 'permissions': await managePermissions(); break;
        case 'hooks':       await manageHooks(); break;
        case 'claudemd':    await generateClaudeMd(); break;
        case 'profile':     await manageProfile(); break;
        case 'view':        await viewConfig(); break;
      }
    } catch (err) {
      if (err?.name === 'ExitPromptError') process.exit(0); // Ctrl+C
      console.error(chalk.red(`\n  Error: ${err.message}\n`));
    }

    console.log();
  }
}

async function viewConfig() {
  const settings = readSettings();
  section('RAW CONFIG');
  console.log(JSON.stringify(settings, null, 2));
}
