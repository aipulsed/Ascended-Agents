import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

export async function runCreate(args: string[]): Promise<void> {
  const agentId = args[0];
  if (!agentId || !/^[a-z][a-z0-9-]*$/.test(agentId)) {
    console.error('Usage: ascended-agents create <agent-id>  (kebab-case, e.g. my-agent)');
    process.exit(1);
  }

  const dir = resolve(process.cwd(), 'packages', 'agents', 'src', agentId);
  if (existsSync(dir)) {
    console.error(`Agent directory already exists: ${dir}`);
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });

  // agent.config.ts
  writeFileSync(
    resolve(dir, 'agent.config.ts'),
    `import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ${toCamel(agentId)}Definition: AgentDefinition = {
  id: '${agentId}',
  name: '${toTitle(agentId)}',
  description: 'TODO: describe what this agent does.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    allowedEnvironments: ['dev', 'staging', 'production'],
  },
  prompt: readFileSync(resolve(__dirname, 'agent.prompt.xml'), 'utf-8'),
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
  failure: {
    retryable: true,
    maxRetries: 3,
    fallbackAgent: 'fallback-agent',
  },
};
`,
  );

  // agent.schema.ts
  writeFileSync(
    resolve(dir, 'agent.schema.ts'),
    `import { z } from 'zod';

export const inputSchema = z.object({
  // TODO: define input fields
});

export const outputSchema = z.object({
  executionPlan: z.array(z.record(z.unknown())),
  meta: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
});
`,
  );

  // agent.tools.ts
  writeFileSync(
    resolve(dir, 'agent.tools.ts'),
    `import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: '${agentId.replace(/-/g, '_')}_tool',
    description: 'TODO: describe this tool.',
    version: '1.0.0',
    inputSchema: z.object({}),
    outputSchema: z.object({}),
    tags: ['${agentId}'],
  },
];
`,
  );

  // agent.prompt.xml
  writeFileSync(
    resolve(dir, 'agent.prompt.xml'),
    `<agent>
  <role>${toTitle(agentId)} — TODO: one-line role description.</role>
  <instructions>
    TODO: step-by-step instructions for the agent.
  </instructions>
  <constraints>
    TODO: operational limits and rules.
  </constraints>
</agent>
`,
  );

  // agent.test.ts
  writeFileSync(
    resolve(dir, 'agent.test.ts'),
    `import { describe, it, expect } from 'vitest';
import { ${toCamel(agentId)}Definition } from './agent.config.js';
import { fullValidationPipeline } from '@ascended-agents/validator';

describe('${agentId}', () => {
  it('passes full validation pipeline', () => {
    const result = fullValidationPipeline(${toCamel(agentId)}Definition);
    expect(result.passed).toBe(true);
    expect(result.agentValidation.errors).toHaveLength(0);
  });

  it('has at least one tool defined', () => {
    expect(${toCamel(agentId)}Definition.tools.length).toBeGreaterThan(0);
  });
});
`,
  );

  console.log(`✅ Agent scaffolded: ${dir}`);
  console.log(`   Edit the files in that directory to complete your agent definition.`);
}

function toCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toTitle(id: string): string {
  return id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}
