import { input, password } from '@inquirer/prompts';
import chalk from 'chalk';

export async function promptEnv(mcp) {
  const env = {};
  if (!mcp.env) return env;

  console.log();
  console.log(chalk.bold(`  ${mcp.name} — credentials needed:`));

  for (const envVar of mcp.env) {
    const promptFn = envVar.sensitive ? password : input;
    const value = await promptFn({
      message: `    ${envVar.name}${envVar.hint ? chalk.dim(` (${envVar.hint})`) : ''}:`,
      validate: v => (v && v.trim()) ? true : 'Required',
    });
    env[envVar.name] = value.trim();
  }

  return env;
}
