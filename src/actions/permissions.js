import chalk from 'chalk';
import { select, checkbox, input } from '@inquirer/prompts';
import { readSettings, writeSettings, addPermission, removePermission, SETTINGS_PATH } from '../settings.js';
import { section, successLine } from '../ui.js';

const PRESET_ALLOW = [
  { pattern: 'Bash(npm run *)', description: 'All npm scripts' },
  { pattern: 'Bash(npx *)', description: 'Run any npx command' },
  { pattern: 'Bash(git *)', description: 'All git commands' },
  { pattern: 'Bash(pnpm *)', description: 'All pnpm commands' },
  { pattern: 'Bash(yarn *)', description: 'All yarn commands' },
  { pattern: 'Bash(python *)', description: 'Run python commands' },
  { pattern: 'Bash(cargo *)', description: 'Run cargo commands' },
  { pattern: 'Bash(go *)', description: 'Run go commands' },
  { pattern: 'Edit(**)', description: 'Edit any file' },
  { pattern: 'WebFetch(*)', description: 'Fetch any URL' },
  { pattern: 'WebSearch(*)', description: 'Search the web' },
];

const PRESET_DENY = [
  { pattern: 'Bash(rm -rf *)', description: 'Recursive deletion' },
  { pattern: 'Bash(git push --force *)', description: 'Force push' },
  { pattern: 'Bash(sudo *)', description: 'Any sudo command' },
  { pattern: 'Bash(DROP TABLE *)', description: 'SQL DROP TABLE' },
];

export async function managePermissions() {
  const action = await select({
    message: 'Permission Management',
    choices: [
      { name: 'Add allow rules', value: 'allow' },
      { name: 'Add deny rules', value: 'deny' },
      { name: 'Remove rules', value: 'remove' },
      { name: 'View current rules', value: 'view' },
      { name: '← Back', value: 'back' },
    ],
  });

  if (action === 'back') return;
  if (action === 'allow') await addRules('allow');
  if (action === 'deny') await addRules('deny');
  if (action === 'remove') await removeRules();
  if (action === 'view') await viewRules();
}

async function addRules(type) {
  const label = type === 'allow' ? 'ALLOW' : 'DENY';
  const presets = type === 'allow' ? PRESET_ALLOW : PRESET_DENY;

  section(`${label} RULES`);

  const settings = readSettings();
  const existing = settings.permissions?.[type] || [];

  const available = presets.filter(p => !existing.includes(p.pattern));

  const choices = [
    ...available.map(p => ({
      name: `${chalk.white(p.pattern.padEnd(28))}${chalk.dim(p.description)}`,
      value: p.pattern,
    })),
    { name: chalk.cyan('+ Custom pattern...'), value: '__custom__' },
  ];

  const selected = await checkbox({
    message: `Select patterns to ${type}:`,
    choices,
    pageSize: 14,
  });

  let patterns = selected.filter(s => s !== '__custom__');

  if (selected.includes('__custom__')) {
    const custom = await input({
      message: `  Custom pattern (e.g. Bash(docker *)):`,
      validate: v => v.trim() ? true : 'Required',
    });
    patterns.push(custom.trim());
  }

  if (patterns.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  for (const pattern of patterns) {
    addPermission(settings, type, pattern);
  }
  writeSettings(settings);
  console.log();
  successLine(`${patterns.length} rule(s) added.`);
  successLine(`Saved to ${SETTINGS_PATH}`);
}

async function removeRules() {
  const settings = readSettings();
  const perms = settings.permissions || {};
  const entries = [];

  for (const type of ['allow', 'deny']) {
    for (const pattern of perms[type] || []) {
      entries.push({
        name: `${type === 'allow' ? chalk.green('allow') : chalk.red('deny ')}  ${pattern}`,
        value: { type, pattern },
      });
    }
  }

  if (entries.length === 0) {
    console.log(chalk.dim('\n  No permission rules defined.\n'));
    return;
  }

  section('REMOVE RULES');

  const selected = await checkbox({
    message: 'Select rules to remove:',
    choices: entries,
    pageSize: 14,
  });

  if (selected.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  for (const { type, pattern } of selected) {
    removePermission(settings, type, pattern);
  }
  writeSettings(settings);
  console.log();
  console.log(chalk.green(`  ✓  ${selected.length} rule(s) removed.`));
  successLine(`Saved to ${SETTINGS_PATH}`);
}

async function viewRules() {
  const settings = readSettings();
  const perms = settings.permissions || {};

  if (!perms.allow?.length && !perms.deny?.length) {
    console.log(chalk.dim('\n  No permission rules defined.\n'));
    return;
  }

  section('CURRENT RULES');

  if (perms.allow?.length) {
    console.log(chalk.bold('  Allow:'));
    for (const p of perms.allow) console.log(`    ${chalk.green('✓')}  ${p}`);
    console.log();
  }

  if (perms.deny?.length) {
    console.log(chalk.bold('  Deny:'));
    for (const p of perms.deny) console.log(`    ${chalk.red('✖')}  ${p}`);
    console.log();
  }
}
