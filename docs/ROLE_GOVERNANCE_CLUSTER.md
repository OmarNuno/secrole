# SecRole Role Governance Cluster

Last reviewed: October 2, 2026

## Purpose

The Microsoft Entra Role Governance cluster is one connected administrator journey rather than four unrelated articles. Together, the pages explain effective administrator access across role capability, assignment scope, activation state, inheritance, duration, controls, and evidence.

## Published routes

| Journey step | Route | Primary question |
|---|---|---|
| Foundation | `/role-governance` | What combination of principal, role, scope, state, time, controls, inheritance, and evidence produces effective access? |
| Time | `/role-governance/privileged-identity-management` | When can privileged access become active, for how long, and under which activation controls? |
| Inheritance | `/role-governance/role-assignable-groups` | How can membership or ownership create indirect administrator access? |
| Capability and scope | `/role-governance/custom-roles-and-scope` | What actions are allowed, and where can those actions be exercised? |

The shared sequence is:

```text
Model → Time → Inheritance → Capability and scope
```

Each page remains useful as a direct search destination, but visitors should always be able to understand where the page sits in the complete governance model.

## Effective-access contract

Role Governance content must preserve these fields together:

```text
Principal
    ×
Role definition
    ×
Assignment scope
    ×
Active or eligible state
    ×
Duration
    ×
Inheritance path
    ×
Activation and review controls
    ×
Operational evidence
```

A role display name or one portal screenshot is not sufficient evidence. Reviews should preserve stable identifiers, assignment or schedule records, dates, scope, source, owner, and the evidence used to keep or change access.

## Journey navigation contract

`src/pages/role-governance/RoleGovernanceJourney.jsx` is the shared cluster navigation component.

- Render it near the beginning of the hub and every child guide.
- Mark the current route with `aria-current="page"`.
- Keep the four steps in the same order on every page.
- Use the journey for sibling navigation instead of repeating the same three sibling cards at the end of every article.
- Keep the final Related Resources section focused on tools or genuinely adjacent domains.
- Preserve the responsive layout: four columns on wide screens, two on medium screens, and one on phones.

## Display-label contract

SEO titles and H1 headings can be descriptive and task-oriented. Cards and breadcrumbs need shorter labels.

`src/data/pageDisplay.js` supplies concise display labels for:

- Knowledge Library cards
- Related-resource cards
- Breadcrumbs

Do not shorten canonical page titles or H1 headings merely to make a card fit. Add or revise a display override instead.

Current display labels:

| Page | Card title | Breadcrumb |
|---|---|---|
| Role Governance hub | Microsoft Entra Role Governance | Role Governance |
| PIM guide | PIM Role Settings & Eligible Assignments | PIM Role Settings |
| Role-Assignable Groups guide | Role-Assignable Groups & Delegated Administration | Role-Assignable Groups |
| Custom Roles guide | Custom Roles, Scope & Administrative Units | Custom Roles & Scope |

## Cross-linking contract

The cluster should link as follows:

1. `/knowledge` links to the hub and every published guide.
2. Every cluster page displays the shared four-step journey.
3. Every child guide automatically links back to the Role Governance hub through `KnowledgeGuideLayout`.
4. The final related section should emphasize SecRole tools or adjacent content rather than duplicate the journey.
5. Application-administration sections may link to the Service Principal Permissions and Admin Consent guide when the distinction between administrative delegation and runtime authorization matters.

## Command and evidence contract

All cluster command sections follow these conventions:

- Read-only investigation appears before state-changing examples.
- Code cards use a short functional label such as `Assignment inventory`, `Policy inventory`, `Control findings`, or `State-changing HTTP`.
- Export filenames describe the evidence domain and include a timestamp.
- State-changing examples are explicitly labeled in both the surrounding section and the code card.
- Large-tenant notes describe pagination, throttling, enrichment cost, and staged investigation where relevant.
- Positive validation is not enough; custom-role and scope work must include prohibited and out-of-scope negative tests.

Current major exports:

```text
Entra_Role_Governance_<timestamp>.csv
Entra_PIM_Assignments_<timestamp>.csv
Entra_PIM_RoleSettings_<timestamp>.csv
Entra_PIM_Requests_<timestamp>.csv
RoleAssignable_Groups_<timestamp>.csv
RoleAssignable_Group_RolePaths_<timestamp>.csv
RoleAssignable_Group_Relationships_<timestamp>.csv
RoleAssignable_Group_Findings_<timestamp>.csv
Entra_Custom_Role_Definitions_<timestamp>.csv
Entra_Custom_Role_Assignments_<timestamp>.csv
Entra_Administrative_Units_<timestamp>.csv
Entra_Custom_Role_Findings_<timestamp>.csv
```

## Shared user-interface contract

Role Governance pages use `KnowledgeGuideLayout` and the shared guide components.

The cluster polish pass established these shared behaviors:

- Concise breadcrumbs and cards without changing SEO titles or H1s
- One visible journey rail across all four pages
- Functional code-card labels
- Copy buttons with descriptive accessible names
- Keyboard-focusable horizontally scrollable code blocks
- Responsive journey, diagrams, tables, and code cards
- Nonduplicative related-resource sections

When shared components change, verify that Service Principal guides remain visually and functionally correct because both knowledge clusters use the same layout and code-card components.

## Review checklist

Before merging a cluster-wide change, verify all five routes:

```text
/knowledge
/role-governance
/role-governance/privileged-identity-management
/role-governance/role-assignable-groups
/role-governance/custom-roles-and-scope
```

Confirm:

- Knowledge reports the expected number of published guides.
- The Govern privileged access track contains the three focused guides in the intended order.
- The shared journey appears once on every Role Governance page and highlights the current step.
- Breadcrumb labels are concise and correct.
- The hub and guides still expose their complete H1 and metadata.
- Copy buttons work and code can be reached and scrolled with a keyboard.
- State-changing examples remain unmistakable.
- Tables and diagrams remain readable on phone widths.
- Light and dark themes preserve contrast and hierarchy.
- Official-source links, canonical URLs, structured data, sitemap, and direct route loads remain valid.

## Maintenance rules

Re-review the cluster when Microsoft changes any of the following:

- Microsoft Entra built-in or custom role permissions
- PIM schedule, request, policy, approval, or authentication-context behavior
- Role-assignable group limits, membership rules, ownership behavior, or PIM for Groups
- Administrative Unit or Restricted Management Administrative Unit capabilities and limitations
- Supported Microsoft Entra resource scopes
- Microsoft Graph resource shapes, endpoint permissions, or query requirements
- Licensing requirements

Prefer updating the focused authority page and adding concise links elsewhere instead of copying a complete explanation into multiple pages.

## Next knowledge decision

After the cluster passes visual and functional review, choose the third major SecRole knowledge hub. The leading candidate is Microsoft Purview Administration and Role Governance because Purview already represents a large portion of the Role Library and has a distinct authorization model that deserves its own operational reference.
