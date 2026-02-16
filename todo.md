# Todo: Migrate Frontend from MUI to Shadcn/UI

This plan outlines the steps required to refactor the application's frontend, replacing the Material-UI (MUI) component library with Shadcn/UI and Tailwind CSS.

## Phase 1: Setup & Scoping

- [x] **Initialize Shadcn/UI:** Set up and configure Shadcn/UI within the existing project structure.
- [x] **Audit MUI Components:** Systematically identify all files and components currently using `@mui/material` and `@emotion/*` dependencies.
- [x] **Create Component Migration Map:** For each MUI component, identify the corresponding Shadcn/UI equivalent to be used. (Most MUI components have direct Shadcn equivalents: Button, Card, Dialog, Input, Select, Table, etc.)

## Phase 2: Component Migration (Iterative)

This will be done on a per-component basis to ensure stability.

- [x] **Core Components:**
    - [x] Migrate `components/core/Login.tsx`
    - [x] Migrate `components/core/Dashboard.tsx`
    - [x] Migrate `components/core/StatCard.tsx`
    - [x] Migrate `components/core/ProjectModal.tsx`
    - [x] Migrate `components/core/ProjectsList.tsx`
- [x] **Common Components:**
    - [x] Migrate `components/common/UserManagement.tsx`
    - [x] Migrate `components/common/UserRegistration.tsx`
- [x] **Hubs:**
    - [x] Migrate `components/hubs/FinancialsCommercialHub.tsx`
    - [x] Migrate `components/hubs/QualityHub.tsx`
    - [x] Migrate `components/hubs/ReportsAnalyticsHub.tsx`
- [x] **Modules:**
    - [x] **Modules (Remaining):**
    - [x] Migrate `modules/SubcontractorBillingModule.tsx`
    - [x] Migrate `modules/StaffManagementModule.tsx`
    - [x] Migrate `modules/SettingsModule.tsx`
    - [x] Migrate `modules/RFIModule.tsx`
    - [x] Migrate `modules/ResourceManagementHub.tsx`
    - [x] Migrate `modules/MPRReportModule.tsx`
    - [x] Migrate `modules/MaterialManagementModule.tsx`
    - [x] Migrate `modules/FleetModule.tsx`

## Phase 3: Cleanup & Verification

- [x] **Remove MUI Dependencies:** Uninstall `@mui/material`, `@mui/x-data-grid`, `@emotion/react`, and `@emotion/styled` from `package.json`.
- [x] **Clean Install:** Run `npm install` to prune `node_modules` and `package-lock.json`.
- [x] **Full Build:** Execute the `npm run build` command to ensure the application compiles without errors. (Vulnerabilities addressed where possible, some remain due to no available fixes or breaking changes.)
- [ ] **Runtime Testing:** Manually test key user flows to confirm the application is fully functional after the refactor.

## Remaining Components to Migrate (0 files with active MUI usage)

**Priority 1 - Core Business Modules:**
- [✅] SettingsModule.tsx (Already migrated to Shadcn/UI)
- [✅] MaterialManagementModule.tsx (Migration completed)
- [✅] SubcontractorBillingModule.tsx (Migration completed)
- [✅] StaffManagementModule.tsx (Migration completed)
- [✅] RFIModule.tsx (Migration completed)
- [✅] SubcontractorModule.tsx (Migration completed)
- [✅] ResourceManagementHub.tsx (Migration completed)
- [✅] FinancialManagementHub.tsx (Migration completed)
- [✅] DocumentationHub.tsx (Migration completed)

**Migration Status:**
- ✅ SettingsModule.tsx - Already using Shadcn/UI components
- ✅ MaterialManagementModule.tsx - Fully migrated to Shadcn/UI
- ✅ SubcontractorBillingModule.tsx - Fully migrated to Shadcn/UI
- ✅ StaffManagementModule.tsx - Fully migrated to Shadcn/UI
- ✅ RFIModule.tsx - Fully migrated to Shadcn/UI
- ✅ SubcontractorModule.tsx - Fully migrated to Shadcn/UI
- ✅ ResourceManagementHub.tsx - Fully migrated to Shadcn/UI
- ✅ FinancialManagementHub.tsx - Fully migrated to Shadcn/UI
- ✅ DocumentationHub.tsx - Fully migrated to Shadcn/UI
- ✅ All modules migrated - No remaining MUI usage

**Migration Strategy:**
1. Start with smaller modules (Settings, MaterialManagement)
2. Move to medium-sized modules (SubcontractorBilling, ResourceManagementHub)
3. Handle large modules last (StaffManagement, RFI, FinancialManagement)

**Quick Wins (Smaller files):**
- SettingsModule.tsx - Primarily form controls
- MaterialManagementModule.tsx - Standard tables and forms

The migration framework is complete. Remaining work is iterative component-by-component migration.
