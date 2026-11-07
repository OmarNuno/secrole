# SecRole Role Drift Automation

Last updated: October 7, 2026

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

## Official Purview evidence

The parser resolves numbered notes for the specific table row that references them, including Learn superscripts and repository `<sup>` markers. Restrictions remain separate from capability text and default-role membership, but all three are supplied to the drafting model. An unresolved numbered footnote aborts discovery rather than silently dropping restrictions.

For example, the six Information Protection ABAC groups and their six individual roles carry Microsoft's note that they are in private preview, unsupported and without operational effect outside that preview, with support **planned only** for GCC High and DoD. The prompt explicitly requires retaining these limitations; planned support must not be described as current availability. Purview notes are not removed by the capability-text length cap.

Guardrails evaluate affirmative capability clauses rather than role names, membership labels, or applicability notes. This prevents `Default roles assigned to this role group` and `View-Only Manage Alerts` from being mistaken for assignment or write powers. Checks keep word boundaries, common negations and read-only contexts, and do not combine unrelated fields into one capability. Broad read-only access to content across all investigation cases still warrants a High confidentiality flag.

These checks are conservative text heuristics, not a permission evaluator or general natural-language parser. A clean report does not establish that a risk rating is correct. Reviewers must still check the source, scope, included roles, and restrictions.

The offline fixture in `scripts/fixtures/purview-scc-permissions.md` is a source-attributed excerpt of Microsoft's current table. Regression tests cover footnote applicability, prompt retention, false membership flags, positive privileged/security/write capabilities, negation, read-only access, and confidential content scope without invoking the drafting API.

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

## Purview review reporting

The Purview source does not provide the Entra privileged marker. Reports therefore
show `Not assessed (no source marker)` for Purview, never infer absence of privilege
from the generator's false default. The capability-based risk rating is separate;
Organization Management remains Critical because it controls role groups.

Two explicit Microsoft sentences about centrally administering group membership
and the scope of portal edits are excluded from capability heuristics. This narrow
exclusion prevents Security Reader assignment instructions from becoming fictitious
write powers; genuine role-management capabilities still trigger the guardrail.

The p76–p90 review preserves service-only and internal-use restrictions, separate
Exchange permissions, case review limitations, and content/export capabilities.
Privacy Management Contributors and Subject Rights Request Approvers are High for
bundled content search, preview, export, and custodian access; Security Operator is
High for tenant allow/block settings. Security Reader is Medium for broad security
visibility. Reviewer remains Medium for assigned-case review-set access, with no
search-result preview or case administration. Current eDiscovery documentation
requires a separate Manage Review Set Tags role for tag management.

Sources checked October 13, 2026:
- https://learn.microsoft.com/en-us/defender-office-365/scc-permissions
- https://learn.microsoft.com/en-us/purview/edisc-permissions

## Supervisory Review review — October 19, 2026

PR #25 adds the Supervisory Review role group (p91), whose sole documented default
role is Supervisory Review Administrator (p35). Reciprocal links distinguish the
group from the role. The current Microsoft table lists both and does not identify
p35 as retired, so its categorical legacy/replaced wording and legacy tag were
removed. This does not assert that every tenant exposes the same solution UI.

The descriptions stay within policy scope and reviewer selection. They do not
infer message-content or investigation permission, or unconditional tenant-wide
access, from policy administration. Independent approval is optional organizational
guidance, not a documented Microsoft requirement. High remains SecRole's reasoned
assessment of the impact of changing compliance monitoring policies, not an
official Microsoft risk label or evidence of unrestricted access.

Sources:
- https://learn.microsoft.com/en-us/defender-office-365/scc-permissions#role-groups-in-microsoft-defender-for-office-365-and-microsoft-purview
- https://learn.microsoft.com/en-us/purview/communication-compliance-permissions
