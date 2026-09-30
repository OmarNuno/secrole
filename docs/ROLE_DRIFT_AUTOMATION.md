# SecRole Role Drift Automation

Last updated: September 19, 2026

## Purpose

The role-drift workflow compares SecRole's role catalog with Microsoft's current Microsoft Entra and Microsoft Purview role documentation. When an official role is missing, the workflow drafts a review pull request. It never publishes, retires, or deletes a role automatically.

## Trust model

The workflow separates five responsibilities:

1. Microsoft documentation supplies the official role name and capability text.
2. The drafting model converts that source text into SecRole's content format.
3. Deterministic validation enforces IDs, products, fields, related-role references, and catalog integrity.
4. Deterministic risk guardrails flag suspicious ratings for human review.
5. A human reviewer decides whether to edit, merge, close, or ignore the proposal.

AI-generated text is a draft, not a source of truth.

## Risk rubric

| Risk | SecRole rule |
|---|---|
| Critical | Tenant takeover, role escalation, control of privileged authentication or credentials, or equivalent persistent control |
| High | Broad write access to identity, security, compliance, or data-protection controls; or tenant-wide access to sensitive content, communications, investigation evidence, or identity data even when read-only |
| Medium | Meaningful scoped write access, broad configuration visibility, or access to sensitive metadata |
| Low | Narrow operational visibility, aggregate reporting, or low-impact metadata with limited blast radius |

Read-only is not automatically Low. Confidentiality, scope, and evidence sensitivity matter.

## Automated review flags

Drafted roles are flagged when the proposed rating appears inconsistent with the documented capability, including:

- Microsoft marks the role privileged but the rating is below High.
- The role can manage or escalate role assignments but is rated too low.
- The role can modify identity, authentication, credential, consent, or security-critical configuration but is rated too low.
- The role can read tenant-wide email, messages, documents, files, evidence, or personal data but is rated below High.
- The role exposes broad sensitive metadata or security evidence but is rated Low.
- The role contains meaningful write or approval capability but is rated Low.
- The draft omits a useful risk rationale.

Flags do not silently rewrite the rating. They are shown in the generated pull request so the reviewer can make the final decision.

## Same-batch related roles

The script reserves IDs before drafting. Newly detected roles in the same batch can therefore reference one another in `relatedRoles`. Validation removes self-references, unknown IDs, cross-product references, and references to drafts that did not survive validation.

## Local commands

```bash
# Structural validation only; no network or AI call
npm run validate:roles

# Built-in validation through the drift script
npm run role-drift:validate

# Unit tests for structural validation and risk guardrails
npm run test:role-drift

# Compare current catalog with Microsoft documentation without changing roles.js
npm run role-drift:dry-run
```

`role-drift:dry-run` performs discovery only. It does not call the drafting model and does not modify `roles.js`.

## Generated pull-request review

Each generated pull request includes:

- Proposed ID and exact official name
- Product and category
- Proposed risk
- Required risk rationale
- Deterministic review flags
- Microsoft privileged marker
- Direct source link
- Human reviewer checklist
- Deferred, deprecated, and possibly retired entries

## Reviewer checklist

Before merging a drift pull request, verify:

- Official name and product
- Description and permissions against the cited source
- Risk based on both capability and data sensitivity
- Privileged marker
- Least-privilege and PIM guidance
- Related-role family
- Deprecated, reserved, or restricted status

Nothing ships until a human merges the pull request.
