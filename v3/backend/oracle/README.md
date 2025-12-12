# Oracle's Training System

## Overview

Oracle maintains two key systems:
1. **LLM Preferences** - Which models each bot should use
2. **Training Inbox** - Training materials for bots to learn from

---

## LLM Preferences

**File:** `data/oracle/llm-preferences.json`

**Oracle updates this file** after researching LLM benchmarks.
**Bots check this file** to know which models to use.

### Bot Workflow:
```typescript
// Bot starting a task
const assignment = await oracleTraining.getBotLLM('gladyce');
const model = assignment.primary; // "gemini-2.0-flash-exp"

// If primary fails, use fallback
if (primaryFails) {
  model = assignment.fallback_1; // "gemini-1.5-pro"
}
```

### Oracle Workflow:
```typescript
// Oracle researches and updates
await oracleTraining.updateBotLLM('gladyce', {
  primary: 'gemini-2.0-flash-exp',
  fallback_1: 'gemini-1.5-pro',
  fallback_2: 'gemini-2.5-flash',
  reasoning: 'Flash-exp optimal for engineering tasks'
});
```

---

## Training Inbox

**Directory:** `data/training/inbox/{bot-id}/`

**Oracle adds materials** for bots to learn from.
**Bots process materials** from their inbox.

### Oracle Workflow:
```typescript
// Oracle finds good training material
await oracleTraining.addTrainingMaterial('gladyce', {
  type: 'youtube',
  source: 'https://youtube.com/watch?v=...',
  topic: 'Advanced rocket propulsion',
  notes: 'Excellent coverage of thrust vectoring'
});
```

### Bot Workflow:
```typescript
// Bot checks inbox
const materials = await oracleTraining.getTrainingMaterials('gladyce');

for (const material of materials) {
  // Process material (YouTube transcript, PDF, etc.)
  const knowledge = await processTraining(material);
  
  // Extract insights
  // Delete original file (inbox protocol)
}
```

---

## Overnight Research

**Schedule:** Every night at 3am

**Oracle's tasks:**
1. Scrape LLM leaderboards
2. Analyze benchmark results
3. Update LLM assignments if better models available
4. Prepare training materials for bots
5. Push updates to `llm-preferences.json`

```typescript
// Scheduled task
await oracleTraining.conductOvernightResearch();
```

---

## File Structure

```
data/
├── oracle/
│   └── llm-preferences.json     ← Oracle updates, bots read
└── training/
    └── inbox/
        ├── oracle/              ← Oracle's training materials
        ├── gladyce/             ← Gladyce's training materials
        ├── hanna/               ← Hanna's training materials
        └── ...
```

---

## Benefits

✅ **Oracle has authority** - Can update LLM assignments
✅ **Bots stay current** - Always use optimal models
✅ **Centralized research** - Oracle does research once, all bots benefit
✅ **Training distribution** - Oracle can push knowledge to specific bots
✅ **3-tier fallback** - Primary → Fallback 1 → Fallback 2
