# Document 11 — SEO Architecture & Content Strategy

**Project Codename:** ValEstate
**Document Owner:** UX / Frontend / Product
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 05, 07, 08*

---

## 1. Purpose
Define the **SEO-first architecture** (pillar from *Doc 01*) that makes organic search ValEstate's primary acquisition channel (*Doc 02 §11*). Covers rendering strategy, URL/taxonomy, structured data, technical SEO, content model, and how "verified" becomes an SEO differentiator.

## 2. Scope
**In:** rendering (SSR/ISR), URL & taxonomy design, metadata & structured data (JSON-LD), sitemaps/robots, canonical/duplication handling, Core Web Vitals, content/landing-page strategy, internal linking, localization-readiness.
**Out:** paid acquisition (*Doc 02/23*), search *engine* internals (*Doc 13*).

## 3. Dependencies
Next.js rendering (*Doc 05 ADR-001*), listing/locality data (*Doc 08*), publication events (*Doc 04/07*).

## 4. Success Criteria
Every verified listing and locality is a fast, indexable, structured page; duplicates are canonicalized; freshness is reflected via ISR + sitemaps; "verified" trust signals are machine- and human-readable.

---

## 5. Rendering Strategy
| Page type | Strategy | Why |
|---|---|---|
| Listing detail (`/property/{slug}`) | **ISR** (revalidate on publish/update event) | Indexable HTML + fresh + cache-cheap |
| Locality landing (`/{city}/{locality}`) | **ISR/SSG** | High-value keyword pages |
| Search results (`/search?...`) | SSR (indexable subset) / CSR for deep filters | Balance crawlability vs. infinite facets |
| Auth/dashboard/admin | CSR, `noindex` | Private |
> API serves data; **Next renders indexable HTML** (*Doc 05*). Avoid client-only rendering for anything we want ranked.

## 6. URL & Taxonomy Design
```
/                                   home
/{city}                             city hub
/{city}/{locality}                  locality landing (SEO money page)
/{city}/{locality}/{type}           e.g. /bengaluru/koramangala/apartments-for-sale
/property/{slug}                    listing detail
/search                             faceted search (params)
```
- **Slug:** human + keyword rich, stable, unique: `2bhk-apartment-for-sale-koramangala-bengaluru-{shortid}`.
- Taxonomy = `localities` tree (*Doc 08 §7.9*) × property type × intent.
- **Stable canonical URLs**; slug changes → **301 redirect** (redirect map).

## 7. Structured Data (JSON-LD)
Emit on every listing/locality page:
- **`RealEstateListing` / `Product`/`Offer`** — price, availability, area, address, geo, images.
- **`Residence`/`Place`** — property attributes.
- **Trust signal markup** — verified date, "verified listing" (custom + `Organization` publisher trust). *This is our differentiator surfaced to search.*
- **`BreadcrumbList`** — city → locality → type → listing.
- **`Organization`/`WebSite`** with `SearchAction` (sitelinks search box).
- Locality pages: `ItemList` of listings.

## 8. Technical SEO Checklist
| Item | Rule |
|---|---|
| Titles/meta | Templated, unique per page, keyword+locality driven |
| Canonical tags | Self-canonical; params canonicalize to clean URL |
| Robots | `index,follow` public; `noindex` private/thin/filtered-noise |
| Sitemaps | Auto-generated, segmented (listings, localities), updated on publish/unpublish events; `lastmod` accurate |
| `hreflang` | Ready for future multi-language/region (*Doc 19*) |
| Pagination | `rel=next/prev` semantics / canonical strategy for locality lists |
| 404/410 | CLOSED listings → `410 Gone` or redirect to locality (avoid soft-404 & stale) |
| Redirects | 301 map for slug/locality changes |
| Image SEO | alt text, next/image, responsive, lazy, hashed CDN URLs |
| Structured freshness | verified/updated dates visible + in markup |

## 9. Core Web Vitals / Performance (SEO ranking factor)
- Budgets: LCP < 2.5s, INP < 200ms, CLS < 0.1 (mobile-first).
- Techniques: ISR + CDN, `next/image`, font optimization, code-splitting, minimal JS on public pages, edge caching, prefetch locality links.
- Perf gates in CI (Lighthouse) (*Doc 20/21*).

## 10. Handling the "Verified, Smaller Catalog" SEO Reality
Incumbents win on **volume of pages**. We win on:
1. **Quality & freshness** — no dead/duplicate pages (they suffer index bloat & soft-404s; we don't).
2. **Trust intent** — target long-tail "genuine/verified/no-broker {locality} property" queries (*Doc 02*).
3. **Locality depth** — rich, unique locality landing pages (guides, price context) beyond bare listings.
4. **Structured trust signals** — verified markup differentiates SERP snippets.
> **Duplicate minimization (*Doc 07*) is also an SEO asset:** one canonical listing per property = clean index, unlike competitors' duplicate sprawl.

## 11. Content Strategy
| Content | Purpose | Phase |
|---|---|---|
| Locality landing pages | Rank for `{locality} property` intent | 1–2 |
| Listing pages | Long-tail specific intent | 1 |
| Buyer guides / trust content ("how verification works") | Topical authority + trust brand | 2 |
| Price/area insights per locality | E-E-A-T, unique data | 2–3 |
- **E-E-A-T:** surface verification process, org trust, data provenance.
- Editorial/config-managed locality metadata (*Doc 08 seo_meta_json*).

## 12. Internal Linking
- Breadcrumbs everywhere; locality ↔ listing ↔ similar listings; city hub → localities. Distributes authority to money pages.

## 13. Business Rules
- **BR-11.1** Only VERIFIED+PUBLISHED listings are indexable; drafts/rejected/private are `noindex`.
- **BR-11.2** On `ListingUnpublished/Closed`, page returns 410/redirect and sitemap updates (event-driven).
- **BR-11.3** One canonical URL per property (dedup enforced upstream, *Doc 07*).
- **BR-11.4** No PII/owner contact in indexable HTML (*Doc 10 §10*).

## 14. Edge Cases
| Case | Handling |
|---|---|
| Listing sold quickly | 410/redirect; keep locality page strong |
| Slug change | 301 redirect, update canonical + sitemap |
| Thin locality (few listings) | Enrich with content; avoid indexing empty facets |
| Filtered search variants | Canonicalize to avoid duplicate-content penalty |

## 15. Assumptions
- Single language/city at launch; i18n later (D-1).
- ISR revalidation tied to publication events (*Doc 05*).

## 16. Risks
| Risk | Mitigation |
|---|---|
| Incumbent domain authority | Long-tail trust intent + freshness + Core Web Vitals edge |
| Thin/duplicate pages hurt ranking | noindex thin, canonicalize, dedup upstream |
| JS-rendered content not indexed | SSR/ISR for all ranked pages |

## 17. Future Improvements
- Programmatic SEO across localities/types at national scale.
- Multi-language `hreflang`, regional subpaths.
- Rich data pages (price trends) as unique-content moat.
- AMP/edge experiments if needed.

## 18. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-11.1 | Launch city slug conventions & locality taxonomy source. | Product/SEO |
| OQ-11.2 | 410 vs 301 policy for closed listings. | SEO |

## 19. Related Documents
Parents: *Doc 05, 07, 08*. Related: *Doc 13 (search), 16 (web UX), 02 (GTM)*. Next: *Doc 12*.

## 20. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | UX/Frontend/Product | Initial draft |

---
*End of Document 11.*
