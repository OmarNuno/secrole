<!-- Microsoft Learn scc-permissions excerpt, retrieved 2026-10-05; checked against live page 2026-10-07.
Source: https://learn.microsoft.com/en-us/defender-office-365/scc-permissions
Microsoft documentation, CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ -->

## Role groups in Microsoft Defender for Office 365 and Microsoft Purview

| Role group | Description | Default roles |
| --- | --- | --- |
| **AI Administrators** | In addition to the capabilities listed for this role in [Microsoft Entra built-in roles](/en-us/entra/identity/role-based-access-control/permissions-reference#ai-administrator), use this group to assign read-only permissions to users for Data Security Posture Management for AI (classic) and AI-related data in the preview version of Data Security Posture Management. | AI Administrator |
| **Audit Reader** | Search, View, and Export Audit logs. | View-Only Audit Logs |
| **Compliance Administrator**¹ | Members can manage settings for device management, data loss prevention, reports, and preservation. | Admin Unit Extension Manager  Case Management  Communication Compliance Admin  Communication Compliance Case Management  Compliance Administrator  Compliance Manager Administration  Compliance Search  Credential Reader  Credential Writer  Data Classification Feedback Provider  Data Classification Feedback Reviewer  Data Connector Admin  Data Investigation Management  Data Map Reader  Data Security Investigation Admin  Device Management  Disposition Management  DLP Compliance Management  Hold  IB Compliance Management  Information Protection Admin  Information Protection Analyst  Information Protection Reader  Insider Risk Management Admin  Insights Reader  Manage Alerts  Organization Configuration  Purview Agent Analysis  Purview Agent Deployment  Purview Copilot Workspace Contributor  RecordManagement  Retention Management  Scan Reader  Scan Writer  Scope Manager  Source Reader  Source Writer  View-Only Audit Logs  View-Only Case  View-Only Device Management  View-Only DLP Compliance Management  View-Only IB Compliance Management  View-Only Manage Alerts  View-Only Recipients  View-Only Record Management  View-Only Retention Management |
| **Data Security AI Admins** | Use this group to assign editing capabilities for Data Loss Prevention policies and viewing AI content in Data Security Posture Management. Review the role description for access details. | Data Security AI Admin |
| **Data Security AI Viewers** | Use this group to assign read-only permissions to users for Data Security Posture Management for AI (classic) and the preview version of Data Security Posture Management. | Data Security AI Viewer |
| **Data Security Investigation Admins** | Administrators for Data Security Investigation that can create and manage all investigations, processes, and settings. | Data Security Investigation Admin  Data Security Investigation Analyst  Data Security Investigation Investigator  Data Security Investigation Reviewer |
| **Data Security Investigation Investigators** | Investigators for Data Security Investigation that can create and manage assigned investigations, processes, and settings. | Data Security Investigation Analyst  Data Security Investigation Investigator  Data Security Investigation Reviewer |
| **Data Security Investigation Reviewers** | Reviewers for Data Security Investigation that can create and manage all assigned investigations. | Data Security Investigation Reviewer |
| **Information Protection ABAC Attribute Assignment Administrators**² | Assign and remove M365 Info Protect Attributes for supported objects such as users and service principals. | Information Protection ABAC Attribute Assignment Administrator  Information Protection ABAC Attribute Definition Reader |
| **Information Protection ABAC Attribute Assignment Readers**² | Read M365 Info Protect Attributes for supported objects. | Information Protection ABAC Attribute Assignment Reader |
| **Information Protection ABAC Attribute Definition Administrators**² | Define a valid set of M365 Info Protect Attributes that can be assigned to supported objects. Activate and deactivate these attributes. | Information Protection ABAC Attribute Definition Administrator |
| **Information Protection ABAC Attribute Definition Readers**² | Read the definitions of M365 Info Protect Attributes. | Information Protection ABAC Attribute Definition Reader |
| **Information Protection ABAC Policy Administrators**² | Define M365 Info Protect ABAC Policies and Rules to control M365 ABAC Mandatory Access Control decisions. Create, view, edit, delete, enable, and disable those policies and rules. | Information Protection ABAC Policy Administrator  Information Protection ABAC Attribute Definition Reader |
| **Information Protection ABAC Policy Readers**² | View M365 Info Protect ABAC Policies and Rules. | Information Protection ABAC Policy Reader |
| **Information Protection Readers** | View-only access to reports for DLP policies and sensitivity labels and their policies. | Information Protection Reader |
| **Purview Administrators** | Create, edit, and delete domains and perform role assignments. | Admin Unit Extension Manager  Purview Domain Manager  Role Management |

Note

¹ This role group doesn't assign members the permissions necessary to search the audit log or to use any reports that might include Exchange data, such as the DLP or Defender for Office 365 reports. To search the audit log or to view all reports, a user has to be assigned permissions in Exchange Online. This action is required because the underlying cmdlet that's used to search the audit log is an Exchange Online cmdlet. Global admins can search the audit log and view all reports because they're automatically added as members of the Organization Management role group in Exchange Online. For more information, see [Search the audit log in the Microsoft Purview portal](/en-us/purview/audit-log-search).

Note

² This role or role group is in preview. While it may be visible in commercial Microsoft 365 tenants, it is not supported and has no operational effect outside the M365 ABAC private preview. At this time, support is planned only for Microsoft U.S. government cloud environments (GCC High and DoD, see [Understand Microsoft U.S. government cloud environments for Microsoft 365 and Microsoft Copilot](/en-us/microsoft-365/copilot/gov-overview)).

## Roles in Microsoft Defender for Office 365 and Microsoft Purview

| Role | Description | Default roles |
| --- | --- | --- |
| **Compliance Administrator** | View and edit settings and reports for compliance features. | Compliance Administrator  Compliance Data Administrator  Organization Management |
| ^\*^**Information Protection ABAC Attribute Assignment Administrator**² | Assign and remove M365 Info Protect Attributes for supported objects such as users and service principals. | Information Protection ABAC Attribute Assignment Administrators |
| ^\*^**Information Protection ABAC Attribute Assignment Reader**² | Read M365 Info Protect Attributes for supported objects. | Information Protection ABAC Attribute Assignment Readers |
| ^\*^**Information Protection ABAC Attribute Definition Administrator**² | Define a valid set of M365 Info Protect Attributes that can be assigned to supported objects. Activate and deactivate these attributes. | Information Protection ABAC Attribute Definition Administrators |
| ^\*^**Information Protection ABAC Attribute Definition Reader**² | Read the definitions of M365 Info Protect Attributes. | Information Protection ABAC Attribute Assignment Administrators  Information Protection ABAC Attribute Definition Readers  Information Protection ABAC Policy Administrators |
| ^\*^**Information Protection ABAC Policy Administrator**² | Define M365 Info Protect ABAC Policies and Rules to control M365 ABAC Mandatory Access Control decisions. Create, view, edit, delete, enable, and disable those policies and rules. | Information Protection ABAC Policy Administrators |
| ^\*^**Information Protection ABAC Policy Reader**² | View M365 Info Protect ABAC Policies and Rules. | Information Protection ABAC Policy Readers |
| **View-Only Audit Logs** | View and export audit reports. Because these reports might contain sensitive information, you should only assign this role to people with an explicit need to view this information. | Audit Manager  Audit Reader  Compliance Administrator  Compliance Data Administrator  Global Reader  Organization Management  Security Administrator  Security Operator |
| **View-Only Manage Alerts** | View the configuration and reports for the Manage Alerts feature. | Compliance Administrator  Compliance Data Administrator  Global Reader  Organization Management  Security Administrator  Security Operator  Security Reader |

Note

² This role or role group is in preview. While it may be visible in commercial Microsoft 365 tenants, it is not supported and has no operational effect outside the M365 ABAC private preview. At this time, support is planned only for Microsoft U.S. government cloud environments (GCC High and DoD, see [Understand Microsoft U.S. government cloud environments for Microsoft 365 and Microsoft Copilot](/en-us/microsoft-365/copilot/gov-overview)).
