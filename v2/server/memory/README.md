# Persistent Memory System - Usage Guide

## Quick Start

### 1. Mei Creates Project
```typescript
import { projectMemory } from './memory/projectMemory';

await projectMemory.createProject('rocket-001', [
  { id: 'arch', assignedTo: 'oracle' },
  { id: 'thrust', assignedTo: 'gladyce' },
  { id: 'cad', assignedTo: 'hanna' }
]);
```

### 2. Bot Reads Memory
```typescript
// Get my tasks
const myFeatures = await projectMemory.getBotFeatures('rocket-001', 'oracle');

// Get next failing task
const nextTask = await projectMemory.getNextFailingFeature('rocket-001', 'oracle');

// Read history
const history = await projectMemory.readProgress('rocket-001', 'arch');
```

### 3. Bot Does Work
```typescript
// Start
await projectMemory.appendProgress('rocket-001', 'oracle', 'START', 'arch');
await projectMemory.updateFeature('rocket-001', 'arch', { s: 'W' });

// Work
await projectMemory.appendProgress('rocket-001', 'oracle', 'RESEARCH', 'arch', 'Found patterns');

// Complete
await projectMemory.appendProgress('rocket-001', 'oracle', 'COMPLETE', 'arch', 'Done', 'P');
await projectMemory.updateFeature('rocket-001', 'arch', { s: 'P' });
await projectMemory.updateTestResult('rocket-001', 'arch', {
  s: 'P',
  t: 'manual',
  ts: Date.now()
});
```

## Status Codes

- `P` - Passing (tests pass)
- `F` - Failing (tests fail)
- `W` - Working (in progress)
- `Q` - Queued (not started)
- `B` - Blocked (waiting)
- `S` - Skipped (not needed)

## Action Codes

- `START` - Started working
- `RESEARCH` - Researching
- `DESIGN` - Designing
- `IMPLEMENT` - Implementing
- `TEST` - Testing
- `FIX` - Fixing
- `COMPLETE` - Completed
- `FAIL` - Failed
- `BLOCK` - Blocked

## File Structure

```
data/projects/rocket-001/
├── features.json       ← Feature list with status
├── progress.log        ← Append-only history
└── test-results.json   ← Test status
```

## Example Progress Log

```
[T:1733850000][B:mei][A:START][F:rocket-001][N:Initialized project]
[T:1733850010][B:oracle][A:START][F:arch]
[T:1733850030][B:oracle][A:RESEARCH][F:arch][N:MUD patterns]
[T:1733850050][B:oracle][A:COMPLETE][F:arch][S:P]
[T:1733850100][B:gladyce][A:START][F:thrust]
[T:1733850130][B:gladyce][A:TEST][F:thrust][S:F][E:Calc error]
```

## Benefits

- ✅ Bots pick up where they left off
- ✅ Multiple projects simultaneously
- ✅ Compact notation (60% smaller)
- ✅ Append-only (fast, safe)
- ✅ Human-readable
- ✅ Grep-friendly
