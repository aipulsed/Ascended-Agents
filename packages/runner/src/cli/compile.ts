import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { compileAgent } from '../compiler.js';
import type { AgentDefinition } from '@ascended-agents/core';

export async function runCompile(args: string[]): Promise<void> {
  const filePath = args[0];
  const outPath = args[1];

  if (!filePath) {
    console.error('Usage: ascended-agents compile <path-to-agent.json> [output.json]');
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);
  let raw: AgentDefinition;
  try {
    raw = JSON.parse(readFileSync(absolutePath, 'utf-8')) as AgentDefinition;
  } catch (err) {
    console.error(`Failed to read/parse file: ${absolutePath}`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  let result;
  try {
    result = compileAgent(raw);
  } catch (err) {
    console.error('\n❌ Compilation FAILED:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const output = JSON.stringify(result.compiled, null, 2);

  if (outPath) {
    const absoluteOut = resolve(process.cwd(), outPath);
    writeFileSync(absoluteOut, output, 'utf-8');
    console.log(`✅ Compiled agent written to: ${absoluteOut}`);
  } else {
    console.log(output);
  }

  console.log(`\n   Checksum : ${result.compiled.checksum}`);
  console.log(`   Compiled : ${result.compiled.compiledAt}`);
}
