---
phase: 2
slug: core-game-loop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — build verification only |
| **Config file** | None |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual quest board check
- **Before `/gsd:verify-work`:** Build succeeds, quest interactions work in browser
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HBIT-03, XPLV-01, XPLV-05, STRK-02-05 | unit-ready | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | HBIT-01, HBIT-02, HBIT-04, STRK-01, XPLV-02 | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | HBIT-05, STRK-06, XPLV-03, XPLV-04 | visual | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Build continues to pass after each task
- [ ] Engine pure functions compile with correct types

*No test framework needed — engine functions are pure and deterministic, testable later.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quest cards display today's habits | HBIT-01 | Visual layout | Login as user@, verify 4 quest cards shown |
| One-click completion | HBIT-02 | Interactive | Click quest checkbox, verify instant response |
| Partial progress blocks | HBIT-04 | Visual | Check water habit shows pixel progress blocks |
| DONE stamp animation | HBIT-05 | Visual | Complete a quest, verify stamp appears rotated 5deg |
| Streak counter prominent | STRK-01 | Visual | Verify streak flame + count is largest element |
| Flame pulse animation | STRK-06 | Visual | Check flame gently pulses on 2s loop |
| Segmented XP bar | XPLV-02 | Visual | Verify blocky/segmented bar, not smooth |
| Level-up flash | XPLV-03 | Visual | Trigger level-up, verify banner flash + text |
| XP float animation | XPLV-04 | Visual | Complete quest, verify +XP floats upward |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
