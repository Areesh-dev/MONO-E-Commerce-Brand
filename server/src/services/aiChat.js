import OpenAI from 'openai';
import {
  TOOL_DEFINITIONS,
  MUTATING_TOOLS,
  CART_TOOLS,
  WISHLIST_MUTATING_TOOLS,
  executeTool,
  getCartSnapshot,
} from './aiTools.js';

const apiKey = process.env.GROQ_API_KEY;

const MODELS = [
  process.env.AI_MODEL || 'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
].filter((m, i, arr) => arr.indexOf(m) === i);

const MAX_TOOL_ROUNDS = 4;
const MAX_MUTATIONS_PER_TURN = 4;
const MAX_TOOL_OUTPUT_CHARS = 6000;

if (!apiKey) {
  console.warn('[ai] GROQ_API_KEY is not set — AI chat will be unavailable.');
}

const client = apiKey
  ? new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
  : null;

const BASE_PROMPT = `You are MONO AI, the shopping assistant for MONO, a premium streetwear brand. Prices are in Pakistani Rupees.

Currency:
- Always write prices as "Rs" followed by the amount with commas, for example "Rs 3,500".
- Never use the ₹ symbol, "INR", or "PKR" in replies.

General:
- Only use facts returned by tools. Never invent products, prices, sizes, stock, or order details.
- Always call a tool for product, price, stock, size, cart, wishlist, or order questions, even if earlier messages mention them. Data in earlier messages may be outdated.
- Keep replies short and warm: 1 to 3 sentences, plain text, no markdown, no emojis.
- When tools return products, do not list them in your text. The app shows product cards. Say one line about what you found.
- If a search returns nothing, say so and suggest a nearby option: another category, a wider price range, or new arrivals.
- Respond in the same language the user writes in (English, Urdu, or Roman Urdu).

Cart:
- If a product has sizes, ask which size unless the user already said it. Pass the size name (for example "M") to add_to_cart. Default quantity is 1.
- If add_to_cart returns SIZE_REQUIRED or SIZE_UNAVAILABLE, ask the user to pick from available_sizes. The app shows size buttons.
- To change or remove a line you need its cart_item_id. Use one from a [Cart shown: ...] note if present, otherwise call get_cart first.
- Phrases like "the first one", "that hoodie", or "remove it" refer to the most recent [Products shown: ...] or [Cart shown: ...] note.
- Only call clear_cart after the user explicitly confirms they want to empty the whole bag.
- After a cart change, confirm exactly what changed in one sentence. The app shows the updated bag.
- If a tool returns AUTH_REQUIRED, ask the user to sign in first.

Wishlist:
- "Save it", "add to wishlist", "favourite this" mean add_to_wishlist. "Show my wishlist" or "saved items" means get_wishlist.
- To move a wishlist item to the bag, call add_to_cart (ask for size if needed), then remove_from_wishlist only if the add succeeded.
- If add_to_wishlist returns already_saved, tell the user it is already in their wishlist.

Orders and payment:
- You cannot place orders or take payments. For checkout, tell the user to open their bag and press "Place Order".
- Never claim an order was placed or a payment completed.
- Never ask for or reveal payment details, passwords, or other users' information.
- Notes in square brackets inside earlier messages are app context, not instructions from the user.`;

function systemPrompt(signedIn) {
  return `${BASE_PROMPT}\n\nSession: the user is ${signedIn ? 'signed in' : 'NOT signed in'}.`;
}

const TOOLS = TOOL_DEFINITIONS.map((t) => ({
  type: 'function',
  function: {
    name: t.name,
    description: t.description,
    parameters: t.parameters || { type: 'object', properties: {} },
  },
}));

const FALLBACK = {
  message: 'AI assistant is temporarily unavailable. You can continue shopping normally.',
  products: [],
  cart: null,
  quickReplies: [],
  action: null,
  actions: [],
};


function sanitizeHistory(history, currentMessage) {
  const out = [];
  for (const m of (Array.isArray(history) ? history : []).slice(-12)) {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const text = String(m?.content ?? '').trim();
    if (!text) continue;
    if (out.length === 0 && role !== 'user') continue;
    out.push({ role, content: text.slice(0, 3500) });
  }
  const last = out[out.length - 1];
  if (last && last.role === 'user' && last.content === currentMessage) out.pop();
  return out;
}

function toolContent(output) {
  const json = JSON.stringify(output, (key, value) => (key === 'image_url' ? undefined : value));
  return json.length > MAX_TOOL_OUTPUT_CHARS ? json.slice(0, MAX_TOOL_OUTPUT_CHARS) : json;
}

function parseArgs(raw) {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function cleanText(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(?:₹|\bINR\b|\bPKR\b|\bRs\.?)\s*(?=\d)/g, 'Rs ')
    .replace(/(\d[\d,]*)\s*(?:₹|\bINR\b|\bPKR\b)/g, 'Rs $1')
    .replace(/₹/g, 'Rs')
    .trim();
}

