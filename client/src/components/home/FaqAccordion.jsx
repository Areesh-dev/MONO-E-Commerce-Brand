import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaqAccordion({ items }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="divide-y divide-ink-line border-y border-ink-line">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const buttonId = `faq-button-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 sm:gap-6 py-5 sm:py-6 text-left group"
              >
                <span className="text-sm uppercase tracking-nav text-ink-white group-hover:text-ink-text transition-colors">
                  {item.question}
                </span>
                {open
                  ? <Minus className="w-4 h-4 text-ink-white flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  : <Plus className="w-4 h-4 text-ink-dim group-hover:text-ink-white flex-shrink-0 transition-colors" strokeWidth={1.5} aria-hidden="true" />}
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 sm:pb-6 pr-4 sm:pr-10 text-sm text-ink-dim leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}