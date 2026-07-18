# Document 24 — Launch City Configuration & Phase 0/1 Placeholders

**Project Codename:** HousePoint
**Document Owner:** Product / Ops / Eng
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 01 (D-1), 06, 07, 11, 12, 22*

---

## 1. Purpose
Provide **concrete, buildable default values** so engineering can start Phase 0/1 immediately, now that **Launch City = Imphal, Manipur, India (D-1)** is fixed. Everything here is **config, not code** (*Doc 08/18* config-driven) — values are provisional and refined with Ops/Legal without code changes.

## 2. Scope
**In:** Imphal locality taxonomy seed, India jurisdiction posture, per-type ownership-document defaults, provisional SLA/checklist values, currency/locale, config placeholders for verification/SEO.
**Out:** final legal sign-off (*Doc 22* w/ counsel), engine tuning.

## 3. Launch Market Facts
| Item | Value |
|---|---|
| City | **Imphal** (Imphal West + Imphal East districts) |
| State | Manipur, India |
| Country / locale | India · `en-IN` (Meitei/Manipuri `mni` future, i18n-ready *Doc 11/19*) |
| Currency | INR (`₹`), stored as `amount_minor` (paise) + `INR` (*Doc 08*) |
| Timezone | Asia/Kolkata (IST, UTC+5:30) — store UTC, present IST |
| Regulator | **Manipur RERA** (real-estate advertising/disclosure) |
| Data law | **India DPDP Act 2023** (*Doc 22*) |

## 4. Imphal Locality Taxonomy (SEO + search seed)
> Seeds `localities` (*Doc 08 §7.9*) → powers URLs `/imphal/{locality}` (*Doc 11*). Expand with Ops; this is the Phase 1 starter set.

```
Imphal (CITY)
├── Imphal West (AREA)
│   ├── Thangmeiband, Uripok, Sagolband, Keishampat, Paona Bazar,
│       Thangal Bazar, Nagamapal, Lamphelpat, Langol, Chingmeirong,
│       Kwakeithel, Singjamei, Wangkhei-adjacent
├── Imphal East (AREA)
│   ├── Kongba, Porompat, Khurai, Wangkhei, Sagolband-adjacent,
│       Chingangbam Leikai, Kshetri, Andro Road
└── Peri-urban (AREA)
    ├── Lamphel, Mantripukhri, Koirengei, Canchipur (near MU),
        Sekmai, Bishnupur-road corridor
```
Each locality node: `name, slug, level, parent_id, geo_polygon?(optional), seo_meta_json`. Slugs kebab-case (`thangmeiband`, `imphal-west`).

## 5. Property Types × Ownership-Document Defaults (India / Manipur)
> Provisional — **confirm with counsel** (OQ-2a/07.1). Drives per-type checklist (*Doc 07 §6.3*, config in *Doc 18*).

| Property Type / Intent | Primary ownership proof (accept ≥1) | Identity (D-4) |
|---|---|---|
| **Residential — Sale** | Sale deed / Registered conveyance / **Patta** (land record) / Allotment letter + latest **property tax receipt** | Aadhaar / PAN / Voter ID / Passport |
| **Residential — Rent** | Ownership proof (as above) **or** registered rent/lease agreement (owner-let) + tax receipt | same |
| **Commercial** | Sale/lease deed / commercial allotment + **trade/usage permission** + tax receipt | same + entity proof if company |
| **Land / Plots** | **Patta / Jamabandi / title deed** + latest land tax (khazana) receipt + (recommended) encumbrance indication | same |
> Note (Manipur-specific): land ownership/transfer in hill vs valley areas may carry restrictions — **flag to counsel**; verifier checks locality-appropriate document. Captured as checklist item `title/encumbrance indication` for LAND (*Doc 07 §6.3*).

