# Document 13 — Discovery, Search & Recommendation

**Project Codename:** HousePoint
**Document Owner:** Product / Architect
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 04, 05, 08, 11*

---

## 1. Purpose
Specify how buyers **find** verified listings: search, filters, geo, sorting/relevance, saved searches & alerts, and (later) recommendations — built on the **event-fed read model** (*Doc 05 ADR-003*) so the search engine is swappable without touching write models.

## 2. Scope
**In:** search read-model shape, query capabilities, filters/facets, geo search, ranking, saved searches/alerts, recommendations, freshness/indexing, MVP vs. Phase-2 engine.
**Out:** SEO page rendering (*Doc 11*), messaging (*Doc 14*).

## 3. Dependencies
Discovery context (*Doc 04*), read-model/search strategy (*Doc 05*), schema & sync (*Doc 08 §10*), taxonomy (*Doc 08/11*).

## 4. Success Criteria
Fast, relevant, faceted discovery over verified listings; freshness within seconds of publish; engine swap (MySQL→Meili/OpenSearch) is additive.

---

## 5. Read Model & Indexing
- Search document built from `ListingPublished/Updated/Unpublished` events (*Doc 08 §10*), **PII/doc-free**.
- **Doc fields:** id, slug, title, type, intent, price, area, key attributes (bedrooms…), localityId + path, geo(lat/lng), trust signals (verifiedAt), publishedAt, availability, thumbnail.
- Freshness: worker updates index on event; target < few seconds propagation.
- **Engine phasing (ADR-003):** MVP = MySQL (indexed cols + FULLTEXT + bounding-box geo); Phase 2 = Meilisearch/OpenSearch (typo-tolerance, facets, geo, relevance).

## 6. Query Capabilities
| Capability | MVP | Phase 2 |
|---|---|---|
| Keyword (title/locality) | FULLTEXT/LIKE | typo-tolerant relevance |
| Filters (type, intent, price range, bedrooms, area, furnishing…) | ✓ | ✓ faceted counts |
| Locality filter (tree) | ✓ | ✓ |
| Geo radius / map bounds | basic bounding box | true geo + distance sort |
| Sort (recency, price asc/desc, relevance) | ✓ | ✓ + relevance tuning |
| Availability filter | ✓ | ✓ |
| Verified-only | always true (all are verified) | — |

**Filter contract** via API (*Doc 09 §8.4*): whitelisted `filter[...]`, `sort`, cursor pagination.

## 7. Ranking / Relevance
- MVP default sort: **freshness** (recently verified/published) — reinforces "real & available."
- Signals for later relevance model: recency, completeness (photos/attributes), engagement (views/inquiries), trust score (*Doc 04/08*), locality match, price competitiveness.
- **No pay-to-rank that hides verification**; featured/boost (monetization, *Doc 23*) is clearly labeled and never displaces the verified-only guarantee (*Doc 01 §8 guardrail*).

## 8. Facets & Filters UX Data
- Facet counts (Phase 2) per type/price-band/bedrooms/locality to guide buyers.
- Locality landing pages (*Doc 11*) reuse the same query layer (SSR).

## 9. Saved Searches & Alerts (Phase 2)
- Buyer saves a query (`saved_searches`, *Doc 08*). Worker runs new-match detection on `ListingPublished` → notifies (email/push, *Doc 14/NOTF*) at chosen frequency (instant/daily).
- Re-engagement driver + habit loop (*Doc 02 flywheel*).

## 10. Recommendations (Phase 2–3)
| Type | Basis |
|---|---|
| Similar listings (on detail page) | same locality + type + price band + attributes |
| "You might like" (returning buyer) | saved searches, view history |
| New verified in your area | locality subscription |
- Start rule-based (similarity), evolve to ML at scale.

## 11. Performance
- Search responses cached (Redis/CDN) for popular queries/localities; bust on relevant publish events.
- Pagination cursor-based for infinite scroll (*Doc 09*).
- Budget: search API p95 < 300ms (cached), < 800ms (cold) at MVP scale.

## 12. Business Rules
- **BR-13.1** Only PUBLIC (verified) listings appear in results.
- **BR-13.2** No sensitive/PII fields in the index or results (*Doc 08/10*).
- **BR-13.3** CLOSED/unpublished listings removed from index on event (no stale results — a core differentiator vs incumbents).
- **BR-13.4** Featured/boosted results labeled; ranking transparency preserved.

## 13. Edge Cases
| Case | Handling |
|---|---|
| Listing unpublished but cached in search | Event-driven index removal + cache bust |
| Empty result set | Suggest broader filters / nearby localities |
| Geo query at city edge | Bounding box + locality fallback |
| Duplicate somehow indexed | Upstream dedup prevents; canonical only (*Doc 07*) |

## 14. Assumptions
- Single-city corpus small at MVP → MySQL adequate.
- Read-model isolation lets us defer engine choice to Phase-2 gate.

## 15. Risks
| Risk | Mitigation |
|---|---|
| MySQL search limits hit early | Read-model swap ready (ADR-003) |
| Stale results erode trust | Event-driven freshness (BR-13.3) |
| Irrelevant ranking | Iterate relevance signals; start with freshness |

## 16. Future Improvements
- Dedicated engine (Meili/OpenSearch) with facets + geo + relevance.
- Personalization & ML ranking.
- Natural-language search ("2bhk under X near park").
- Map-first discovery UX.

## 17. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-13.1 | Meilisearch vs OpenSearch at Phase 2 (ties OQ-05.2). | Architect |
| OQ-13.2 | Default sort — pure freshness or blended relevance at MVP? | Product |

## 18. Related Documents
Parents: *Doc 04, 05, 08, 11*. Related: *Doc 14 (alerts), 15 (signals), 23 (featured)*. Next: *Doc 14*.

## 19. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Product/Architect | Initial draft |

---
*End of Document 13.*
