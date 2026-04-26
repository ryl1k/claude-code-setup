// type: 'plugin'  → installed via settings.enabledPlugins (official Claude plugins)
// type: 'server'  → installed via settings.mcpServers (npx/uvx-based MCP servers)

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
  // ── Official Claude plugins ───────────────────────────────────────
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
    recommended: true,
  },
  {
    id: 'frontend-design',
    name: 'Frontend Design',
    description: 'Production-grade UI component generation',
    type: 'plugin',
    pluginId: 'frontend-design@claude-plugins-official',
    recommended: false,
  },

  // ── MCP servers — always useful, no credentials ───────────────────
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
    description: 'Persistent knowledge graph across sessions',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    recommended: false,
  },

  // ── MCP servers — credentials required ───────────────────────────
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Real-time web search',
    type: 'server',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    recommended: false,
    env: [
      { name: 'BRAVE_API_KEY', description: 'Brave Search API key', hint: 'api.search.brave.com', sensitive: true },
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
      { name: 'SLACK_BOT_TOKEN', description: 'Slack bot token (xoxb-...)', sensitive: true },
      { name: 'SLACK_TEAM_ID', description: 'Slack workspace team ID', sensitive: false },
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
      { name: 'POSTGRES_CONNECTION_STRING', description: 'Connection string (postgresql://user:pass@host/db)', sensitive: true },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Read and write Notion pages & databases',
    type: 'server',
    command: 'npx',
    args: ['-y', '@notionhq/notion-mcp-server'],
    recommended: false,
    env: [
      { name: 'OPENAPI_MCP_HEADERS', description: 'JSON header with Notion token: {"Authorization":"Bearer ntn_xxx","Notion-Version":"2022-06-28"}', sensitive: true },
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Manage Supabase projects — DB, auth, storage, edge functions',
    type: 'server',
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase'],
    recommended: false,
    env: [
      { name: 'SUPABASE_ACCESS_TOKEN', description: 'Supabase personal access token', hint: 'app.supabase.com/account/tokens', sensitive: true },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Read and manage Linear issues & projects',
    type: 'server',
    command: 'npx',
    args: ['-y', 'linear-mcp-server'],
    recommended: false,
    env: [
      { name: 'LINEAR_API_KEY', description: 'Linear API key', hint: 'linear.app/settings/api', sensitive: true },
    ],
  },

  // ── MCP servers — optional setup ─────────────────────────────────
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
