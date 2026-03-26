/**
 * Ascended-Agents Playground
 *
 * A local development harness for:
 *   - Testing agent definitions interactively
 *   - Validating execution plans
 *   - Simulating DEL consumption of plans
 *   - Verifying SDK adapter normalisation
 *
 * Run: pnpm --filter playground dev
 */

import { registerAgent } from '@ascended-agents/registry';
import { AgentRunner } from '@ascended-agents/runner';
import { runAgentTestSuite, simulateDelExecution } from '@ascended-agents/testing';

// Import a selection of agent definitions
import {
  codingAgentDefinition,
  billingAgentDefinition,
  crmAgentDefinition,
  invoiceAgentDefinition,
  fallbackAgentDefinition,
} from '@ascended-agents/agents';

// ─── Setup ─────────────────────────────────────────────────────────────────────

console.log('\n🚀 Ascended-Agents Playground\n');

// Register agents into the in-memory registry
[
  codingAgentDefinition,
  billingAgentDefinition,
  crmAgentDefinition,
  invoiceAgentDefinition,
  fallbackAgentDefinition,
].forEach((def) => {
  registerAgent(def, 'dev');
  console.log(`  ✔ Registered: ${def.id}@${def.version}`);
});

// ─── Run a full test suite on each registered agent ───────────────────────────

async function runPlayground() {
  const runner = new AgentRunner();

  console.log('\n─── Validation & Test Suite ───────────────────────────────────\n');

  for (const def of [
    codingAgentDefinition,
    billingAgentDefinition,
    crmAgentDefinition,
    invoiceAgentDefinition,
  ]) {
    const suite = await runAgentTestSuite(def, {
      input: { projectPath: '/tmp/project', dryRun: true },
      environment: 'dev',
    });

    const icon = suite.allPassed ? '✅' : '❌';
    console.log(`${icon} ${def.id}: schema=${suite.schema.passed}, constraints=${suite.constraints.passed}, deterministic=${suite.determinism?.deterministic ?? 'n/a'}`);

    if (!suite.schema.passed) {
      console.error('   Schema errors:', suite.schema.errors);
    }
    if (!suite.constraints.passed) {
      console.error('   Constraint violations:', suite.constraints.violations);
    }
  }

  // ─── Generate a plan and simulate DEL execution ─────────────────────────────

  console.log('\n─── Execution Plan Simulation (coding-agent) ──────────────────\n');

  const output = await runner.runFromDefinition(codingAgentDefinition, {
    input: { projectPath: '/tmp/ascendstack', dryRun: false },
    environment: 'dev',
    sessionId: 'playground-session-001',
  });

  console.log('Execution Plan:');
  output.executionPlan.forEach((step, i) => {
    if (step.step === 'tool_call') {
      console.log(`  [${i}] tool_call → ${step.tool}`);
    } else if (step.step === 'event_emit') {
      console.log(`  [${i}] event_emit → ${step.event}`);
    } else {
      console.log(`  [${i}] ${step.step}`);
    }
  });

  const delSim = simulateDelExecution(output);
  console.log('\nDEL Simulation:');
  console.log(`  Steps: ${delSim.stepsExecuted}`);
  console.log(`  Tool calls: ${delSim.toolCalls.join(', ') || 'none'}`);
  console.log(`  Events: ${delSim.events.join(', ') || 'none'}`);
  console.log(`  Delegations: ${delSim.delegations.join(', ') || 'none'}`);
  console.log(`  Memory requests: ${delSim.memoryRequests.join(', ') || 'none'}`);

  console.log('\n✅ Playground complete.\n');
}

runPlayground().catch((err) => {
  console.error('Playground error:', err);
  process.exit(1);
});
