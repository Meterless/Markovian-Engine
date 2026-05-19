import { Markovian } from "@meterless/markovian";

async function main() {
  const configs = [
    {
      label: "Information-light (creative brief)",
      chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 300, framingTokens: 250 },
    },
    {
      label: "Decision-heavy (architecture plan)",
      chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800, framingTokens: 400 },
    },
    {
      label: "State-heavy (multi-account ops)",
      chunkConfig: { tokensPerChunk: 8000, carryoverTokens: 1600, framingTokens: 500 },
    },
  ];

  for (const { label, chunkConfig } of configs) {
    const markovian = new Markovian({ chunkConfig });
    const run = await markovian.run({
      goal: "Plan 10 steps of work",
      stepFn: async ({ step }) => ({
        content: `Step ${step + 1} content. <CARRYOVER>state-${step}</CARRYOVER>`,
        step: step + 1,
      }),
      stopWhen: ({ step }) => step >= 10,
    });

    console.log(`\n[${label}]`);
    console.log(`  chunks: ${run.chunks.length}`);
    console.log(`  total tokens in: ${run.stats.totalTokensIn}`);
    console.log(`  avg per chunk: ${Math.round(run.stats.totalTokensIn / run.chunks.length)}`);
  }
}

main();
