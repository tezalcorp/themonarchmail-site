// Vercel serverless function: website chatbot backed by Claude.
// Requires the ANTHROPIC_API_KEY environment variable set in the Vercel project.

import { SYSTEM_PROMPT } from "./knowledge.js";

const MODEL = "claude-haiku-5-5";
const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 12;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 20; // per visitor IP, per window
const FALLBACK_EMAIL = "contact@themonarchmail.com";

// Best-effort in-memory rate limit. Resets when the serverless instance restarts.
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "The chat assistant is not set up yet.", fallback: FALLBACK_EMAIL });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({
      error: `You've sent a lot of messages in a short time. Please try again in a few minutes, or email ${FALLBACK_EMAIL}.`,
      fallback: FALLBACK_EMAIL,
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  let messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_CHARS) }));

  // The API requires the conversation to start with a user message.
  while (messages.length && messages[0].role !== "user") messages.shift();

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Please send a question." });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages,
      }),
    });

    if (!upstream.ok) {
      return res.status(502).json({
        error: `Sorry, the assistant is unavailable right now. Please email ${FALLBACK_EMAIL}.`,
        fallback: FALLBACK_EMAIL,
      });
    }

    const data = await upstream.json();
    const reply = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return res.status(200).json({ reply: reply || `Please email ${FALLBACK_EMAIL} and we'll help you.` });
  } catch {
    return res.status(502).json({
      error: `Sorry, the assistant is unavailable right now. Please email ${FALLBACK_EMAIL}.`,
      fallback: FALLBACK_EMAIL,
    });
  }
}
