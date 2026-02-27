/**
 * Robust JSON extraction from LLM output.
 * Handles markdown fences, think tags, trailing commas, partial JSON.
 */

import type { LLMConfig, Message } from "../types.ts";
import { complete } from "./provider.ts";

function stripFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

function extractBalanced(text: string): string | null {
  const startChars = ["{", "["];
  const endMap: Record<string, string> = { "{": "}", "[": "]" };

  for (const startChar of startChars) {
    const startIdx = text.indexOf(startChar);
    if (startIdx === -1) continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === startChar) depth++;
      if (ch === endMap[startChar]) {
        depth--;
        if (depth === 0) return text.slice(startIdx, i + 1);
      }
    }
  }
  return null;
}

function cleanJson(text: string): string {
  return text.replace(/,\s*([}\]])/g, "$1");
}

export function parseJson<T>(raw: string): T | null {
  let text = stripFences(raw);

  try { return JSON.parse(text) as T; } catch { /* continue */ }

  const balanced = extractBalanced(text);
  if (balanced) {
    try { return JSON.parse(balanced) as T; } catch { /* continue */ }
    try { return JSON.parse(cleanJson(balanced)) as T; } catch { /* continue */ }
  }

  text = cleanJson(text);
  try { return JSON.parse(text) as T; } catch { /* continue */ }

  return null;
}

export async function extractJSON<T>(
  messages: Message[],
  config: LLMConfig,
  retries = 2,
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const msgs = attempt === 0
      ? messages
      : [...messages, {
          role: "user" as const,
          content: "Your previous response was not valid JSON. Please respond with ONLY a JSON object, no explanation.",
        }];

    const raw = await complete(msgs, config);
    const parsed = parseJson<T>(raw);
    if (parsed !== null) return parsed;
  }

  return null;
}
