import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 600 },
    tools: {
      "world.query": async (input) => ({ ok: true, mock: "world result", input }),
    },
  });

  markovian.on("chunk.progress", (e) => console.log(`  [progress] step ${e.step}: ${e.message}`));
  markovian.on("chunk.tool", (e) => console.log(`  [tool call] step ${e.step}: ${e.tool}`));

  const run = await markovian.run({
    goal: "Research and recommend",
    stepFn: async ({ step }) => {
      const responses = [
        `<PROGRESS>Surveying landscape.</PROGRESS>\n<NEEDS_TOOL tool="world.query" input='{"q":"vector dbs"}' />`,
        `<PROGRESS>Comparing top 3.</PROGRESS>\n<CARRYOVER>SHORTLIST: pinecone, weaviate, qdrant</CARRYOVER>`,
        `<PROGRESS>Drafting recommendation.</PROGRESS>\n<CARRYOVER>SHORTLIST: pinecone, weaviate, qdrant; LEAN: qdrant</CARRYOVER>`,
        `Final recommendation: Qdrant for the use case.\n<DONE>`,
      ];
      return { content: responses[step] ?? "<DONE>", step: step + 1 };
    },
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });

  console.log("\nMarkers parsed per chunk:");
  for (const c of run.chunks) {
    console.log(`  step ${c.step}: ${Object.keys(c.markers).join(", ") || "(none)"}`);
  }
}

main();
