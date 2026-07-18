# Document 22 — Risk, Compliance & Legal

**Project Codename:** HousePoint
**Document Owner:** Security / Legal
**Status:** DRAFT · **Version:** 0.1.0 · **Last Updated:** 2026-07-18
**Parents:** *Doc 01, 07, 08, 10*

---

## 1. Purpose
Consolidate **platform risk, data-protection compliance, and legal considerations** for handling sensitive real-estate and identity data, verification liability, and marketplace obligations. Trust-first makes compliance a brand asset, not overhead.

## 2. Scope
**In:** consolidated risk register, data-protection/privacy obligations, PII/document retention, consent, user rights, verification liability, content/marketplace legal, security compliance, insurance.
**Out:** jurisdiction-specific legal text (counsel deliverable — depends on launch city, OQ-1a/6), monetization tax (*Doc 23*).

## 3. Dependencies
Sensitive data handling (*Doc 08/10*), verification process/liability (*Doc 07*), decisions D-1..D-4 (*Doc 01*).

## 4. Success Criteria
A clear risk register with owners/mitigations; a documented data-protection posture (storage, retention, consent, rights); and identified legal obligations to close with counsel before launch.

---

## 5. Consolidated Risk Register
| ID | Risk | Sev | Likelihood | Mitigation | Owner |
|---|---|---|---|---|---|
| RSK-1 | PII/ownership-doc breach | Critical | Low | *Doc 10 §7* controls, encryption, audit, retention | Security |
| RSK-2 | Verification bottleneck / cost | High | Med | Capacity + automation-assist (*Doc 12/07*) | Ops |
| RSK-3 | Cold-start liquidity failure | High | Med | Supply-first GTM (*Doc 02*) | Product |
| RSK-4 | Fraudulent/forged docs slip through | High | Med | D-4 triad + forensics roadmap + reporting | Ops/Security |
| RSK-5 | Wrongful rejection harms owners | Med | Med | Reason codes + appeals (*Doc 07*) | Ops |
| RSK-6 | "Verified" liability (buyer relies, deal sours) | High | Med | Clear ToS scope of verification; disclaimers; audit trail | Legal |
| RSK-7 | Regulatory non-compliance (data/real-estate) | High | Med | Counsel review per city; compliance controls | Legal |
| RSK-8 | Search rewrite / scale debt | Med | Low | Read-model isolation (*Doc 05*) | Architect |
| RSK-9 | Copycat "verified" badge | Med | Med | Auditable, visible verification depth (*Doc 02/16*) | Product |
| RSK-10 | Insider misuse of doc access | High | Low | Least-priv + 2FA + audit + anomaly (*Doc 10*) | Security |
| RSK-11 | Scraping/lead theft | Med | High | Contact-reveal gating + rate limits (*Doc 10/14*) | Security |
| RSK-12 | Vendor/provider outage | Med | Med | ACLs, fallbacks, DR (*Doc 05/20*) | DevOps |

## 6. Data Protection & Privacy Posture
> Applicable regime depends on launch jurisdiction (India **DPDP Act** / EU **GDPR** / other) — confirm with counsel (OQ-6). Design to the **strictest reasonable baseline** now.

| Principle | Implementation |
|---|---|
| Lawful basis / consent | Consent for processing + tracking; documented purpose |
| Data minimization | Collect only what verification needs (*Doc 08 §11*) |
| Purpose limitation | Docs used only for verification; not resold |
| Storage limitation | **Retention policy** — purge ownership/ID docs N days after CLOSED/REJECTED (OQ-08.1); configurable |
| Security | Encryption at rest/in transit, access control, audit (*Doc 10*) |
| Accuracy | Owner can correct; re-verification on change |
| Accountability | Audit logs, DPO/roles, records of processing |

## 7. User Rights (data subject)
| Right | Mechanism |
|---|---|
| Access / portability | Export user data (PII-scoped) |
| Rectification | Profile/property edit |
| Erasure ("delete my account") | Anonymize PII, purge docs, preserve aggregate/audit integrity (*Doc 08 §11*) |
| Object/restrict processing | Opt-out of non-essential tracking (*Doc 15*) |
| Withdraw consent | Notification/tracking prefs |
- SLA for rights requests per regulation; audited handling.

