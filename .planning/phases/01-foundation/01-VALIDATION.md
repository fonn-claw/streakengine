---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — greenfield project, Wave 0 installs |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual login test
- **Before `/gsd:verify-work`:** Build must succeed, all 3 demo accounts login
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01 | integration | `curl -X POST /api/auth/login` with demo creds | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | integration | Check cookie set after login | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | integration | POST to logout, verify redirect | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | AUTH-04 | integration | Login as coach, verify /coach redirect | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | UIDN-01 | manual-only | Visual inspection — squared edges, 3px borders | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | UIDN-02 | manual-only | Visual inspection — bg is #1A1A2E | N/A | ⬜ pending |
| 01-02-03 | 02 | 1 | UIDN-03 | manual-only | Check computed font-family | N/A | ⬜ pending |
| 01-02-04 | 02 | 1 | UIDN-04 | manual-only | Responsive view check — bottom tab bar | N/A | ⬜ pending |
| 01-02-05 | 02 | 1 | UIDN-05 | manual-only | Browser width check — top nav, 720px max | N/A | ⬜ pending |
| 01-02-06 | 02 | 1 | UIDN-06 | manual-only | Visual inspection of nav icons from assets | N/A | ⬜ pending |
| 01-02-07 | 02 | 1 | UIDN-07 | unit | `import { motion }` compiles in build | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Next.js project scaffolded with `create-next-app@latest`
- [ ] Build succeeds with `npm run build`
- [ ] Motion library installed and importable

*Phase 1 is primarily infrastructure + UI shell. Build success is the primary automated gate.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pixel-art aesthetic | UIDN-01 | Visual design judgment | Check squared edges, 3px borders, no rounded corners |
| Dark theme | UIDN-02 | Visual check | Background is #1A1A2E |
| Pixel fonts | UIDN-03 | Font rendering | Press Start 2P for headings, Silkscreen for body |
| Mobile tab bar | UIDN-04 | Responsive layout | 4-item bottom tab bar with pixel icons at mobile widths |
| Desktop nav | UIDN-05 | Responsive layout | Top nav strip, content max-width 720px centered |
| Asset usage | UIDN-06 | Visual check | Nav uses icon-flame.svg, icon-sword.svg, icon-people.svg, icon-shield.svg |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
