import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fullValidationPipeline } from '@ascended-agents/validator';

export async function runValidate(args: string[]): Promise<void> {
  const filePath = args[0];
  if (!filePath) {
    console.error('Usage: ascended-agents validate <path-to-agent.json>');
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to read/parse file: ${absolutePath}`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const { passed, agentValidation, staticAnalysis } = fullValidationPipeline(raw);

  if (agentValidation.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    agentValidation.warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  const infoItems = staticAnalysis.filter((i) => i.severity === 'info');
  const warnItems = staticAnalysis.filter((i) => i.severity === 'warning');
  const errorItems = staticAnalysis.filter((i) => i.severity === 'error');

  if (warnItems.length > 0) {
    console.warn('\n⚠️  Static analysis warnings:');
    warnItems.forEach((i) => console.warn(`   [${i.code}] ${i.message}`));
  }
  if (infoItems.length > 0) {
    console.info('\nℹ️  Static analysis info:');
    infoItems.forEach((i) => console.info(`   [${i.code}] ${i.message}`));
  }

  if (!passed) {
    console.error('\n❌ Validation FAILED:');
    agentValidation.errors.forEach((e) => console.error(`   - ${e}`));
    errorItems.forEach((i) => console.error(`   [${i.code}] ${i.message}`));
    process.exit(1);
  }

  console.log(`\n✅ Agent definition is valid: ${absolutePath}`);
}
