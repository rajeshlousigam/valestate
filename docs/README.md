# HousePoint — Enterprise Documentation Suite

**Project Codename:** HousePoint — a **verification-first real-estate marketplace**: every property is verified by a human Operations process *before* it becomes publicly visible. Vision: *the operating system for real estate transactions*.

**Status:** Documentation baseline complete (v0.1–0.2 drafts). Engineering can begin against these specs.
**Last Updated:** 2026-07-18

---

## How to read this suite
- Start at **Doc 01** (vision) → **Doc 04** (domain language) → **Doc 07** (the core verification workflow). These three carry the platform's core bet.
- Every document has: Purpose · Scope · Dependencies · Success Criteria (top) and Open Questions · Future Improvements · Related Documents · Revision History (bottom).
- Terminology is **binding** from Doc 04 (Property = the asset; Listing = its publishable offer).

## Locked foundational decisions (Doc 01 §16)
| ID | Decision |
|---|---|
| D-1 | Launch geography = **single city** (specific city TBD) |
| D-2 | Property types = **Residential Sale + Rent, Commercial, Land/Plots** |
| D-3 | **Owner-only** listing (no brokers in MVP; role modeled for future) |
| D-4 | Verification = **ownership docs + identity + operations call** (no field visit in MVP) |

## Document Index
| # | Document | Focus |
|---|---|---|
| 01 | [Product Vision, Strategy & Scope](01-product-vision-and-strategy.md) | The bet, pillars, North Star, doc roadmap |
| 02 | [Market & Competitive Analysis](02-market-and-competitive-analysis.md) | "Verified Marketplace" positioning, cold-start GTM |
| 03 | [Personas, Roles & RBAC](03-personas-roles-and-rbac.md) | Actors + permission matrix |
| 04 | [Domain Model & Ubiquitous Language](04-domain-model-and-ubiquitous-language.md) | ⭐ DDD contexts, aggregates, events |
| 05 | [System & Solution Architecture](05-system-and-solution-architecture.md) | Modular monolith, event backbone, CQRS-lite, ADRs |
| 06 | [Functional Requirements Module Map](06-functional-requirements-module-map.md) | Epics, requirement standards, MVP cut line |
| 07 | [Property Lifecycle & Verification](07-property-lifecycle-and-verification.md) | ⭐ The core workflow, checklists, SLAs, reason codes |
| 08 | [Data Model & Database Architecture](08-data-model-and-database-architecture.md) | MySQL schema, indexes, PII, outbox |
| 09 | [API Design & Contract Standards](09-api-design-and-contract-standards.md) | REST conventions, endpoint map, OpenAPI |
| 10 | [Auth, Authorization & Security](10-authentication-authorization-security.md) | JWT/refresh, RBAC, doc protection, threat model |
| 11 | [SEO Architecture & Content](11-seo-architecture-and-content-strategy.md) | SSR/ISR, structured data, taxonomy |
| 12 | [Operations & Verification Playbook](12-operations-and-verification-playbook.md) | Queues, SLAs, staffing, QA sampling |
| 13 | [Discovery, Search & Recommendation](13-discovery-search-and-recommendation.md) | Read-model search, filters, alerts |
| 14 | [Messaging & Communication](14-messaging-and-communication.md) | Inquiries, chat, notifications, contact policy |
| 15 | [Analytics, Events & Tracking](15-analytics-events-and-tracking.md) | Event taxonomy, funnels, KPI definitions |
| 16 | [Web Application UX Spec](16-web-application-ux-spec.md) | IA, journeys, design system, a11y |
| 17 | [Mobile Application Spec](17-mobile-application-spec.md) | React Native, native features, parity |
| 18 | [Admin Dashboard Spec](18-admin-dashboard-spec.md) | Verification console, config, moderation |
| 19 | [NFR & Phased Roadmap](19-nfr-and-phased-roadmap.md) | Quality targets, phases 0–4, launch checklist |
| 20 | [DevOps, Infrastructure & Environments](20-devops-infrastructure-and-environments.md) | AWS topology, CI/CD, observability, DR |
| 21 | [QA Strategy & Test Architecture](21-qa-strategy-and-test-architecture.md) | Test pyramid, critical-path matrix, gates |
| 22 | [Risk, Compliance & Legal](22-risk-compliance-and-legal.md) | Risk register, data protection, verification liability |
| 23 | [Monetization & Billing](23-monetization-and-billing.md) | Revenue streams, trust guardrail, billing arch |
| 24 | [Launch City Config & Placeholders](24-launch-city-config-and-placeholders.md) | **Imphal** taxonomy, India compliance, Phase 0/1 config defaults |

## Highest-leverage documents
**Doc 04** (domain model) and **Doc 07** (verification workflow) encode the core differentiator — invest the most rigor there; everything else derives from them.

## Resolved & remaining Open Questions
**Resolved:** Launch city = **Imphal, Manipur** (D-1) · Jurisdiction = **India (DPDP Act 2023 + Manipur RERA)** — see [Doc 24](24-launch-city-config-and-placeholders.md).

**Remaining (none block Phase 0/1 code):**
| Ref | Question | Blocks |
|---|---|---|
| OQ-2a/07.1 | Counsel sign-off on **ownership-document set per type** (Manipur land rules) | verification *content*, not engine |
| OQ-22.x | DPDP/RERA specifics, retention period, ToS "verified" wording | real-PII prod handling, go-live |
| OQ-02.2/23.1 | Launch verification **free, subsidized, or paid**? | billing switch (Phase 2) |
| OQ-06.1/16.2 | MVP scope of **in-app chat** (defaulted ON) & **map search** (Phase 2) | feature-slice scope |
| OQ-07 | **Commercial/Land** under owner-only — Phase 1 or Phase 2? | supply strategy (model supports both) |

## Build status
Phase 0 foundations scaffolded (monorepo, Docker infra, Yii2 API health+auth, migrations, Next.js). See root [README](../README.md) for quick start.

## Consistent conventions across the suite
- Requirement IDs: `FR-/US-/BR-<MODULE>-<n>`; decisions `D-n`; risks `RSK-/R-`; open questions `OQ-`.
- ADRs live in Doc 05. Event contracts in Doc 04/09/15. KPI definitions in Doc 15.
