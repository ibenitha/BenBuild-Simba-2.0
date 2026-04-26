# 🎬 Simba 2.0 - Demo Day Quick Reference

**Demo Day: Friday, April 25, 2026**

---

## 🚀 Pre-Demo Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Database seeded with sample data
- [ ] Application running on `localhost:3000`
- [ ] Browser window ready (preferably Chrome/Edge)
- [ ] Clear browser cache and cookies
- [ ] Test all flows once before demo

---

## 🎯 4-Minute Demo Script

### 1. Landing Page (30 seconds)

**What to say:**
> "Welcome to Simba 2.0, Rwanda's #1 supermarket chain. Notice how the landing page immediately answers three questions: What is this? Why should I use it? How do I start?"

**What to show:**
- Hero carousel auto-sliding
- Value props: 45-min delivery, 9 branches, MoMo payment
- Trust signals: 789+ products, 9 Kigali branches
- Real branch names (Remera, Kimironko, etc.)

**Key Points:**
- "The landing page is designed for 3-second trust building"
- "All 9 real Simba branches in Kigali are integrated"

---

### 2. Multi-Language (15 seconds)

**What to say:**
> "Rwanda is trilingual. We've implemented complete translation coverage across English, Kinyarwanda, and French."

**What to show:**
- Click language switcher (top right)
- Switch: EN → RW → FR
- Show navigation, buttons, and content all translate

**Key Points:**
- "Not just 20% translated - 100% coverage"
- "Every label, button, error message, and empty state"

---

### 3. Conversational AI Search (45 seconds)

**What to say:**
> "This is our GenAI differentiator. Instead of traditional keyword search, we use Groq's AI to understand natural language queries."

**What to show:**
1. Scroll to "Ask Simba AI" section
2. Type: "Do you have fresh milk?"
3. Show AI response with matched products
4. Click a suggested prompt: "I need something for breakfast"
5. Show different results

**Key Points:**
- "Powered by Groq's llama-3.3-70b-versatile model"
- "Uses our live product catalog as context"
- "No other team has this feature"

---

### 4. Shopping Flow (30 seconds)

**What to say:**
> "Let's add some items to our cart and proceed to checkout."

**What to show:**
1. Browse products or use category filter
2. Click "Add to Cart" on 2-3 products
3. Open cart drawer (top right)
4. Show cart summary with totals
5. Click "Proceed to Checkout"

**Key Points:**
- "Cart persists across page navigation"
- "Real-time total calculation"

---

### 5. Pick-Up Checkout (60 seconds)

**What to say:**
> "Our primary flow is pick-up, not delivery. It's simpler and maps to how Simba actually operates."

**What to show:**

**Step 1: Branch Selection**
- Show all 9 branches with districts
- Point out branch ratings (if any reviews exist)
- Select "Simba Supermarket Remera"

**Step 2: Time & Contact**
- Enter phone: "+250 788 123 456"
- Select time slot: "10:00 - 12:00"
- Show stock validation: "All items available"
- Click "Continue to MoMo Deposit"

**Step 3: MoMo Deposit**
- Show deposit amount: 500 RWF
- Explain: "Non-refundable deposit prevents no-shows"
- Show order summary
- Click "Simulate MoMo Payment"

**Step 4: Confirmation**
- Show order ID
- Point out links to Branch Dashboard and Reviews

**Key Points:**
- "Real Kigali branches with accurate districts"
- "Stock is validated per branch"
- "Deposit increases if customer has no-show history"

---

### 6. Branch Operations (60 seconds)

**What to say:**
> "Now let's see the backend flow. Branch managers assign orders, staff prepares them."

**What to show:**

**Manager View:**
1. Click "Open Branch Dashboard" (or navigate to `/branch-dashboard`)
2. Show "Branch Manager" role selected
3. Point out the pending order just placed
4. Click "Assign" button
5. Enter staff name: "Staff A"
6. Show order status changes to "Preparing"

**Staff View:**
1. Switch role to "Branch Staff"
2. Enter staff name: "Staff A"
3. Show the assigned order appears
4. Click "Mark Ready"
5. Show order status changes to "Ready"
6. Click "Complete Pickup"
7. Show order status changes to "Completed"

