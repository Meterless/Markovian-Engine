import { Markovian } from "@meterless/markovian";
import { HMEM } from "@meterless/hmem";

async function main() {
  const memory = new HMEM({ storage: "memory", agentId: "demo-agent" });

  // Seed memory with prior context
  await memory.mine({
    source: "preference",
    content: "User prefers Iceberg over Delta Lake for new analytics work",
    provenance: { kind: "user-correction", at: new Date() },
  });
  await memory.mine({
    source: "preference",
    content: "Backfill window for migrations is typically 18 months",
    provenance: { kind: "user-correction", at: new Date() },
  });

  // Query memory for relevant context before the run
  const relevant = await memory.retrieve({ query: "data warehouse migration preferences", limit: 5 });
  const initialCarryover = relevant.map((m) => `MEM: ${m.content}`).join("\n");

  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
  });

  const run = await markovian.run({
    goal: "Plan the analytics warehouse migration",
    initialCarryover, // chunk-zero gets prior memory
    stepFn: async ({ carryover, step }) => ({
      content: `Step ${step + 1}: applying prior context. ${step >= 4 ? "<DONE>" : `<CARRYOVER>${carryover}; +step-${step + 1}</CARRYOVER>`}`,
      step: step + 1,
    }),
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  console.log(`Run completed in ${run.chunks.length} chunks`);
  console.log(`Initial carryover injected ${relevant.length} memories`);

  // Mine the final output back into memory
  await memory.mine({
    source: "agent-run",
    content: run.output,
    provenance: { kind: "markovian-run", runId: run.runId, at: new Date() },
  });

  console.log(`\nFinal output mined back into H-MEM for future recall.`);
}

main();
