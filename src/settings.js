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

export function isInstalled(settings, mcp) {
  if (mcp.type === 'plugin') {
    return !!(settings.enabledPlugins?.[mcp.pluginId]);
  }
  return !!(settings.mcpServers?.[mcp.id]);
}

export function addMcpToSettings(settings, mcp, env = {}) {
  if (mcp.type === 'plugin') {
    if (!settings.enabledPlugins) settings.enabledPlugins = {};
    settings.enabledPlugins[mcp.pluginId] = true;
  } else {
    if (!settings.mcpServers) settings.mcpServers = {};
    settings.mcpServers[mcp.id] = {
      command: mcp.command,
      args: mcp.args,
      ...(Object.keys(env).length > 0 ? { env } : {}),
    };
  }
  return settings;
}

export function removeMcpFromSettings(settings, mcp) {
  if (mcp.type === 'plugin') {
    delete settings.enabledPlugins?.[mcp.pluginId];
  } else {
    delete settings.mcpServers?.[mcp.id];
  }
  return settings;
}

export function getInstalledMcpIds(settings) {
  const pluginIds = Object.entries(settings.enabledPlugins || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  const serverIds = Object.keys(settings.mcpServers || {});
  return { pluginIds, serverIds };
}

export function addHookToSettings(settings, event, hookEntry) {
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks[event]) settings.hooks[event] = [];
  settings.hooks[event].push(hookEntry);
  return settings;
}

export function removeHookFromSettings(settings, event, index) {
  if (settings.hooks?.[event]) {
    settings.hooks[event].splice(index, 1);
    if (settings.hooks[event].length === 0) delete settings.hooks[event];
  }
  return settings;
}

export function addPermission(settings, type, pattern) {
  if (!settings.permissions) settings.permissions = {};
  if (!settings.permissions[type]) settings.permissions[type] = [];
  if (!settings.permissions[type].includes(pattern)) {
    settings.permissions[type].push(pattern);
  }
  return settings;
}

export function removePermission(settings, type, pattern) {
  if (settings.permissions?.[type]) {
    settings.permissions[type] = settings.permissions[type].filter(p => p !== pattern);
  }
  return settings;
}
