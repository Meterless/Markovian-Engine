# Markovian Engine — One-Pager

**Think in steps. Win at scale.** Bounded-context reasoning for long-horizon work.

## What it is

A reasoning engine that breaks long work into bounded chunks and carries only compressed state forward. Per-step token cost stays flat. Per-run cost grows linearly, not quadratically.

## What it solves

Long agent runs blow up. Every step appends to history. By step 30 you're shipping the full transcript on every call. Bigger context windows delay the problem; they don't fix it. Markovian fixes it.

## Five core capabilities

1. **Chunk manager** — schedules bounded-context calls
2. **Marker protocol** — structured signals (`<CARRYOVER>`, `<PROGRESS>`, `<DONE>`) the engine reads
3. **Compression cascade** — preserves decisions and entities; drops prose
4. **Run history** — per-step records for replay, inspection, diffs
5. **Reflection** — optional self-review at the end of long runs

## The unique asset

**Token economics demo** — an interactive chart in the repo. Drag the sliders. Watch the naive curve grow quadratically. Watch the Markovian curve stay flat. That's the entire pitch.

## Composes with the Meterless stack

- **Scout** decides "this is long-horizon" → routes to Markovian
- **H-MEM** feeds chunk-zero carryover; final output mines back in
- **World Model** snapshots before; reconciles after
- **Swarm** can use Markovian inside individual specialist tasks

## Why it's different

- Flat cost in step count, not linear
- Markers are typed data, not prose summaries
- Bounded blast radius — a confused step affects one chunk
- Inspectable runs with full per-chunk history
- MIT-licensed. Yours forever.

## Adopt it

```bash
npm install @meterless/markovian
```

[Quickstart →](../README.md#quickstart) · [Workshops →](../workshops) · [Token economics →](../token-economics-demo)
