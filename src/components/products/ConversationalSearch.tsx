'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, ArrowRight, Trash2, ShoppingCart, 
  X, MessageSquare, Minus, Plus, ChevronRight
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { products } from '@/lib/products';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { Product } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  productIds?: string[];
  recommendedSearchQuery?: string;
  timestamp: Date;
}

interface ChatProductCardProps {
  product: Product;
  locale: string;
}

function ChatProductCard({ product, locale }: ChatProductCardProps) {
  const t = useTranslations('product');
  const { addItem, removeItem, updateQuantity, items } = useCartStore();
  const cartItem = items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault();
    if (qty === 1) removeItem(product.id);
    else updateQuantity(product.id, qty - 1);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition hover:border-simba-orange dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <Link href={`/${locale}/products/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="200px"
        />
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <h4 className="line-clamp-1 text-[11px] font-bold text-slate-900 dark:text-white mb-1">
          {product.name}
        </h4>
        <p className="text-[10px] font-black text-simba-orange mb-2">{formatPrice(product.price)}</p>
        
        <div className="mt-auto">
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 bg-simba-orange/10 hover:bg-simba-orange text-simba-orange hover:text-white py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95"
            >
              <ShoppingCart className="h-3 w-3" />
              {t('add')}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-simba-orange rounded-lg overflow-hidden">
              <button
                onClick={handleDec}
                className="p-1.5 text-white hover:bg-black/10 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-white font-bold text-[10px]">{qty}</span>
              <button
                onClick={handleInc}
                className="p-1.5 text-white hover:bg-black/10 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  locale: string;
}

export default function ConversationalSearch({ locale }: Props) {
  const t = useTranslations('conversationSearch');
  const { isChatOpen: isOpen, setChatOpen: setIsOpen } = useUIStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    t('suggestedPrompts.milk'),
    t('suggestedPrompts.breakfast'),
    t('suggestedPrompts.snacks'),
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const runSearch = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/conversation-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, locale }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? t('noResponse'),
        productIds: data.productIds ?? [],
        recommendedSearchQuery: data.recommendedSearchQuery,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('unavailable'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [loading, t]);

  const onAsk = (event: React.FormEvent) => {
    event.preventDefault();
    void runSearch(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 animate-bounce"
            >
              {t('welcomeBubble')}
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-simba-orange text-white shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] transition-all hover:scale-105 hover:shadow-[0_14px_50px_-10px_rgba(249,115,22,0.7)] active:scale-95",
            isOpen ? "rotate-90 opacity-0 pointer-events-none scale-0" : "rotate-0 opacity-100 scale-100"
          )}
        >
          {/* Simba logo */}
          <Image
            src="/simba-logo.png"
            alt="Ask Simba AI"
            width={34}
            height={34}
            className="object-contain brightness-0 invert"
          />
          {/* Live pulse dot */}
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-sm">
            <div className="h-2 w-2 rounded-full bg-simba-orange animate-ping" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile to prevent scroll interventions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[65] md:hidden touch-none"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-[70] flex h-[600px] w-[calc(100vw-3rem)] sm:w-[400px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900"
            >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                {/* Simba logo avatar */}
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-simba-orange shadow-lg shadow-orange-200 dark:shadow-none flex-shrink-0">
                  <Image
                    src="/simba-logo.png"
                    alt="Simba AI"
                    width={28}
                    height={28}
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{t('title')}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {t('repliesInSeconds')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 text-slate-400 transition hover:bg-slate-50 hover:text-red-500 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/20 p-5 space-y-6 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-simba-orange blur-2xl opacity-20 animate-pulse rounded-full" />
                    <div className="relative rounded-2xl bg-simba-orange p-4 shadow-lg shadow-orange-200 dark:shadow-none">
                      <Image
                        src="/simba-logo.png"
                        alt="Simba AI"
                        width={40}
                        height={40}
                        className="object-contain brightness-0 invert"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('eyebrow')}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-[240px]">
                    {t('hint')}
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-2 w-full">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void runSearch(prompt)}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-simba-orange hover:bg-orange-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {prompt}
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-simba-orange transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn('flex w-full flex-col', m.role === 'user' ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'relative group max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                        m.role === 'user'
                          ? 'bg-simba-orange text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                      )}
                    >
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      
                      {/* Timestamp */}
                      <div className={cn(
                        "absolute -bottom-5 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                        m.role === 'user' ? "right-0" : "left-0"
                      )}>
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Actionable Recommendations */}
                    {m.role === 'assistant' && m.productIds && m.productIds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 w-full space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('recommendations')}</span>
                          <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {m.productIds.map((pid) => {
                            const product = products.find((p) => p.id === pid);
                            if (!product) return null;
                            return <ChatProductCard key={pid} product={product} locale={locale} />;
                          })}
                        </div>
                        
                        {/* View All Results Button */}
                        <Link
                          href={`/${locale}/products?aiIds=${(m.productIds ?? []).join(',')}&q=${encodeURIComponent(m.recommendedSearchQuery || '')}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-300 hover:bg-simba-orange hover:text-white transition-all group shadow-sm active:scale-[0.98]"
                        >
                          {t('viewAllResults')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-1 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 w-16 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-simba-orange [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-simba-orange [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-simba-orange"></span>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <form onSubmit={onAsk} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('placeholder')}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 pl-4 pr-4 text-sm font-medium outline-none transition focus:border-simba-orange focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:focus:border-simba-orange dark:focus:bg-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-simba-orange text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <ArrowRight className="h-6 w-6" />
                  )}
                </button>
              </form>
              <p className="mt-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              {t('poweredBy')} · Kigali, Rwanda
              </p>
              </div>
              </motion.div>
              </>
              )}
              </AnimatePresence>
              </>
              );
              }

