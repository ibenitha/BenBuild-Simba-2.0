# ⚡ Simba 2.0 - Quick Start

**Get up and running in 5 minutes!**

---

## 🚀 Super Fast Setup

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Create `.env.local` (2 minutes)

```bash
# Copy this template
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GROQ_API_KEY=gsk_xxxxx...
```

**Get credentials:**
- Supabase: [supabase.com](https://supabase.com) → New Project → Settings → API
- Groq: [console.groq.com](https://console.groq.com) → API Keys → Create

### 3. Set Up Database (1 minute)

1. Open Supabase SQL Editor
2. Copy contents of `supabase-schema.sql`
3. Paste and run

### 4. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Quick Test

1. **Landing page loads** ✓
2. **Switch language** (EN → RW → FR) ✓
3. **Register account** ✓
4. **Add to cart** ✓
5. **Place order** ✓
6. **Check dashboard** ✓

---

## 📚 Documentation

- **Full Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Demo Script:** [DEMO_DAY_GUIDE.md](./DEMO_DAY_GUIDE.md)
- **Features:** [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🆘 Quick Troubleshooting

**Issue:** Connection fails  
**Fix:** Check `.env.local` has correct credentials

**Issue:** AI search doesn't work  
**Fix:** Verify `GROQ_API_KEY` is set

**Issue:** Orders don't appear  
**Fix:** Run database schema in Supabase

---

## 🎬 Demo Day Ready?

1. ✅ All features working
2. ✅ Practiced demo flow
3. ✅ Browser cache cleared
4. ✅ Backup data ready

**See [DEMO_DAY_GUIDE.md](./DEMO_DAY_GUIDE.md) for full demo script!**

---

**That's it! You're ready to go! 🚀**
