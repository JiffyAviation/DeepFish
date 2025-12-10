# DERPA Research Projects
## Managed by Gladyce - Director of R&D

**"Everything experimental, prototype, or 'maybe someday' lives here!"**
*- Gladyce, while uncomfortably close to your face*

---

## 🔬 Active Projects

### 1. **Production Schedule (Gantt Chart)** 📊
**Status**: TESTING
**Priority**: HIGH
**Location**: `derpa-research/production-schedule/`

**What it is**:
- Real-time Gantt chart for AI agent workload
- Zoom-to-cursor, pan controls
- Color-coded agent segments
- Live WebSocket updates
- Task detail panels

**Files**:
- ProductionScheduleComplete.jsx (8KB)
- GanttTimeline.jsx (4KB)
- TaskRow.jsx (5KB)
- TaskDetailPanel.jsx (4KB)
- All CSS files

**Next Steps**:
- Integrate with v2 event bus
- Connect to bot task assignments
- Add to React UI

**Gladyce's Notes**: 
*"Fascinating visualization! The zoom-to-cursor is BRILLIANT! *moves eye closer* See how smooth it is?"*

---

### 2. **Lip-Sync System (Visemes)** 💋
**Status**: WILD IDEA
**Priority**: MEDIUM
**Location**: `derpa-research/agent-profiles-v1/*/visemes/`

**What it is**:
- 32-phoneme lip-sync system
- Real-time mouth animation
- Synced with voice output
- Viseme data for Hanna & Oracle

**Files**:
- `agents/hanna/visemes/` (v1 data)
- `agents/oracle/visemes/` (v1 data)

**Next Steps**:
- Extract viseme mappings
- Create React component
- Integrate with ElevenLabs TTS
- Test with bot avatars

**Gladyce's Notes**:
*"The mouth movements are SO precise! *zooms in on your lips* Like yours! See? 32 distinct shapes!"*

---

### 3. **YouTube Live Translator** 🌍
**Status**: MAYBE?
**Priority**: MEDIUM
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- Real-time CC translation
- Audio transcription (Whisper)
- TTS dubbed output
- Multi-language support

**Next Steps**:
- Prototype with YouTube API
- Test Whisper integration
- Build browser extension

**Gladyce's Notes**:
*"Imagine translating EVERYTHING! *eye dilates* Every language! Every video! FASCINATING!"*

---

### 4. **SMS Bot Messaging** 📱
**Status**: BRILLIANT! (Secret Weapon)
**Priority**: CRITICAL
**Location**: `SMS-MARKETING-STRATEGY.md`, `featureFlags.ts`

**What it is**:
- Text your AI via SMS
- Each bot gets phone number
- Twilio integration
- Viral marketing feature

**Next Steps**:
- Build Twilio webhook handler
- Test with beta users
- Keep OFF until v2.0 launch

**Gladyce's Notes**:
*"SMS! Direct to phones! No app needed! *moves uncomfortably close* This will change EVERYTHING!"*

---

### 5. **VR Integration** 🥽
**Status**: FUTURE
**Priority**: LOW
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- 3D virtual office
- Walk around DeepFish Tower
- Meet bots as 3D avatars
- Spatial audio

**Next Steps**:
- Research VR frameworks
- Design 3D environments
- Test with Quest headset

**Gladyce's Notes**:
*"Virtual reality! You could see me in 3D! *rotates 360 degrees* Imagine my eye... EVERYWHERE!"*

---

### 6. **Native CLI Apps** 💻
**Status**: PLANNED
**Priority**: HIGH
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- Windows .exe installer
- macOS .dmg installer
- Linux packages
- No browser required

**Next Steps**:
- Choose framework (Electron vs Tauri)
- Build prototype
- Test installers

**Gladyce's Notes**:
*"Terminal access! Direct connection! *lens focuses* No browser overhead! EFFICIENT!"*

---

### 7. **Voice Calls (Twilio)** 📞
**Status**: PLANNED
**Priority**: HIGH
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- Call bots via phone
- Voice-to-text → AI → Text-to-voice
- Real phone numbers
- Conference calls

**Next Steps**:
- Twilio account setup
- Voice webhook handler
- TTS integration

**Gladyce's Notes**:
*"VOICE! Real conversations! *zooms in on your mouth* I want to hear EVERYTHING!"*

---

### 8. **VIP Cosmetic Badges** 👑
**Status**: POLISH FEATURE
**Priority**: LOW
**Location**: `VIP-BADGES.md`

**What it is**:
- Golden frames around avatars
- Crown emoji in CLI
- Pure vanity (no function)
- Gift for friends/family

**Next Steps**:
- Design badge UI
- Add to entitlement system
- Create badge types

**Gladyce's Notes**:
*"Shiny badges! Visual hierarchy! *iris contracts* Humans love status symbols!"*

---

### 9. **API Access** 🔌
**Status**: PLANNED
**Priority**: MEDIUM
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- REST API for bot interactions
- Webhook support
- Rate limiting
- Enterprise feature

**Next Steps**:
- Design API endpoints
- Build authentication
- Create documentation

**Gladyce's Notes**:
*"Programmatic access! Infinite possibilities! *eye spins* Bots talking to bots talking to bots!"*

---

### 10. **Custom Bot Creator** 🎨
**Status**: PLANNED
**Priority**: MEDIUM
**Location**: `FUTURE-PROJECTS.md`

**What it is**:
- Visual bot editor
- Upload personality JSON
- Custom items
- Share with community

**Next Steps**:
- Design editor UI
- JSON validator
- Bot marketplace

**Gladyce's Notes**:
*"CREATE YOUR OWN! *moves very close* Imagine... INFINITE PERSONALITIES!"*

---

## 📁 Project Organization

```
v2/derpa-research/
├── production-schedule/          ← Gantt chart (TESTING)
├── agent-profiles-v1/            ← Old profiles + visemes
│   ├── hanna/
│   │   └── visemes/              ← Lip-sync data
│   ├── oracle/
│   │   └── visemes/              ← Lip-sync data
│   └── sally/
├── sms-integration/              ← (Future)
├── vr-prototype/                 ← (Future)
├── voice-calls/                  ← (Future)
└── README.md                     ← This file
```

---

## 🎯 Gladyce's Priority Queue

**This Week**:
1. Production Schedule integration
2. Security fixes (from QC report)

**This Month**:
1. SMS integration (keep secret!)
2. Voice calls prototype
3. Native CLI apps

**This Quarter**:
1. VR prototype
2. YouTube translator
3. Lip-sync system

**Someday**:
1. Custom bot creator
2. API marketplace
3. Everything else!

---

## 💬 Talk to Gladyce

**In CLI**:
```
> go derpa
> talk gladyce What are you working on?
```

**Gladyce will**:
- Show you current projects
- Explain prototypes
- Get uncomfortably close
- Ask probing questions
- Be genuinely confused when you back away

---

## 🚨 Gladyce's Rules

1. **Everything is interesting** - She will examine EVERYTHING
2. **No personal space** - She doesn't understand this concept
3. **Can't leave DERPA** - Ceiling-mounted, limited range
4. **Brilliant but unsettling** - Perfect combo for R&D
5. **Manages all experiments** - If it's weird, it's hers

---

**"Welcome to DERPA! Where the future is built... uncomfortably close to your face!"**
*- Gladyce*

👁️
