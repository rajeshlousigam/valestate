# Document 06 — Functional Requirements: Module Map & Standards

**Project Codename:** ValEstate
**Document Owner:** Business Analyst
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 03, 04, 05*

---

## 1. Purpose
Provide the **catalog of functional modules and epics**, a consistent **requirement-writing standard** (IDs, user-story + acceptance-criteria format), and a **feature → phase** map. This is the index that individual feature specs and the roadmap (*Doc 19*) hang off. It prevents scope ambiguity across teams.

## 2. Scope
**In:** module list, epic list per module, requirement ID scheme, story/AC template, MoSCoW + phase mapping, traceability approach.
**Out:** deep per-feature specs (each becomes its own child spec as needed), UX detail (*Doc 16/17*).

## 3. Dependencies
Roles (*Doc 03*), domain (*Doc 04*), architecture (*Doc 05*).

## 4. Success Criteria
Every team can locate its module, knows the requirement format, and can see what's in MVP vs. later — with traceable IDs.

---

## 5. Requirement Standards

### 5.1 ID Scheme
`FR-<MODULE>-<n>` for functional requirements; `US-<MODULE>-<n>` for user stories; `AC` bullets under each story; `BR-<MODULE>-<n>` business rules.
Modules: `IAM, PROP, VER, MEDIA, PUB, DISC, ENG, TRUST, OPS, NOTF, SEO, ADMIN, ANALYTICS`.

### 5.2 User Story + Acceptance Criteria Template
```
US-PROP-12  (Priority: Must · Phase: 1)
As an Owner, I want to submit a property with photos and ownership documents
so that it can be verified and published.

Acceptance Criteria (Gherkin-style):
  AC1 Given an Active contact-verified Owner
      When they submit with >=1 ownership doc and required media
      Then Property status becomes SUBMITTED and a VerificationCase is created.
  AC2 Given missing required attributes for the property type
      Then submission is blocked with field-level errors.
Business Rules: BR-PROP-3 (see Doc 04 I-1)
Events: Property.PropertySubmitted (Doc 04 §9)
Edge Cases: partial upload, network drop, duplicate detected
```

### 5.3 Prioritization (MoSCoW) & Phase
Each requirement tagged **Must/Should/Could/Won't-now** and a **Phase (0–4)** from *Doc 01 §11*.

---

## 6. Module Map (Epics)

### M1 — Identity & Access (IAM)
| Epic | Key stories | Phase |
|---|---|---|
| Registration & login | email/phone signup, OTP verify, JWT login/refresh, logout | 0–1 |
| Password & recovery | reset, change, lockout | 1 |
| Profile & roles | profile edit, role assignment (staff), multi-role | 1 |
| Account states | suspend/ban/deactivate flows | 1–2 |
| Session/security | refresh rotation, device list, 2FA (staff) | 1–2 |

### M2 — Property (PROP)
| Epic | Key stories | Phase |
|---|---|---|
| Property submission | create draft, type-specific attributes, media upload, doc upload, submit | 1 |
| Property management | edit, availability, mark closed/sold, archive | 1 |
| Re-verification triggers | material-change detection | 1–2 |
| Owner dashboard | my properties, statuses, inquiries summary | 1 |

### M3 — Verification (VER)  ⭐ core
| Epic | Key stories | Phase |
|---|---|---|
| Verification case lifecycle | claim, doc review, ID check, owner call, decision | 1 |
| Checklists & reason codes | configurable checklist, mandatory items, reason taxonomy | 1 |
| Info-request loop | request more info, owner responds, resume | 1 |
| Appeals | owner appeal of rejection | 2 |
| Automation-assist | OCR, image forensics, ML dedup surfacing | 3 |

### M4 — Media & Document (MEDIA)
| Epic | Stories | Phase |
|---|---|---|
| Uploads | pre-signed S3, progress, retry, validation | 1 |
| Image processing | variants, watermark(optional), EXIF strip | 1–2 |
| Sensitive docs | private storage, signed access, audit | 1 |

### M5 — Publication & Catalog (PUB)
| Epic | Stories | Phase |
|---|---|---|
| Publish/unpublish | on verify → publish; unpublish on close/ban | 1 |
| Trust signals | verified badge, checks-performed, verified date | 1 |
| Slug/canonical | SEO slug, canonical URL, redirects | 1 |

