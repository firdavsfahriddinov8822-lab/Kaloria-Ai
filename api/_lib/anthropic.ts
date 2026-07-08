import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | undefined;

export function getAnthropic(): Anthropic | undefined {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return undefined;
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
}

export function anthropicModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
}
