# Document 18 — Admin Dashboard Spec (Yii2)

**Project Codename:** ValEstate
**Document Owner:** Product / Ops
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 03, 07, 12, 09*

---

## 1. Purpose
Specify the **Yii2 Admin Dashboard** — the internal control plane for Operations, Moderation, and Administration: the verification console, moderation queues, configuration management, user/RBAC administration, and analytics views. It is a **client of the same API + RBAC** (*Doc 05/09/10*).

## 2. Scope
**In:** admin IA, verification console, ops dashboards, moderation/reports, config management (attribute schemas, checklists, reason codes, SLAs, localities), user/staff/RBAC admin, audit views, analytics embeds.
**Out:** public/buyer/owner apps (*Doc 16/17*), backend internals (*Doc 08/09*).

## 3. Dependencies
Roles/RBAC (*Doc 03*), verification workflow (*Doc 07*), ops model (*Doc 12*), API (*Doc 09*), analytics (*Doc 15*).

## 4. Success Criteria
Verifiers and Ops Managers can run the verification operation efficiently and safely (audited, least-privilege); admins can configure the platform without code changes.

---

## 5. Admin IA (role-gated)
```
Dashboard (KPIs)
Verification: Queue · Case detail · My cases
Moderation: Reports · User 360 · Actions
Users & Staff: Users · Staff · Roles/RBAC
Config: Attribute schemas · Checklist templates · Reason codes · SLA · Localities/SEO · Notification templates
Trust: Duplicate clusters · Fraud signals · Blocklist
Analytics: Ops · Funnels · Trust
Audit: Logs
```
Navigation items appear per permission (*Doc 03 §8*).

## 6. Verification Console (core tool — *Doc 07/12*)
### 6.1 Queue view
- Columns: property, type, submitted, SLA due (countdown), flags (duplicate/fraud), status, assignee.
- Sort/filter by SLA-risk, flag, type; **claim** / auto-assign; WIP indicator.
### 6.2 Case detail (single screen to decide)
- Property summary + attributes + photos.
- **Document viewer** — ownership + ID; access issues **audited signed URL** (*Doc 10*), watermark, no download by default.
- **Checklist** (config-driven per type, *Doc 07 §6.3*) with pass/fail/na + notes.
- **Call panel:** owner phone (click-to-call/log), 8-point script, attempt log.
- **Duplicate cluster panel** + fraud signals (*Doc 07 §8*).
- **Decision:** Approve / Reject(reason code) / Request-info(fields) — mandatory reason; conflict-of-interest guard (*Doc 03 BR-03.2*).
- Full case history/audit trail.

## 7. Moderation
- **Reports queue** (fake/duplicate/abuse) with triage, listing/user 360, actions: unpublish, warn, suspend, ban, dismiss — all audited (*Doc 12 §12*).
- **User 360:** profile, properties, inquiries, reports, audit, blocklist status.

## 8. Configuration Management (no-code operations)
| Config | What admins manage |
|---|---|
| Attribute schemas | Per property type field definitions (validation) — drives owner wizard (*Doc 16*) |
| Checklist templates | Per-type verification checklist items & mandatory flags (*Doc 07*) |
| Reason codes | Rejection/report taxonomy (*Doc 07 §6.5*) |
| SLA config | Stage targets, coverage windows (*Doc 12 §7*) |
| Localities & SEO | Taxonomy tree + SEO metadata (*Doc 08/11*) |
| Notification templates | Copy per template key (*Doc 14 §9.2*) |
| Feature flags | e.g. broker role (D-3 OFF), map view, appeals |
> Config changes are **versioned + audited**; some (checklist/SLA) affect live behavior → change log + effective-date.

## 9. Users, Staff & RBAC Admin
- Provision staff, assign roles (*Doc 03*), enforce 2FA (*Doc 10*), deactivate/offboard (revoke + reassign cases).
- RBAC editor (Super Admin): roles ↔ permissions; changes audited.

## 10. Trust & Anti-Fraud Admin
- Duplicate cluster review/adjudication; fraud signal triage; blocklist management (phone/email/ID/IP) (*Doc 07/08*).

## 11. Analytics Views
- Embed/mirror ops & trust dashboards (*Doc 15 §12*): queue/SLA/turnaround/reason distribution/decision quality; funnels; North Star.

## 12. Audit
- Searchable audit log (actor, action, resource, time); **sensitive-doc access log** prominently (*Doc 10*). Append-only, exportable for compliance (*Doc 22*).

## 13. Security & Access
- Admin behind auth + **mandatory 2FA** for all staff (*Doc 10*); IP allowlist optional; short sessions; every sensitive action audited; least-privilege per *Doc 03*.
- Admin uses same API/permission checks — **no privileged backdoor**.

## 14. Business Rules
- **BR-18.1** Every decision/moderation/config action is audited (actor+reason+time).
- **BR-18.2** Verifier sees only assigned cases' documents; access audited (*Doc 03 §8.4*).
- **BR-18.3** Config changes affecting live flows are versioned with change log.
- **BR-18.4** RBAC edits restricted to Super Admin (*Doc 03*).
- **BR-18.5** No listing publish path bypasses verification (*Doc 07 BR-07.1*) — admin cannot force-publish unverified except via explicit, audited override role (if ever allowed; default: not allowed).

## 15. Edge Cases
| Case | Handling |
|---|---|
| Staff offboarded with open cases | Reassign, revoke access, kill sessions (*Doc 10*) |
| Config change mid-verification | New cases use new config; in-flight keep captured template |
| Two admins edit same config | Optimistic lock / conflict warning |
| Emergency unpublish (legal) | Moderator/Admin unpublish + audit + reason |

## 16. Assumptions
- Yii2 server-rendered admin (fast to build, RBAC-native); may add SPA panels later.
- Single-city single-queue at MVP (*Doc 12*).

## 17. Risks
| Risk | Mitigation |
|---|---|
| Insider misuse | 2FA, least-priv, audit, anomaly review |
| Config error breaks flow | Versioning, validation, staging test |
| Console slows verifier throughput | Single-screen decision UX, keyboard-friendly |

## 18. Future Improvements
- Automation-assist panels (OCR/forensics suggestions) (*Doc 07 §17*).
- Multi-queue routing, verifier performance views, SLA forecasting.
- Bulk moderation tools; richer analytics.

## 19. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-18.1 | Is any audited "force-publish/override" ever permitted? (default no) | Product/Ops/Legal |
| OQ-18.2 | Server-rendered vs SPA for verification console (throughput UX). | Eng/UX |

## 20. Related Documents
Parents: *Doc 03, 07, 12, 09*. Related: *Doc 10 (security), 15 (analytics), 22 (audit/compliance)*. Next: *Doc 19*.

## 21. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Product/Ops | Initial draft |

---
*End of Document 18.*
