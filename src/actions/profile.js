import chalk from 'chalk';
import { select, input } from '@inquirer/prompts';
import { section, successLine } from '../ui.js';

export async function manageProfile() {
  const action = await select({
    message: 'Profile',
    choices: [
      { name: 'Export current config', value: 'export' },
      { name: 'Apply a profile from file', value: 'apply' },
      { name: '← Back', value: 'back' },
    ],
  });

  if (action === 'back') return;

  if (action === 'export') {
    const filename = await input({
      message: 'Output filename:',
      default: 'claude-profile.json',
    });
    section('EXPORT PROFILE');
    const { exportProfile } = await import('../commands/export.js');
    await exportProfile(filename.trim());
  }

  if (action === 'apply') {
    const filename = await input({
      message: 'Profile file path:',
      validate: v => v.trim() ? true : 'Required',
    });
    section('APPLY PROFILE');
    const { applyProfile } = await import('../commands/apply.js');
    await applyProfile(filename.trim());
  }
}
