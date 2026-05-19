import { Markovian } from "@meterless/markovian";

async function main() {
  const markovian = new Markovian({
    chunkConfig: { tokensPerChunk: 4000, carryoverTokens: 600 },
  });

  const run = await markovian.run({
    goal: "Outline a 5-step plan to ship a new product newsletter",
    stepFn: async ({ goal, carryover, step }) => {
      // In real usage this is a real LLM call.
      // Stubbed here so the example runs without API keys.
      const stepPrompt = `${goal}\nProgress: ${carryover || "(none yet)"}\nStep ${step + 1}:`;
      const content = mockLLM(stepPrompt, step);
      return { content, step: step + 1 };
    },
    stopWhen: ({ step }) => step >= 5,
  });

  console.log(`Ran ${run.chunks.length} chunks`);
  console.log(`Final output:\n${run.output}\n`);
  console.log("Stats:", run.stats);
}

function mockLLM(_prompt: string, step: number): string {
  const steps = [
    "Step 1 outline — define audience and frequency.\n<CARRYOVER>AUDIENCE: PMs; FREQUENCY: weekly</CARRYOVER>",
    "Step 2 — choose channels. Email + LinkedIn.\n<CARRYOVER>AUDIENCE: PMs; FREQUENCY: weekly; CHANNELS: email,linkedin</CARRYOVER>",
    "Step 3 — content pillars. Product updates, customer stories, industry POV.\n<CARRYOVER>PILLARS: updates, stories, POV; CHANNELS: email,linkedin</CARRYOVER>",
    "Step 4 — production pipeline. Draft Monday, edit Tue, send Wed.\n<CARRYOVER>PIPELINE: draft-Mon, edit-Tue, send-Wed</CARRYOVER>",
    "Step 5 — measurement. Open rate, click rate, reply rate. <DONE>",
  ];
  return steps[step] ?? "(done)";
}

main();
