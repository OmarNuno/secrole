# Microsoft Purview Governance Knowledge Cluster

Last updated: October 3, 2026

## Purpose

This document defines the content, navigation, evidence, and maintenance contract for SecRole's Microsoft Purview Administration and Role Governance knowledge domain.

The public hub is:

```text
/purview-governance
```

It explains Microsoft Purview access as a complete authorization path rather than one role-group assignment.

## Effective-access model

A Purview review must explain these factors together:

```text
Identity
  × Permission plane
  × Capability
  × Scope
  × State and duration
  × Content sensitivity
  × Evidence
```

The hub preserves the following distinctions:

- Microsoft Purview role groups vs. Microsoft Entra roles
- Role group vs. role vs. member
- Direct user assignment vs. security-group assignment
- Permanent assignment vs. temporary assignment vs. PIM-for-Groups activation
- Administrative Unit scope vs. tenant-wide capability
- Purview scope vs. an overlapping unscoped Microsoft Entra role
- Portal visibility vs. list visibility vs. content visibility
- Role capability vs. eDiscovery case membership
- eDiscovery case access vs. searchable-content boundary
- Configuration access vs. investigation-data access
- Unified Catalog role vs. Data Map domain or collection access
- Purview governance access vs. underlying Azure, Fabric, or source-resource permission

## Public and planned routes

### Published hub

```text
/purview-governance
```

### Planned focused guides

```text
/purview-governance/role-groups-and-scoping
/purview-governance/ediscovery-permissions
/purview-governance/sensitive-content-access
/purview-governance/data-governance-roles
```

Planned routes remain hidden from the sitemap, Knowledge Library, and public links until each page is complete.

## Hub responsibility

The hub must remain useful without any child guide. It includes:

1. The Purview permission equation
2. Role groups and individual roles
3. Microsoft Entra role mappings and precedence
4. Direct, temporary, group-based, and PIM-based access
5. Administrative Unit scope
6. Sensitive-content roles
7. eDiscovery role, case, and compliance-boundary layers
8. Data Map and Unified Catalog permissions
9. Read-only inventory tooling
10. A repeatable access-review workflow
11. Troubleshooting and operating cadence
12. Official Microsoft sources

Focused pages should deepen one administrator task with additional portal steps, decision trees, commands, evidence, and edge cases. They should not repeat the entire hub.

## Permission-plane contract

Every Purview article must identify which authorization plane evaluates the action:

| Permission plane | Representative evidence |
|---|---|
| Purview role group | Group identity, included roles, direct and group members, expiration, scope |
| Microsoft Entra role | Active or eligible assignment, assignment source, PIM state, mapped capability |
| Solution or case access | Case member, policy owner, investigator role, solution configuration |
| Search and content boundary | List viewer, content viewer, search role, export role, compliance filter |
| Unified Catalog | Tenant role group, catalog or governance-domain role |
| Data Map | Domain and collection permission |
| Underlying resource | Azure, Fabric, or source-system role and access state |

Do not describe a Purview permission without stating which plane grants it and which other plane can expand, restrict, or override it.

## Role-group governance contract

A role-group review must preserve:

- Built-in vs. custom role group
- Job-function purpose
- Every role included in the group
- Direct user members
- Security-group members
- Group owners and membership authority
- Temporary assignment dates
- PIM-for-Groups eligibility and activation
- Administrative Unit assignment
- Overlapping Microsoft Entra role assignments
- Role Management delegation
- Audit evidence and next review date

Changing a role-group definition can affect more than permissions. In eDiscovery, changing roles can remove that role group from cases. Production role changes require case-dependency review and rollback planning.

## Scope and time contract

Purview access may be reduced through:

- Administrative Units for supported Purview solutions and role groups
- Direct temporary user assignments where the role group supports them
- Microsoft Entra PIM for Groups on a security group assigned to the Purview role group
- eDiscovery cases and search-permissions filters
- Governance domains and Data Map domains or collections
- Underlying source-resource permissions

A time-bound or scoped Purview assignment is not sufficient evidence by itself. Review alternate role groups, security groups, Microsoft Entra roles, cases, domains, collections, and resource roles.

## Sensitive-content contract

Treat these permissions as data access, not merely administration:

- Data Classification List Viewer
- Data Classification Content Viewer
- Audit search and export
- Compliance Search, preview, export, purge, and hold
- Communication Compliance investigation content
- Insider Risk investigation content
- Data Security Posture Management for AI prompt and response access
- eDiscovery case data
- Records, retention, and information-protection evidence

