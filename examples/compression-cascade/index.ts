import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 400 },
  });

  const run = await markovian.run({
    goal: "Migrate the analytics warehouse",
    stepFn: async ({ step }) => {
      const sequence = [
        `Phase 1 analysis. <CARRYOVER>DECISIONS: target=Iceberg; PHASES: 3; OPEN: catalog</CARRYOVER>`,
        `Phase 2 — chose Polaris. <CARRYOVER>DECISIONS: target=Iceberg, catalog=Polaris; PHASES: 3; OPEN: backfill-window</CARRYOVER>`,
        `Phase 3 — 18mo backfill window. <CARRYOVER>DECISIONS: target=Iceberg, catalog=Polaris, backfill=18mo; PHASES: 3; OPEN: cutover-strategy</CARRYOVER>`,
        `Cutover dual-write. <CARRYOVER>DECISIONS: target=Iceberg, catalog=Polaris, backfill=18mo, cutover=dual-write; OPEN: (none)</CARRYOVER>`,
        `<DONE>`,
      ];
      return { content: sequence[step] ?? "<DONE>", step: step + 1 };
    },
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  console.log("Carryover evolution:\n");
  for (const c of run.chunks) {
    console.log(`step ${c.step} → ${c.carryoverOut.replace(/\n/g, " ")}`);
  }

  const diff = markovian.diff(run.chunks[0].carryoverOut, run.chunks[3].carryoverOut);
  console.log("\nStep 1 → Step 4 diff:");
  console.log("  added:", diff.added);
  console.log("  removed:", diff.removed);
}

main();
