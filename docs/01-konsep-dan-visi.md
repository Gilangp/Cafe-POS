# Velvra - Konsep & Visi Produk

**Document Type:** Enterprise Product Requirements Document
**Document Status:** Approved for Implementation – Baseline v1.0
**Classification:** Internal / Confidential – Engineering & Product Distribution Only

---

## Document Control

| Field | Value |
|---|---|
| Document Title | Velvra Coffee Shop & Kitchen Management Platform – PRD |
| Version | 1.0.0 |
| Status | Baseline (Ready for Sprint 0) |
| Owner | Product Management Office (PMO) |
| Primary Author | Senior Product Manager (Platform) |
| Contributing Roles | Product Management, Software Architecture, System Analysis, UI/UX Design, Technical Writing, Backend Engineering, Frontend Engineering, Enterprise Solution Architecture |
| Distribution | Product, UI/UX, Frontend, Backend, QA, DevOps, Project Management, Executive Stakeholders |
| Review Cycle | Every sprint boundary (bi-weekly) during build phase; quarterly post-GA |
| Change Control | All changes tracked via version history table below; no verbal or out-of-band scope changes permitted |

### Version History

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 0.1.0 | Draft | PMO | Initial draft skeleton |
| 0.5.0 | Draft | PMO + Architecture | Added technical architecture, module inventory |
| 1.0.0 | Baseline | PMO | Full baseline: all modules, RBAC, data model, API, design system, NFRs approved for Sprint 0 kickoff |

### Naming Convention

The product is internally codenamed **"Velvra"** throughout this document for concreteness (branding is a CMS-managed, white-label-capable configuration, not a hardcoded value). Any brand name, logo, color palette, or copy referenced in examples throughout this PRD is illustrative content that MUST be fully editable via the CMS at runtime, not compiled into the application.

---

## 1. Executive Summary

Velvra is an enterprise-grade, API-first digital ecosystem for a multi-branch, premium coffee brand. It unifies the entire operational surface of a modern coffee & kitchen business – from the public-facing marketing website and customer ordering experience, through in-store point of sale and kitchen production, to back-office inventory, procurement, workforce, membership, and analytics – into a single coherent platform with one source of truth for data and one design language for experience.

The platform is explicitly **not** a brochure website. It is a operational system of record. Every customer-visible surface (landing pages, menu, blog, gallery, careers, events) and every internal operational surface (POS, KDS, inventory, HR, CRM, purchasing) is powered by the same backend, the same RBAC engine, the same audit trail, and the same content model, exposed through a versioned REST API consumed by fully decoupled frontends (web, and – per the scalability mandate – future native mobile apps, kiosks, and digital signage).

The system must be architected from day one to support national multi-branch operation and international expansion, meaning: multi-branch data partitioning, multi-currency and multi-timezone support, localizable content, and a modular monolith-to-services-ready backend that can be decomposed as scale demands.

This document is the single source of truth for all engineering, design, QA, and delivery decisions on this program. It supersedes any verbal specification, chat conversation, or prior informal brief.

### 1.1 Problem Statement

Multi-branch premium coffee operators typically run on a patchwork of disconnected tools: a marketing CMS, a third-party POS, spreadsheet-based inventory, a disconnected loyalty program, and manual kitchen ticketing. This fragmentation causes:

- Inventory shrinkage and stockouts due to lack of real-time recipe-based deduction.
- Inconsistent customer experience across digital ordering channels.
- No single view of a customer across loyalty, orders, and reservations.
- Slow, error-prone multi-branch reporting and reconciliation.
- Inability to launch new channels (kiosk, app, delivery aggregators) without re-integration effort.

### 1.2 Solution Summary

Velvra replaces this patchwork with a unified platform:

- **One Database**: All transactions, master data, content, and audit trails in a single source of truth with branch-partitioned visibility.
- **One API**: All frontend surfaces (web, future mobile, kiosk) consume the same versioned REST API with consistent auth, validation, and error handling.
- **One Design System**: Token-based design system ensures visual consistency across all touchpoints.
- **One Permission Model**: Role-based access control (RBAC) with branch-scope isolation governs every action, from public ordering to executive reporting.

---

## 2. Product Vision, Goals & Success Metrics

### 2.1 Vision Statement

To be the operating system for premium multi-branch coffee & kitchen businesses, delivering a seamless, data-driven experience for customers, staff, and management while enabling rapid multi-channel and international expansion.

### 2.2 Strategic Goals

