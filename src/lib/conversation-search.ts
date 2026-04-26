import { Product } from '@/types';
import { products } from '@/lib/products';

export interface ConversationSearchResult {
  reply: string;
  productIds: string[];
  recommendedSearchQuery?: string;
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'are',
  'do',
  'for',
  'fresh',
  'have',
  'i',
  'im',
  'is',
  'me',
  'need',
  'please',
  'show',
  'something',
  'the',
  'to',
  'want',
  'with',
]);

const INTENT_KEYWORDS: Array<{ keywords: string[]; productIds: string[] }> = [
  { keywords: ['breakfast', 'morning'], productIds: ['p13', 'p14', 'p18', 'p15', 'p16', 'p3'] },
  { keywords: ['milk', 'dairy'], productIds: ['p13', 'p16', 'p15', 'p17'] },
  { keywords: ['bread', 'sandwich'], productIds: ['p18', 'p15', 'p17', 'p13'] },
  { keywords: ['healthy', 'fresh', 'fruit', 'fruits', 'produce'], productIds: ['p21', 'p24', 'p25', 'p26', 'p27', 'p29'] },
  { keywords: ['drink', 'drinks', 'juice', 'soda', 'water', 'beverage', 'beverages'], productIds: ['p31', 'p32', 'p33', 'p34', 'p35'] },
  { keywords: ['clean', 'cleaning', 'soap', 'detergent', 'sanitary', 'wash', 'hygiene'], productIds: ['p37', 'p38', 'p39', 'p40', 'p42'] },
  { keywords: ['baby', 'kid', 'child', 'diaper', 'infant'], productIds: ['p41', 'p14', 'p13', 'p47'] },
  { keywords: ['protein', 'meat', 'chicken', 'beef', 'fish', 'poultry'], productIds: ['p19', 'p20', 'p14', 'p17'] },
  { keywords: ['cooking', 'oil', 'salt', 'spice', 'spices', 'seasoning'], productIds: ['p1', 'p2', 'p3', 'p4', 'p5'] },
  { keywords: ['snack', 'snacks', 'biscuit', 'chips', 'chocolate'], productIds: ['p43', 'p44', 'p45', 'p46'] },
];

function tokenize(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function scoreProduct(product: Product, query: string, tokens: string[]) {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  if (product.name.toLowerCase().includes(lowerQuery)) score += 12;
  if (product.description.toLowerCase().includes(lowerQuery)) score += 8;
  if (product.category.toLowerCase().includes(lowerQuery)) score += 6;

  for (const token of tokens) {
    if (product.name.toLowerCase().includes(token)) score += 5;
    if (product.description.toLowerCase().includes(token)) score += 3;
    if (product.category.toLowerCase().includes(token)) score += 2;
    if (product.unit?.toLowerCase().includes(token)) score += 1;
  }

  return score;
}

function getIntentProducts(query: string) {
  const lowerQuery = query.toLowerCase();
  const matchedIds = new Set<string>();

  for (const intent of INTENT_KEYWORDS) {
    if (intent.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      for (const productId of intent.productIds) {
        matchedIds.add(productId);
      }
    }
  }

  return products.filter((product) => matchedIds.has(product.id));
}

export function buildCatalogContext() {
  return products
    .map((product) =>
      JSON.stringify({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        priceRwf: product.price,
        unit: product.unit ?? null,
        inStock: product.inStock,
      })
    )
    .join('\n');
}

export function buildLocalSearchResult(query: string): ConversationSearchResult {
  const tokens = tokenize(query);
  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, query, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);

  const intentMatches = getIntentProducts(query);
  const combined = [...scored, ...intentMatches].reduce<Product[]>((acc, product) => {
    if (!acc.some((entry) => entry.id === product.id)) {
      acc.push(product);
    }
    return acc;
  }, []);

  const topMatches = combined.slice(0, 6);

  if (topMatches.length === 0) {
    return {
      reply: `I couldn't find an exact match for "${query}", but I can still help with groceries, drinks, cleaning supplies, or breakfast ideas.`,
      productIds: products.slice(0, 6).map((product) => product.id),
      recommendedSearchQuery: 'groceries',
    };
  }

  const names = topMatches.slice(0, 3).map((product) => product.name).join(', ');
  return {
    reply:
      topMatches.length === 1
        ? `Yes, we have ${topMatches[0].name}.`
        : `I found ${topMatches.length} relevant options for "${query}", including ${names}.`,
    productIds: topMatches.map((product) => product.id),
    recommendedSearchQuery: tokens.slice(0, 2).join(' '),
  };
}

export function parseGroqResult(content: string): ConversationSearchResult | null {
  try {
    const direct = JSON.parse(content) as ConversationSearchResult;
    if (Array.isArray(direct.productIds)) {
      return direct;
    }
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      const extracted = JSON.parse(match[0]) as ConversationSearchResult;
      if (Array.isArray(extracted.productIds)) {
        return extracted;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function sanitizeProductIds(productIds: string[] | undefined) {
  return (productIds ?? []).filter((id, index, array) => {
    return array.indexOf(id) === index && products.some((product) => product.id === id);
  });
}