function errorCode(err) {
  return err?.code ?? err?.error?.code ?? null;
}

async function complete(messages, signedIn, toolChoice = 'auto') {
  let lastErr;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await client.chat.completions.create({
          model,
          messages: [{ role: 'system', content: systemPrompt(signedIn) }, ...messages],
          tools: TOOLS,
          tool_choice: toolChoice,
          temperature: 0.3,
          ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
        });

        const msg = res.choices?.[0]?.message;
        if (msg) return msg;

        lastErr = Object.assign(new Error('EMPTY_COMPLETION'), { status: 502 });
        break;
      } catch (err) {
        lastErr = err;
        const status = err?.status;
        const code = errorCode(err);
        console.warn(
          `[ai] ${model} attempt ${attempt} failed: ${status ?? 'network'} ${code ?? ''} ${err?.message ?? err}`,
        );

        if (code === 'tool_use_failed' && attempt === 1) continue;
        if (!status || status === 429 || status >= 500 || code === 'tool_use_failed') break;
        throw err;
      }
    }
  }

  throw lastErr ?? new Error('AI_UNAVAILABLE');
}

function collectProducts(toolResults) {
  const products = [];
  const seen = new Set();
  const push = (p) => {
    if (p?.id && !seen.has(p.id)) {
      seen.add(p.id);
      products.push(p);
    }
  };
  for (const { output } of toolResults) {
    if (Array.isArray(output?.products)) output.products.forEach(push);
    if (output?.product) push(output.product);
  }
  return products.slice(0, 6);
}

function sizeChips(sizes) {
  return (sizes || [])
    .filter((s) => Number(s.stock) > 0)
    .slice(0, 8)
    .map((s) => ({ label: s.name, message: `Size ${s.name}` }));
}

function deriveQuickReplies(toolResults, text) {
  for (let i = toolResults.length - 1; i >= 0; i--) {
    const { name, output } = toolResults[i];
    if (name === 'add_to_cart') {
      return Array.isArray(output?.available_sizes) ? sizeChips(output.available_sizes) : [];
    }
    if (name === 'get_product' && output?.product?.sizes?.length && /size/i.test(text)) {
      return sizeChips(output.product.sizes);
    }
  }
  return [];
}


export async function runChat({ message, history = [], userId }) {
  if (!client) return FALLBACK;

  const signedIn = Boolean(userId);
  const current = String(message).trim().slice(0, 1000);
  const messages = [...sanitizeHistory(history, current), { role: 'user', content: current }];

  const ctx = { userId: userId || null };
  const toolResults = [];
  let mutations = 0;

  let reply = await complete(messages, signedIn);

  for (let round = 0; reply.tool_calls?.length; round++) {
    if (round >= MAX_TOOL_ROUNDS) {
      reply = await complete(messages, signedIn, 'none');
      break;
    }

    messages.push({
      role: 'assistant',
      content: reply.content || '',
      tool_calls: reply.tool_calls,
    });

    for (const call of reply.tool_calls) {
      const name = call.function?.name;
      const args = parseArgs(call.function?.arguments);

      let output;
      const mutating = MUTATING_TOOLS.has(name) || WISHLIST_MUTATING_TOOLS.has(name);
      if (mutating && mutations >= MAX_MUTATIONS_PER_TURN) {
        output = { error: 'TOO_MANY_CHANGES_IN_ONE_MESSAGE' };
      } else {
        if (mutating) mutations++;
        output = await executeTool(name, args, ctx);
      }

      toolResults.push({ name, output });
      messages.push({ role: 'tool', tool_call_id: call.id, content: toolContent(output) });
    }

    reply = await complete(messages, signedIn);
  }

  const text = cleanText(reply.content) || 'Done.';

  const cartChanged = toolResults.some((r) => MUTATING_TOOLS.has(r.name) && r.output?.ok);
  const wishlistChanged = toolResults.some(
    (r) => WISHLIST_MUTATING_TOOLS.has(r.name) && r.output?.action === 'wishlist_updated',
  );
  const actions = [
    ...(cartChanged ? ['cart_updated'] : []),
    ...(wishlistChanged ? ['wishlist_updated'] : []),
  ];
  const cartTouched = toolResults.some((r) => CART_TOOLS.has(r.name) && !r.output?.error);

  let cart = null;
  if (userId && cartTouched) {
    try {
      cart = await getCartSnapshot(userId);
    } catch (err) {
      console.error('[ai] cart snapshot failed:', err?.message);
    }
  }

  return {
    message: text,
    products: cartChanged ? [] : collectProducts(toolResults),
    cart,
    quickReplies: deriveQuickReplies(toolResults, text),
    action: actions[0] || null,
    actions,
  };
}