/**
 * Minimal OpenAI-compatible LLM client.
 * Supports Groq, Ollama, LM Studio — any OpenAI-compatible endpoint.
 */

import type { LLMConfig, Message } from "../types.ts";

export const PRESETS: Record<string, Omit<LLMConfig, "apiKey">> = {
  "groq": {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.3,
  },
  "groq-70b": {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.3,
  },
  "groq-8b": {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    temperature: 0.3,
  },
  local: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.1:8b",
    temperature: 0.3,
  },
  "lmstudio": {
    baseUrl: "http://127.0.0.1:1234/v1",
    model: "default",
    temperature: 0.3,
  },
};

export function getConfig(preset = "groq-70b", overrides?: Partial<LLMConfig>): LLMConfig {
  const base = PRESETS[preset] ?? PRESETS["groq"];
  const config: LLMConfig = {
    ...base,
    apiKey: Deno.env.get("GROQ_API_KEY") ?? Deno.env.get("OPENAI_API_KEY"),
    ...overrides,
  };
  return config;
}

export async function complete(messages: Message[], config: LLMConfig): Promise<string> {
  const url = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const body = {
    model: config.model,
    messages,
    temperature: config.temperature ?? 0.3,
    max_tokens: 1024,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  // Strip <think> tags (common with reasoning models)
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