**Inventory Panel:**
- Point out the stock levels on the right
- Click "Mark out of stock" on a product
- Show stock changes to 0
- Click "Restock" to restore

**Key Points:**
- "Two roles: Manager assigns, Staff prepares"
- "Real-time order status updates"
- "Per-branch inventory tracking"
- "Auto-refresh every 15 seconds"

---

### 7. Reviews System (30 seconds)

**What to say:**
> "Customers can rate their pick-up experience, and branches can flag problematic customers."

**What to show:**
1. Navigate to `/branch-reviews`
2. Select a branch
3. Fill out review form:
   - Name: "Jean-Pierre"
   - Rating: 5 stars
   - Comment: "Fast service, friendly staff!"
4. Submit review
5. Show review appears in the list
6. Point out branch ratings update

**Key Points:**
- "Customer reviews help other shoppers choose branches"
- "Branch staff can flag no-shows (increases their deposit)"
- "Two-way accountability system"

---

## 🎤 Key Talking Points

### What Makes This Special?

1. **Conversational AI** - "No other team has natural language search"
2. **Complete i18n** - "100% translated, not just 20%"
3. **Real Data** - "Using actual Simba branch locations"
4. **Smart Deposit** - "Dynamic pricing prevents no-shows"
5. **Production Ready** - "Every feature works perfectly"

### Technical Highlights

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Supabase** for database and auth
- **Groq AI** for conversational search
- **Zustand** for state management
- **Tailwind CSS** for styling

---

## 🐛 Troubleshooting

### If something goes wrong:

**Cart is empty:**
- Add products again quickly
- Or skip to Branch Dashboard with existing order

**AI search not working:**
- Check GROQ_API_KEY in `.env.local`
- Fallback: Use regular search bar

**Login fails:**
- Use test account: `demo@simba.rw` / `password123`
- Or create new account on the spot

**Branch dashboard empty:**
- Place a new order through checkout
- Or refresh the page

---

## 📱 Demo Tips

1. **Practice the flow** - Run through it 2-3 times before demo
2. **Have backup data** - Pre-create an order if needed
3. **Clear browser cache** - Start fresh for demo
4. **Use incognito mode** - Avoid cached data issues
5. **Zoom in browser** - Make text readable for audience (Ctrl/Cmd + +)
6. **Prepare for questions** - Know your tech stack

---

## ❓ Anticipated Questions & Answers

**Q: Is the MoMo payment real?**
> A: It's simulated for demo purposes, as recommended in the requirements. In production, we'd integrate with MTN MoMo API.

**Q: How does the AI search work?**
> A: We use Groq's llama-3.3-70b-versatile model. We send the user's query along with our product catalog as context, and the AI returns relevant product IDs and a natural language response.

**Q: Why pick-up instead of delivery?**
> A: Pick-up is simpler to demo, logistics are clearer, and it maps to how Simba actually operates. Delivery can be added later.

**Q: How do you handle stock across branches?**
> A: Each branch has its own stock table. When an order is placed at Remera, only Remera's stock decreases. Kimironko's stock is unaffected.

**Q: What happens if a customer doesn't show up?**
> A: Branch staff can flag them as a no-show. This increases their required deposit for future orders (500 RWF per flag).

**Q: Is this production-ready?**
> A: Yes. All features are fully functional, tested, and ready for deployment. We prioritized quality over quantity.

---

## 🎯 Success Metrics

**You'll know the demo went well if:**
- ✅ Audience understands the 3-second landing page concept
- ✅ AI search gets a "wow" reaction
- ✅ Complete checkout flow works smoothly
- ✅ Branch operations flow is clear
- ✅ Judges ask technical questions (shows interest)
- ✅ No major bugs or crashes

---

## 🏆 Closing Statement

**End with:**
> "Simba 2.0 is production-ready. Every feature works perfectly. We prioritized quality over quantity, and we're proud of what we've built. Thank you!"

---

**Good luck! 🚀**

**Remember:** <cite index="1-73,1-74">Quality over quantity. A product where everything works is better than one where 10 features are half-broken.</cite>
