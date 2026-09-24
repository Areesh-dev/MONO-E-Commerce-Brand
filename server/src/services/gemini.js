import OpenAI from 'openai';
import { TOOL_DEFINITIONS, executeTool } from './aiTools.js';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('[ai] GROQ_API_KEY is not set — AI chat will be unavailable.');
}

const client = apiKey
  ? new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
  : null;

const MODEL_CANDIDATES = [
  process.env.AI_MODEL || 'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
].filter((m, i, arr) => arr.indexOf(m) === i);

const SYSTEM_INSTRUCTION = `You are MONO AI, the shopping assistant for MONO — a premium streetwear e-commerce brand.

Rules you must always follow:
- Only use facts returned by tools. Never invent products, prices, sizes, or stock.
- If a tool returns an error, explain it briefly and offer a helpful alternative.
- Keep responses short, warm, and useful. Plain text only — no markdown headings, no emojis.
- If a product has sizes, you MUST ask the user which size before adding to cart.
- Never claim an order was placed unless a tool confirmed it.
- Never claim payment was completed unless the payment system confirmed it.
- Never ask for or reveal payment details, passwords, or another user's information.
- If the user is not signed in and asks for cart or order actions, politely ask them to sign in.
- For final checkout, always direct the user to the "Place Order" button on the cart page. You cannot place orders yourself.
- Respond in the same language the user writes in.
- When you show products, keep the text minimal (1–2 sentences) — the product cards already convey the details.`;

function lowercaseTypes(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const out = { ...schema };
  if (typeof out.type === 'string') out.type = out.type.toLowerCase();
  if (out.properties && typeof out.properties === 'object') {
    out.properties = Object.fromEntries(
      Object.entries(out.properties).map(([k, v]) => [k, lowercaseTypes(v)])
    );
  }
  if (out.items) out.items = lowercaseTypes(out.items);
  return out;
}

const TOOLS = TOOL_DEFINITIONS.map((t) => ({
  type: 'function',
  function: {
    name: t.name,
    description: t.description,
    parameters: t.parameters
      ? lowercaseTypes(t.parameters)
      : { type: 'object', properties: {} },
  },
}));

function sanitizeHistory(history) {
  const cleaned = [];
  for (const m of (history || []).slice(-12)) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const text = String(m.content || '').trim();
    if (!text) continue;
    if (cleaned.length === 0 && role !== 'user') continue;
    cleaned.push({ role, content: text.slice(0, 2000) });
  }
  return cleaned;
}

function collectProducts(toolResults) {
  const products = [];
  const seen = new Set();
  for (const tr of toolResults) {
    if (Array.isArray(tr.output?.products)) {
      for (const p of tr.output.products) {
        if (p?.id && !seen.has(p.id)) {
          seen.add(p.id);
          products.push(p);
        }
      }
    }
    if (tr.output?.product?.id && !seen.has(tr.output.product.id)) {
      seen.add(tr.output.product.id);
      products.push(tr.output.product);
    }
  }
  return products.slice(0, 6);
}

async function callModel(model, messages, toolResults, userId) {
  let lastText = '';

  for (let round = 0; round < 2; round++) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.3,
    });

    const reply = completion.choices?.[0]?.message;
    if (!reply) break;

    lastText = (reply.content || '').trim();
    const toolCalls = reply.tool_calls || [];

    if (toolCalls.length === 0) break;

    messages.push({
      role: 'assistant',
      content: reply.content || null,
      tool_calls: toolCalls,
    });

    for (const call of toolCalls) {
      let args = {};
      try {
        args = JSON.parse(call.function?.arguments || '{}');
      } catch {
        args = {};
      }

      const output = await executeTool(call.function.name, args, { userId });
      toolResults.push({ name: call.function.name, output });

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });
    }
  }

  return lastText || 'Done.';
}

export async function runChat({ message, history = [], userId }) {
  if (!client) {
    console.error('[ai] client is null — GROQ_API_KEY missing at module load');
    return {
      message: 'AI assistant is temporarily unavailable. You can continue shopping normally.',
      products: [],
      action: null,
    };
  }

  const baseMessages = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    ...sanitizeHistory(history),
    { role: 'user', content: String(message).slice(0, 1000) },
  ];

  const toolResults = [];
  let lastError = null;
  let action = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const content = await callModel(
        model,
        [...baseMessages],
        toolResults,
        userId || null
      );

      for (const tr of toolResults) {
        if (tr.output?.action) action = tr.output.action;
      }

      return {
        message: content,
        products: collectProducts(toolResults),
        action,
      };
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.response?.status;
      const msg = err?.message || String(err);
      console.error(`[ai] ${model} failed: ${status ?? 'unknown'} ${msg}`);

      const retryable = status === 429 || (typeof status === 'number' && status >= 500);
      if (!retryable) throw err;
    }
  }

  throw lastError || new Error('AI_UNAVAILABLE');
}