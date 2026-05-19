import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 500 },
  });

  // Mode 1 — ratify
  const r1 = await markovian.run({
    goal: "Plan a launch",
    stepFn: async ({ step }) => ({
      content: `Step ${step + 1} content. <CARRYOVER>state-${step}</CARRYOVER>${step >= 4 ? " <DONE>" : ""}`,
      step: step + 1,
    }),
    stopWhen: ({ output }) => output.includes("<DONE>"),
    reflection: { mode: "ratify" },
  });

  console.log("[ratify]");
  console.log("  verdict:", r1.reflection?.verdict);
  console.log("  issues:", r1.reflection?.issues?.length ?? 0);

  // Mode 2 — refine
  const r2 = await markovian.run({
    goal: "Plan a launch",
    stepFn: async ({ step }) => ({
      content: `Step ${step + 1} content. <CARRYOVER>state-${step}</CARRYOVER>${step >= 4 ? " <DONE>" : ""}`,
      step: step + 1,
    }),
    stopWhen: ({ output }) => output.includes("<DONE>"),
    reflection: { mode: "refine" },
  });

  console.log("\n[refine]");
  console.log("  verdict:", r2.reflection?.verdict);
  console.log("  refined output differs:", r2.output !== r2.reflection?.originalOutput);
}

main();