### M6 — Discovery & Search (DISC)
| Epic | Stories | Phase |
|---|---|---|
| Search & filters | keyword, locality, price, type, attributes | 1 |
| Geo search | map view, radius, boundary | 2 |
| Sort & relevance | recency, price, relevance | 1–2 |
| Saved searches & alerts | save, notify on new match | 2 |
| Recommendations | similar listings | 2–3 |

### M7 — Engagement (ENG)
| Epic | Stories | Phase |
|---|---|---|
| Inquiries | buyer inquiry, owner receives lead | 1 |
| Messaging | in-app thread, notifications, read receipts | 1–2 |
| Contact controls | reveal rules, spam/abuse limits | 1–2 |
| Transaction milestones | mark negotiating/closed | 2–3 |

### M8 — Trust & Anti-Fraud (TRUST)
| Epic | Stories | Phase |
|---|---|---|
| Duplicate detection | clustering on submit, ops surfacing | 1–2 |
| Fraud signals | heuristics, blocklists, velocity checks | 2 |
| Trust score | property/owner scoring | 2–3 |
| Reporting | user reports fake/duplicate/abuse | 1 |

### M9 — Operations (OPS)
| Epic | Stories | Phase |
|---|---|---|
| Work queues | queue, claim, aging, SLA | 1 |
| Assignment | auto/manual, reassignment, workload | 1–2 |
| Dashboards | SLA, throughput, decision quality | 1–2 |

### M10 — Notification (NOTF)
| Epic | Stories | Phase |
|---|---|---|
| Transactional | verification updates, inquiries, messages | 1 |
| Channels | email, SMS, push | 1–2 |
| Preferences | opt-in/out, digests | 2 |

### M11 — SEO (SEO)
| Epic | Stories | Phase |
|---|---|---|
| Rendering | SSR/ISR public pages | 1 |
| Structured data | JSON-LD, sitemaps, canonical, robots | 1 |
| Content taxonomy | city/locality/type landing pages | 1–2 |

### M12 — Admin (ADMIN)
| Epic | Stories | Phase |
|---|---|---|
| Ops tooling | verification console, reports queue | 1 |
| Config | localities, attribute schemas, verification rules, reason codes | 1 |
| User/role mgmt | staff provisioning, RBAC | 1 |
| Moderation | reports, unpublish, ban | 1–2 |

### M13 — Analytics (ANALYTICS)
| Epic | Stories | Phase |
|---|---|---|
| Event tracking | taxonomy, ingestion | 1–2 |
| Dashboards | North Star, funnels, ops KPIs | 2 |

---

## 7. MVP Cut Line (Phase 1 "Must") — the end-to-end loop
> The single non-negotiable MVP outcome: **a property can go submit → verify → public → inquiry, end to end, in one city.**

Must-haves: IAM (register/login/roles), PROP (submit/manage), VER (full case lifecycle), MEDIA (uploads + sensitive docs), PUB (publish + trust signals), DISC (search/filter, no map), ENG (inquiry + basic messaging), OPS (queue/claim/decision), NOTF (transactional email/SMS), SEO (SSR + JSON-LD + sitemap), ADMIN (verification console + config + moderation basics), TRUST (report + basic dedup surfacing).

Deferred to Phase 2+: map/geo search, saved-search alerts, appeals, fraud scoring, recommendations, transaction milestones, mobile app depth, analytics dashboards.

## 8. Traceability
Each requirement links **up** to a *Doc 01* goal/pillar and **down** to test cases (*Doc 21*) and endpoints (*Doc 09*). Maintained in a traceability matrix (tooling: issue tracker labels = module + phase + priority).

## 9. Assumptions
- Detailed per-feature specs are authored just-in-time per epic, following §5 template.
- Attribute schemas per property type are **config-driven** (Admin), not hardcoded.

## 10. Risks
| Risk | Mitigation |
|---|---|
| Scope creep past MVP cut line | §7 is the contract; changes need roadmap (*Doc 19*) sign-off |
| Inconsistent requirement quality | §5 template mandatory in reviews |

## 11. Future Improvements
- Auto-generate traceability matrix from issue tracker.
- BDD test generation from AC (*Doc 21*).

## 12. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-06.1 | Is in-app messaging Must for MVP or is inquiry+notify enough at launch? | Product |
| OQ-06.2 | Minimum media count per property type? | Product/Ops |

## 13. Related Documents
Parents: *Doc 03, 04, 05*. Children: all feature specs, *Doc 07* (VER detail), *Doc 19* (roadmap). Next: *Doc 07*.

## 14. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | BA | Initial draft |

---
*End of Document 06.*
