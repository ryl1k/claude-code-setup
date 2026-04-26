import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { select, checkbox, confirm } from '@inquirer/prompts';
import { CURATED_AGENTS } from '../agents-registry.js';
import { section, successLine, infoLine } from '../ui.js';

const AGENTS_DIR = join(homedir(), '.claude', 'agents');

function getInstalledAgentIds() {
  if (!existsSync(AGENTS_DIR)) return [];
  return readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

function agentFilePath(id) {
  return join(AGENTS_DIR, `${id}.md`);
}

function buildAgentFile(agent) {
  return `---
name: ${agent.id}
description: ${agent.description}
model: ${agent.model}
color: ${agent.color}
---

${agent.content}
`;
}

export async function manageSkills() {
  const action = await select({
    message: 'Skill / Agent Management',
    choices: [
      { name: 'Install agents', value: 'install' },
      { name: 'Remove agents', value: 'remove' },
      { name: 'View installed agents', value: 'view' },
      { name: 'Preview agent definition', value: 'preview' },
      { name: '← Back', value: 'back' },
    ],
  });

  if (action === 'back') return;
  if (action === 'install') await installAgents();
  if (action === 'remove') await removeAgents();
  if (action === 'view') await viewInstalled();
  if (action === 'preview') await previewAgent();
}

async function installAgents() {
  const installedIds = new Set(getInstalledAgentIds());
  const available = CURATED_AGENTS.filter(a => !installedIds.has(a.id));

  if (available.length === 0) {
    console.log(chalk.green('\n  All curated agents are already installed.\n'));
    return;
  }

  section('INSTALL AGENTS');

  const selectedIds = await checkbox({
    message: 'Select agents to install:',
    choices: available.map(a => ({
      name: chalk.white(a.name.padEnd(22)) + chalk.dim(a.description.slice(0, 55)),
      value: a.id,
      checked: false,
    })),
    pageSize: 12,
  });

  if (selectedIds.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  if (!existsSync(AGENTS_DIR)) mkdirSync(AGENTS_DIR, { recursive: true });

  console.log();
  for (const id of selectedIds) {
    const agent = CURATED_AGENTS.find(a => a.id === id);
    writeFileSync(agentFilePath(id), buildAgentFile(agent), 'utf8');
    console.log(`  ${chalk.green('✓')}  ${agent.name}`);
  }
  console.log();
  successLine(`Agents written to ${AGENTS_DIR}`);
  infoLine('Restart Claude Code to activate new agents.');
}

async function removeAgents() {
  const installedIds = getInstalledAgentIds();

  if (installedIds.length === 0) {
    console.log(chalk.dim('\n  No agents installed.\n'));
    return;
  }

  section('REMOVE AGENTS');

  const choices = installedIds.map(id => {
    const known = CURATED_AGENTS.find(a => a.id === id);
    return {
      name: known
        ? chalk.white(known.name.padEnd(22)) + chalk.dim(known.description.slice(0, 50))
        : chalk.white(id) + chalk.dim(' (custom)'),
      value: id,
    };
  });

  const selectedIds = await checkbox({
    message: 'Select agents to remove:',
    choices,
    pageSize: 12,
  });

  if (selectedIds.length === 0) {
    console.log(chalk.dim('\n  Nothing selected.\n'));
    return;
  }

  const confirmed = await confirm({
    message: `Remove ${selectedIds.length} agent(s)?`,
    default: false,
  });

  if (!confirmed) return;

  console.log();
  for (const id of selectedIds) {
    const path = agentFilePath(id);
    if (existsSync(path)) {
      unlinkSync(path);
      const known = CURATED_AGENTS.find(a => a.id === id);
      console.log(`  ${chalk.red('✖')}  ${known?.name ?? id} removed.`);
    }
  }
  console.log();
}

async function viewInstalled() {
  const installedIds = getInstalledAgentIds();

  if (installedIds.length === 0) {
    console.log(chalk.dim('\n  No agents installed in ~/.claude/agents/\n'));
    return;
  }

  section('INSTALLED AGENTS');

  for (const id of installedIds) {
    const known = CURATED_AGENTS.find(a => a.id === id);
    const tag = known ? '' : chalk.dim(' (custom)');
    const model = known ? chalk.dim(` [${known.model}]`) : '';
    console.log(`  ${chalk.green('✓')}  ${(known?.name ?? id).padEnd(22)}${tag}${model}`);
  }

  const available = CURATED_AGENTS.filter(a => !installedIds.includes(a.id));
  if (available.length > 0) {
    console.log();
    console.log(chalk.bold(`Available to install (${available.length}):`));
    for (const a of available) {
      console.log(`  ${chalk.dim('○')}  ${a.name.padEnd(22)}${chalk.dim(a.description.slice(0, 55))}`);
    }
  }
  console.log();
}

async function previewAgent() {
  const choices = CURATED_AGENTS.map(a => ({
    name: a.name,
    value: a.id,
  }));

  const id = await select({
    message: 'Which agent to preview?',
    choices,
  });

  const agent = CURATED_AGENTS.find(a => a.id === id);
  section(`${agent.name.toUpperCase()}`);
  console.log(chalk.dim(`  model: ${agent.model}  ·  color: ${agent.color}`));
  console.log();
  console.log(agent.content);
  console.log();
}
