# Tomorrow's Plan - DeepFish v2

## 🎯 Primary Goal
**Get bots talking with AI** - Make Mei, Vesper, and Julie actually respond using Gemini/Claude

---

## Morning Session (2-3 hours)

### 1. Fix Critical QC Issues ⚠️
**Priority**: HIGH
**Time**: 30 minutes

- [ ] Add event validation to `eventBus.ts`
- [ ] Add JSON schema validation with Zod
- [ ] Integrate message sanitizer with CLI

**Why**: Security hardening before adding AI

---

### 2. Add AI Integration to Bots 🤖
**Priority**: HIGH
**Time**: 1-2 hours

- [ ] Update `bot-runner.ts` to call Gemini API
- [ ] Test with Mei first (simple conversation)
- [ ] Add error handling for API failures
- [ ] Test end-to-end: CLI → Bot → AI → Response

**Goal**: Have a working conversation with Mei in the CLI

**Test**:
```
> go lobby
> say Hello Mei, what's on your clipboard?
Mei: Hi! Let me check... *taps clipboard* I'm tracking 3 active projects right now!
```

---

## Afternoon Session (2-3 hours)

### 3. Build Simple React UI 🎨
**Priority**: MEDIUM
**Time**: 2-3 hours

- [ ] Create basic React app structure
- [ ] Build simple chat interface
- [ ] Connect to event bus (WebSocket)
- [ ] Test with one bot (Mei)

**Goal**: Chat with Mei in a web browser

**Keep it simple**: Just a chat box and send button. No fancy UI yet.

---

## Evening (Optional)

### 4. Test Purchase Flow 💰
**Priority**: LOW (if time permits)
**Time**: 1 hour

- [ ] Set up Stripe test mode
- [ ] Test "Buy Hanna" flow
- [ ] Verify webhook updates entitlements
- [ ] Confirm Hanna appears after purchase

---

## Success Criteria for Tomorrow

**Minimum (Must Have)**:
- ✅ Mei responds with AI in CLI
- ✅ Critical security issues fixed

**Target (Should Have)**:
- ✅ All 3 bots (Mei, Vesper, Julie) working with AI
- ✅ Basic React chat UI working

**Stretch (Nice to Have)**:
- ✅ Purchase flow tested
- ✅ Multiple bots in one conversation

---

## If You Get Stuck

**Problem**: AI not responding
**Solution**: Check API keys in `.env`, verify Gemini quota

**Problem**: Event bus not working
**Solution**: Check if Leon is running, verify process spawning

**Problem**: React not connecting
**Solution**: Check WebSocket connection, verify CORS settings

---

## What NOT to Do Tomorrow

❌ Don't try to build the full UI
❌ Don't add VR or voice yet
❌ Don't optimize for scale
❌ Don't add new features

**Focus**: Get the core working. One bot talking = success.

---

## Prep for Tomorrow

**Before you start**:
1. Make sure `.env` has valid API keys
2. CLI should still be working (test with `npm run cli`)
3. Review `QC-REPORT.md` for critical issues

**Coffee/Tea**: ☕ Required
**Protein shake**: 🥤 Optional (unless you're Julie)

---

## Expected Timeline

- **9:00 AM**: Fix security issues (30 min)
- **9:30 AM**: Add AI to bot-runner (1 hour)
- **10:30 AM**: Test Mei conversation (30 min)
- **11:00 AM**: Break ☕
- **11:15 AM**: Start React UI (2 hours)
- **1:15 PM**: Lunch 🍕
- **2:00 PM**: Test React + AI integration (1 hour)
- **3:00 PM**: Polish and test (1 hour)
- **4:00 PM**: Done! 🎉

---

## Reward Yourself

**When you get Mei talking**:
- Take a screenshot
- Celebrate! 🎉
- Maybe go for a run (if you're Julie)

**You've built something amazing.** Tomorrow you bring it to life! 🚀
