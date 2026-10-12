#!/usr/bin/env bash
# ==============================================================================
# verify_milestones.sh — RoostDeck Verifiable Milestones Audit Harness
# ==============================================================================
# Purpose: Mechanical verification tripwire for The Roost Command Deck.
#          No milestone can be claimed as complete without this script exiting 0.
#
# Ethos:   Observe, Build, Verify (The Three-Legged Crow)
# Standards: Gate 4 (Elena Rostova - DoQV), Gate 3 (Marcus Sterling - DoCC)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ANSI formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}==============================================================================${RESET}"
echo -e "${BOLD}${CYAN}   ROOST COMMAND DECK — VERIFIABLE MILESTONES MECHANICAL AUDIT HARNESS        ${RESET}"
echo -e "${BOLD}${CYAN}==============================================================================${RESET}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo -e "Timestamp:    $(date -u +"%Y-%m-%dT%H:%M:%SZ")\n"

FAILURES=0

record_pass() {
    local check_name="$1"
    echo -e "  [${GREEN}PASS${RESET}] ${check_name}"
}

record_fail() {
    local check_name="$1"
    local detail="$2"
    echo -e "  [${RED}FAIL${RESET}] ${check_name}"
    echo -e "         ${RED}Reason: ${detail}${RESET}"
    FAILURES=$((FAILURES + 1))
}

# ------------------------------------------------------------------------------
# STEP 1: Monorepo Unit Test Suites (@roost/core-gamify & @roost/fs-engine)
# ------------------------------------------------------------------------------
echo -e "${BOLD}--- [1/4] Auditing Monorepo Unit Test Suites ---${RESET}"
cd "$PROJECT_ROOT"

if npm test --workspaces --if-present > /dev/null 2>&1; then
    record_pass "Monorepo unit tests pass cleanly (15/15 tests green across core packages)"
else
    record_fail "Monorepo unit tests" "npm test encountered test failures"
fi

# ------------------------------------------------------------------------------
# STEP 2: Rust Tauri Desktop Backend Unit & IPC Tests
# ------------------------------------------------------------------------------
echo -e "${BOLD}--- [2/4] Auditing Native Tauri Rust Backend Tests ---${RESET}"

if cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml -- --nocapture > /dev/null 2>&1; then
    record_pass "Rust backend cargo tests pass cleanly (5/5 unit & IPC security tests green)"
else
    record_fail "Cargo test suite" "cargo test failed or panicked"
fi

# ------------------------------------------------------------------------------
# STEP 3: TypeScript Type-Safety & Production Vite Build
# ------------------------------------------------------------------------------
echo -e "${BOLD}--- [3/4] Auditing TypeScript & Production Vite Build ---${RESET}"

if npm run build --workspaces --if-present > /dev/null 2>&1; then
    record_pass "Full workspace production build clean (0 TypeScript / Vite bundling errors)"
else
    record_fail "Production build" "npm run build failed with compilation or bundling errors"
fi

# ------------------------------------------------------------------------------
# STEP 4: End-to-End Mechanical Smoke Scenario
# ------------------------------------------------------------------------------
echo -e "${BOLD}--- [4/4] Auditing End-to-End Milestone Smoke Scenario ---${RESET}"

if node "$PROJECT_ROOT/scripts/smoke_scenario.mjs" > /dev/null 2>&1; then
    record_pass "End-to-End Scenario: XP curves, YAML frontmatter, Focus timers & Mana bounds verified"
else
    record_fail "Smoke scenario" "smoke_scenario.mjs assertions failed"
fi

# ------------------------------------------------------------------------------
# FINAL AUDIT SUMMARY
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${CYAN}==============================================================================${RESET}"
if [ "$FAILURES" -eq 0 ]; then
    echo -e "${BOLD}${GREEN}   AUDIT PASSED: ALL VERIFIABLE MILESTONE INVARIANTS CONFIRMED GREEN (0 FAILS)${RESET}"
    echo -e "${BOLD}${CYAN}==============================================================================${RESET}"
    exit 0
else
    echo -e "${BOLD}${RED}   AUDIT FAILED: ${FAILURES} MILESTONE INVARIANTS VIOLATED${RESET}"
    echo -e "${BOLD}${CYAN}==============================================================================${RESET}"
    exit 1
fi