| Goal | Description | Target Timeframe |
|---|---|---|
| **Unified Operations** | Single platform replaces 5+ disconnected tools | v1.0 (6 months) |
| **Real-Time Inventory** | Recipe-driven inventory deduction eliminates shrinkage | v1.0 |
| **Omnichannel Ordering** | Consistent ordering experience across web, QR, POS, kiosk | v1.0 web/QR/POS; v1.5 kiosk |
| **Branch Scalability** | Seamlessly onboard new branches with isolated data and permissions | v1.0 architecture; ongoing |
| **International Ready** | Multi-currency, multi-timezone, localizable content from day one | v1.0 foundation |
| **Analytics-Driven** | Real-time operational dashboards for branch managers and executives | v1.0 |

### 2.3 Success Metrics (KPIs)

| Metric | Baseline (Current State) | Target (6 months post-launch) | Measurement Method |
|---|---|---|---|
| Inventory accuracy | ~75% (manual spreadsheet) | ≥95% | Monthly physical count variance |
| Order fulfillment time | 12 min avg | ≤8 min avg | KDS timestamp analysis |
| Customer repeat rate | 30% | ≥45% | Loyalty program enrollment & transaction frequency |
| Branch onboarding time | 2-3 weeks | ≤3 days | Project tracking from decision to first transaction |
| System uptime | 95% (aggregated across tools) | ≥99.5% | Uptime monitoring (24/7) |
| Staff training time (new hires) | 2 days | ≤4 hours | HR onboarding records |

---

## 3. Scope Definition

### 3.1 In Scope (v1.0 – 6-Month Delivery)

**Customer-Facing (Public Web)**
- Premium landing website (hero, story, menu preview, locations, contact)
- Full online ordering (browse menu, cart, checkout, payment, order tracking)
- QR-code ordering (table-side ordering with kitchen integration)
- Customer portal (order history, loyalty points, profile management)
- Blog/journal (CMS-powered articles)
- Events listing (CMS-powered event calendar)
- Careers portal (job postings, application submission)
- Gallery (photo/video showcase)
- Reservation system (table booking with availability management)

**Operations (Staff Web Apps)**
- Point of Sale (POS) – cashier interface for in-store transactions
- Kitchen Display System (KDS) – real-time order queue for kitchen staff
- Table Management – floor plan, table status, assignment
- Inventory Management – real-time stock levels, recipe-based deduction, reorder alerts
- Warehouse Management – multi-location stock, transfers, receiving
- Supplier Management – supplier directory, contact, terms
- Purchase Management – purchase orders, receiving, invoice matching
- Menu Management – centralized menu editor (items, categories, modifiers, pricing)
- Recipe Management – ingredient lists, costing, yield calculation

**Back Office (Admin Web Apps)**
- Multi-Branch Management – branch profiles, operational hours, contact info
- Employee Management – staff directory, roles, shift scheduling
- Membership & Loyalty – customer profiles, point accrual/redemption, tier management
- Promotion Management – discount rules, coupon codes, campaign scheduling
- CRM – customer segmentation, communication history, targeted campaigns
- Analytics Dashboard – real-time KPIs (sales, orders, inventory, customer metrics)
- Reports – scheduled/on-demand reports (sales, inventory, labor, customer)
- Audit Logs – comprehensive activity tracking for compliance
- Notification Center – in-app alerts, email/SMS notification management
- Settings – system configuration (payment gateways, taxes, branding, localization)
- Media Library – centralized asset management for all images/videos

**Infrastructure & Platform**
- REST API (versioned, OpenAPI-documented)
- Role-Based Access Control (RBAC) with branch-scope isolation
- Multi-tenant data architecture (branch-partitioned visibility)
- Audit logging for all sensitive actions
- Real-time notification engine (WebSocket + email/SMS)
- Payment gateway integration (credit/debit, digital wallets)
- Responsive design (desktop, tablet, mobile web)
- WCAG 2.2 AA accessibility compliance
- Multi-currency & multi-timezone support
- Localization framework (i18n-ready, initial: English & Bahasa Indonesia)

### 3.2 Out of Scope (v1.0)

- Native mobile apps (iOS/Android) – planned for Phase 3
- Self-ordering kiosk app – planned for Phase 2
- Digital menu board app – planned for Phase 2
- Delivery aggregator integrations (GrabFood, GoFood, etc.) – planned for Phase 4
- ERP/accounting system integration – planned for Phase 4
- Advanced AI features (demand forecasting, dynamic pricing) – future roadmap
- White-label multi-tenant SaaS platform – future commercialization phase

### 3.3 Assumptions & Dependencies

**Assumptions:**
- Initial deployment targets 3-5 branches in one country (Indonesia)
- All branches have stable internet connectivity
- Staff have access to tablets/computers for POS/KDS
- Payment gateway provider will be selected by Sprint 0
- Initial content (menu, images, copy) will be provided by client

