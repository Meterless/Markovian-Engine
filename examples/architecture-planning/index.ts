import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 8000, carryoverTokens: 1400 },  // decision-heavy
  });

  const phases = [
    "scope and constraints",
    "current state audit",
    "target architecture",
    "migration phases",
    "catalog and metadata",
    "data quality strategy",
    "cutover plan",
    "rollback plan",
    "team and ownership",
    "timeline and milestones",
    "cost model",
    "risk register",
    "comms plan",
    "success metrics",
    "final summary",
  ];

  const run = await markovian.run({
    goal: "Design a 6-month analytics warehouse migration to Iceberg",
    stepFn: async ({ step }) => {
      const phase = phases[step] ?? "summary";
      const isLast = step >= phases.length - 1;
      return {
        content:
          `## ${phase}\n` +
          `Decision: ...\n` +
          `<CARRYOVER>\nDECISIONS: phase-${step + 1}-decided\nOPEN_QUESTIONS: phase-${step + 2}-pending\n</CARRYOVER>` +
          (isLast ? "\n<DONE>" : ""),
        step: step + 1,
      };
    },
    stopWhen: ({ output }) => output.includes("<DONE>"),
    reflection: { mode: "ratify" },
  });

  console.log(`Plan: ${run.chunks.length} chunks`);
  console.log(`Reflection verdict: ${run.reflection?.verdict}`);
  console.log(`Efficiency: ${run.stats.efficiency}%`);
}

main();
