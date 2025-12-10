# 🚨 Fire Drill Test

## What It Does

1. **Starts Leon** (VP of Operations)
2. **Starts all bots**: Mei, Hanna, Vesper, Skillz, Oracle
3. **ROLL CALL** - checks everyone is present
4. **Simulates emergency** - crashes Mei
5. **Verifies Leon restarts Mei**
6. **Final roll call** - confirms everyone accounted for

## How to Run

```bash
cd v2
npm install
npm run test:fire-drill
```

## Expected Output

```
🚨 FIRE DRILL - ALL PERSONNEL REPORT 🚨
========================================
1. Starting Leon (VP of Operations)...
[Leon] VP of Operations ONLINE

2. Starting all personnel...
[Leon] Starting bot-mei...
[Leon] ✓ bot-mei started (PID: 1234)
[Leon] Starting bot-hanna...
[Leon] ✓ bot-hanna started (PID: 1235)
...

🚨 ROLL CALL - SOUND OFF! 🚨
============================

📋 ATTENDANCE:
  ✅ ROUTER - online
  ✅ BOT-MEI - online
  ✅ BOT-HANNA - online
  ✅ BOT-VESPER - online
  ✅ BOT-SKILLZ - online
  ✅ BOT-ORACLE - online

✅ ALL PERSONNEL ACCOUNTED FOR

Total Expected: 6
Total Present: 6
Total Missing: 0

🔥 SIMULATING EMERGENCY - MEI GOES DOWN 🔥
==========================================
Terminating Mei (PID: 1234)...
Waiting for Leon to respond...

[Leon] 🔥 bot-mei crashed! (Restart count: 1)
[Leon] Restarting bot-mei in 1000ms...
[Leon] ✓ bot-mei started (PID: 5678)
[Leon] 📢 EMERGENCY BROADCAST: bot-mei has been restarted

🚨 POST-EMERGENCY ROLL CALL 🚨
==============================

  ✅ ROUTER - online
  ✅ BOT-MEI - online (restarted 1x)
  ✅ BOT-HANNA - online
  ✅ BOT-VESPER - online
  ✅ BOT-SKILLZ - online
  ✅ BOT-ORACLE - online

✅ FIRE DRILL COMPLETE
Leon successfully detected and restarted Mei
```

## What Gets Tested

- ✅ All components start successfully
- ✅ Roll call identifies all personnel
- ✅ Missing personnel detected
- ✅ Emergency response (crash detection)
- ✅ Automatic restart
- ✅ Post-emergency verification
- ✅ Restart count tracking

## Fire Safety Verified

**If someone is missing:**
- ❌ Shows "MISSING PERSONNEL" alert
- ❌ Lists who is not present
- 🚨 Emergency status

**After emergency:**
- ✅ Leon detects crash within 10s
- ✅ Leon restarts missing component
- ✅ All personnel accounted for again
- ✅ System returns to normal operation

---

**This is your fire drill - everyone must be accounted for!** 🚨
