# Railway Environment Variables - Feature Flags

## v1.0 Launch Configuration

```bash
# Core Features (Always On)
CORE_CHAT=true
CORE_BOTS=true
CORE_ROOMS=true

# Launch Features (The 4 We Sell)
FEATURE_CLI=true
FEATURE_REACT_UI=true

# Secret Weapon (OFF until v2.0!)
FEATURE_SMS=false

# Future Features (OFF)
FEATURE_VOICE_CALLS=false
FEATURE_VR=false
FEATURE_CUSTOM_BOTS=false
FEATURE_API_ACCESS=false
FEATURE_YOUTUBE_TRANSLATOR=false
FEATURE_NATIVE_CLI_APPS=false

# Monetization (ON)
FEATURE_STRIPE_PAYMENTS=true
FEATURE_ENTITLEMENTS=true

# Admin/Debug (OFF in production)
FEATURE_ADMIN_DASHBOARD=false
FEATURE_METRICS=true
FEATURE_DEBUG_MODE=false

# API Keys (Add your real keys)
GEMINI_API_KEY=your_gemini_key_here
STRIPE_SECRET_KEY=your_stripe_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Server Config
PORT=3000
NODE_ENV=production
```

---

## v2.0 Launch Configuration

**Just change ONE line:**

```bash
# Secret Weapon (TURN ON!)
FEATURE_SMS=true  ← Change false to true

# Add Twilio keys
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

**That's it. Feature goes live.** 🚀

---

## How to Update on Railway

### Option 1: Railway Dashboard
1. Go to Railway dashboard
2. Select DeepFish project
3. Click "Variables"
4. Change `FEATURE_SMS` from `false` to `true`
5. Click "Save"
6. App auto-redeploys

### Option 2: Railway CLI
```bash
railway variables set FEATURE_SMS=true
```

**30 seconds. Feature is live.** ⚡

---

## Feature Flag Strategy

### v1.0 (Month 1-3):
- Focus on 4 core features
- Keep it simple
- Build user base

### v1.5 (Month 3-6):
- SMS built and tested (but OFF)
- Beta users test via special flag
- Perfect the experience

### v2.0 (Month 6):
- Flip FEATURE_SMS=true
- Announce to world
- Viral explosion

---

**The code is ready. The feature is built. Just waiting for the right moment.** 🎯
