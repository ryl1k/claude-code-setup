import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

export const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');

export function readSettings() {
  if (!existsSync(SETTINGS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(SETTINGS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

export function writeSettings(settings) {
  const dir = dirname(SETTINGS_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf8');
}

export function isInstalled(settings, mcpId) {
  return !!(settings.mcpServers?.[mcpId]);
}

export function getInstalledMcpIds(settings) {
  return Object.keys(settings.mcpServers || {});
}