## 6. Provisional Verification Config (tune post-launch, *Doc 12*)
| Setting | Provisional value |
|---|---|
| Submitted → Claimed SLA | 4 business hours |
| Claimed → Decided SLA | 24 business hours (owner promise: "1 business day") |
| Owner-call attempts | 3 attempts / 24h, IST business+evening (10:00–19:00 IST) |
| Info-requested owner clock | 5 days |
| Min media per property | 3 photos (RES/COMM), 2 (LAND) |
| Re-verify price threshold `T` | ±10% (else re-verify) |
| Re-verify hard triggers | address, ownership docs, property type(blocked) (*Doc 07 §9*) |
| Verifier avg handle time (capacity model) | 20 min (*Doc 12 §8*) |

## 7. India Compliance Posture (Phase 0/1 defaults — *Doc 22*)
| Area | Default to build against |
|---|---|
| Consent | Explicit consent capture for processing + tracking (DPDP) |
| Doc retention | Ownership/ID docs purged **90 days** after CLOSED/REJECTED (provisional, confirm counsel) |
| Data residency | Store in **India region** (AWS `ap-south-1` Mumbai) — set in *Doc 20* infra |
| User rights | Access/correction/erasure endpoints (DPDP data-principal rights) |
| Grievance | Grievance officer contact in ToS (India IT rules) |
| RERA | Listing disclosure fields where applicable; advertising norms |
| Verified scope | ToS bounds "verified" = docs+ID+call, not legal title guarantee (*Doc 22 §9*) |

## 8. Engineering Config Placeholders (start Phase 0/1 now)
Seed these as **config/env**, not hardcoded:
```
DEFAULT_CITY = imphal
DEFAULT_COUNTRY = IN
DEFAULT_CURRENCY = INR
DEFAULT_LOCALE = en-IN
DEFAULT_TIMEZONE = Asia/Kolkata
AWS_REGION = ap-south-1
DOC_RETENTION_DAYS = 90
SLA_CLAIM_HOURS = 4
SLA_DECIDE_HOURS = 24
FEATURE_BROKER_ROLE = false        # D-3
FEATURE_MAP_SEARCH = false         # Phase 2
FEATURE_IN_APP_CHAT = true         # MVP (confirm OQ-06.1)
FEATURE_APPEALS = false            # Phase 2
PROPERTY_TYPES = RESIDENTIAL,COMMERCIAL,LAND
INTENTS = SALE,RENT
```
Checklist templates, reason codes, attribute schemas, localities → seed via migrations/config (*Doc 08/18*), editable in Admin.

## 9. Remaining (non-blocking) confirmations
| Ref | Needs | Owner | Blocks |
|---|---|---|---|
| OQ-2a | Counsel sign-off on doc set / Manipur land rules | Legal | verification content only (engine unblocked) |
| OQ-22.x | DPDP/RERA specifics, retention period, ToS "verified" wording | Legal | prod PII handling, go-live |
| OQ-02.2/23.1 | Free vs paid verification at launch | Business | billing switch (Phase 2) |
| OQ-06.1 | In-app chat scope confirm (defaulted ON) | Product | chat feature slice |

## 10. Business Rules
- **BR-24.1** All launch-city values are **config**, editable without deploy (*Doc 18*).
- **BR-24.2** Data stored in India region (DPDP), doc retention enforced (*Doc 22*).
- **BR-24.3** Provisional legal defaults must be counsel-confirmed before handling real PII in prod.

## 11. Assumptions
- Imphal West/East cover MVP; peri-urban added as supply grows.
- English (`en-IN`) at launch; Manipuri localization future.

## 12. Open Questions
Tracked in §9 (all non-blocking for Phase 0/1 code).

## 13. Related Documents
Parents: *Doc 01, 06, 07, 11, 12, 22*. Consumed by: config seeds (*Doc 08/18*), infra region (*Doc 20*).

## 14. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Product/Ops/Eng | Initial — Imphal launch config + Phase 0/1 placeholders |

---
*End of Document 24.*
