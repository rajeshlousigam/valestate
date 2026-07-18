# Document 15 — Analytics, Events & Tracking Taxonomy

**Project Codename:** ValEstate
**Document Owner:** Product / Data
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 01, 04, 07*

---

## 1. Purpose
Define the **event & analytics taxonomy** that measures the North Star and KPIs (*Doc 01 §9*), instruments the funnels, and powers ops/product dashboards — distinguishing **domain events** (system truth) from **tracking events** (behavioral analytics), both flowing to an analytics sink separate from OLTP (*Doc 05/08*).

## 2. Scope
**In:** event types, naming, schema, identity/consent, funnels, KPI definitions, dashboards, data pipeline, governance.
**Out:** BI tool selection detail (*Doc 20*), ML modeling.

## 3. Dependencies
Metrics (*Doc 01*), domain events (*Doc 04 §9*), verification metrics (*Doc 07 §14*), ops metrics (*Doc 12 §13*).

## 4. Success Criteria
Every KPI has a precise event-based definition; funnels are instrumented end-to-end; analytics never carries PII/sensitive data; teams share one metric vocabulary.

---

## 5. Two Event Streams
| Stream | Source | Purpose | Store |
|---|---|---|---|
| **Domain events** | Backend (outbox) *Doc 04 §9* | System truth, workflow, audit-adjacent | Queue → analytics sink + warehouse |
| **Tracking events** | Web/mobile clients | Behavior (views, clicks, funnels) | Analytics pipeline |
Both normalized into an **event warehouse** (Phase 2) for BI. MVP: lightweight ingestion + key dashboards.

## 6. Naming & Schema
- **Name:** `object_action` snake (e.g. `listing_viewed`, `inquiry_created`, `property_verified`).
- **Envelope:**
```json
{ "event":"listing_viewed", "version":1, "occurredAt":"ISO8601",
  "anonId":"…", "userId":"uuid|null", "sessionId":"…",
  "context": { "platform":"web|ios|android", "locale":"…", "ref":"…" },
  "props": { "listingId":"…", "localityId":"…", "type":"RESIDENTIAL" },
  "requestId":"…" }
```
- **No PII** in `props` (no phone/email/doc); use ids. Versioned; additive changes only within a version.

## 7. Core Tracking Events (client)
| Event | Key props | Funnel |
|---|---|---|
| `page_viewed` | path, ref | acquisition |
| `search_performed` | filters, resultsCount | discovery |
| `listing_impression` | listingId, position | discovery |
| `listing_viewed` | listingId, locality, type | discovery |
| `listing_saved` | listingId | engagement |
| `contact_revealed` | listingId | engagement |
| `inquiry_started` / `inquiry_submitted` | listingId | conversion |
| `message_sent` | conversationId | conversion |
| `owner_submit_started` / `submit_completed` | propertyId, type | supply |
| `doc_uploaded` | propertyId (no doc content) | supply |
| `saved_search_created` | queryHash | retention |

## 8. Core Domain Events (server → analytics)
From *Doc 04 §9*: `PropertySubmitted`, `PropertyVerified`, `PropertyRejected(reasonCode)`, `ListingPublished/Unpublished`, `InquiryCreated`, `MessageSent`, `ListingMarkedClosed`, plus verification stage transitions (*Doc 07*).

## 9. Funnels
### 9.1 Buyer funnel
```
Visit → search_performed → listing_viewed → (listing_saved) →
contact_revealed/inquiry_submitted → message_sent → deal (ListingMarkedClosed)
```
### 9.2 Owner/supply funnel
```
Register → owner_submit_started → submit_completed →
PropertySubmitted → PropertyVerified → ListingPublished → receives inquiries
```
### 9.3 Verification funnel (ops)
```
Submitted → Claimed → Decided(Approved/Rejected) [+ InfoRequested loop]
```

