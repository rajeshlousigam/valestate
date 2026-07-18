# Document 09 — API Design & Contract Standards

**Project Codename:** ValEstate
**Document Owner:** Backend Architect
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 03, 04, 05, 08*

---

## 1. Purpose
Define the **REST API standards and the core endpoint contract** that all clients (Next.js web, React Native, Yii2 admin) consume. Covers conventions, versioning, auth, error format, pagination, idempotency, rate limiting, webhooks/events, and the endpoint map per bounded context. API-first: every capability is an endpoint before a screen.

## 2. Scope
**In:** API conventions, resource/endpoint map, request/response envelope, error taxonomy, auth headers, pagination/filtering, idempotency, versioning, OpenAPI approach.
**Out:** endpoint-by-endpoint field dictionaries (generated OpenAPI is source of truth), auth internals (*Doc 10*), search internals (*Doc 13*).

## 3. Dependencies
RBAC permissions (*Doc 03*), aggregates/events (*Doc 04*), architecture (*Doc 05*), schema (*Doc 08*).

## 4. Success Criteria
Consistent, versioned, secure contract; every endpoint maps to a permission (*Doc 03*) and a domain action (*Doc 04*); clients can integrate from the OpenAPI spec without backend clarification.

---

## 5. Conventions
- **Base:** `https://api.housepoint.<tld>/v1` — **URI versioning** (`/v1`). Breaking changes → `/v2`.
- **Format:** JSON only; `Content-Type: application/json`; UTF-8.
- **Resource naming:** plural nouns, kebab where needed (`/verification-cases`). Actions that aren't CRUD use sub-resources/verbs (`POST /verification-cases/{id}/decision`).
- **Statelessness:** no server session; JWT per request (*Doc 10*).
- **Time:** ISO-8601 UTC. **Money:** `{amount_minor, currency}`.
- **IDs:** public `uuid`/`slug`, never internal auto-inc.

## 6. Standard Envelopes

### 6.1 Success
```json
{ "data": { ... }, "meta": { "requestId": "…" } }
```
List:
```json
{ "data": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 134, "requestId": "…" } }
```

### 6.2 Error (RFC-7807-inspired)
```json
{ "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable summary",
    "details": [ { "field": "price_minor", "issue": "required" } ],
    "requestId": "…"
} }
```
| HTTP | code family | Example |
|---|---|---|
| 400 | `VALIDATION_ERROR` | bad fields |
| 401 | `UNAUTHENTICATED` | missing/expired token |
| 403 | `FORBIDDEN` | RBAC denied (*Doc 03*) |
| 404 | `NOT_FOUND` | / hidden resource |
| 409 | `CONFLICT` | version mismatch, duplicate |
| 422 | `UNPROCESSABLE` | domain rule violation (e.g. publish-before-verify) |
| 429 | `RATE_LIMITED` | throttle |
| 5xx | `INTERNAL` | unexpected |

## 7. Auth, Pagination, Idempotency, Rate Limits
- **Auth header:** `Authorization: Bearer <access_jwt>`. Refresh via `POST /auth/refresh` (*Doc 10*).
- **Pagination:** cursor preferred for large/infinite lists (`?cursor=&limit=`); page-based allowed for admin tables. Return `meta`.
- **Filtering/sort:** `?filter[locality]=…&filter[type]=RESIDENTIAL&sort=-published_at`. Whitelisted fields only.
- **Idempotency:** mutating POSTs accept `Idempotency-Key` header (esp. submit, inquiry, decision) → dedup via Redis (24h).
- **Rate limiting:** per-IP + per-user token buckets (Redis); stricter on auth, inquiry, report, search. `429` + `Retry-After`.
- **Correlation:** every request gets/echoes `X-Request-Id`; propagated to logs/events.

## 8. Endpoint Map (by Bounded Context)

### 8.1 IAM / Auth
| Method | Path | Perm | Notes |
|---|---|---|---|
| POST | /auth/register | public | email/phone + password |
| POST | /auth/verify-otp | public | contact verification |
| POST | /auth/login | public | → access+refresh |
| POST | /auth/refresh | public(token) | rotation (*Doc 10*) |
| POST | /auth/logout | auth | revoke refresh |
| POST | /auth/password/forgot / reset | public | |
| GET | /me | auth | profile + roles |
| PATCH | /me | auth | update profile |

### 8.2 Property (Owner)
| Method | Path | Perm |
|---|---|---|
| POST | /properties | property:create |
| GET | /properties/mine | property:read:own |
| GET | /properties/{uuid} | owner/staff |
| PATCH | /properties/{uuid} | property:update:own |
| POST | /properties/{uuid}/submit | property:update:own |
| POST | /properties/{uuid}/availability | property:update:own |
| POST | /properties/{uuid}/close | property:update:own |
| DELETE | /properties/{uuid} | property:delete:own |
| POST | /properties/{uuid}/media (pre-sign) | media:upload:own |
| POST | /properties/{uuid}/documents (pre-sign) | document:upload:own |

**Media/doc upload flow:** `POST …/media` → returns pre-signed S3 URL + assetId → client PUTs to S3 → `POST …/media/{assetId}/complete`. Docs go to **private** bucket (*Doc 05/08*).

### 8.3 Verification (Ops)
| Method | Path | Perm |
|---|---|---|
| GET | /verification/queue | verification:claim |
| POST | /verification-cases/{id}/claim | verification:claim |
| GET | /verification-cases/{id} | assigned/ops |
| GET | /verification-cases/{id}/documents/{docId}/access | document:view (signed URL, **audited**) |
| PATCH | /verification-cases/{id}/checklist | property:approve/reject scope |
| POST | /verification-cases/{id}/request-info | verification |
| POST | /verification-cases/{id}/decision | property:approve/reject |
| POST | /verification-cases/{id}/reassign | verification:reassign |

