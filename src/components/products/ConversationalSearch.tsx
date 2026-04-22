'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { products } from '@/lib/products';

interface Props {
  locale: string;
}

export default function ConversationalSearch({ locale }: Props) {
  const t = useTranslations('conversationSearch');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [ids, setIds] = useState<string[]>([]);

  const matched = ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  const onAsk = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/conversation-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setReply(data.reply ?? t('noResponse'));
      setIds(data.productIds ?? []);
    } catch {
      setReply(t('unavailable'));
      setIds([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-8">
      <h2 className="text-xl font-bold mb-2">{t('title')}</h2>
      <p className="text-sm text-slate-500 mb-4">{t('hint')}</p>
      <form onSubmit={onAsk} className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent"
        />
        <button className="bg-simba-orange text-white px-4 rounded-xl font-semibold" disabled={loading}>
          {loading ? t('searching') : t('ask')}
        </button>
      </form>
      {reply && <p className="mt-4 text-sm text-slate-700 dark:text-slate-200">{reply}</p>}
      {matched.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {matched.map((product) => (
            <Link key={product.id} href={`/${locale}/products/${product.id}`} className="border rounded-xl p-3 hover:border-simba-orange">
              <p className="font-semibold text-sm">{product.name}</p>
              <p className="text-xs text-slate-500">{product.category}</p>
              <p className="text-sm mt-1 font-bold text-simba-orange">{product.price} RWF</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
