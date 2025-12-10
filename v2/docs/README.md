# DeepFish v2 - Architecture Overview

## The Building

```
🏢 DeepFish Tower

┌─────────────────────────────────────────┐
│         Leon - VP of Operations         │ ← Building Manager
│  (Monitors & Restarts All Components)   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐  ┌────▼────┐  ┌──▼───┐
    │Router │  │  Bots   │  │Rooms │
    │       │  │ (Annex) │  │      │
    └───────┘  └─────────┘  └──────┘
```

## Components

### Leon - VP of Operations
**Role**: Building Manager / Supervisor
**Responsibilities**:
- Monitors health of all components
- Auto-restarts crashed components
- Emergency broadcast system
- Graceful shutdown coordination
- Health dashboard

**Fire Prevention**:
- If Router crashes → Leon restarts it
- If Bot crashes → Leon restarts it
- If Leon crashes → System needs manual restart (top-level supervisor)

### Router - Switchboard
**Role**: Traffic Control
**Isolation**: Separate process from bots
**Crash Impact**: Leon detects and restarts within seconds

### Bots - Annex (Offices)
**Role**: AI Workers
**Isolation**: Each bot = separate process
**Crash Impact**: Other bots unaffected, Leon restarts crashed bot

### Rooms - Locations
**Role**: Conversation Contexts
**Isolation**: Each room = separate React component with Error Boundary
**Crash Impact**: Other rooms unaffected, crashed room shows "Unavailable"

## Fire Prevention Strategy

**Scenario: Mei Crashes**
```
1. Mei process exits
2. Leon detects crash (within 10s)
3. Leon logs: "🔥 bot-mei crashed!"
4. Leon waits 1s (exponential backoff)
5. Leon restarts Mei
6. Leon broadcasts: "Mei has been restarted"
7. Other bots: 100% operational throughout
```

**Scenario: Router Crashes**
```
1. Router process exits
2. Leon detects crash
3. Leon restarts Router
4. Router reconnects to existing bot processes
5. Frontend shows "Reconnecting..." briefly
6. Normal operation resumes
```

**Scenario: Conference Room UI Crashes**
```
1. React Error Boundary catches error
2. Shows: "Conference Room Unavailable"
3. Other rooms: 100% operational
4. User can still use Lobby, Lunch Room, Exec
```

## Startup Sequence

```
1. npm run dev:server
   ↓
2. Leon starts (main.ts)
   ↓
3. Leon starts Router (index.ts)
   ↓
4. Router initializes (all 8 features)
   ↓
5. Leon monitors health
   ↓
6. System ready
```

## Health Monitoring

Leon checks every 10 seconds:
- Is Router responding?
- Are bots responding?
- Any component unresponsive for >30s?

If unresponsive:
- Kill process
- Restart with exponential backoff
- Broadcast emergency message

## Restart Limits

- Max 5 restarts per component
- After 5 failures: Manual intervention required
- Prevents infinite restart loops

## Next Steps

- [ ] Create bot-runner.ts (bot process)
- [ ] Add React Error Boundaries for rooms
- [ ] Implement WebSocket for emergency broadcasts
- [ ] Build health dashboard UI
