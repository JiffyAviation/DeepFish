# CodeDefrag - Automated Codebase Cleanup

**Version:** 1.0.0  
**Purpose:** 3-pass automated cleanup to remove duplicates, orphans, redundancies, and fragmentation

---

## Quick Start

```powershell
# Report only (dry run)
.\scripts\codedefrag.ps1

# Execute cleanup
.\scripts\codedefrag.ps1 -Execute

# Execute with verbose output
.\scripts\codedefrag.ps1 -Execute -Verbose
```

---

## What It Does

### Pass 1: Surface-Level Scan
- Finds orphaned test files (`test-*.js/mjs`)
- Detects duplicate YouTube readers
- Identifies old constitution files

### Pass 2: Deep Structure Analysis
- Finds redundant systems (honeypot, routers, orchestrators)
- Detects duplicate implementations
- Identifies abandoned code

### Pass 3: Fragmentation Analysis
- Finds scattered documentation
- Identifies disorganized files
- Suggests reorganization

---

## Safety Features

- **Dry run by default** - Shows what would be deleted without actually deleting
- **Verbose mode** - See exactly what's happening
- **Error handling** - Continues even if some operations fail
- **Selective deletion** - Only removes confirmed duplicates/orphans

---

## Output Example

```
🧹 CodeDefrag v1.0 - 3-Pass Cleanup
=================================

📊 PASS 1: Surface-Level Scan
  Duplicates: 3
  Orphans: 8

📊 PASS 2: Deep Structure Analysis
  Redundancies: 4

📊 PASS 3: Fragmentation Analysis
  Fragmentation issues: 1

=================================
📋 SUMMARY
  Total Duplicates: 3
  Total Orphans: 8
  Total Redundancies: 4
  Total Fragmentation: 1

ℹ️  DRY RUN - No changes made
  Run with -Execute to perform cleanup
```

---

## When to Run

- After major feature development
- Before major refactoring
- When build times increase
- Before production deployment
- Every 2-3 weeks during active development

---

## Process Definition

See `.agent/processes/codedefrag.json` for the complete process definition and methodology.

---

## Future Enhancements

- [ ] Automated import analysis
- [ ] Dead code detection
- [ ] Unused dependency detection
- [ ] Integration with CI/CD
- [ ] npm script: `npm run codedefrag`
