# Workshop 01 — Run your first chain

**Time:** 30 minutes
**You'll leave with:** a running Markovian chain of 5+ steps, an understanding of what carryover actually carries, and the muscle memory for emitting markers.

## Setup

```bash
mkdir my-markovian && cd my-markovian
npm init -y
npm install @meterless/markovian tsx typescript
```

## Step 1 — Pick a goal that needs more than one step (5 min)

"Summarize this paragraph" doesn't. "Plan the next quarter of work" does. The Markovian shape only helps when the work is genuinely multi-step.

Good first goals:

- Draft a five-section onboarding doc
- Plan a four-phase launch
- Outline a six-step retrospective

## Step 2 — Write your stepFn (10 min)

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 600 },
});

const run = await markovian.run({
  goal: "Plan a four-phase product launch",
  stepFn: async ({ goal, carryover, step }) => {
    const prompt = `${goal}\n\nProgress so far:\n${carryover || "(starting fresh)"}\n\nNext step (${step + 1}):`;
    const output = await yourLLM(prompt);
    return { content: output, step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log(run.output);
```

## Step 3 — Teach the model the marker protocol (10 min)

Add framing that tells the model what to emit:

```ts
const framing = `
You are planning step-by-step. After each step's content, emit:

<CARRYOVER>
DECISIONS: ...
OPEN_QUESTIONS: ...
PROGRESS: step X of ~Y
</CARRYOVER>

Emit <DONE> only when the goal is fully complete.
`;
```

Prepend `framing` to your prompts. Now the model emits structured markers; the engine reads them.

## Step 4 — Watch the carryover evolve (5 min)

```ts
for (const c of run.chunks) {
  console.log(`step ${c.step}:`);
  console.log(`  in:  ${c.carryoverIn.slice(0, 80)}...`);
  console.log(`  out: ${c.carryoverOut.slice(0, 80)}...`);
}
```

You should see decisions accumulating, open questions resolving, progress advancing. If you see whole transcripts copied forward, the model isn't compressing — fix the framing.

## What you learned

- Markovian is multi-step reasoning with bounded context.
- The marker protocol is what makes carryover reliable.
- The model is doing the compression — the engine just reads the markers.
- Framing matters more than chunk size.

## Next

[Workshop 02 — Size your chunks →](./02-size-your-chunks.md)