## 10. KPI Definitions (canonical)
| KPI (*Doc 01 §9*) | Definition (events) |
|---|---|
| **North Star: Verified Transactions Facilitated** | count `ListingMarkedClosed` where confirmed genuine (owner milestone) / month |
| % rejected at verification | `PropertyRejected` / (`PropertyVerified`+`PropertyRejected`) |
| Verified fraud/complaint rate | reports on published / published listings |
| Verified active listings | listings with visibility=PUBLIC |
| Median verification turnaround | median(`Decided.at` − `Claimed.at`) business hours |
| Organic sessions | `page_viewed` where ref=organic |
| Qualified inquiries | `inquiry_submitted` (dedup) |
| Buyer→owner conversation rate | conversations / inquiries |
| Owner submit completion | submit_completed / owner_submit_started |
| SLA compliance | share within targets (*Doc 12*) |

## 11. Identity, Consent & Privacy
- **anonId** (cookie/device) pre-login; **userId** (uuid) post-login; stitched.
- **Consent:** cookie/tracking consent per jurisdiction (*Doc 22*); respect opt-out (no non-essential tracking).
- **PII exclusion enforced** in schema review; sensitive-doc events carry ids only.
- Data retention & anonymization per *Doc 22*.

## 12. Dashboards
| Dashboard | Audience | Contents |
|---|---|---|
| Executive / North Star | Leadership | transactions, supply, demand, trust |
| Verification / Ops | Ops (*Doc 12*) | queue, SLA, turnaround, reasons, quality |
| Supply funnel | Product/Growth | register→submit→verified→published |
| Demand funnel | Product/Growth | visit→view→inquiry→message→deal |
| SEO / Acquisition | Marketing | organic sessions, top localities, CWV |
| Trust & Fraud | Trust/Ops | duplicates caught, reports, fraud signals |

## 13. Pipeline (phased)
- **MVP:** emit tracking events to a collector; domain events via outbox → analytics sink; key dashboards from aggregated tables/replica.
- **Phase 2:** event warehouse (e.g. columnar), transformation layer, self-serve BI; CDC from MySQL.

## 14. Governance
- **Event registry** (this doc + tracking plan) is source of truth; new events reviewed (name, props, PII check, owner).
- Versioned; deprecations tracked.
- QA validates events fire correctly (*Doc 21*).

## 15. Business Rules
- **BR-15.1** No PII/sensitive data in analytics events.
- **BR-15.2** Every KPI maps to explicit event definitions (§10) — no ambiguous metrics.
- **BR-15.3** Tracking respects consent/opt-out.
- **BR-15.4** Analytics store is separate from OLTP (*Doc 05/08*).

## 16. Edge Cases
| Case | Handling |
|---|---|
| Event replay (at-least-once) | idempotent aggregation by eventId |
| Anon→user stitching gaps | best-effort; report caveats |
| Bot traffic skews funnels | filter known bots; separate segment |
| Consent withdrawn | stop non-essential tracking, honor deletion |

## 17. Assumptions
- Lightweight analytics at MVP; warehouse later.
- One tracking plan shared web+mobile.

## 18. Risks
| Risk | Mitigation |
|---|---|
| Metric definition drift | Canonical registry (this doc) |
| PII leakage into analytics | Schema review + tests |
| Instrumentation gaps | QA event tests + funnel monitoring |

## 19. Future Improvements
- Real-time dashboards; anomaly alerts.
- Attribution modeling; cohort/retention analysis.
- Experimentation/AB platform.
- ML features from event store (recommendations, fraud).

## 20. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-15.1 | Analytics/collector tooling & warehouse choice. | Data/DevOps |
| OQ-15.2 | Genuine-transaction confirmation method for North Star. | Product |

## 21. Related Documents
Parents: *Doc 01, 04, 07*. Related: *Doc 12 (ops metrics), 13 (signals), 22 (consent)*. Next: *Doc 16*.

## 22. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Product/Data | Initial draft |

---
*End of Document 15.*