Read-only access can still be High risk when it exposes tenant-wide communications, files, prompts, investigation evidence, identities, or security findings.

## eDiscovery contract

An eDiscovery access review must identify:

1. The role group and roles
2. Manager vs. Administrator capability
3. The specific case
4. User or role-group case membership
5. Search-permissions filters and searchable locations
6. Licensing, billing, and service prerequisites
7. Search, preview, export, hold, and purge evidence
8. Recovery path when the last case member leaves
9. Service-principal authorization where automation is used
10. Audit and review evidence

Capability groups and compliance-boundary groups should remain separate where possible so permission changes do not silently alter searchable-content scope.

## Data-governance contract

A Unified Catalog or Data Map review must preserve:

- Purview account type and portal experience
- Tenant-level role group
- Unified Catalog role
- Governance-domain role
- Data Map domain or collection permission
- Underlying Azure, Fabric, or source-resource access
- Domain and collection ownership
- Backup owner and recovery path
- Asset visibility and management test
- Audit evidence and next review date

Do not infer asset visibility from one role. Unified Catalog can return assets because of Data Map access or existing resource permissions.

## Read-only evidence conventions

The initial hub uses these exports:

```text
Purview_RoleGroups_<timestamp>.csv
Purview_RoleGroupMembers_<timestamp>.csv
Purview_RoleGroupRoles_<timestamp>.csv
Purview_ComplianceSecurityFilters_<timestamp>.csv
Purview_AdministrativeUnits_<timestamp>.csv
Purview_AdministrativeUnitMembers_<timestamp>.csv
Purview_Permission_Findings_<timestamp>.csv
```

Command-card labels should describe the evidence function:

- Role-group inventory
- Compliance boundaries
- PowerShell helper
- Scope inventory
- Control findings
- Case inventory
- Sensitive-content access
- Data-governance inventory
- State-changing PowerShell
- State-changing HTTP

Read-only evidence appears before state-changing examples.

## Review workflow

The standard sequence is:

1. Define the exact business task.
2. Identify the permission plane.
3. Inventory every assignment path.
4. Inspect every role in the role group.
5. Validate scope and case boundaries.
6. Rate content sensitivity.
7. Review time controls and PIM.
8. Confirm ownership and recovery.
9. Correlate actual use.
10. Choose a disposition.
11. Test required and denied behavior.
12. Preserve evidence and schedule review.

Supported dispositions:

- Retain
- Separate duties or role groups
- Narrow scope
- Time-bound access
- Reduce sensitive-content capability
- Remove

## Cross-linking rules

- `/knowledge` links to the Purview hub.
- The Purview hub links to the Role Library, Overlap Analyzer, AI Advisor, Role Governance hub, and Updates.
- The Microsoft Entra Role Governance hub is the adjacent authority for mapped Entra-role paths, PIM, role-assignable groups, and Administrative Units.
- Future focused Purview guides link to the hub and only the relevant sibling guides.
- Planned routes remain unlinked.

## Mobile and accessibility contract

Review the hub and every future child page at desktop, tablet, and phone widths.

Verify:

- Permission equations and flows collapse without horizontal clipping.
- Tables retain horizontal scrolling.
- Code blocks are keyboard focusable and horizontally scrollable.
- Copy buttons have descriptive accessible names.
- The sticky table of contents disappears cleanly on smaller screens.
- Light and dark themes preserve contrast for Purview, warning, High, and Critical states.
- Long role-group, permission, and export names wrap without breaking cards.
- Current navigation and breadcrumbs remain meaningful.

## Maintenance triggers

Review the hub when Microsoft changes:

- Purview role groups or included roles
- Microsoft Entra role mappings
- Role precedence behavior
- Administrative Unit support
- Temporary assignment behavior
- PIM-for-Groups integration or propagation
- eDiscovery role or case behavior
- Search-permissions filters
- Content Explorer roles
- Communication Compliance, Insider Risk, Audit, or AI investigation permissions
- Unified Catalog and Data Map roles
- Purview account models, portal navigation, or licensing
- Security & Compliance PowerShell cmdlets

The role-drift workflow should continue detecting role additions, while this cluster explains how Purview assignments become effective access.

## Recommended publication sequence

1. Publish and review the complete Purview governance hub.
2. Build Role Groups, Administrative Units, and Temporary Access.
3. Build eDiscovery Permissions, Cases, and Compliance Boundaries.
4. Build Sensitive Content Access and Investigation Roles.
5. Build Unified Catalog and Data Map Role Governance.
6. Review the cluster as one user journey and normalize commands, exports, and cross-links.
