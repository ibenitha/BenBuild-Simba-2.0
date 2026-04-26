import { NextRequest, NextResponse } from 'next/server';
import {
  buildCatalogContext,
  buildLocalSearchResult,
  parseGroqResult,
  sanitizeProductIds,
} from '@/lib/conversation-search';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { message?: string; locale?: string };
    const message = body.message?.trim();
    const locale = body.locale ?? 'en';

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const fallback = buildLocalSearchResult(message);
    const key = process.env.GROQ_API_KEY;

    if (!key) {
      console.warn('GROQ_API_KEY is not set, using local fallback search');
      return NextResponse.json(fallback);
    }

    const languageInstruction =
      locale === 'fr'
        ? 'You MUST respond in French. The "reply" field must be written in French.'
        : locale === 'rw'
        ? 'You MUST respond in Kinyarwanda. The "reply" field must be written in Kinyarwanda.'
        : 'You MUST respond in English. The "reply" field must be written in English.';

    const systemPrompt =
      'You are Simba AI, the friendly shopping assistant for Simba Supermarket in Kigali, Rwanda. ' +
      'Your goal is to help customers find exactly what they need from our catalog. ' +
      'You must return strict JSON only with keys "reply", "productIds", and "recommendedSearchQuery". ' +
      languageInstruction + ' ' +
      '"reply" should be a helpful, warm response (e.g., "Certainly! We have fresh milk and bread available today at our branches."). ' +
      'Keep the reply concise (max 2 sentences). ' +
      '"productIds" MUST be an array of 1 to 6 valid product IDs from the catalog provided. ' +
      '"recommendedSearchQuery" MUST be a short (1-3 words) keyword-based string for our search engine (e.g., "milk bread"). ' +
      "If the user asks for something we don't have, be polite and suggest the closest alternative from the catalog. " +
      'Never invent product IDs or mention products not in the catalog. ' +
      'Current vibe: Professional, Kigali-local, efficient.';

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Product catalog (ID, Name, Category, Description, Price):\n${buildCatalogContext()}\n\nCustomer message: ${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === 'string' ? parseGroqResult(content) : null;

    if (!parsed) {
      return NextResponse.json(fallback);
    }

    const productIds = sanitizeProductIds(parsed.productIds).slice(0, 6);
    if (productIds.length === 0) {
      return NextResponse.json({
        reply: parsed.reply?.trim() || fallback.reply,
        productIds: fallback.productIds,
        recommendedSearchQuery: parsed.recommendedSearchQuery?.trim() || fallback.recommendedSearchQuery,
      });
    }

    return NextResponse.json({
      reply: parsed.reply?.trim() || fallback.reply,
      productIds,
      recommendedSearchQuery: parsed.recommendedSearchQuery?.trim() || fallback.recommendedSearchQuery,
    });
  } catch (error) {
    console.error('Search route error:', error);
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
  }
}
