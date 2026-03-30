---
phase: 3
slug: social-achievements
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 3 — Validation Strategy

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
- **After every plan wave:** Run `npm run build` + manual page check
- **Before `/gsd:verify-work`:** Build succeeds, all pages render correctly in browser
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | LDBD-01-05, ACHV-01-05, SOCL-01-04 | unit-ready | `npm run build` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | PROF-01-04 | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | LDBD-01-05, SOCL-01-04, ACHV-01-05, PROF-01-04 | visual | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Build continues to pass after each task
- [ ] Engine pure functions compile with correct types
- [ ] New DB queries compile and types match schema

*No test framework needed — engine functions are pure and deterministic, testable later.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Leaderboard shows ranked friends with trophies | LDBD-01-03 | Visual layout | Login as user@, verify leaderboard with gold/silver/bronze trophies |
| Current user row highlighted | LDBD-04 | Visual | Verify own row has primary-colored left border |
| Friends list with streak/level | SOCL-01-02 | Visual | Navigate to /friends, verify friend cards show data |
| Send nudge button works | SOCL-03 | Interactive | Click nudge button, verify feedback appears |
| Achievement grid locked/unlocked | ACHV-01-02 | Visual | Check profile, verify locked badges show "?" with lock icon |
| Achievement sparkle animation | ACHV-04 | Visual | Trigger achievement unlock, verify sparkle particles |
| Profile character sheet layout | PROF-01 | Visual | Navigate to /profile, verify level/XP/streak display |
| RPG stat block display | PROF-02 | Visual | Verify STR/INT/DEX/CHA bars on profile |
| Weekly challenge progress blocks | SOCL-04 | Visual | Verify blocky progress blocks on challenge card |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
