# Purchase Flow - How It Works

## The Complete Flow

```
User clicks "Buy Hanna" 
    ↓
Stripe Checkout
    ↓
User pays $3
    ↓
Stripe sends webhook to your server
    ↓
Server updates user's JSON file
    ↓
User instantly has access to Hanna
```

**No manual work. Completely automatic.** 💰

---

## Step-by-Step Implementation

### 1. User Clicks "Buy Hanna"

**In your React app:**

```tsx
function BotCard({ bot }) {
  const handlePurchase = async () => {
    // Call your server to create Stripe checkout
    const response = await fetch('/api/purchase/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: 'bot-hanna',
        price: 300 // $3.00 in cents
      })
    });
    
    const { checkoutUrl } = await response.json();
    
    // Redirect to Stripe checkout
    window.location.href = checkoutUrl;
  };
  
  return (
    <div>
      <h3>Hanna - Design Lead</h3>
      <p>Unlock for $3/month</p>
      <button onClick={handlePurchase}>
        Buy Now
      </button>
    </div>
  );
}
```

---

### 2. Server Creates Stripe Checkout

**In your Express server:**

```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/purchase/create-checkout', async (req, res) => {
  const { userId, productId, price } = req.body;
  
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Hanna - Design Lead Bot',
            description: 'AI design assistant for DeepFish'
          },
          unit_amount: price, // $3.00 = 300 cents
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: 'https://deepfish.ai/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://deepfish.ai/cancel',
    
    // IMPORTANT: Store user info in metadata
    client_reference_id: userId,
    metadata: {
      userId: userId,
      productId: productId,
      productType: 'bot'
    }
  });
  
  res.json({ checkoutUrl: session.url });
});
```

---

### 3. User Pays on Stripe

User is redirected to Stripe's checkout page:
- Enters card info
- Completes payment
- Stripe processes payment

**You don't handle any payment details!** Stripe does it all.

---

### 4. Stripe Sends Webhook

**When payment succeeds, Stripe sends webhook to your server:**

```typescript
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify webhook is from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});
```

---

### 5. Server Updates Entitlements

**The magic happens here:**

```typescript
async function handleCheckoutComplete(session: any) {
  const userId = session.client_reference_id;
  const { productId, productType } = session.metadata;
  
  console.log(`[Purchase] User ${userId} bought ${productId}`);
  
  // Update user's entitlements
  if (productType === 'bot') {
    await entitlementManager.grantAccess(userId, 'bots', productId.replace('bot-', ''));
  }
  
  console.log(`[Purchase] ✓ Access granted to ${userId}`);
  
  // Optional: Send confirmation email
  await sendEmail(userId, {
    subject: 'Welcome to Hanna!',
    body: 'You now have access to Hanna, your AI design assistant!'
  });
}
```

**What this does:**

1. Gets `userId` from webhook
2. Gets `productId` (e.g., "bot-hanna")
3. Calls `entitlementManager.grantAccess()`
4. Updates `data/entitlements/users/user-123.json`:

```json
{
  "bots": {
    "hanna": false  →  true  // ← Changed!
  }
}
```

**Done! User now has access.**

---

### 6. User Sees Hanna Instantly

**Next time user loads the app:**

```typescript
// Check if user has access
const canAccessHanna = await entitlementManager.hasAccess(userId, 'bots', 'hanna');

if (canAccessHanna) {
  // Show Hanna in bot list
  bots.push({
    id: 'hanna',
    name: 'Hanna',
    available: true
  });
}
```

**In CLI:**

```
> who
👥 Online:
  ✓ admin (you)
  ✓ Mei - Project Manager
  ✓ Vesper - Concierge
  ✓ Hanna - Design Lead  ← NEW!
```

---

## Handling Subscription Cancellation

**If user cancels subscription:**

```typescript
async function handleSubscriptionCanceled(subscription: any) {
  const userId = subscription.metadata.userId;
  const productId = subscription.metadata.productId;
  
  console.log(`[Cancellation] User ${userId} canceled ${productId}`);
  
  // Revoke access
  await entitlementManager.revokeAccess(userId, 'bots', productId.replace('bot-', ''));
  
  console.log(`[Cancellation] ✓ Access revoked from ${userId}`);
}
```

**Updates JSON:**

```json
{
  "bots": {
    "hanna": true  →  false  // ← Revoked!
  }
}
```

---

## Testing (Before Going Live)

### 1. Use Stripe Test Mode

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...  # Test key
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### 2. Test with Fake Cards

Stripe provides test cards:
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Decline

### 3. Test Webhooks Locally

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

---

## Security

### 1. Verify Webhook Signature

```typescript
// ALWAYS verify webhook is from Stripe
event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Without this, anyone could fake a webhook!**

### 2. Check Payment Status

```typescript
if (session.payment_status === 'paid') {
  // Grant access
}
```

### 3. Idempotency

```typescript
// Prevent duplicate processing
const alreadyProcessed = await checkIfProcessed(session.id);
if (alreadyProcessed) {
  return res.json({ received: true });
}
```

---

## The Complete Code

See next file for full implementation!
