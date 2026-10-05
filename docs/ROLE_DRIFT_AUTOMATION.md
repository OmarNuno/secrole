# SecRole Role Drift Automation

Last updated: October 5, 2026

## Purpose

The role-drift workflow compares SecRole's catalog with Microsoft's current Microsoft Entra and Microsoft Purview role documentation. **Discovery is the default.** Optional OpenAI drafting proposes additions in a draft pull request for human review. The workflow never publishes, merges, retires, or deletes a role automatically.

## Discovery and drafting modes

| Mode | AI call | Catalog change | Result |
|---|---|---|---|
| `--validate-only` | No | No | Offline structural validation |
| No flag or `--dry-run` | No | No | Official-source discovery report |
| `--draft` | Yes, if additions need drafting and a key is configured | Validated additions on the working branch | Review report; the enabled workflow opens a draft PR |

Discovery fetches public Microsoft documentation and compares it with the catalog. It needs no model API key. A report can still identify missing, deprecated, or possibly retired roles; it is not evidence that those roles should automatically be added or removed.

Explicit drafting uses the shared `lib/openai.js` adapter, the OpenAI Responses API, and the default `gpt-4.1-mini-2025-04-14` snapshot. An optional server-side `OPENAI_MODEL` override must be an OpenAI model compatible with the request contract. There is no provider fallback. API errors, incomplete responses, and refusals fail generation rather than becoming role data.

## GitHub Actions activation

The **Check Role Drift** workflow runs on Mondays at 07:00 UTC and supports manual dispatch. Its paid behavior is disabled unless the repository variable `OPENAI_AUTOMATION_ENABLED` is exactly `true`.

| Repository opt-in | Invocation | Behavior |
|---|---|---|
| Unset or anything except `true` | Scheduled or manual | Discovery only |
| `true` | Manual with `draft_roles: false` (default) | Discovery only |
| `true` | Manual with `draft_roles: true` | Explicit drafting mode |
| `true` | Scheduled | Drafting mode |

The discovery report is available in the workflow run summary and the `role-drift-discovery` artifact. Discovery runs with read-only repository permissions and no model secret; write permissions are confined to the enabled drafting job.

Drafting also needs the repository Actions secret `OPENAI_API_KEY`. A missing key does not cause a provider fallback. The opt-in is a workflow gate, not a replacement for the explicit `--draft` flag when running locally. Never put secrets in repository variables or `VITE_*` variables.

A merged migration alone does not configure this service. The owner must approve paid activation and securely enter the GitHub secret before enabling the opt-in. This also enables scheduled runs of the separate daily updates workflow to call OpenAI; manual update generation additionally requires `generate_updates: true`. Review both costs before opting in. The in-app API needs its own server-side Vercel `OPENAI_API_KEY` and is independent of the Actions opt-in.

