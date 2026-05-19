# Marker protocol

The carryover between chunks isn't free-form prose. It's a set of structured markers the model emits and the engine reads.

This is what makes carryover **bounded and reliable**. Free-form summaries drift; markers don't.

## The markers

Five core markers. The engine parses them; downstream chunks read them.

### `<CARRYOVER>...</CARRYOVER>`

The compressed state for the next chunk. The model writes this; the engine extracts it; the next chunk gets it injected at the carryover slot.

```xml
<CARRYOVER>
DECISIONS:
- Use Iceberg over Delta Lake (cost + ecosystem)
- Migration in 3 phases over 6 months

OPEN_QUESTIONS:
- Which catalog provider — Polaris or Glue?
- Backfill strategy for the cold layer?

CURRENT_STEP: 4
NEXT_STEP: 5 — design the catalog evaluation criteria
</CARRYOVER>
```

Format inside is up to your stepFn — JSON, YAML, lists, free text — as long as it fits in `carryoverTokens`.

### `<PROGRESS>...</PROGRESS>`

A per-step progress signal. Surfaced in the streaming UI. Doesn't carry into the next chunk's prompt directly, but lands in run history.

```xml
<PROGRESS>
Step 4/12 — Selected Iceberg as the target format. Drafted migration phases.
</PROGRESS>
```

### `<DONE>`

The chain is complete. The engine stops scheduling new chunks.

```xml
<DONE>
Final plan ready. See OUTPUT below.
</DONE>
```

### `<NEEDS_TOOL tool="..." input="...">`

The chunk wants the engine to invoke a tool and feed the result back into the next chunk.

```xml
<NEEDS_TOOL tool="world.query" input='{"entity":"team:bengals"}' />
```

The engine pauses, calls the tool, injects the result at the next chunk's input slot.

### `<NEEDS_CLARIFICATION>...</NEEDS_CLARIFICATION>`

The chunk needs a human answer before continuing. The engine pauses, surfaces the question to the host, resumes when the answer arrives.

```xml
<NEEDS_CLARIFICATION>
Should we evaluate Polaris alongside Glue, or commit to one before the next step?
</NEEDS_CLARIFICATION>
```

## How the model produces markers

Two patterns:

**1. Instruction in framing.** Tell the model to emit markers at specific points in its output.

```text
At the end of each step, emit:
<CARRYOVER>...</CARRYOVER> — bounded state for the next step
<PROGRESS>...</PROGRESS> — one-line summary
And <DONE> when the goal is complete.
```

**2. Structured-output mode.** If the model supports JSON mode or structured outputs, define the schema and let the engine convert to markers.

```ts
{
  output: "...",
  carryover: "...",
  progress: "...",
  done: false,
}
```

The engine accepts either. The wire format inside the engine is always the marker form.

## Parser tolerance

The parser is **tolerant**. Markers can have:

- Extra whitespace, line breaks, indentation
- Mixed case in tag names (`<carryover>` works)
- Optional trailing `/` on void markers (`<DONE/>`)
- Surrounding prose the model wrote anyway

It's **not** tolerant of:

- Malformed XML (unclosed tags)
- Markers inside markers (no nesting)
- Carryover that exceeds `carryoverTokens` (truncated with a warning)

Malformed marker → typed error, run history records the attempt.

## What happens if no marker?

If a chunk produces no `<CARRYOVER>`, the engine falls back to the compression cascade and produces one automatically from the chunk's full output. This works, but the model knows the task better than the generic compressor — encouraging marker emission is always better.

If a chunk produces no `<DONE>` and you've hit `maxChunks`, the run stops with `reason: "max-chunks"` and a structured warning. The host decides whether to continue with a fresh run or accept the partial result.

## Why structured

A model that writes "we discussed the migration phases, then talked about the catalog choice, and finally agreed to..." in free-form prose is *summarizing*. Summarization drifts. Decisions get rephrased. Numbers get rounded. Open questions disappear.

A model that writes:

```
DECISIONS:
- Iceberg over Delta
- 3-phase migration
OPEN_QUESTIONS:
- Catalog provider
```

is **structuring**. Structure is what survives compression.

The marker protocol turns "summarize your progress" into "fill in this schema." That's why it works.

## What's next

- [Compression cascade](./compression-cascade.md) — what happens to the carryover before it lands in the next chunk
- [Run history](./run-history.md) — markers in the per-step records
- [Streaming UI](./streaming-ui.md) — surfacing PROGRESS to users
