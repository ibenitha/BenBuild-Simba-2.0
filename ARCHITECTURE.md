# 🏗️ Simba 2.0 - Technical Architecture

This document provides a comprehensive overview of the technical architecture, design decisions, and implementation patterns used in Simba 2.0.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Tablet     │      │
│  │  (Desktop)   │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server Components (RSC) + Client Components         │   │
│  │  - SSR for SEO and performance                       │   │
│  │  - Client-side hydration for interactivity          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Orders  │  │  Stock   │  │ Reviews  │  │ AI Search│   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │   Groq AI    │  │  Vercel CDN  │      │
│  │  (Database   │  │  (LLM API)   │  │  (Hosting)   │      │
│  │   + Auth)    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing page (Server Component)
│   │   ├── auth/                # Auth pages (Client Components)
│   │   ├── checkout/            # Checkout flow (Client)
│   │   ├── branch-dashboard/    # Operations (Client)
│   │   └── branch-reviews/      # Reviews (Client)
│   └── api/                     # API Routes (Server-side)
│       ├── orders/              # Order CRUD
│       ├── stock/               # Inventory management
│       ├── reviews/             # Review CRUD
│       └── conversation-search/ # AI search endpoint
├── components/                  # React Components
│   ├── products/               # Product-related components
│   ├── cart/                   # Cart components
│   ├── layout/                 # Layout components
│   └── ui/                     # Reusable UI primitives
├── store/                      # Zustand State Management
│   ├── auth.ts                # Authentication state
│   ├── cart.ts                # Shopping cart state
│   └── operations.ts          # Operations state
└── lib/                       # Utilities and helpers
    ├── supabase/             # Supabase clients
    ├── products.ts           # Product data
    └── branches.ts           # Branch data
```

---

## 🔄 Data Flow

### 1. User Authentication Flow

```
User clicks "Login"
    ↓
Login form (Client Component)
    ↓
useAuthStore.login()
    ↓
Supabase Auth API
    ↓
Session token stored in cookie
    ↓
User state updated in Zustand
    ↓
UI updates (show "Logout" button)
```

### 2. Shopping Cart Flow

```
User clicks "Add to Cart"
    ↓
useCartStore.addItem()
    ↓
Cart state updated (Zustand)
    ↓
Cart persisted to localStorage
    ↓
Cart drawer shows updated count
    ↓
User proceeds to checkout
    ↓
Cart items sent to API
    ↓
Order created in database
```

### 3. AI Search Flow

```
User types query: "Do you have fresh milk?"
    ↓
ConversationalSearch component
    ↓
POST /api/conversation-search
    ↓
Build product catalog context
    ↓
Send to Groq API (llama-3.3-70b-versatile)
    ↓
Groq returns JSON: { reply, productIds }
    ↓
Validate and sanitize product IDs
    ↓
Return matched products to client
    ↓
Display AI response + product cards
```

### 4. Order Management Flow

```
Customer places order
    ↓
POST /api/orders
    ↓
Order saved to database (status: pending)
    ↓
Order appears in Branch Dashboard
    ↓
Manager assigns to staff
    ↓
PATCH /api/orders/[id] (status: accepted)
    ↓
Staff marks ready
    ↓
PATCH /api/orders/[id] (status: ready)
    ↓
Customer picks up
    ↓
PATCH /api/orders/[id] (status: completed)
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     orders      │
├─────────────────┤
│ id (PK)         │
│ customer_name   │
│ customer_email  │
│ branch_id       │
│ time_slot       │
│ deposit         │
│ status          │
│ assigned_to     │
│ created_at      │
└─────────────────┘
        │
        │ 1:N
        ↓
┌─────────────────┐
│  order_items    │
├─────────────────┤
│ id (PK)         │
│ order_id (FK)   │
│ product_id      │
│ name            │
│ quantity        │
└─────────────────┘

┌─────────────────┐
│  branch_stock   │
├─────────────────┤
│ id (PK)         │
│ branch_id       │
│ product_id      │
│ quantity        │
└─────────────────┘

