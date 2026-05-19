import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 600 },
  });

  let totalIn = 0;
  const budget = 24000;

  markovian.on("chunk.start", (e) => console.log(`\n● step ${e.step + 1} started...`));
  markovian.on("chunk.progress", (e) => console.log(`    ${e.message}`));
  markovian.on("chunk.complete", (e) => {
    totalIn += e.tokensIn;
    const filled = Math.round((totalIn / budget) * 20);
    const bar = "█".repeat(filled) + "░".repeat(20 - filled);
    console.log(`✓ step ${e.step} done · ${e.tokensIn} tok · [${bar}] ${totalIn}/${budget}`);
  });

  const run = await markovian.run({
    goal: "Plan a 6-step launch",
    stepFn: async ({ step }) => ({
      content: `<PROGRESS>step ${step + 1} planning</PROGRESS>\nStep ${step + 1} content. ${step >= 5 ? "<DONE>" : ""}`,
      step: step + 1,
    }),
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  console.log(`\n${run.chunks.length} chunks · ${run.stats.efficiency}% saved vs naive`);
}

main();