`decision` body: `{ decision: APPROVED|REJECTED, reasonCode?, note? }` → emits `PropertyVerified|PropertyRejected`.

### 8.4 Catalog / Public (SEO + browse) — mostly unauthenticated
| Method | Path | Perm |
|---|---|---|
| GET | /listings | public | search/filter/sort |
| GET | /listings/{slug} | public | full public listing (no PII) |
| GET | /localities | public | taxonomy for SEO/nav |
| GET | /localities/{slug}/listings | public | locality landing |
| GET | /sitemap-data | public/system | feeds sitemap gen (*Doc 11*) |

### 8.5 Engagement (Buyer)
| Method | Path | Perm |
|---|---|---|
| POST | /listings/{slug}/inquiries | inquiry:create |
| GET | /inquiries/mine | inquiry:read:own |
| GET | /conversations | message scope |
| GET | /conversations/{id}/messages | participant |
| POST | /conversations/{id}/messages | message:send |
| POST | /messages/{id}/read | participant |

### 8.6 Saved Search & Notifications
| Method | Path | Perm |
|---|---|---|
| POST/GET/DELETE | /saved-searches | savedsearch:manage:own |
| GET/PATCH | /notification-preferences | own |

### 8.7 Trust / Reports
| Method | Path | Perm |
|---|---|---|
| POST | /reports | report:create (captcha for guest) |
| GET | /reports | report:resolve |
| POST | /reports/{id}/resolve | report:resolve |

### 8.8 Admin / Config / Ops
| Method | Path | Perm |
|---|---|---|
| GET | /admin/users, /admin/users/{id} | user mgmt |
| POST | /admin/users/{id}/suspend|ban | user:suspend/ban |
| CRUD | /admin/config/attribute-schemas | config:manage |
| CRUD | /admin/config/checklist-templates | config:manage |
| CRUD | /admin/config/reason-codes, /sla, /localities | config:manage |
| GET | /admin/analytics/* | analytics:view |
| CRUD | /admin/rbac/* | rbac:manage |

> Admin uses the **same API + RBAC**; the Yii2 admin UI is a client (*Doc 05, 18*).

## 9. Domain Events over API (async contract)
- Internal events (*Doc 04 §9*) are **not** public REST but are the async contract between modules/workers (outbox → queue).
- **Outbound webhooks** (future/B2B, *Doc 01 §15*): signed `POST` to partner URLs with event payload; retries + HMAC signature. Not MVP.
- Event payloads are **versioned** (`eventType`, `version`, `occurredAt`, `data`) and documented alongside OpenAPI.

## 10. OpenAPI & Contract Governance
- **Single source of truth:** OpenAPI 3.1 spec, versioned in repo, generated/validated in CI.
- Clients generate typed SDKs (TS for web/mobile) from it → no drift.
- **Contract tests** (*Doc 21*) verify server matches spec; breaking changes gated in review.
- Every endpoint annotated with required **permission** (*Doc 03*) and emitted **events** (*Doc 04*).

## 11. Security Cross-Refs
- All non-public endpoints require valid access JWT; RBAC checked server-side (UI hints are advisory).
- Sensitive document access is **never** a direct URL — always a short-lived signed URL issued by an **audited** endpoint (§8.3).
- Input validation, output PII-filtering, rate limits, idempotency → *Doc 10*.

## 12. Business Rules
- **BR-09.1** `422 UNPROCESSABLE` for domain-rule violations (e.g. publishing unverified) — distinct from `400` validation.
- **BR-09.2** List endpoints never return sensitive docs/PII regardless of role (separate audited endpoint only).
- **BR-09.3** Mutations that emit events must use the outbox in the same transaction (*Doc 05/08*).
- **BR-09.4** Version bumps: additive changes are non-breaking within `/v1`; removals/renames require `/v2`.

## 13. Edge Cases
| Case | Handling |
|---|---|
| Client retries submit (network) | Idempotency-Key dedups |
| Optimistic concurrency on property edit | `version` check → `409 CONFLICT` |
| Access token expired mid-flow | `401` → client refreshes → retry |
| Guest tries protected endpoint | `401`; register/login flow |
| Search with unknown filter | ignore or `400` (whitelist) |

## 14. Assumptions
- REST (not GraphQL) per stack mandate; GraphQL considered future for complex client needs.
- Mobile & web share the same `/v1` contract.

## 15. Risks
| Risk | Mitigation |
|---|---|
| Spec/impl drift | OpenAPI in CI + contract tests |
| Over-fetching on mobile | Field selection/sparse fieldsets where needed |
| Breaking changes leak | Versioning policy + review gate (BR-09.4) |

## 16. Future Improvements
- Typed SDK auto-publish per release.
- GraphQL/BFF layer for rich mobile screens if REST round-trips grow.
- Public/B2B API with API keys + webhooks (*Doc 01 §15*).

## 17. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-09.1 | Cursor vs page pagination default for public search? | Backend/Frontend |
| OQ-09.2 | Do we expose a BFF for Next.js server components, or call API directly? | Architect |

## 18. Related Documents
Parents: *Doc 03, 04, 05, 08*. Enforced by *Doc 10*; consumed by *Doc 16, 17, 18*; tested by *Doc 21*. Next: *Doc 10*.

## 19. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Backend Architect | Initial draft |

---
*End of Document 09.*
