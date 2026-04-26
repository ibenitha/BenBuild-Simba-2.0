# 🔧 Simba 2.0 - Complete Setup Guide

This guide will walk you through setting up Simba 2.0 from scratch.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18 or higher installed
- ✅ npm or yarn package manager
- ✅ A code editor (VS Code recommended)
- ✅ A modern web browser (Chrome/Edge/Firefox)
- ✅ Git installed

---

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd simba-supermarket

# Install dependencies
npm install
```

**Expected output:**
```
added 300+ packages in 30s
```

---

### Step 2: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign in with GitHub** (or create account)
4. **Create a new project:**
   - Organization: Select or create one
   - Name: `simba-supermarket`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to Rwanda (e.g., Frankfurt, London)
   - Pricing Plan: Free

5. **Wait 2-3 minutes** for project to be created

---

### Step 3: Get Supabase Credentials

1. **In your Supabase project dashboard:**
   - Click "Settings" (gear icon in sidebar)
   - Click "API"

2. **Copy these values:**
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

### Step 4: Set Up Database Schema

1. **In Supabase dashboard:**
   - Click "SQL Editor" in sidebar
   - Click "New query"

2. **Copy the entire contents of `supabase-schema.sql`**

3. **Paste into the SQL Editor**

4. **Click "Run"** (or press Ctrl/Cmd + Enter)

5. **Verify tables were created:**
   - Click "Table Editor" in sidebar
   - You should see: `orders`, `order_items`, `branch_stock`, `branch_reviews`, `customer_flags`

---

### Step 5: Enable Google OAuth (Optional but Recommended)

1. **In Supabase dashboard:**
   - Go to "Authentication" → "Providers"
   - Find "Google" and toggle it ON

2. **Get Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

3. **Back in Supabase:**
   - Paste Client ID and Client Secret
   - Click "Save"

---

### Step 6: Get Groq API Key

1. **Go to [console.groq.com](https://console.groq.com)**

2. **Sign up for free** (GitHub or Google)

3. **Create an API key:**
   - Click "API Keys" in sidebar
   - Click "Create API Key"
   - Name: `simba-supermarket`
   - Copy the key (starts with `gsk_...`)
   - **Save it immediately** (you won't see it again!)

---

### Step 7: Configure Environment Variables

1. **Create `.env.local` file** in project root:

```bash
# In project root directory
touch .env.local
```

2. **Add your credentials:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Groq API Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

**Replace:**
- `https://xxxxx.supabase.co` with your Supabase Project URL
- `eyJhbGci...` with your Supabase anon key
- `gsk_xxx...` with your Groq API key

3. **Save the file**

---

### Step 8: Run the Application

```bash
# Start development server
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

---

### Step 9: Verify Everything Works

1. **Open browser:** `http://localhost:3000`

2. **Test landing page:**
   - ✅ Hero carousel should auto-slide
   - ✅ All images load
   - ✅ Categories display correctly

3. **Test language switching:**
   - Click language dropdown (top right)
   - Switch to Kinyarwanda (RW)
   - Switch to French (FR)
   - ✅ All text should translate

4. **Test authentication:**
   - Click "Login" (top right)
   - Click "Create account"
   - Register with email: `test@simba.rw`
   - Password: `password123`
   - ✅ Should redirect to home page
   - ✅ Should show "Logout" button

5. **Test conversational search:**
   - Scroll to "Ask Simba AI" section
   - Type: "Do you have fresh milk?"
   - Click "Ask"
   - ✅ Should show AI response
   - ✅ Should show matched products

6. **Test checkout flow:**
   - Add products to cart
   - Click cart icon (top right)
   - Click "Proceed to Checkout"
   - Select a branch
   - Choose time slot
   - Enter phone number
   - Click "Continue to MoMo Deposit"
   - Click "Simulate MoMo Payment"
   - ✅ Should show order confirmation

7. **Test branch dashboard:**
   - Navigate to `/branch-dashboard`
   - ✅ Should see the order you just placed
   - Click "Assign" button
   - Enter staff name: "Staff A"
   - ✅ Order status should change to "Preparing"

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Supabase connection fails

**Check:**
1. ✅ `.env.local` file exists in project root
2. ✅ Environment variables are correct (no extra spaces)
3. ✅ Supabase project is active (not paused)
4. ✅ Database schema was run successfully

**Test connection:**
```bash
# In browser console (F12)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
# Should show your Supabase URL
```

---

### Issue: AI search returns "unavailable"

**Check:**
1. ✅ `GROQ_API_KEY` is set in `.env.local`
2. ✅ API key is valid (not expired)
3. ✅ No extra spaces in the key

**Test API key:**
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
# Should return list of models
```

---

### Issue: Google OAuth doesn't work

**Check:**
1. ✅ Google provider is enabled in Supabase
2. ✅ Redirect URI is correct
3. ✅ Client ID and Secret are correct

**Note:** Google OAuth requires HTTPS in production. In development, it may not work on `localhost`. This is normal.

---

### Issue: Orders don't appear in dashboard

**Check:**
1. ✅ User is logged in
2. ✅ Order was placed successfully (check confirmation page)
3. ✅ Correct branch is selected in dashboard
4. ✅ Database tables exist (check Supabase Table Editor)

**Refresh data:**
- Click the "Refresh" button in dashboard
- Or reload the page

---

### Issue: Translations not working

**Check:**
1. ✅ Files exist: `messages/en.json`, `messages/rw.json`, `messages/fr.json`
2. ✅ No JSON syntax errors (use JSON validator)
3. ✅ Restart dev server after changing translation files

---

### Issue: Build fails

**Common causes:**
1. TypeScript errors - Check terminal output
2. Missing environment variables - Check `.env.local`
3. Outdated dependencies - Run `npm update`

**Solution:**
```bash
# Check for errors
npm run build

# If errors, fix them and try again
```

---

## 🎯 Quick Test Checklist

After setup, verify these work:

- [ ] Landing page loads
- [ ] Language switching (EN/RW/FR)
- [ ] User registration
- [ ] User login
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Order appears in dashboard
- [ ] AI search returns results
- [ ] Branch operations work
- [ ] Reviews can be submitted

---

## 📦 Optional: Seed Sample Data

To populate the database with sample orders and reviews:

1. **Create a seed script** (optional - for demo purposes)
2. **Or manually create test data:**
   - Register 2-3 test users
   - Place 5-10 test orders
   - Submit 3-5 reviews

---

## 🚀 Ready for Demo Day

Once everything works:

1. **Practice the demo flow** (see `DEMO_DAY_GUIDE.md`)
2. **Clear browser cache** before demo
3. **Test in incognito mode** to ensure fresh state
4. **Have backup data** ready (pre-created orders)

---

## 📞 Need Help?

**Common resources:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq Documentation](https://console.groq.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

**Check these files:**
- `IMPLEMENTATION_STATUS.md` - Feature details
- `DEMO_DAY_GUIDE.md` - Demo script
- `README.md` - Project overview

---

## ✅ Setup Complete!

You're now ready to:
- Develop new features
- Customize the design
- Practice for demo day
- Deploy to production

**Good luck! 🚀**
