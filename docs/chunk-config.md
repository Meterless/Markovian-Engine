# Chunk config

The chunk configuration is the entire budget profile for a run. Get this right and the engine flies. Get it wrong and you either run out of context or spend tokens on nothing.

## The shape

```ts
type ChunkConfig = {
  tokensPerChunk: number;       // total per-chunk budget for the model call
  carryoverTokens: number;      // how much state we forward to chunk N+1
  framingTokens: number;        // budget reserved for goal + system framing
  overlapTokens?: number;       // optional overlap between chunks (default 0)
  maxChunks?: number;           // hard stop after this many chunks
  outputBudget?: number;        // expected per-step output size for accounting
};
```

## Defaults

```ts
{
  tokensPerChunk: 6000,
  carryoverTokens: 800,
  framingTokens: 400,
  outputBudget: 1200,
  maxChunks: 50,
}
```

These work for most 8K-context models with reasonable headroom. Scale them to your model.

## How to size them

### `tokensPerChunk`

Set this to **60-75% of your model's context window**. Leave headroom for output, framing variance, and any unexpected tool returns.

| Model context | Recommended `tokensPerChunk` |
|---|---|
| 8K | 5000 |
| 32K | 22000 |
| 128K | 90000 |
| 200K | 140000 |

Larger isn't automatically better. Bigger chunks mean fewer chunks for the same work, but each chunk is more expensive and slower. Smaller chunks mean more roundtrips but tighter per-step focus.

### `carryoverTokens`

The single most consequential knob. It controls how much state crosses chunk boundaries.

Rule of thumb: **carryover should be 10-15% of `tokensPerChunk`**. Smaller than that and important state gets lost in compression. Larger than that and you're paying for state that should have been compressed.

| Task shape | Recommended carryover ratio |
|---|---|
| Information-light (creative writing, brainstorming) | 5-10% |
| Decision-heavy (planning, architecture) | 12-18% |
| State-heavy (multi-account ops, long debugging) | 15-22% |

### `framingTokens`

The goal, system instructions, and any persistent context. This is paid every chunk, so it grows the bill.

Keep framing **tight and stable**. A 200-token goal beats a 1200-token system prompt with options the model rarely uses.

### `overlapTokens`

Optional. Some tasks benefit from a small overlap between chunks — the last 100-200 tokens of chunk N also appear at the start of chunk N+1, giving the model a "where we just were" hint independent of compressed carryover.

Set this to 0 for most tasks. Set it to 100-300 for tasks where continuity matters more than savings (long-form writing, code reasoning).

### `maxChunks`

A hard stop. Prevents runaway runs from spending budget on a stuck loop.

Default 50 is conservative. Tune up for genuinely long migration plans (200+) or down for tighter chains (15-20).

### `outputBudget`

Estimated per-step output size, used for cost accounting and budget projection.

Doesn't enforce — the model still emits what it emits — but the engine uses it to flag "this run is going to exceed the chunk budget if outputs keep growing."

## Per-task overrides

For tasks where one shape doesn't fit:

```ts
const run = await markovian.run({
  goal: "...",
  chunkConfig: { tokensPerChunk: 18000, carryoverTokens: 2400 }, // override for this run
  stepFn: ...,
});
```

## Validation

The engine validates configs at load time:

- `tokensPerChunk >= framingTokens + carryoverTokens + outputBudget`
- `carryoverTokens > 0`
- `tokensPerChunk` fits in the configured model's context

A config that doesn't budget enough for output produces a typed error at runtime, not a silent truncation.

## What's next

- [Marker protocol](./marker-protocol.md) — what the model emits
- [Compression cascade](./compression-cascade.md) — how carryover gets produced
- [Efficiency model](./efficiency-model.md) — the math behind the budget
