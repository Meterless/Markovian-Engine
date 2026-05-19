# Compose with Swarm

Markovian and Swarm solve different problems:

- **Swarm** coordinates *many* tasks in parallel through a governed DAG.
- **Markovian** runs *one* task across many bounded chunks.

The natural composition: **Markovian runs inside a Swarm task** when that task needs long-horizon reasoning.

## The picture

```
                    Swarm DAG
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ Task A  │    │ Task B  │    │ Task C  │
   │ short   │    │ short   │    │ LONG    │
   │ LLM call│    │ LLM call│    │ → runs  │
   └─────────┘    └─────────┘    │   inside│
                                  │   Markov│
                                  └─────────┘
        ▼              ▼              ▼
              merge & verify
```

Task A and B are short — single LLM calls. Task C needs a 20-step plan, so internally it spawns a Markovian chain. The swarm sees one task with one output; Markovian handles the bounded-context reasoning behind it.

## The handshake

Swarm passes its task input and contract to Markovian:

```ts
swarm.registerTaskKind("plan-migration", async ({ input, contract }) => {
  const run = await markovian.run({
    goal: input.goal,
    contract,                     // signed Scout contract, verified by Markovian
    chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
    stepFn: async ({ goal, carryover, step }) => {
      const out = await llm.complete(`${goal}\n${carryover}\nNext step:`);
      return { content: out, step: step + 1 };
    },
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  return { plan: run.output, runId: run.runId };
});
```

Swarm gets one output back. Verification happens at the swarm boundary, not per-chunk.

## When *not* to do this

- The task is short and fits in one model call → use a plain LLM step inside the swarm task, skip Markovian.
- The work needs multiple specialists in parallel → use Swarm with multiple tasks, each potentially short.
- The work needs both — fan out across specialists, *and* each specialist needs long reasoning → use Swarm with multiple Markovian-backed tasks.

## H-MEM in the loop

A common shape:

```
Swarm task starts
  ↓
H-MEM recall (relevant memories injected into chunk-zero carryover)
  ↓
Markovian chain (20+ chunks)
  ↓
H-MEM mining (final output → new memories)
  ↓
Swarm task complete
```

The whole composition stays bounded: the memory query is constant, the Markovian chain is constant per chunk, the swarm task itself is one entry in a bounded DAG. No part grows unboundedly with the others.

## Approval gates

If the Scout contract requires per-chunk approval, both engines respect it:

- Swarm checks the contract before invoking the task
- Markovian checks the same contract before each chunk
- Approval prompts surface in the streaming UI

A misrouted contract or expired contract gets refused at either boundary.

## What's next

- [Run history](./run-history.md) — Markovian's history inside a swarm task
- [Streaming UI](./streaming-ui.md) — surfacing per-chunk progress to swarm telemetry
