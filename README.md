# Ascended-Agents

> Deterministic, typed, constrained agent definition framework for the AscendStack ecosystem.

**This is NOT AI.** It is a control plane — a formalised decision + intent definition system that outputs structured execution plans for downstream systems.

---

## What It Is

Ascended-Agents defines:
- Agent **capabilities**
- Tool access **contracts**
- Execution **constraints**
- Structured **prompts**
- **Validation** schemas
- Deterministic **output formats**

## What It Is NOT

| Concern | Owner |
|---|---|
| Execute workflows | DEL (Deterministic Execution Layer) |
| Store memory / context | [Ascended-VectorDB](https://github.com/aipulsed/Ascended-VectorDB) |
| Transport events | [Ascended-Event-Bus](https://github.com/aipulsed/Ascended-Event-Bus) |
| Generate embeddings / API | Ascended-SDK |

---

## Repository Structure

```
Ascended-Agents/
├── packages/
│   ├── core/          # AgentDefinition, ToolDefinition, ExecutionPlan types
│   ├── agents/        # 16 production-ready agent definitions
│   ├── schemas/       # Centralised Zod schemas
│   ├── registry/      # registerAgent(), getAgent(), listAgents()
│   ├── validator/     # Schema validation + static analysis
│   ├── event-bus/     # Thin adapter over @ascendstack/ascended-event-bus
│   ├── ai-fallback/   # AI fallback stubs (wired by host/DEL)
│   ├── runner/        # AgentRunner, compiler, CLI tools
│   ├── sdk-adapter/   # Type alignment with Ascended-SDK
│   └── testing/       # Schema, determinism, constraint, DEL simulation tests
├── apps/
│   └── playground/    # Local dev harness
├── examples/
│   └── integration-ascendstack/
├── .github/workflows/ # CI: typecheck → lint → test → build
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Included Agents

| Agent | Description |
|---|---|
| `coding-agent` | Lint, test, build, document, and security-scan code |
| `billing-agent` | Invoice creation, payment verification, refunds, ledger updates |
| `crm-agent` | Lead capture, contact management, scoring, follow-ups |
| `document-agent` | Text extraction, classification, validation, archival |
| `fallback-agent` | Handles pipeline failures — escalation, retry, error emission |
| `hr-agent` | Employee onboarding, leave, payroll, benefits |
| `marketing-agent` | Campaigns, lead segmentation, conversion tracking |
| `research-agent` | Data scraping, knowledge-base updates, search |
| `invoice-agent` | Invoice generation, validation, approval, archival |
| `security-agent` | Vulnerability scanning, access policy validation |
| `analytics-agent` | Metrics aggregation, dashboards, event tracking |
| `onboarding-agent` | User account creation, role assignment, provisioning |
| `notification-agent` | Email, SMS, push, scheduled notifications |
| `deployment-agent` | Deployment validation, rollback, status notifications |
| `testing-agent` | Unit/integration test runs, coverage validation |
| `reporting-agent` | Data aggregation, report generation, distribution |

---

## Execution Model

Agents are **pure functions**:

```
Agent(input) → ExecutionPlan
```

They NEVER execute. DEL does.

```json
{
  "executionPlan": [
    { "step": "tool_call", "tool": "create_invoice", "input": {} },
    { "step": "event_emit", "event": "agent.plan.generated", "payload": {} }
  ],
  "meta": {},
  "validation": { "schemaValid": true, "constraintsPassed": true, "toolsResolved": true }
}
```

---

## Event Bus Integration

Agent lifecycle events are emitted via [`@ascendstack/ascended-event-bus`](https://github.com/aipulsed/Ascended-Event-Bus).  
The `packages/event-bus` package in this repo is a **thin adapter only** — it defines agent event constants and a typed helper (`AgentEventEmitter`). All transport, retry, DLQ, and Redis logic lives in the separate Ascended-Event-Bus repository.

```ts
import { createEventBus } from '@ascendstack/ascended-event-bus';
import { AgentEventEmitter } from '@ascended-agents/event-bus';

const bus = createEventBus({ mode: 'memory' });
const emitter = new AgentEventEmitter(bus);

await emitter.planGenerated('invoice-agent', { executionPlan: [...], meta: {}, validation: {...} });
```

---

## Getting Started

```bash
pnpm install
pnpm build
pnpm test
```

### CLI Tools

```bash
# Scaffold a new agent
pnpm agent:create my-new-agent

# Validate an agent definition file
pnpm agent:validate packages/agents/src/coding-agent/agent.config.json

# Compile and checksum an agent
pnpm agent:compile packages/agents/src/coding-agent/agent.config.json compiled.json
```

### Playground

```bash
pnpm --filter playground dev
```

---

## CI/CD

GitHub Actions runs on every push and PR:

1. **Type check** — `tsc --noEmit` across all packages
2. **Lint** — ESLint with TypeScript rules
3. **Test** — Vitest unit + schema + determinism tests
4. **Build** — tsup builds all packages

---

## Core Principles

1. **Deterministic** — same input always produces same output
2. **Declarative** — JSON/TS config, no imperative logic
3. **Stateless** — no memory, no side effects
4. **Type-safe** — full TypeScript + Zod enforcement
5. **Portable** — importable as packages, no framework lock-in