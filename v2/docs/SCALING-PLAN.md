# Scaling Plan - "Knocking Out Walls"

## Current Architecture (Phase 1)

**< 10,000 users**
- JSON files for entitlements ✓
- In-memory cache ✓
- File-based storage ✓

**Works perfectly. No changes needed.**

---

## Phase 2: Add Redis Cache

**When**: 10,000 - 100,000 users
**Why**: File reads getting slow
**How**: Uncomment REDIS section

### What Changes:
```typescript
// In entitlementManager.ts, uncomment:
private redis: Redis;

async getEntitlementsWithRedis(userId: string) {
  // Try Redis first (fast!)
  // Fall back to file if not cached
}
```

### What To Do:
1. Add Redis to Railway
2. Uncomment Redis code
3. Deploy
4. **JSON files still work as backup!**

### Cost:
- Redis on Railway: ~$5/month

---

## Phase 3: Migrate to Database

**When**: > 100,000 users
**Why**: Too many files, need complex queries
**How**: Uncomment DATABASE section

### What Changes:
```typescript
// In entitlementManager.ts, uncomment:
private db: Database;

async getEntitlementsFromDB(userId: string) {
  // Query Postgres
}
```

### Migration Script:
```typescript
// migrate-to-db.ts
async function migrate() {
  const files = await fs.readdir('./data/entitlements/users');
  
  for (const file of files) {
    const entitlements = JSON.parse(await fs.readFile(file));
    await db.insert('user_entitlements', entitlements);
  }
}
```

### What To Do:
1. Add Postgres to Railway
2. Run migration script
3. Uncomment database code
4. Deploy
5. **Keep JSON files as backup for 30 days**

### Cost:
- Postgres on Railway: ~$10/month

---

## Phase 4: Distributed System

**When**: > 1,000,000 users
**Why**: Single server can't handle load
**How**: Already designed for it!

### What Changes:
- Multiple Railway instances
- Load balancer
- Shared Redis/Postgres
- **Event bus already supports this!**

### What To Do:
1. Scale Railway to multiple instances
2. Add load balancer
3. **No code changes needed!**

### Cost:
- Multiple instances: ~$50/month

---

## The Beautiful Part:

**Each phase is just uncommenting code!**

```typescript
// Phase 1: JSON files (current)
await this.getEntitlements(userId);

// Phase 2: Add Redis (uncomment)
await this.getEntitlementsWithRedis(userId);

// Phase 3: Add Database (uncomment)
await this.getEntitlementsFromDB(userId);
```

**The interface stays the same:**
```typescript
// This never changes!
const canAccess = await entitlementManager.hasAccess(userId, 'bots', 'hanna');
```

---

## Dead Ends = Expansion Joints

**Current:**
```
[JSON Files] → Works great
```

**Phase 2:**
```
[Redis Cache] → [JSON Files] → Still works
```

**Phase 3:**
```
[Redis Cache] → [Database] → [JSON Backup] → Still works
```

**Each layer adds performance, but old layers stay as failsafes!**

---

## When To Upgrade:

### Signs You Need Redis:
- File reads taking > 100ms
- Cache hit rate < 80%
- Users complaining about slowness

### Signs You Need Database:
- > 100,000 JSON files
- Need complex queries (e.g., "all pro users")
- File system getting slow

### Signs You Need Distribution:
- Single server CPU > 80%
- Response times > 500ms
- > 1M users

---

## Cost Projection:

| Users | Phase | Monthly Cost |
|-------|-------|--------------|
| 0 - 10k | JSON only | $5 (Railway) |
| 10k - 100k | + Redis | $10 |
| 100k - 1M | + Postgres | $20 |
| > 1M | + Distribution | $50+ |

**Start cheap. Scale when needed. Code is ready.** 🚀