With the opt-in disabled, the daily updates workflow uses `--dry-run` and preserves `public/updates-cache.json`, so the feed stops refreshing. With no Vercel key, `/api/chat` returns `503`; static catalog, knowledge pages, and the existing feed remain usable. See [README rollout guidance](../README.md#safe-defaults-and-rollout).

Changing this branch does not change the default branch or live site until the owner merges/deploys it. Live credential configuration, paid smoke tests, deployment, and retiring old credentials are separate owner-approved steps; this code migration does not claim to have performed them.

## Trust model

The workflow separates five responsibilities:

1. Microsoft documentation supplies the official role name and capability text.
2. OpenAI drafting converts that source text into SecRole's content format.
3. Deterministic validation enforces IDs, products, fields, related-role references, and catalog integrity.
4. Deterministic risk guardrails flag suspicious ratings for human review.
5. A human reviewer decides whether to edit, merge, close, or ignore the proposal.

AI-generated text is a draft, not a source of truth.

## Sources and discovery safeguards

- Entra: Microsoft's `permissions-reference.md` and matching per-role `includes/*.md` in `MicrosoftDocs/entra-docs`; the public reference is [Microsoft Entra built-in roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference)
- Purview: the role groups documented in [Permissions in the Microsoft Purview portal](https://learn.microsoft.com/en-us/defender-office-365/scc-permissions), using Microsoft Learn markdown and public repository fallbacks
- Minimum source counts guard against a changed document format being mistaken for mass retirement
- Name normalization tolerates common plural and administrator-name differences
- Exact names in `scripts/role-drift-ignore.json` are excluded until removed from that file
- Deprecated or reserved entries are reported or deferred, not silently introduced as usable roles
- Possibly retired or renamed catalog entries are flagged for investigation, never automatically deleted

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

- Microsoft marks the role privileged but the rating is below High
- The role can manage or escalate role assignments but is rated too low
- The role can modify identity, authentication, credential, consent, or security-critical configuration but is rated too low
- The role can read tenant-wide email, messages, documents, files, evidence, or personal data but is rated below High
- The role exposes broad sensitive metadata or security evidence but is rated Low
- The role contains meaningful write or approval capability but is rated Low
- The draft omits a useful risk rationale

Flags do not silently rewrite the rating. They appear in the review report so a human can make the final decision.

## Same-batch related roles

The script reserves IDs before drafting. Newly detected roles in the same batch can therefore reference one another in `relatedRoles`. Validation removes self-references, unknown IDs, cross-product references, and references to drafts that did not survive validation.

## Local commands

Use Node 22, matching the workflows. The scripts use native `fetch` without an AI SDK dependency.

```bash
# Offline checks: no network or model call
npm run validate:roles
npm run role-drift:validate
npm test

# Discovery only: fetch Microsoft docs, no AI call or roles.js change
node scripts/check-role-drift.js
npm run role-drift:dry-run

# Save the discovery report to a file for review
DRIFT_PR_BODY=/tmp/secrole-discovery.md npm run role-drift:dry-run

# Paid generation: only after explicit approval and secure environment setup
# OPENAI_API_KEY must already be present in the server process environment
npm run role-drift:draft  # node scripts/check-role-drift.js --draft
```

`DRIFT_DRAFT_CAP` controls the maximum roles drafted per run (integer from 1 to 15, default 15). `DRIFT_PR_BODY` controls the output report path; the drafting default is `/tmp/drift-pr-body.md`. Keep generated changes on a review branch. The script does not itself open or merge a PR; the enabled workflow handles PR creation.

## Keyless assistant-authored drafts

A repository API key is optional for maintaining role content:

1. Run discovery only and inspect the report and official source links.
2. Ask an OpenAI assistant to draft the selected role additions from current Microsoft documentation, with exact official names, capability evidence, and a risk rationale for each proposed rating.
3. Add the entries on a separate branch using existing product categories and valid unique IDs. Check related roles against the actual catalog.
4. Run `npm run validate:roles`, `npm run test:role-drift`, `npm run lint`, and `npm run build`.
5. Open a **draft PR** with source links, risk rationale, any uncertainty, and the reviewer checklist below. Get human review before merging.

This path does not call SecRole's API adapter or need a SecRole API secret. Existing assistant access may have its own plan or usage limits. Manually authored entries do not automatically receive the drafting script's per-draft risk report, so include the rationale and apply the same rubric explicitly during review.

## Generated pull-request review

Each generated role-addition PR includes:

- Proposed ID and exact official name
- Product and category
- Proposed risk and required risk rationale
- Deterministic review flags
- Microsoft privileged marker
- Direct source link
- Human reviewer checklist
- Deferred, deprecated, and possibly retired entries

An open `role-drift/*` PR prevents stacking another drafting proposal; review, merge, or close it before requesting another batch. The workflow creates proposals in draft mode and never enables automatic merge.

## Reviewer checklist

Before merging a drift pull request, verify:

- Official name and product
- Description and permissions against the cited source
- Risk based on both capability and data sensitivity
- Privileged marker
- Least-privilege and PIM guidance
- Related-role family
- Deprecated, reserved, or restricted status
- Catalog validation, tests, lint, and build results for the proposed commit

A workflow-created PR may not trigger every downstream check when it uses `GITHUB_TOKEN`; verify required validation rather than assuming a green preview exists. Nothing ships until a human merges the pull request and the deployment succeeds.

## Cost and failure handling

Discovery and structural checks make no model API call. Drafting is billed according to actual OpenAI usage; see [current API pricing](https://developers.openai.com/api/docs/pricing) and the [default model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini). Review actual usage before choosing a larger draft cap or a different model. There is no fixed per-run cost guarantee.

A failed or invalid draft must not be treated as approved content. Inspect the run's source counts and errors, resolve the cause, and rerun only within the approved scope. Do not substitute a different provider, bypass validation, or delete roles to clear an error.
