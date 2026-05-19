import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
  });

  const run = await markovian.run({
    goal: "Comprehensive technical review of the agentic IDE landscape — 10 tools, 8 dimensions, comparison memo",
    stepFn: async ({ carryover, step }) => {
      const total = 30;
      const isLast = step >= total - 1;
      const content = isLast
        ? `Final synthesis: ranked recommendation across the 10 tools. <DONE>`
        : `Step ${step + 1}/${total}: analyzed tool ${(step % 10) + 1} on dimension ${Math.floor(step / 10) + 1}. ` +
          `<CARRYOVER>${(carryover ?? "").slice(0, 600)}; +step-${step + 1}-findings</CARRYOVER>`;
      return { content, step: step + 1 };
    },
    stopWhen: ({ output }) => output.includes("<DONE>"),
    maxChunks: 35,
  });

  console.log(`Completed ${run.chunks.length} chunks`);
  console.log(`Total tokens in: ${run.stats.totalTokensIn}`);
  console.log(`Naive baseline would have been: ${run.stats.naiveTokensProjected}`);
  console.log(`Efficiency: ${run.stats.efficiency}%`);
}

main();
