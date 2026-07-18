# Document 17 — Mobile Application Spec (React Native)

**Project Codename:** HousePoint
**Document Owner:** UX / Mobile
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 06, 09, 16*

---

## 1. Purpose
Specify the **React Native (TypeScript) mobile app** for buyers and owners: scope, navigation, screens, native capabilities (camera/upload/push/location), offline behavior, parity with web, and platform considerations. Mobile-first is a core pillar (*Doc 01*).

## 2. Scope
**In:** app platforms, navigation/IA, buyer & owner journeys, native features, push, offline/perf, auth/token storage, parity matrix, release/store considerations.
**Out:** verifier/admin (web/admin only, *Doc 18*), backend (*Doc 09*).

## 3. Dependencies
API contract (*Doc 09*), auth/token model (*Doc 10*), web UX parity (*Doc 16*), messaging/push (*Doc 14*).

## 4. Success Criteria
A fast, native-feeling app sharing the `/v1` API and design language with web; owners can submit (with camera + doc upload) and buyers can discover/inquire/chat with push.

## 5. Platforms & Phasing
- iOS + Android from one RN codebase.
- **Phasing:** Mobile is **Phase 2** (*Doc 01 §11*, *Doc 06 §7*) — web MVP first. Buyer app before deep owner tooling if prioritized. Push + discovery + inquiry/chat are the highest-value mobile features.

## 6. Navigation / IA
```
Tabs: Home/Search · Saved · Messages · Account
Stacks:
  Search -> Results -> Listing detail -> Inquiry/Chat
  Account -> Owner: My properties -> Add property (wizard) -> Status
  Messages -> Conversation
Auth modal stack (register/login/OTP)
```
React Navigation; deep links to listing/locality (parity with web URLs for SEO→app handoff, universal links).

## 7. Key Screens (parity with Doc 16)
| Screen | Notes |
|---|---|
| Home/Search | search bar, filters (bottom sheet), locality chips |
| Results | cards + Verified badge, infinite scroll, map toggle (Phase 2) |
| Listing detail | gallery (swipe), trust panel, sticky Inquire/Message, save, report |
| Add Property wizard | camera capture, gallery pick, **document capture** with privacy copy, step validation, autosave draft |
| Owner properties | status chips, actions |
| Messages/Conversation | chat UI + push, read receipts |
| Account/Auth | profile, notification prefs, devices |

## 8. Native Capabilities
| Capability | Use |
|---|---|
| Camera / photo library | property photos, document capture (ownership/ID) |
| Secure storage (Keychain/Keystore) | refresh token (*Doc 10*) |
| Push (FCM/APNs) | new inquiry, message, verification updates, saved-search matches (*Doc 14*) |
| Location (Phase 2) | "near me" search, map |
| Biometric unlock (Phase 2) | app lock for owners |
| Deep/universal links | SEO/web → app continuity |

- **Document capture** uses same private-upload flow (pre-signed URL → private bucket, *Doc 05/10*); on-device guidance (framing, legibility); never cached insecurely.

## 9. Auth & Security (mobile)
- Access JWT in memory; **refresh token in secure storage** (*Doc 10*). Rotation + reuse detection identical to web.
- Certificate pinning (recommended), jailbreak/root awareness (best-effort), no sensitive data in logs.
- App lock/biometric for owner sensitive areas (Phase 2).

## 10. Offline & Performance
- Cache last search/listing views for read-only offline; queue actions (save) to sync.
- Optimistic UI for save/message; retries on reconnect.
- Image optimization (responsive, lazy), list virtualization, cold-start budget, minimal bundle; monitor with perf tooling (*Doc 20*).

## 11. Design Parity
- Shared design tokens/components mirroring web Shadcn system (*Doc 16 §9*) via an RN component library; consistent trust UI (Verified badge, trust panel).
- Same states discipline (loading/empty/error/success).

## 12. Web ↔ Mobile Parity Matrix
| Capability | Web (MVP) | Mobile (Phase 2) |
|---|---|---|
| Browse/search verified | ✓ | ✓ |
| Listing detail + trust | ✓ | ✓ |
| Inquiry + chat | ✓ | ✓ (+push) |
| Owner submit + docs | ✓ | ✓ (camera) |
| Saved searches/alerts | ✓ (P2) | ✓ (push) |
| Map/geo | P2 | P2 |
| Admin/verifier | ✓ (admin) | ✗ |

## 13. Accessibility
- Native a11y (screen reader labels, dynamic type, contrast, touch targets, reduced motion). Parity with WCAG intent (*Doc 16 §11*).

## 14. Store & Release
- App Store / Play compliance (privacy nutrition labels, permissions rationale for camera/location, data-safety forms — ties *Doc 22*).
- OTA updates (e.g. Expo/CodePush-style) for JS-only fixes; native builds via CI (*Doc 20*).
- Staged rollout, crash reporting, versioned API (`/v1`) compatibility.

## 15. Business Rules
- **BR-17.1** Refresh token only in secure storage; never plaintext.
- **BR-17.2** Document capture uploads to private bucket via signed URL only (*Doc 10*).
- **BR-17.3** Owner contact hidden pre-inquiry (parity, *Doc 14*).
- **BR-17.4** Push respects notification preferences (*Doc 14*).

## 16. Edge Cases
| Case | Handling |
|---|---|
| Permission denied (camera) | Explain + fallback to library/skip |
| Upload on flaky mobile network | Resumable/retry, background upload |
| Token expiry offline | Refresh on reconnect; graceful re-auth |
| App backgrounded mid-wizard | Autosave draft, restore |
| Deep link to closed listing | Show unavailable + similar |

## 17. Assumptions
- Mobile is Phase 2; API already stable from web MVP.
- Single language at launch; i18n-ready.

## 18. Risks
| Risk | Mitigation |
|---|---|
| Store review (doc/PII handling) | Clear permission rationale, privacy compliance (*Doc 22*) |
| RN performance on low-end devices | Virtualization, image budgets, profiling |
| Divergence from web behavior | Shared API + design tokens + parity matrix |

## 19. Future Improvements
- In-app map discovery, biometric lock, offline-first enhancements, in-app visit scheduling, richer chat (attachments), localization.

## 20. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-17.1 | Buyer-first or full owner tooling in first mobile release? | Product |
| OQ-17.2 | Expo vs bare RN; OTA strategy. | Mobile/DevOps |

## 21. Related Documents
Parents: *Doc 06, 09, 16*. Related: *Doc 10 (security), 14 (push), 22 (store privacy)*. Next: *Doc 18*.

## 22. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | UX/Mobile | Initial draft |

---
*End of Document 17.*
