/**
 * AscendStack Integration Example
 *
 * Demonstrates how AscendStack (or any host application) imports and runs
 * Ascended-Agents as a package — producing deterministic execution plans
 * for downstream consumption by DEL.
 *
 * KEY POINTS:
 *   1. Agents are imported as packages — no framework coupling.
 *   2. Plans are generated, NOT executed here.
 *   3. DEL is responsible for executing the returned plans.
 *   4. The event bus (Ascended-Event-Bus) is wired in by the host.
 */

import { registerAgent } from '@ascended-agents/registry';
import { AgentRunner } from '@ascended-agents/runner';
import {
  sdkRequestToAgentInput,
  agentOutputToSdkResponse,
  listAgentSummaries,
  getEmbeddingHint,
} from '@ascended-agents/sdk-adapter';
import {
  codingAgentDefinition,
  billingAgentDefinition,
  invoiceAgentDefinition,
} from '@ascended-agents/agents';

// ─── Bootstrap: register agents ──────────────────────────────────────────────

registerAgent(codingAgentDefinition, 'production');
registerAgent(billingAgentDefinition, 'production');
registerAgent(invoiceAgentDefinition, 'production');

const runner = new AgentRunner();

// ─── Example 1: Run coding-agent ──────────────────────────────────────────────

async function runCodingAgent() {
  console.log('\n─── Example 1: coding-agent ──────────────────────────────────\n');

  const sdkRequest = {
    agentId: 'coding-agent',
    input: { projectPath: '/projects/ascendstack', lint: true, test: true },
    environment: 'production' as const,
    sessionId: 'session-coding-001',
    correlationId: 'trace-abc123',
  };

  // Check if the agent needs memory context (hint for SDK to pre-fetch)
  const embeddingHint = getEmbeddingHint(sdkRequest.agentId, sdkRequest.input);
  if (embeddingHint) {
    console.log('Embedding hint for VectorDB pre-fetch:', embeddingHint);
  }

  const agentInput = sdkRequestToAgentInput(sdkRequest);
  const output = await runner.run(sdkRequest.agentId, agentInput);

  const sdkResponse = agentOutputToSdkResponse(
    sdkRequest.agentId,
    codingAgentDefinition.version,
    agentInput.sessionId!,
    output,
    sdkRequest.correlationId,
  );

  console.log('SDK Response:');
  console.log(JSON.stringify(sdkResponse, null, 2));

  // This plan would now be forwarded to DEL for execution.
  console.log(`\n  → ${sdkResponse.executionPlan.length} steps ready for DEL.`);
}

// ─── Example 2: Run billing-agent ─────────────────────────────────────────────

async function runBillingAgent() {
  console.log('\n─── Example 2: billing-agent ─────────────────────────────────\n');

  const agentInput = sdkRequestToAgentInput({
    agentId: 'billing-agent',
    input: { invoiceId: 'INV-2026-001', customerId: 'CUST-42', amount: 1500.00 },
    environment: 'production',
    sessionId: 'session-billing-001',
  });

  const output = await runner.run('billing-agent', agentInput);

  console.log('Execution Plan:');
  output.executionPlan.forEach((step, i) => {
    if (step.step === 'tool_call') {
      console.log(`  [${i}] TOOL  → ${step.tool}`);
    } else if (step.step === 'event_emit') {
      console.log(`  [${i}] EVENT → ${step.event}`);
    }
  });
}

// ─── Example 3: Discover available agents via SDK adapter ─────────────────────

function discoverAgents() {
  console.log('\n─── Example 3: Agent discovery ───────────────────────────────\n');

  const summaries = listAgentSummaries('production');
  summaries.forEach((s) => {
    console.log(`  ${s.id}@${s.version} — ${s.description}`);
    console.log(`    Tools: ${s.tools.map((t) => t.name).join(', ')}`);
    console.log(`    Capabilities: ${s.capabilities.join(', ')}`);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔗 AscendStack × Ascended-Agents Integration Example\n');

  discoverAgents();
  await runCodingAgent();
  await runBillingAgent();

  console.log('\n✅ Integration example complete.\n');
}

main().catch((err) => {
  console.error('Example error:', err);
  process.exit(1);
});