┌─────────────────┐
│ branch_reviews  │
├─────────────────┤
│ id (PK)         │
│ branch_id       │
│ customer_name   │
│ rating          │
│ comment         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ customer_flags  │
├─────────────────┤
│ id (PK)         │
│ customer_email  │
│ branch_id       │
│ order_id        │
│ flag_type       │
│ comment         │
│ created_at      │
└─────────────────┘
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Auth                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Email/Pwd  │  │ Google OAuth │  │  JWT Tokens  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Row Level Security (RLS)                │
│  - Users can only read their own orders                  │
│  - Branch staff can only update their branch's orders    │
│  - Public read access for products and reviews           │
└─────────────────────────────────────────────────────────┘
```

### Security Measures

1. **Environment Variables**
   - Sensitive keys stored in `.env.local`
   - Never committed to version control
   - Server-side only for API keys

2. **Input Validation**
   - Client-side validation for UX
   - Server-side validation for security
   - Sanitization of user inputs

3. **API Security**
   - Rate limiting (Vercel default)
   - CORS configuration
   - HTTPS only in production

4. **Database Security**
   - Row Level Security (RLS) policies
   - Prepared statements (SQL injection prevention)
   - Encrypted connections

---

## 🎨 State Management

### Zustand Stores

```typescript
// Auth Store
interface AuthStore {
  currentUser: User | null
  login: (email, password) => Promise<Result>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Cart Store
interface CartStore {
  items: CartItem[]
  addItem: (product) => void
  removeItem: (productId) => void
  updateQuantity: (productId, quantity) => void
  clearCart: () => void
  total: () => number
}

// Operations Store
interface OperationsStore {
  orders: Order[]
  stockByBranch: Record<string, Record<string, number>>
  reviews: Review[]
  customerFlags: CustomerFlag[]
  fetchOrders: (branchId?) => Promise<void>
  placePickupOrder: (order) => Promise<Result>
  assignOrder: (orderId, staffName) => Promise<void>
  // ... more operations
}
```

### State Persistence

- **Cart:** Persisted to `localStorage`
- **Auth:** Session stored in HTTP-only cookie (Supabase)
- **Language:** Stored in URL path (`/en`, `/rw`, `/fr`)

---

## 🌐 Internationalization (i18n)

### Architecture

```
next-intl
    ↓
messages/
├── en.json  (English)
├── rw.json  (Kinyarwanda)
└── fr.json  (French)
    ↓
useTranslations('namespace')
    ↓
t('key')
    ↓
Translated text
```

### Translation Keys Structure

```json
{
  "nav": { ... },           // Navigation
  "home": { ... },          // Landing page
  "product": { ... },       // Product pages
  "cart": { ... },          // Shopping cart
  "checkout": { ... },      // Checkout flow
  "auth": { ... },          // Authentication
  "branchDashboard": { ... }, // Operations
  "branchReviews": { ... }  // Reviews
}
```

---

## 🤖 AI Integration

### Groq API Integration

```typescript
// Request
POST https://api.groq.com/openai/v1/chat/completions
{
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: "You are Simba Supermarket AI..."
    },
    {
      role: "user",
      content: "Product catalog:\n...\n\nCustomer: Do you have fresh milk?"
    }
  ]
}

// Response
{
  reply: "Yes! We have fresh milk available...",
  productIds: ["prod-123", "prod-456"]
}
```

### Fallback Strategy

```
Try Groq API
    ↓
Success? → Return AI results
    ↓
Failure? → Use local keyword search
    ↓
Return fallback results
```

---

## 📊 Performance Optimizations

### 1. Code Splitting

- Automatic route-based code splitting (Next.js)
- Dynamic imports for heavy components
- Lazy loading for images

### 2. Caching Strategy

```
Static Assets (images, fonts)
    ↓
CDN Cache (Vercel Edge Network)
    ↓
Browser Cache (1 year)

API Responses
    ↓
No cache (real-time data)

Product Data
    ↓
In-memory cache (5 minutes)
```

### 3. Image Optimization

- Next.js Image component
- Automatic WebP conversion
- Responsive images with srcset
- Lazy loading below the fold

### 4. Database Optimization

- Indexed columns: `id`, `branch_id`, `customer_email`, `status`
- Efficient queries with proper JOINs
- Pagination for large datasets

---

## 🚀 Deployment Architecture

### Vercel Deployment

```
GitHub Repository
    ↓
Push to main branch
    ↓
Vercel CI/CD Pipeline
    ↓
Build Next.js app
    ↓
Deploy to Edge Network
    ↓
Production URL
```

### Environment Configuration

```
Development:
- Local: http://localhost:3000
- Database: Supabase (dev project)
- API Keys: .env.local

