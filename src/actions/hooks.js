import chalk from 'chalk';
import { select, checkbox, input } from '@inquirer/prompts';
import { readSettings, writeSettings, addHookToSettings, removeHookFromSettings, SETTINGS_PATH } from '../settings.js';
import { section, successLine } from '../ui.js';

const HOOK_EVENTS = ['PreToolUse', 'PostToolUse', 'Stop', 'Notification'];

function notifyCommand() {
  if (process.platform === 'win32') {
    return 'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show(\'Claude is done!\', \'Claude Code\')"';
  }
  if (process.platform === 'darwin') {
    return "osascript -e 'display notification \"Claude is done!\" with title \"Claude Code\"'";
  }
  return 'notify-send "Claude Code" "Claude is done!"';
}

const PRESET_HOOKS = [
  {
    id: 'notify-stop',
    name: 'Desktop notification when done',
    description: 'System notification when Claude finishes responding',
    event: 'Stop',
    entry: { hooks: [{ type: 'command', command: notifyCommand() }] },
  },
  {
    id: 'log-tools',
    name: 'Log all tool calls',
    description: 'Append each tool call to ~/.claude/tools.log',
    event: 'PreToolUse',
    entry: {
      matcher: '.*',
      hooks: [{ type: 'command', command: 'echo "[$(date -Iseconds)] $CLAUDE_TOOL_NAME" >> ~/.claude/tools.log' }],
    },
  },
  {
    id: 'block-rm-rf',
    name: 'Warn on destructive bash commands',
    description: 'Exit non-zero if Claude runs rm -rf, git reset --hard, etc.',
    event: 'PreToolUse',
    entry: {
      matcher: 'Bash',
      hooks: [{
        type: 'command',
        command: 'echo "$CLAUDE_TOOL_INPUT" | grep -qE "rm\\s+-rf|git\\s+reset\\s+--hard|DROP\\s+TABLE|format\\s+c:" && echo "Blocked destructive command" && exit 1 || exit 0',
      }],
    },
  },
];

export async function manageHooks() {
  const action = await select({
    message: 'Hook Management',
    choices: [
      { name: 'Add preset hook', value: 'preset' },
      { name: 'Add custom hook', value: 'custom' },
      { name: 'Remove hook', value: 'remove' },
      { name: 'View installed hooks', value: 'view' },
      { name: '← Back', value: 'back' },
    ],
  });

  if (action === 'back') return;
  if (action === 'preset') await addPresetHooks();
  if (action === 'custom') await addCustomHook();
  if (action === 'remove') await removeHook();
  if (action === 'view') await viewHooks();
}

async function addPresetHooks() {
  section('PRESET HOOKS');

  const settings = readSettings();

  const selected = await checkbox({
    message: 'Select hooks to install:',
    choices: PRESET_HOOKS.map(h => ({
      name: `${chalk.white(h.name.padEnd(34))}${chalk.dim(h.description)}`,
      value: h.id,
    })),
    pageSize: 10,
  });

  if (selected.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  for (const id of selected) {
    const preset = PRESET_HOOKS.find(h => h.id === id);
    addHookToSettings(settings, preset.event, preset.entry);
    writeSettings(settings);
    console.log(`\n  ${chalk.green('✓')}  ${preset.name} added.`);
  }
  console.log();
  successLine(`Saved to ${SETTINGS_PATH}`);
}

async function addCustomHook() {
  section('CUSTOM HOOK');

  const event = await select({
    message: 'Hook event:',
    choices: HOOK_EVENTS.map(e => ({ name: e, value: e })),
  });

  const matcher = (event === 'PreToolUse' || event === 'PostToolUse')
    ? await input({ message: 'Tool matcher (regex, e.g. Bash or .*):' })
    : null;

  const command = await input({
    message: 'Shell command to run:',
    validate: v => v.trim() ? true : 'Required',
  });

  const entry = { hooks: [{ type: 'command', command: command.trim() }] };
  if (matcher?.trim()) entry.matcher = matcher.trim();

  const settings = readSettings();
  addHookToSettings(settings, event, entry);
  writeSettings(settings);

  console.log();
  successLine(`Hook added to ${event}.`);
  successLine(`Saved to ${SETTINGS_PATH}`);
}

async function removeHook() {
  const settings = readSettings();
  const hooks = settings.hooks || {};
  const entries = [];

  for (const [event, list] of Object.entries(hooks)) {
    list.forEach((entry, idx) => {
      const cmd = entry.hooks?.[0]?.command || '(unknown)';
      const label = entry.matcher ? `[${entry.matcher}] ${cmd}` : cmd;
      entries.push({ name: `${chalk.dim(event.padEnd(14))} ${label.slice(0, 50)}`, value: { event, idx } });
    });
  }

  if (entries.length === 0) {
    console.log(chalk.dim('\n  No hooks installed.\n'));
    return;
  }

  section('REMOVE HOOK');

  const selected = await checkbox({
    message: 'Select hooks to remove:',
    choices: entries,
    pageSize: 12,
  });

  if (selected.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  // Remove in reverse index order to avoid index shifting
  const sorted = [...selected].sort((a, b) => b.idx - a.idx);
  for (const { event, idx } of sorted) {
    removeHookFromSettings(settings, event, idx);
  }
  writeSettings(settings);
  console.log();
  console.log(chalk.green(`  ✓  ${selected.length} hook(s) removed.`));
  successLine(`Saved to ${SETTINGS_PATH}`);
}

async function viewHooks() {
  const settings = readSettings();
  const hooks = settings.hooks || {};

  if (Object.keys(hooks).length === 0) {
    console.log(chalk.dim('\n  No hooks installed.\n'));
    return;
  }

  section('INSTALLED HOOKS');

  for (const [event, list] of Object.entries(hooks)) {
    console.log(chalk.bold(`  ${event} (${list.length}):`));
    for (const entry of list) {
      const cmd = entry.hooks?.[0]?.command || '';
      const label = entry.matcher ? `[${entry.matcher}]  ${cmd}` : cmd;
      console.log(`    ${chalk.dim('•')}  ${label.slice(0, 60)}`);
    }
    console.log();
  }
}
