import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { basename } from 'path';
import chalk from 'chalk';
import { input, select, checkbox, confirm } from '@inquirer/prompts';
import { section, successLine, warnLine } from '../ui.js';

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'C/C++', 'Ruby', 'Other'];

const FRAMEWORKS = {
  TypeScript: ['Next.js', 'React', 'Vue', 'Angular', 'SvelteKit', 'Express', 'Fastify', 'NestJS', 'None'],
  JavaScript: ['Next.js', 'React', 'Vue', 'Angular', 'Express', 'Fastify', 'None'],
  Python: ['FastAPI', 'Django', 'Flask', 'None'],
  Go: ['Gin', 'Echo', 'Fiber', 'chi', 'None'],
  Rust: ['Actix', 'Axum', 'None'],
  Java: ['Spring Boot', 'Quarkus', 'Micronaut', 'None'],
  'C#': ['.NET / ASP.NET Core', 'None'],
};

const PKG_MANAGERS = {
  TypeScript: ['npm', 'pnpm', 'yarn', 'bun'],
  JavaScript: ['npm', 'pnpm', 'yarn', 'bun'],
  Python: ['pip', 'uv', 'poetry', 'conda'],
  Go: ['go mod'],
  Rust: ['cargo'],
  Java: ['Maven', 'Gradle'],
  'C#': ['dotnet'],
};

export async function generateClaudeMd() {
  section('GENERATE CLAUDE.md');

  const outPath = join(process.cwd(), 'CLAUDE.md');

  if (existsSync(outPath)) {
    const overwrite = await confirm({
      message: `CLAUDE.md already exists in this directory. Overwrite?`,
      default: false,
    });
    if (!overwrite) return;
  }

  const projectName = await input({
    message: 'Project name:',
    default: basename(process.cwd()),
  });

  const description = await input({
    message: 'Short description (optional):',
  });

  const language = await select({
    message: 'Primary language:',
    choices: LANGUAGES.map(l => ({ name: l, value: l })),
  });

  const frameworks = FRAMEWORKS[language] || [];
  const framework = frameworks.length > 0
    ? await select({
        message: 'Framework:',
        choices: frameworks.map(f => ({ name: f, value: f })),
      })
    : null;

  const pkgManagers = PKG_MANAGERS[language] || [];
  const pkgManager = pkgManagers.length > 0
    ? await select({
        message: 'Package manager:',
        choices: pkgManagers.map(p => ({ name: p, value: p })),
      })
    : null;

  const installCmd = await input({
    message: 'Install dependencies command:',
    default: defaultInstallCmd(pkgManager),
  });

  const devCmd = await input({
    message: 'Run dev server command:',
    default: defaultDevCmd(pkgManager),
  });

  const testCmd = await input({
    message: 'Run tests command:',
    default: defaultTestCmd(pkgManager),
  });

  const buildCmd = await input({
    message: 'Build command:',
    default: defaultBuildCmd(pkgManager),
  });

  const lintCmd = await input({
    message: 'Lint / format command (optional):',
    default: defaultLintCmd(pkgManager),
  });

  const notes = await input({
    message: 'Any special notes or rules for Claude (optional):',
  });

  const content = buildClaudeMd({
    projectName,
    description,
    language,
    framework,
    pkgManager,
    installCmd,
    devCmd,
    testCmd,
    buildCmd,
    lintCmd,
    notes,
  });

  writeFileSync(outPath, content, 'utf8');
  console.log();
  successLine(`CLAUDE.md written to ${outPath}`);
}

function buildClaudeMd({ projectName, description, language, framework, pkgManager, installCmd, devCmd, testCmd, buildCmd, lintCmd, notes }) {
  const stack = [language, framework !== 'None' ? framework : null, pkgManager].filter(Boolean).join(' · ');
  const desc = description?.trim() ? `\n${description.trim()}\n` : '';

  let md = `# ${projectName}\n${desc}
## Stack

${stack}

## Commands

\`\`\`bash
# Install dependencies
${installCmd}

# Development
${devCmd}

# Build
${buildCmd}

# Tests
${testCmd}
${lintCmd ? `\n# Lint / format\n${lintCmd}` : ''}
\`\`\`
`;

  if (notes?.trim()) {
    md += `\n## Notes\n\n${notes.trim()}\n`;
  }

  return md;
}

function defaultInstallCmd(pm) {
  const map = { npm: 'npm install', pnpm: 'pnpm install', yarn: 'yarn', bun: 'bun install', pip: 'pip install -r requirements.txt', uv: 'uv sync', poetry: 'poetry install', cargo: 'cargo build', 'go mod': 'go mod download', dotnet: 'dotnet restore' };
  return map[pm] || 'install';
}

function defaultDevCmd(pm) {
  const map = { npm: 'npm run dev', pnpm: 'pnpm dev', yarn: 'yarn dev', bun: 'bun run dev', pip: 'python main.py', uv: 'uv run main.py', poetry: 'poetry run python main.py', cargo: 'cargo run', 'go mod': 'go run .', dotnet: 'dotnet run' };
  return map[pm] || 'run dev';
}

function defaultTestCmd(pm) {
  const map = { npm: 'npm test', pnpm: 'pnpm test', yarn: 'yarn test', bun: 'bun test', pip: 'pytest', uv: 'uv run pytest', poetry: 'poetry run pytest', cargo: 'cargo test', 'go mod': 'go test ./...', dotnet: 'dotnet test' };
  return map[pm] || 'test';
}

function defaultBuildCmd(pm) {
  const map = { npm: 'npm run build', pnpm: 'pnpm build', yarn: 'yarn build', bun: 'bun run build', cargo: 'cargo build --release', 'go mod': 'go build', dotnet: 'dotnet build' };
  return map[pm] || 'build';
}

function defaultLintCmd(pm) {
  const map = { npm: 'npm run lint', pnpm: 'pnpm lint', yarn: 'yarn lint', bun: 'bun run lint' };
  return map[pm] || '';
}
