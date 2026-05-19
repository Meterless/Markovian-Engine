import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({ storage: "local" });

  const run = await markovian.run({
    goal: "Quick 8-step plan",
    stepFn: async ({ step }) => ({
      content: `Step ${step + 1} <CARRYOVER>state${step + 1}</CARRYOVER>${step >= 7 ? " <DONE>" : ""}`,
      step: step + 1,
    }),
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  // Save the runId, then load it later
  const runId = run.runId;
  const loaded = await markovian.runs.get(runId);

  console.log(`Loaded run ${runId}`);
  console.log(`Chunks: ${loaded.chunks.length}`);
  console.log(`Total tokens in: ${loaded.stats.totalTokensIn}`);
  console.log(`Efficiency vs naive: ${loaded.stats.efficiency}%`);
  console.log(`Avg latency per chunk: ${Math.round(loaded.stats.totalLatencyMs / loaded.chunks.length)} ms`);

  console.log("\nPer-chunk breakdown:");
  for (const c of loaded.chunks) {
    console.log(`  step ${c.step}: in=${c.promptTokensIn} out=${c.outputTokensOut} latency=${c.latencyMs}ms`);
  }

  // Diff carryover between two steps
  const diff = markovian.diff(loaded.chunks[1].carryoverOut, loaded.chunks[5].carryoverOut);
  console.log("\nCarryover diff steps 2 → 6:");
  console.log("  added:", diff.added);
  console.log("  removed:", diff.removed);
}

main();
