# Contributing to Markovian

Thanks for being here. Markovian is an MIT-licensed engine in the Meterless stack and contributions are very welcome.

## Ways to help

- **Use it and report bugs.** Especially efficiency bugs — "I expected flat per-step cost and got linear growth." Include the chunk config, the carryover sample, and the run history.
- **Add a custom compression cascade.** Domain-specific cascades (code, research, CRM) are great as separate packages that depend on `@meterless/markovian`.
- **Improve the token economics demo.** Better visualizations, model-specific presets, side-by-side mode for real model costs.
- **Add workshops.** Real-world tasks framed as Markovian chains help adoption more than another README pass.

## Getting set up

```bash
git clone https://github.com/meterless/markovian-engine
cd markovian-engine
npm install
npm test
```

The token economics demo doubles as a smoke test for the math:

```bash
npm run demo
```

## PR conventions

- One concern per PR.
- Tests for every behavior change, colocated with source.
- Doc updates land in the same PR as the behavior change.
- Token-accounting changes require an updated efficiency-model worked example.

## What we won't merge

- Compression cascades that drop decisions to fit budgets without warning. Decisions are load-bearing; an overflow event is a typed warning, not a silent drop.
- "Smarter summarization" that rephrases markers as prose. Markers are typed data; keep them that way.
- Adaptive carryover schemes that violate the bounded-cost guarantee.

If you're not sure, open a discussion before writing the code.

## Code of conduct

Be kind. Disagreements about code are fine. Disagreements about people aren't.

## License

By contributing you agree your contributions are MIT-licensed.
