# 07 — Reflection pass

After a long chain completes, the model has been reasoning one bounded step at a time — it never saw the whole thing at once. The optional **reflection pass** is a final synthesis over the full run: ratify it, refine it, or branch-and-converge.

Prerequisite reading: [`docs/reflection.md`](../../docs/reflection.md).

---

## Scenario

A 12-step architecture plan finished. Before handing it to a human, run one reflection pass over the original goal + final carryover + full content + code-artifact summary to catch anything that drifted across the chain.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 900 },
  reflection: { mode: "refine" },   // "ratify" | "refine" | "branch-and-converge"
});

const run = await markovian.run({
  goal: "Design a 3-phase migration of the analytics warehouse to Iceberg.",
  stepFn: myStepFn,
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log("verdict:", run.reflection.verdict);          // "ratified" | "refined" | "diverged"
console.log("changed:", run.reflection.changed);          // boolean
console.log(run.reflection.notes);                        // what was deferred / test first

if (run.reflection.changed) {
  console.log("--- original ---\n", run.output);
  console.log("--- refined  ---\n", run.reflection.output);
}
```

## Run it

```bash
npm install @meterless/markovian tsx
npx tsx ./index.ts
```

## Expected output

```text
verdict: refined
changed: true
notes:
- Phase 2 referenced a catalog choice (Glue) decided in step 4 but dropped from the
  final summary — re-stated explicitly.
- Backfill strategy for the cold layer was an OPEN_QUESTION never closed — flagged
  as "test first / decide before phase 1".
--- original ---
 (12-step plan, catalog choice implicit)
--- refined ---
 (same plan, catalog choice restated, open question called out at the top)
```

## The three modes

| Mode | What it does | Use when |
| --- | --- | --- |
| `ratify` | Read-only verdict: is the run internally consistent? Does not edit output. | You trust the chain; you just want a pass/flag. |
| `refine` | Produces a corrected `reflection.output` if it finds drift. | Default for plans/specs going to a human. |
| `branch-and-converge` | Generates alternative endings, converges on the best. | High-stakes output where the last few steps matter most. |

## The hard rule

> Reflection failure must **not** fail the run.

```ts
// Engine behavior, conceptually:
try {
  run.reflection = await reflect(run);
} catch (err) {
  logger.warn("reflection failed", { runId: run.id, err });
  run.reflection = { verdict: "skipped", changed: false, error: String(err) };
}
// run.output is still valid and returned regardless.
```

A reflection step that errors degrades to `verdict: "skipped"` — the 12 chunks of real work are never discarded because the optional review pass hiccuped.

---

## Why it matters

- **No step ever saw the whole run.** That is the cost of bounded context: a decision in step 4 can quietly fail to surface in the step-12 summary. Reflection is the one pass that sees everything — it catches exactly the drift the carryover boundary risks.
- **Reflection is optional and isolated.** It is value-add, not load-bearing. The hard rule (a failed reflection never fails the run) is what keeps it safe to enable by default.
- **`ratify` vs `refine` is a trust decision.** A chain you trust only needs a consistency verdict; output going to a human is worth a refine. Matching the mode to the stakes is the governance.

## Next

- [`architecture-planning`](../architecture-planning/README.md) — a full decision-heavy run that ends with a ratify pass.
- [`06 — run-history-and-stats`](../run-history-and-stats/README.md) — the reflection result is recorded in the run history.
