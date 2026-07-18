# Document 10 — Authentication, Authorization & Security

**Project Codename:** ValEstate
**Document Owner:** Security Consultant
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 03, 05, 08, 09*

---

## 1. Purpose
Specify **how identity, access, and platform security** are implemented: JWT + refresh-token rotation, Yii2 RBAC enforcement, sensitive-data protection (ownership/ID docs), threat model, and security controls across the stack. Trust-first means security is a core feature, not a phase.

## 2. Scope
**In:** authN (JWT/refresh/OTP/2FA), authZ (RBAC enforcement), session/device mgmt, secrets, encryption, input/output security, rate limiting, audit, threat model, abuse/fraud controls (security side).
**Out:** ops fraud adjudication (*Doc 07/12*), legal/compliance obligations (*Doc 22*).

## 3. Dependencies
Roles/permissions (*Doc 03*), API contract (*Doc 09*), data sensitivity (*Doc 08*), architecture (*Doc 05*).

## 4. Success Criteria
Stateless auth with safe refresh rotation; server-side RBAC on every protected endpoint; ownership/ID docs provably protected + audited; documented threat model with mitigations.

---

## 5. Authentication

### 5.1 Token Model
| Token | Lifetime | Storage (web) | Storage (mobile) | Contents |
|---|---|---|---|---|
| **Access JWT** | short (e.g. 15 min) | in-memory | secure storage | `sub(userId uuid)`, `roles[]`, `iat`, `exp`, `jti` |
| **Refresh token** | long (e.g. 30 days) | **HttpOnly Secure SameSite cookie** | Keychain/Keystore | opaque, hashed server-side |

- Access JWT signed with **RS256** (asymmetric) so clients/edge can verify without the signing key; rotate keys via JWKS.
- **Refresh rotation:** each `/auth/refresh` issues a new refresh + revokes the old (stored `token_hash`, *Doc 08*). **Reuse detection:** if a revoked refresh is presented → treat as theft → revoke entire token family + force re-login + alert.
- **Logout** revokes refresh (and family). Access tokens expire naturally; a `jti` denylist in Redis handles forced immediate revocation when needed.

### 5.2 Registration & Contact Verification
- Email + phone OTP (*Doc 09 /auth*). Owner must be **contact-verified** before `property:create` (BR-03.1).
- Passwords: **Argon2id** (or bcrypt cost≥12), breach-list check, min length, rate-limited attempts, lockout + captcha on abuse.

### 5.3 2FA (staff)
- **Mandatory 2FA (TOTP) for all internal roles** (Verifier, Ops Mgr, Moderator, Admin, Super Admin) — they touch PII/decisions. Optional for owners/buyers (Phase 2).

### 5.4 Device/Session Management
- Track refresh tokens per `device_id`; user can list/revoke devices. Staff sessions shorter + IP/geo anomaly alerts.

## 6. Authorization (RBAC)

### 6.1 Enforcement
- **Server is the source of truth.** Yii2 RBAC auth items map to permissions from *Doc 03*. Every protected endpoint declares a required permission (+ scope) checked in a filter/behavior before controller logic.
- **Scope resolution** (`own`/`assigned`/`any`) enforced with ownership checks (e.g., `property.owner_id == userId`, `case.assigned_verifier_id == userId`).
- UI (web/mobile/admin) hides disallowed actions for UX only — never for security.
- **Deny by default**; unknown permission ⇒ 403.

### 6.2 Conflict-of-Interest & Sensitive Rules
- BR-03.2 (verifier≠owner) enforced at claim/decision (auto-reassign).
- Multi-role permission union with scope-aware checks (*Doc 03 §8*).

## 7. Sensitive Data Protection (Ownership & ID Documents)
> This is the highest-risk data on the platform.

| Control | Implementation |
|---|---|
| **Storage isolation** | Private S3 bucket, **no CDN**, block public access, SSE-KMS encryption at rest |
| **Access** | Only via **short-lived (e.g. 60s) signed URL** issued by an **audited** endpoint (*Doc 09 §8.3*) to authorized roles (*Doc 03 §8.4*) |
| **Least exposure** | Never in list/search/read models; never logged; keys never returned to unauthorized clients |
| **Audit** | Every issue-of-signed-URL and every decision logged in `audit_logs` (actor, doc, time, ip) |
| **Retention** | Purge per policy after CLOSED/REJECTED (*Doc 08/22*) |
| **In transit** | TLS 1.2+ everywhere |
| **PII minimization** | Store only what verification needs; redact in logs/analytics |

