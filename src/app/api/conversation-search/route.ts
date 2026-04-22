import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/products';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function localMatch(query: string) {
  const lower = query.toLowerCase();
  const matched = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(lower) ||
        product.description.toLowerCase().includes(lower) ||
        product.category.toLowerCase().includes(lower)
    )
    .slice(0, 8);

  return {
    reply: matched.length
      ? `I found ${matched.length} products that match "${query}".`
      : `I could not find an exact match for "${query}", but you can browse featured categories below.`,
    productIds: matched.map((product) => product.id),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { message?: string };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      return NextResponse.json(localMatch(message));
    }

    const context = products
      .slice(0, 120)
      .map((p) => `${p.id}|${p.name}|${p.category}|${p.description}|${p.price}`)
      .join('\n');

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a supermarket shopping assistant. Return JSON only with keys "reply" and "productIds". productIds must contain existing ids from catalog.',
          },
          {
            role: 'user',
            content: `Catalog:\n${context}\n\nCustomer message: ${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(localMatch(message));
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(text) as { reply?: string; productIds?: string[] };
    const ids = (parsed.productIds ?? []).filter((id) => products.some((product) => product.id === id));

    return NextResponse.json({
      reply: parsed.reply || `Here are some products for "${message}".`,
      productIds: ids.slice(0, 8),
    });
  } catch {
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
  }
}
