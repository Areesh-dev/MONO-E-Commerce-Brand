import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowUp, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import { sendChat } from '../../lib/ai';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const STORAGE_KEY = 'mono-ai-chat-v2';
const MAX_STORED = 40;
const MAX_INPUT = 1000;
const WELCOME_ID = 'welcome';

const WELCOME = {
  id: WELCOME_ID,
  role: 'assistant',
  content: "Hi, I'm MONO AI. I can find pieces for you, check sizes and stock, and add or remove things from your bag.",
};

const SUGGESTIONS_PUBLIC = [
  { label: 'New arrivals', message: 'Show me the new arrivals' },
  { label: 'Popular right now', message: "What's popular right now?" },
  { label: 'Hoodies under Rs 4,000', message: 'Show me hoodies under 4000' },
];
const SUGGESTIONS_SIGNED_IN = [
  { label: "What's in my bag?", message: "What's in my bag?" },
  { label: 'My wishlist', message: 'Show my wishlist' },
  { label: 'My recent orders', message: 'Show my recent orders' },
];
const SUGGESTIONS_SIGNED_OUT = [{ label: 'FAQs', message: 'Show me the FAQs' }];

const ERROR_COPY = {
  AI_QUOTA_EXCEEDED: "Today's free AI quota is used up. The assistant will be back tomorrow; shopping works as usual.",
  AI_BUSY: 'The assistant is overloaded right now. Try again in a few seconds.',
  RATE_LIMITED: 'You are sending messages too quickly. Wait a moment, then try again.',
  AI_TIMEOUT: 'That took too long to answer. Try again.',
  NETWORK_ERROR: "Can't reach the server. Check your connection and try again.",
};
const DEFAULT_ERROR = 'The assistant is unavailable right now. You can keep shopping normally.';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function loadStored() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildHistory(messages) {
  return messages
    .filter((m) => m.id !== WELCOME_ID && !m.isError && m.content)
    .slice(-10)
    .map((m) => {
      let content = m.content;
      if (m.role === 'assistant' && m.products?.length) {
        const list = m.products
          .map((p, i) => `${i + 1}. ${p.name} (id: ${p.id})`)
          .join('; ');
        content += `\n[Products shown: ${list}]`;
      }
      if (m.role === 'assistant' && m.cart?.items?.length) {
        const list = m.cart.items
          .map(
            (it) =>
              `${it.product_name}${it.size_name ? ` size ${it.size_name}` : ''} x${it.quantity} (cart_item_id: ${it.cart_item_id})`,
          )
          .join('; ');
        content += `\n[Cart shown: ${list}]`;
      }
      return { role: m.role, content: content.slice(0, 3500) };
    });
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadStored);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const busyRef = useRef(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    setMessages((m) => (m.length === 0 ? [WELCOME] : m));
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
    }
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, loading, open, reduceMotion]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const send = async (rawText, base = messages) => {
    const text = String(rawText ?? '').trim().slice(0, MAX_INPUT);
    if (!text || busyRef.current) return;

    busyRef.current = true;
    const history = buildHistory(base);
    const userMsg = { id: newId(), role: 'user', content: text };

    setMessages([...base, userMsg]);
    setInput('');
    requestAnimationFrame(resizeInput);
    setLoading(true);

    try {
      const result = await sendChat({ message: text, history });
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: 'assistant',
          content: result.message,
          products: result.products,
          cart: result.cart,
          quickReplies: result.quickReplies,
        },
      ]);

      if (result.actions.includes('cart_updated')) {
        try {
          await refreshCart?.();
        } catch {
        }
      }

      if (result.actions.includes('wishlist_updated')) {
        window.dispatchEvent(new CustomEvent('wishlist:changed'));
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: newId(),
          role: 'assistant',
          content: ERROR_COPY[err.code] || DEFAULT_ERROR,
          isError: true,
          retryText: err.code === 'AI_QUOTA_EXCEEDED' ? null : text,
        },
      ]);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  const retry = (errorId) => {
    const idx = messages.findIndex((m) => m.id === errorId);
    if (idx === -1) return;
    const errorMsg = messages[idx];
    const cutAt = messages[idx - 1]?.role === 'user' ? idx - 1 : idx;
    send(errorMsg.retryText, messages.slice(0, cutAt));
  };

  const resetChat = () => {
    if (busyRef.current) return;
    setMessages([WELCOME]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  if (location.pathname.startsWith('/admin')) return null;

  const onlyWelcome = messages.length <= 1;
  const suggestions = [
    ...SUGGESTIONS_PUBLIC,
    ...(user ? SUGGESTIONS_SIGNED_IN : SUGGESTIONS_SIGNED_OUT),
  ];
  const lastId = messages[messages.length - 1]?.id;
  const nearLimit = input.length > MAX_INPUT - 150;

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-panel"
            {...panelMotion}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="MONO AI shopping assistant"
            aria-modal="false"
            className="fixed inset-x-0 bottom-0 z-[80] flex h-[88dvh] flex-col border-t border-ink-line bg-ink-card sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[640px] sm:max-h-[calc(100dvh-8rem)] sm:w-[420px] sm:border"
          >
            <header className="flex flex-shrink-0 items-center justify-between border-b border-ink-line px-5 py-4">
              <div className="flex flex-col">
                <span className="heading-editorial text-sm tracking-editorial text-ink-white">MONO AI</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-dim" aria-live="polite">
                  <span
                    className={`h-1.5 w-1.5 ${loading ? 'bg-ink-dim motion-safe:animate-pulse' : 'bg-ink-white'}`}
                    aria-hidden="true"
                  />
                  {loading ? 'Looking that up' : user ? 'Ready, signed in' : 'Ready'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  disabled={loading || onlyWelcome}
                  aria-label="Start a new chat"
                  title="New chat"
                  className="flex h-8 w-8 items-center justify-center text-ink-dim transition-colors hover:text-ink-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white disabled:opacity-30"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    launcherRef.current?.focus();
                  }}
                  aria-label="Close chat"
                  className="flex h-8 w-8 items-center justify-center text-ink-dim transition-colors hover:text-ink-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5"
              aria-live="polite"
            >
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isLatest={m.id === lastId}
                  busy={loading}
                  onSend={send}
                  onRetry={m.isError && m.retryText ? () => retry(m.id) : undefined}
                />
              ))}

              {onlyWelcome && !loading && (
                <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Suggestions">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.message)}
                      className="border border-ink-line px-3 py-2 text-xs text-ink-text transition-colors hover:border-ink-white hover:text-ink-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink-white"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-1.5 border-l border-ink-line py-1 pl-3" aria-label="MONO AI is typing">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block h-1.5 w-1.5 bg-ink-text"
                      animate={reduceMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-ink-line p-3">
              <div className="flex items-end gap-2 border border-ink-line bg-ink-surface p-1.5 transition-colors focus-within:border-ink-text">
                <label htmlFor="mono-ai-input" className="sr-only">
                  Message MONO AI
                </label>
                <textarea
                  id="mono-ai-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value.slice(0, MAX_INPUT));
                    resizeInput();
                  }}
                  onKeyDown={handleKey}
                  placeholder={user ? 'Ask about a product or your bag' : 'Ask about a product'}
                  className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-snug text-ink-white placeholder:text-ink-muted focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-ink-white text-ink transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink-white disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between px-0.5 text-[10px] text-ink-muted">
                <span>
                  {user
                    ? 'MONO AI can make mistakes. Check your bag before ordering.'
                    : 'Sign in to let MONO AI manage your bag.'}
                </span>
                {nearLimit && (
                  <span className="tabular-nums">
                    {input.length}/{MAX_INPUT}
                  </span>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close MONO AI' : 'Open MONO AI'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[75] flex h-14 items-center gap-2.5 border border-ink-white bg-ink-white px-4 text-ink transition-colors hover:bg-ink hover:text-ink-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink-white sm:bottom-6 sm:right-6"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden text-xs sm:inline">Ask MONO AI</span>
          </>
        )}
      </button>
    </>
  );
}