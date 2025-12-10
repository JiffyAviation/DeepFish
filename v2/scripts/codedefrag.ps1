#!/usr/bin/env pwsh
<#
.SYNOPSIS
    CodeDefrag - Automated 3-pass codebase cleanup
.DESCRIPTION
    Scans for duplicates, orphans, redundancies, and fragmentation.
    Generates report and optionally executes cleanup.
.PARAMETER Execute
    Execute cleanup (default: false, report only)
.PARAMETER Verbose
    Show detailed output
.EXAMPLE
    .\codedefrag.ps1                    # Report only
    .\codedefrag.ps1 -Execute           # Execute cleanup
    .\codedefrag.ps1 -Execute -Verbose  # Execute with details
#>

param(
    [switch]$Execute = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "🧹 CodeDefrag v1.0 - 3-Pass Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Track findings
$duplicates = @()
$orphans = @()
$redundancies = @()
$fragmented = @()

# PASS 1: Surface-Level Scan
Write-Host "📊 PASS 1: Surface-Level Scan" -ForegroundColor Yellow

# Find orphaned test files
$testFiles = Get-ChildItem -Path "." -Filter "test-*" -File | Where-Object { $_.Extension -match '\.(js|mjs)$' }
foreach ($file in $testFiles) {
    $orphans += $file.Name
    if ($Verbose) { Write-Host "  Found orphan: $($file.Name)" -ForegroundColor Gray }
}

# Find duplicate YouTube readers
$ytReaders = Get-ChildItem -Path "server\utils" -Filter "youtubeTranscript.*" -File -ErrorAction SilentlyContinue
if ($ytReaders.Count -gt 1) {
    foreach ($file in $ytReaders) {
        if ($file.Extension -ne ".mjs") {
            $duplicates += $file.FullName
            if ($Verbose) { Write-Host "  Found duplicate: $($file.Name)" -ForegroundColor Gray }
        }
    }
}

# Find old constitution files
$oldConstitutions = Get-ChildItem -Path "server\world\bots" -Filter "*-constitution.json" -File -ErrorAction SilentlyContinue
foreach ($file in $oldConstitutions) {
    $orphans += $file.FullName
    if ($Verbose) { Write-Host "  Found orphan: $($file.Name)" -ForegroundColor Gray }
}

Write-Host "  Duplicates: $($duplicates.Count)" -ForegroundColor White
Write-Host "  Orphans: $($orphans.Count)" -ForegroundColor White
Write-Host ""

# PASS 2: Deep Structure Analysis
Write-Host "📊 PASS 2: Deep Structure Analysis" -ForegroundColor Yellow

# Find honeypot directory
if (Test-Path "server\honeypot") {
    $redundancies += "server\honeypot (entire directory)"
    if ($Verbose) { Write-Host "  Found redundant: server\honeypot\" -ForegroundColor Gray }
}

# Find duplicate routers
if (Test-Path "server\router-minimal.ts") {
    $redundancies += "server\router-minimal.ts"
    if ($Verbose) { Write-Host "  Found redundant: router-minimal.ts" -ForegroundColor Gray }
}

# Find duplicate orchestrators
if (Test-Path "server\orchestrator.ts") {
    $redundancies += "server\orchestrator.ts"
    if ($Verbose) { Write-Host "  Found redundant: orchestrator.ts" -ForegroundColor Gray }
}

Write-Host "  Redundancies: $($redundancies.Count)" -ForegroundColor White
Write-Host ""

# PASS 3: Fragmentation & Architecture
Write-Host "📊 PASS 3: Fragmentation Analysis" -ForegroundColor Yellow

# Find scattered markdown files
$mdFiles = Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" }
if ($mdFiles.Count -gt 0) {
    $fragmented += "$($mdFiles.Count) markdown files in root"
    if ($Verbose) { 
        Write-Host "  Found fragmented: $($mdFiles.Count) .md files" -ForegroundColor Gray 
    }
}

Write-Host "  Fragmentation issues: $($fragmented.Count)" -ForegroundColor White
Write-Host ""

# SUMMARY
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📋 SUMMARY" -ForegroundColor Cyan
Write-Host "  Total Duplicates: $($duplicates.Count)" -ForegroundColor $(if ($duplicates.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  Total Orphans: $($orphans.Count)" -ForegroundColor $(if ($orphans.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  Total Redundancies: $($redundancies.Count)" -ForegroundColor $(if ($redundancies.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  Total Fragmentation: $($fragmented.Count)" -ForegroundColor $(if ($fragmented.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# EXECUTE CLEANUP
if ($Execute) {
    Write-Host "🚀 EXECUTING CLEANUP..." -ForegroundColor Red
    Write-Host ""
    
    $cleaned = 0
    
    # Delete orphaned test files
    foreach ($file in $testFiles) {
        Remove-Item $file.FullName -Force
        Write-Host "  [OK] Deleted: $($file.Name)" -ForegroundColor Green
        $cleaned++
    }
    
    # Delete duplicate YouTube readers
    foreach ($file in $ytReaders) {
        if ($file.Extension -ne ".mjs") {
            Remove-Item $file.FullName -Force
            Write-Host "  [OK] Deleted: $($file.Name)" -ForegroundColor Green
            $cleaned++
        }
    }
    
    # Delete old constitutions
    foreach ($file in $oldConstitutions) {
        Remove-Item $file.FullName -Force
        Write-Host "  [OK] Deleted: $($file.Name)" -ForegroundColor Green
        $cleaned++
    }
    
    # Delete honeypot
    if (Test-Path "server\honeypot") {
        Remove-Item "server\honeypot" -Recurse -Force
        Write-Host "  [OK] Deleted: server\honeypot\" -ForegroundColor Green
        $cleaned++
    }
    
    # Delete duplicate router
    if (Test-Path "server\router-minimal.ts") {
        Remove-Item "server\router-minimal.ts" -Force
        Write-Host "  [OK] Deleted: router-minimal.ts" -ForegroundColor Green
        $cleaned++
    }
    
    # Delete duplicate orchestrator
    if (Test-Path "server\orchestrator.ts") {
        Remove-Item "server\orchestrator.ts" -Force
        Write-Host "  [OK] Deleted: orchestrator.ts" -ForegroundColor Green
        $cleaned++
    }
    
    # Organize markdown files
    if ($mdFiles.Count -gt 0) {
        if (-not (Test-Path "docs")) {
            New-Item -ItemType Directory -Path "docs" -Force | Out-Null
        }
        foreach ($file in $mdFiles) {
            Move-Item $file.FullName "docs\" -Force
            Write-Host "  [OK] Moved: $($file.Name) -> docs\" -ForegroundColor Green
            $cleaned++
        }
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] CLEANUP COMPLETE!" -ForegroundColor Green
    Write-Host "  Files cleaned: $cleaned" -ForegroundColor White
    
} else {
    Write-Host "ℹ️  DRY RUN - No changes made" -ForegroundColor Cyan
    Write-Host "  Run with -Execute to perform cleanup" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