## 8. Platform Security Controls
| Layer | Control |
|---|---|
| Edge | WAF, DDoS protection, TLS termination, HSTS |
| Transport | TLS 1.2+, secure cookies, CORS allowlist |
| Input | Server-side validation (allowlist), parameterized queries (no raw SQL concat), file-type/size/mime checks on uploads, image re-encode + EXIF strip |
| Output | PII filtering in serializers, no sensitive fields in public DTOs (BR-09.2), CSP, no reflected user HTML (XSS) |
| Auth | JWT RS256, refresh rotation + reuse detection, 2FA staff, lockout |
| Rate limit / abuse | Redis token buckets on auth/inquiry/report/search; captcha on guest report & repeated failures |
| Secrets | Secrets manager (not in repo/env in code); rotation; least-priv IAM roles for S3/KMS |
| Uploads | Pre-signed URLs scoped to key + method + expiry; virus/malware scan on documents (worker) |
| Audit | Append-only `audit_logs`; tamper-evident (hash chain optional) |
| Dependencies | SCA/dependency scanning in CI; pinned versions |

## 9. Threat Model (STRIDE summary)
| Threat | Example | Mitigation |
|---|---|---|
| **Spoofing** | Fake owner, token theft | OTP/ID verification (D-4), refresh reuse detection, 2FA staff |
| **Tampering** | Alter listing/price via API | RBAC scope, optimistic version, audit |
| **Repudiation** | "I didn't approve that" | Immutable audit of decisions (*Doc 07/08*) |
| **Information disclosure** | Leak ownership docs/PII | Private bucket, signed URLs, no read-model PII, audit |
| **Denial of Service** | Flood submit/search | WAF, rate limits, autoscale, queue backpressure |
| **Elevation of privilege** | Buyer acts as admin | Server-side RBAC deny-by-default, no client trust |
| **Business-logic abuse** | Bait listings, lead farming, scraping | Verification (D-4), rate limits, dedup/fraud (*Doc 07*), contact reveal controls |

## 10. Abuse & Anti-Scraping (protecting the verified catalog)
- Contact details (owner phone) **not exposed raw** in public HTML/JSON; revealed to contact-verified buyers via gated action, rate-limited, logged. Deters scraping/lead theft (a key incumbent complaint).
- Bot detection on search/listing endpoints; progressive challenges.
- Watermark/limit bulk media access.

## 11. Business Rules
- **BR-10.1** Every protected endpoint enforces a permission server-side (*Doc 03/09*).
- **BR-10.2** Sensitive doc access is always audited and time-boxed.
- **BR-10.3** Staff accounts require 2FA and are provisioned by Admin only.
- **BR-10.4** Token reuse ⇒ family revocation + alert.
- **BR-10.5** No secret/PII in logs, errors, analytics, or client responses.

## 12. Edge Cases
| Case | Handling |
|---|---|
| Stolen refresh token replayed | Reuse detection revokes family |
| Staff offboarding | Immediate account deactivate + role revoke + session kill |
| Signed URL shared externally | 60s expiry limits blast radius; access still audited to issuer |
| Buyer mass-inquiry (spam) | Rate limit + abuse score + possible suspend |
| Password breach reuse | Breach-list block at set/reset |

## 13. Assumptions
- KMS + secrets manager available in infra (*Doc 20*).
- Single-region compliance context for MVP (*Doc 22*).

## 14. Risks
| Risk | Mitigation |
|---|---|
| PII breach = existential to trust brand | Layered controls (§7), audits, least privilege, retention |
| RBAC misconfig | RBAC as code + tests (*Doc 21*) + periodic review |
| Insider misuse of doc access | Audit + 2FA + least-priv + anomaly alerts |

## 15. Future Improvements
- Field-level encryption / tokenization vault for docs.
- Continuous auth / anomaly detection (impossible-travel).
- Bug bounty + periodic pentest (*Doc 22*).
- Passkeys/WebAuthn for staff.

## 16. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-10.1 | Access/refresh exact TTLs and 2FA vendor. | Security |
| OQ-10.2 | Malware-scanning solution for uploaded documents. | Security/DevOps |

## 17. Related Documents
Parents: *Doc 03, 05, 08, 09*. Related: *Doc 07 (audit of decisions), 22 (compliance)*. Next: *Doc 11*.

## 18. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Security Consultant | Initial draft |

---
*End of Document 10.*
