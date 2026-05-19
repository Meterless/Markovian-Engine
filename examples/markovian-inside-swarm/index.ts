import { Swarm } from "@meterless/swarm";
import { Markovian } from "@meterless/markovian";

async function main() {
  const SECRET = "dev";
  const swarm = new Swarm({ verifyContractsWith: SECRET });
  const markovian = new Markovian({ verifyContractsWith: SECRET });

  // Register a swarm task kind that uses Markovian inside
  swarm.registerTaskKind("plan-migration", async ({ input, contract }) => {
    const run = await markovian.run({
      goal: input.goal,
      contract, // Markovian verifies the same contract Swarm passed
      chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
      stepFn: async ({ step }) => ({
        content: `Step ${step + 1} plan content. ${step >= 8 ? "<DONE>" : ""}`,
        step: step + 1,
      }),
      stopWhen: ({ output }) => output.includes("<DONE>"),
    });
    return { plan: run.output, chunks: run.chunks.length };
  });

  // Mock contract for the example
  const mockContract = {
    contractId: "demo",
    scope: { capabilities: ["swarm.run", "markovian.chain"], user: { id: "u" }, surface: "chat" },
    intent: { primary: { id: "plan.long-horizon" }, parameters: {}, confidence: 0.95, alternates: [] },
    risk: { level: "low", flags: [], redactions: [], approvals: [] },
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300_000).toISOString(),
    signature: "mock-signature",
  };

  // Single swarm task — uses Markovian transparently
  const result = await swarm.runSingle({
    contract: mockContract as any,
    kind: "plan-migration",
    input: { goal: "Plan the warehouse migration" },
  });

  console.log("Swarm task output:");
  console.log(`  chunks: ${result.chunks}`);
  console.log(`  plan: ${result.plan.slice(0, 120)}...`);
}

main();
