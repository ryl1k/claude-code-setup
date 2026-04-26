// type: 'plugin'  → installed via settings.enabledPlugins (official Claude plugins)
// type: 'server'  → installed via settings.mcpServers (custom npx-based MCP servers)

export const CORE_MCPS = [
  {
    id: 'context7',
    name: 'Context7',
    description: 'Up-to-date docs for any library or framework',
    type: 'plugin',
    pluginId: 'context7@claude-plugins-official',
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Enhanced step-by-step reasoning',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
  },
];

export const OPTIONAL_MCPS = [
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation & UI testing',
    type: 'plugin',
    pluginId: 'playwright@claude-plugins-official',
    recommended: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repos, PRs, issues, and code search',
    type: 'plugin',
    pluginId: 'github@claude-plugins-official',
    recommended: false,
  },
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'HTTP requests & reading web content',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    recommended: true,
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent key-value knowledge store',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    recommended: false,
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Real-time web search',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    recommended: false,
    env: [
      {
        name: 'BRAVE_API_KEY',
        description: 'Brave Search API key',
        hint: 'api.search.brave.com',
        sensitive: true,
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Read and send Slack messages',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    recommended: false,
    env: [
      {
        name: 'SLACK_BOT_TOKEN',
        description: 'Slack bot token (xoxb-...)',
        sensitive: true,
      },
      {
        name: 'SLACK_TEAM_ID',
        description: 'Slack workspace team ID',
        sensitive: false,
      },
    ],
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query PostgreSQL databases',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    recommended: false,
    env: [
      {
        name: 'POSTGRES_CONNECTION_STRING',
        description: 'Connection string (postgresql://user:pass@host/db)',
        sensitive: true,
      },
    ],
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Expanded filesystem access beyond project dir',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    recommended: false,
    extraArgs: true,
    extraArgsDescription: 'Paths to allow (space-separated, e.g. /home /tmp)',
  },
];

export const ALL_MCPS = [...CORE_MCPS, ...OPTIONAL_MCPS];
