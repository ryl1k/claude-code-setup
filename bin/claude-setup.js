#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { program } from 'commander';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .name('claude-setup')
  .description('Interactive setup wizard for Claude Code')
  .version(pkg.version)
  .option('-y, --yes', 'install recommended MCPs without prompting')
  .option('--minimal', 'install core MCPs only, skip optional')
  .action(async () => {
    const { runWizard } = await import('../src/wizard.js');
    await runWizard(program.opts());
  });

program
  .command('status')
  .description('show current MCP configuration')
  .action(async () => {
    const { showStatus } = await import('../src/commands/status.js');
    await showStatus();
  });

program
  .command('add <mcp-id>')
  .description('add a specific MCP by ID')
  .action(async (mcpId) => {
    const { addMcpCommand } = await import('../src/commands/add.js');
    await addMcpCommand(mcpId);
  });

program
  .command('export [file]')
  .description('export current config as a shareable profile JSON')
  .action(async (file) => {
    const { exportProfile } = await import('../src/commands/export.js');
    await exportProfile(file);
  });

program
  .command('apply <profile>')
  .description('apply an exported profile JSON file')
  .action(async (profilePath) => {
    const { applyProfile } = await import('../src/commands/apply.js');
    await applyProfile(profilePath);
  });

program.parseAsync();