## 8. Document & PII Retention Schedule (proposal — confirm w/ counsel)
| Data | Retention |
|---|---|
| Ownership/ID documents | Duration of active listing + N days post CLOSED/REJECTED, then purge |
| Verification decisions/audit | Longer (dispute/legal defense), PII-minimized |
| Messages | Retain while account active; purge on erasure (legal holds excepted) |
| Analytics events | PII-free; standard retention (*Doc 15*) |
| Backups | PITR window; erasure honored on restore cycle |

## 9. Verification Liability & ToS Scope
- **Define precisely what "verified" means** (docs reviewed + ID + owner call — D-4) and what it does **not** guarantee (title dispute resolution, legal due diligence, valuation).
- ToS: platform facilitates; buyers must do own due diligence; verification is a **trust signal**, not legal warranty. Disclaimers + audit trail limit liability (RSK-6).
- Owner attestations captured; false submission = account action + possible legal.

## 10. Marketplace / Content Legal
- **ToS & Privacy Policy**, community/listing guidelines, prohibited content, IP (photos ownership/licensing by owner), DMCA-style takedown, dispute resolution, grievance officer (jurisdiction-dependent).
- Real-estate advertising norms / RERA-style disclosures (India) or local equivalents — **counsel per city**.
- Report/takedown workflow (*Doc 12*) supports legal removal.

## 11. Security Compliance
- Align to a recognized framework (e.g. SOC 2 / ISO 27001 direction) as we scale; MVP implements the controls (*Doc 10*), formal certification later.
- Periodic pentest + bug bounty (RSK-1/10, *Doc 21*).
- Incident response + breach notification process (regulatory timelines).

## 12. Insurance & Business Continuity
- Consider cyber-liability, professional-liability (verification), general marketplace coverage.
- BCP/DR per *Doc 20* (RPO/RTO).

## 13. Business Rules
- **BR-22.1** Ownership/ID docs retained only per schedule, then purged (*Doc 08/10*).
- **BR-22.2** "Verified" scope explicitly bounded in ToS (RSK-6).
- **BR-22.3** Erasure anonymizes PII while preserving audit/aggregate integrity.
- **BR-22.4** Consent required for non-essential tracking (*Doc 15*).
- **BR-22.5** Breach → defined IR + notification within regulatory timeline.

## 14. Edge Cases
| Case | Handling |
|---|---|
| Erasure request with active listing | Unpublish + purge docs + anonymize; retain minimal legal record |
| Legal hold vs erasure | Hold overrides purge for named data; documented |
| Cross-border data (future) | Residency controls, per-region storage (*Doc 19 P4*) |
| Ownership dispute escalates legally | Preserve evidence/audit; counsel involvement |
| Government data request | Verified legal process only; logged; minimal disclosure |

## 15. Assumptions
- Launch jurisdiction TBD (OQ-1a/6); design to strict baseline.
- Counsel engaged before launch for city-specific obligations.

## 16. Risks
See §5 register (this doc is the register's home).

## 17. Future Improvements
- Formal SOC 2 / ISO 27001 certification.
- Automated retention enforcement + data-map tooling.
- Privacy-by-design reviews per feature; DPIA for high-risk processing.

## 18. Open Questions
| ID | Question | Owner |
|---|---|---|
| OQ-22.1 | Launch jurisdiction & applicable data-protection regime (ties OQ-6). | Legal |
| OQ-22.2 | Exact document retention periods (ties OQ-08.1). | Legal/Ops |
| OQ-22.3 | Real-estate advertising/RERA-equivalent obligations in launch city. | Legal |
| OQ-22.4 | ToS "verified" liability language sign-off. | Legal |

## 19. Related Documents
Parents: *Doc 01, 07, 08, 10*. Related: *Doc 12 (takedowns), 15 (consent), 20 (DR/retention), 21 (pentest)*. Next: *Doc 23*.

## 20. Revision History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-18 | Security/Legal | Initial draft |

---
*End of Document 22.*