**Dependencies:**
- Payment gateway API documentation and test credentials
- Brand assets (logo, color palette, photography) from client
- Sample menu data with pricing and recipes
- Branch operational data (addresses, hours, staff roster)

---

## 4. Stakeholders & User Personas

### 4.1 Stakeholders

| Stakeholder | Role | Interest | Influence |
|---|---|---|---|
| **Executive Sponsor** | CEO / Owner | ROI, brand reputation, expansion capability | High / High |
| **Operations Director** | COO | Operational efficiency, staff productivity, inventory control | High / High |
| **Marketing Director** | CMO | Customer engagement, brand consistency, campaign effectiveness | Medium / Medium |
| **Finance Director** | CFO | Cost control, financial reporting, audit compliance | Medium / High |
| **IT Manager** | CTO / IT Lead | System reliability, security, maintainability | High / High |
| **Branch Managers** | Store Managers | Ease of use, real-time visibility, staff management | High / Medium |
| **End Customers** | Coffee consumers | Ordering convenience, loyalty rewards, user experience | High / Low |

### 4.2 User Personas

#### Persona 1: Sarah – The Regular Customer
- **Age:** 28, Marketing Professional
- **Tech Savvy:** High
- **Frequency:** 3-4 visits/week
- **Goals:** Quick ordering, loyalty rewards, seamless experience
- **Pain Points:** Long queues, inconsistent service, no digital loyalty tracking
- **Key Features:** Online ordering, QR ordering, loyalty portal, order history

#### Persona 2: Rudi – Branch Manager
- **Age:** 35, 8 years F&B experience
- **Tech Savvy:** Medium
- **Responsibilities:** Daily operations, staff scheduling, inventory oversight
- **Goals:** Real-time visibility, reduce waste, improve staff efficiency
- **Pain Points:** Disconnected systems, manual inventory counts, unclear reporting
- **Key Features:** Analytics dashboard, inventory alerts, staff management, POS oversight

#### Persona 3: Siti – Barista / Cashier
- **Age:** 22, Part-time staff
- **Tech Savvy:** Medium
- **Responsibilities:** Taking orders, processing payments, preparing drinks
- **Goals:** Fast order entry, clear kitchen communication, minimal training time
- **Pain Points:** Complex POS systems, order errors, unclear kitchen status
- **Key Features:** Intuitive POS interface, real-time KDS integration, simple modifier selection

#### Persona 4: Chef Budi – Kitchen Staff
- **Age:** 30, 5 years culinary experience
- **Tech Savvy:** Low-Medium
- **Responsibilities:** Preparing orders, maintaining quality standards
- **Goals:** Clear order visibility, proper sequencing, minimal order confusion
- **Pain Points:** Lost tickets, unclear modifications, no priority indication
- **Key Features:** KDS with clear order queue, ingredient details, preparation timers

#### Persona 5: Linda – Executive / Owner
- **Age:** 45, Business Owner
- **Tech Savvy:** Medium
- **Responsibilities:** Strategic decisions, financial oversight, expansion planning
- **Goals:** Data-driven insights, profitability analysis, growth planning
- **Pain Points:** Delayed reports, no real-time visibility, manual consolidation
- **Key Features:** Executive dashboard, cross-branch reporting, financial analytics

---

## 5. Glossary & Definitions

| Term | Definition |
|---|---|
| **Branch** | A physical location/store within the coffee shop network |
| **Modifier** | Customization option for a menu item (e.g., extra shot, soy milk) |
| **Recipe** | Ingredient list with quantities required to produce one unit of a menu item |
| **SKU** | Stock Keeping Unit – unique identifier for an inventory item |
| **Deduction** | Automatic inventory reduction when a recipe is used in an order |
| **Tender** | Payment method (cash, card, digital wallet) |
| **KDS** | Kitchen Display System – screen showing order queue for kitchen staff |
| **POS** | Point of Sale – cashier interface for processing transactions |
| **RBAC** | Role-Based Access Control – permission system based on user roles |
| **Branch Scope** | Data visibility restriction limiting users to their assigned branch(es) |
| **Audit Trail** | Chronological record of all system activities for compliance |
| **Tenant** | In multi-tenant context, represents the entire business (all branches) |
| **Session** | Active ordering/dining instance (table session, order session) |
| **Cover** | Number of guests at a table |
| **Yield** | Output quantity from a recipe (e.g., 1 cake = 8 slices) |
| **Reorder Point** | Inventory threshold that triggers reorder alert |
| **Par Level** | Target inventory level to maintain |
| **Transfer** | Inter-branch inventory movement |
| **Variance** | Difference between expected and actual inventory (shrinkage/overage) |

---

**Referensi:** File asli `prd.md` section 0-5

