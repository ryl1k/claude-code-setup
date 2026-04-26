export const CORE_MCPS = [
  {
    id: 'context7',
    name: 'Context7',
    description: 'Up-to-date docs for any library or framework',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Enhanced step-by-step reasoning',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
  },
];

export const OPTIONAL_MCPS = [
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation & UI testing',
    command: 'npx',
    args: ['-y', '@playwright/mcp@latest'],
    recommended: true,
  },
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'HTTP requests & reading web content',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    recommended: true,
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent key-value knowledge store',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    recommended: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repos, PRs, issues, and code search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    recommended: false,
    env: [
      {
        name: 'GITHUB_TOKEN',
        description: 'GitHub personal access token',
        hint: 'github.com/settings/tokens/new?scopes=repo',
        sensitive: true,
      },
    ],
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Real-time web search',
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
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    recommended: false,
    extraArgs: true,
    extraArgsDescription: 'Paths to allow (space-separated, e.g. /home /tmp)',
  },
];

export const ALL_MCPS = [...CORE_MCPS, ...OPTIONAL_MCPS];
