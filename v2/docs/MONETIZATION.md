# Monetization Strategy

## Pricing Tiers

### Free Tier ($0/month)
**"Try DeepFish"**

**Included:**
- ✅ Mei (Project Manager)
- ✅ Vesper (Concierge)
- ✅ Lobby, Conference Room, Lunch Room
- ✅ Text chat only
- ✅ Basic items (clipboard, phone)

**Limits:**
- 100 messages/month
- 2 bots max
- No voice calls
- No VR access

**Target**: Individuals trying out the platform

---

### Pro Tier ($9/month)
**"Power User"**

**Everything in Free, plus:**
- ✅ Hanna (Design Lead)
- ✅ Executive Office access
- ✅ Voice calls (phone integration)
- ✅ All bot items unlocked
- ✅ Priority response times

**Limits:**
- 1,000 messages/month
- 5 bots max
- No custom bots

**Target**: Professionals using DeepFish daily

---

### Enterprise Tier ($49/month)
**"Full Office"**

**Everything in Pro, plus:**
- ✅ Oracle (System Architect)
- ✅ Skillz (Developer)
- ✅ All rooms (IT, HR, etc.)
- ✅ VR access
- ✅ API access
- ✅ Custom bot creation
- ✅ Unlimited messages
- ✅ White-label option

**Target**: Teams and businesses

---

## Add-Ons (À la carte)

### Individual Bots
- **Hanna** (Design Lead): $3/month
- **Oracle** (Architect): $5/month
- **Skillz** (Developer): $5/month
- **Custom Bot**: $10/month

### Features
- **Voice Calls**: $5/month
- **VR Access**: $10/month
- **API Access**: $15/month

### Rooms
- **Executive Office**: $2/month
- **IT Closet**: $2/month
- **Custom Room**: $5/month

---

## Purchase Flow

### User Buys Hanna:

1. **Stripe Checkout**
   ```
   User clicks "Unlock Hanna" → $3/month
   ```

2. **Webhook Received**
   ```typescript
   app.post('/webhooks/stripe', async (req, res) => {
     const event = req.body;
     
     if (event.type === 'checkout.session.completed') {
       const userId = event.data.object.client_reference_id;
       const productId = event.data.object.metadata.product;
       
       // Grant access
       await entitlementManager.grantAccess(userId, 'bots', 'hanna');
     }
   });
   ```

3. **Instant Access**
   ```json
   // user-12345.json updated
   {
     "bots": {
       "hanna": false  →  true  // ← Changed!
     }
   }
   ```

4. **User Sees Hanna**
   ```
   > who
   👥 Online:
     ✓ admin (you)
     ✓ Mei - Project Manager
     ✓ Vesper - Concierge
     ✓ Hanna - Design Lead  ← NEW!
   ```

**No download. No install. Instant unlock.** 🔓

---

## Revenue Projections

### Conservative (Year 1):
- 1,000 free users
- 100 pro users ($9/mo) = $900/mo
- 10 enterprise ($49/mo) = $490/mo
- **Total: $1,390/mo = $16,680/year**

### Moderate (Year 2):
- 10,000 free users
- 1,000 pro users = $9,000/mo
- 100 enterprise = $4,900/mo
- **Total: $13,900/mo = $166,800/year**

### Optimistic (Year 3):
- 100,000 free users
- 10,000 pro users = $90,000/mo
- 1,000 enterprise = $49,000/mo
- **Total: $139,000/mo = $1,668,000/year**

---

## Why This Works

1. **Low Friction**: Free tier lets users try
2. **Clear Value**: Each tier adds obvious benefits
3. **Flexible**: Buy just what you need
4. **Instant Gratification**: Unlock immediately
5. **Scalable**: Same code, more users = more revenue

---

## Implementation Status

- ✅ Entitlement system built
- ✅ JSON-based (scalable to database)
- ✅ Tier definitions complete
- ⏳ Stripe integration (next)
- ⏳ Admin dashboard (next)
- ⏳ User upgrade flow (next)

**Ready to monetize!** 💰
