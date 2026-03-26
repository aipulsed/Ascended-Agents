#!/usr/bin/env node
/**
 * ascended-agents CLI entry point
 * Dispatches to create / validate / compile sub-commands.
 */

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case 'create': {
      const { runCreate } = await import('./create.js');
      await runCreate(args);
      break;
    }
    case 'validate': {
      const { runValidate } = await import('./validate.js');
      await runValidate(args);
      break;
    }
    case 'compile': {
      const { runCompile } = await import('./compile.js');
      await runCompile(args);
      break;
    }
    default:
      console.log(`
Ascended-Agents CLI

Usage:
  ascended-agents create  <agent-id>    Scaffold a new agent definition
  ascended-agents validate <path>       Validate an agent definition file
  ascended-agents compile  <path>       Compile and checksum an agent definition
`);
      process.exit(0);
  }
}

main().catch((err) => {
  console.error('[cli] Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