Production:
- Hosting: Vercel
- Database: Supabase (prod project)
- API Keys: Vercel Environment Variables
- CDN: Vercel Edge Network
```

---

## 🧪 Testing Strategy

### Manual Testing

- ✅ Feature testing (all user flows)
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Responsive testing (mobile, tablet, desktop)
- ✅ i18n testing (all three languages)

### Automated Testing (Future)

- Unit tests: Jest + React Testing Library
- Integration tests: Playwright
- E2E tests: Cypress
- API tests: Supertest

---

## 📈 Monitoring & Analytics

### Current Setup

- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- Browser DevTools (performance profiling)

### Future Enhancements

- Error tracking: Sentry
- User analytics: Google Analytics / Plausible
- Performance monitoring: Vercel Speed Insights
- Uptime monitoring: UptimeRobot

---

## 🔄 CI/CD Pipeline

```
Developer pushes code
    ↓
GitHub Actions (optional)
    ↓
Run linter (ESLint)
    ↓
Run type check (TypeScript)
    ↓
Run tests (if configured)
    ↓
Vercel detects push
    ↓
Build Next.js app
    ↓
Deploy to preview URL
    ↓
Merge to main
    ↓
Deploy to production
```

---

## 🛠️ Development Workflow

### Local Development

```bash
# 1. Start development server
npm run dev

# 2. Make changes
# - Edit files in src/
# - Hot reload automatically

# 3. Test changes
# - Manual testing in browser
# - Check console for errors

# 4. Commit changes
git add .
git commit -m "feat: add new feature"
git push origin main

# 5. Deploy
# - Vercel auto-deploys on push
```

---

## 📦 Build Process

```
Source Code (TypeScript + React)
    ↓
Next.js Compiler
    ↓
Transpile TypeScript → JavaScript
    ↓
Bundle with Webpack
    ↓
Optimize (minify, tree-shake)
    ↓
Generate static pages (SSG)
    ↓
Output to .next/ directory
    ↓
Ready for deployment
```

---

## 🔮 Future Enhancements

### Phase 2 Features

1. **Real MoMo Integration**
   - MTN MoMo API
   - Airtel Money API
   - Payment webhooks

2. **Delivery System**
   - Address validation
   - Delivery zones
   - Real-time tracking
   - Driver assignment

3. **Advanced Features**
   - Product recommendations (ML)
   - Loyalty program
   - Subscription orders
   - Push notifications

4. **Admin Dashboard**
   - Analytics and reports
   - Product management
   - User management
   - System configuration

---

## 📚 Technology Decisions

### Why Next.js 14?

- ✅ Server Components for better performance
- ✅ App Router for modern routing
- ✅ Built-in API routes
- ✅ Excellent TypeScript support
- ✅ Image optimization
- ✅ Easy deployment to Vercel

### Why Supabase?

- ✅ PostgreSQL (reliable, scalable)
- ✅ Built-in authentication
- ✅ Row Level Security
- ✅ Real-time subscriptions
- ✅ Free tier for development
- ✅ Easy to use

### Why Groq?

- ✅ Fast inference (< 1 second)
- ✅ Free tier available
- ✅ llama-3.3-70b-versatile model
- ✅ JSON response format
- ✅ Simple API

### Why Zustand?

- ✅ Lightweight (< 1KB)
- ✅ Simple API
- ✅ No boilerplate
- ✅ TypeScript support
- ✅ Easy to test

### Why Tailwind CSS?

- ✅ Utility-first approach
- ✅ Fast development
- ✅ Consistent design
- ✅ Small bundle size
- ✅ Dark mode support

---

## 🎯 Design Principles

1. **Quality over Quantity**
   - Every feature works perfectly
   - No half-broken features

2. **User-Centric Design**
   - 3-second trust building
   - Clear CTAs
   - Intuitive navigation

3. **Performance First**
   - Fast page loads
   - Optimized images
   - Efficient code

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation

5. **Maintainability**
   - Clean code
   - TypeScript for type safety
   - Consistent patterns

---

## 📞 Support & Maintenance

### Code Documentation

- Inline comments for complex logic
- JSDoc for functions
- README files for each major feature

### Version Control

- Git for source control
- Semantic versioning
- Conventional commits

### Backup Strategy

- Database: Supabase automatic backups
- Code: GitHub repository
- Environment variables: Secure storage

---

**Last Updated:** April 24, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
