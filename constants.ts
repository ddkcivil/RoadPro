import { Project, RFIStatus, WorkCategory, User, UserRole, RFI, LabTest, ScheduleTask, InventoryItem, InventoryTransaction, Vehicle, VehicleLog, ProjectDocument, DailyReport, PreConstructionTask, DailyWorkItem, StructureAsset, Message, LandParcel, MapOverlay, LinearWorkLog, Subcontractor, ContractBill, MeasurementSheet, StaffLocation, Agency, AgencyPayment, BOQItem, VariationOrder, VariationItem, TaskDependency, ResourceMatrix, ResourceAllocation } from './types';

export const MOCK_USERS: User[] = [
  { 
      id: 'u1', name: 'Admin User', email: 'admin@roadmaster.com', phone: '9779800000001', role: UserRole.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
  },
  { 
      id: 'u2', name: 'Er. Dharma Dhoj Kunwar', email: 'pm@roadmaster.com', phone: '9779802877286', role: UserRole.PROJECT_MANAGER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  { 
      id: 'u3', name: 'John Doe', email: 'site@roadmaster.com', phone: '9779812345678', role: UserRole.SITE_ENGINEER,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  { 
      id: 'u4', name: 'Sarah Lee', email: 'lab@roadmaster.com', phone: '9779809876543', role: UserRole.LAB_TECHNICIAN,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  { 
      id: 'u5', name: 'Vikram Singh', email: 'supervisor@roadmaster.com', phone: '9779865432109', role: UserRole.SUPERVISOR,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', receiverId: 'general', content: 'Team, please ensure all RFIs for the current segment are submitted by EOD.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 'm2', senderId: 'u3', receiverId: 'u2', content: 'PM, I have updated the pavement logs for KM 12+400.', timestamp: new Date(Date.now() - 43200000).toISOString(), read: false },
  { id: 'm3', senderId: 'u4', receiverId: 'general', content: 'Lab test results for concrete samples are ready for review.', timestamp: new Date(Date.now() - 21600000).toISOString(), read: true },
  { id: 'm4', senderId: 'u5', receiverId: 'u2', content: 'Daily report for excavation work completed today.', timestamp: new Date().toISOString(), read: false },
];

export const MOCK_BOQ_ITEMS: BOQItem[] = [
  {
    id: 'boq-001',
    itemNo: '1.1',
    description: 'Clearing and grubbing of trees and vegetation',
    unit: 'sq.m',
    quantity: 15000,
    rate: 45,
    amount: 15000 * 45,
    location: 'KM 12+000 to 15+000',
    completedQuantity: 12000,
    variationQuantity: 0,
    revisedQuantity: 15000,
    category: 'Earthwork'
  },
  {
    id: 'boq-002',
    itemNo: '1.2',
    description: 'Excavation in ordinary soil',
    unit: 'cu.m',
    quantity: 8500,
    rate: 1200,
    amount: 8500 * 1200,
    location: 'KM 12+000 to 15+000',
    completedQuantity: 7200,
    variationQuantity: 0,
    revisedQuantity: 8500,
    category: 'Earthwork'
  },
  {
    id: 'boq-003',
    itemNo: '2.1',
    description: 'Granular sub-base (GSB) - 200mm thick',
    unit: 'sq.m',
    quantity: 12000,
    rate: 280,
    amount: 12000 * 280,
    location: 'KM 12+000 to 15+000',
    completedQuantity: 8500,
    variationQuantity: 0,
    revisedQuantity: 12000,
    category: 'Pavement'
  },
  {
    id: 'boq-004',
    itemNo: '3.1',
    description: 'PCC (1:4:8) bedding - 100mm thick',
    unit: 'cu.m',
    quantity: 1200,
    rate: 8500,
    amount: 1200 * 8500,
    location: 'KM 12+000 to 15+000',
    completedQuantity: 800,
    variationQuantity: 0,
    revisedQuantity: 1200,
    category: 'Pavement'
  },
  {
    id: 'boq-005',
    itemNo: '4.1',
    description: 'Wearing course - Dense Bituminous Macadam (DBM)',
    unit: 'sq.m',
    quantity: 10000,
    rate: 450,
    amount: 10000 * 450,
    location: 'KM 12+000 to 15+000',
    completedQuantity: 6000,
    variationQuantity: 500,
    revisedQuantity: 10500,
    category: 'Pavement'
  }
];

export const MOCK_VARIATION_ITEMS: VariationItem[] = [
  {
    id: 'vi-001',
    boqItemId: 'boq-001',
    isNewItem: false,
    description: 'Additional clearing and grubbing work',
    unit: 'sq.m',
    quantityDelta: 2000,
    rate: 45
  }
];

export const MOCK_VARIATION_ORDERS: VariationOrder[] = [
  {
    id: 'vo-001',
    voNumber: 'VO-001',
    title: 'Additional excavation work',
    date: '2025-12-20',
    status: 'Approved',
    items: MOCK_VARIATION_ITEMS,
    reason: 'Extra excavation required due to unforeseen ground conditions',
    totalImpact: 1500000
  },
  {
    id: 'vo-002',
    voNumber: 'VO-002',
    title: 'Change in material specification',
    date: '2025-12-25',
    status: 'Draft',
    items: [],
    reason: 'Change from granite to limestone aggregate',
    totalImpact: -800000
  }
];

export const MOCK_RFIS: RFI[] = [
  {
    id: 'rfi-001',
    rfiNumber: 'RFI-001',
    date: '2025-12-18',
    location: 'KM 15+200',
    description: 'Request clarification on drainage pipe alignment at KM 15+200',
    status: RFIStatus.OPEN,
    requestedBy: 'u3',
    inspectionDate: '2025-12-25',
    workflowLog: []
  },
  {
    id: 'rfi-002',
    rfiNumber: 'RFI-002',
    date: '2025-12-19',
    location: 'Foundation excavation',
    description: 'Need approval for soil test results from foundation excavation',
    status: RFIStatus.APPROVED,
    requestedBy: 'u5',
    inspectionDate: '2025-12-26',
    workflowLog: []
  }
];

export const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: 'lt-001',
    testName: 'Concrete Cube Test',
    category: 'Concrete',
    sampleId: 'CS-001',
    date: '2025-12-24',
    location: 'KM 12+400',
    result: 'Pass',
    technician: 'u4'
  },
  {
    id: 'lt-002',
    testName: 'Aggregate Impact Value',
    category: 'Aggregate',
    sampleId: 'AS-001',
    date: '2025-12-25',
    location: 'Quarry A',
    result: 'Pending',
    technician: 'u4'
  }
];

export const MOCK_TASK_DEPENDENCIES: TaskDependency[] = [
  {
    taskId: 'st-001',
    type: 'FS',
    lag: 0
  }
];

export const MOCK_SCHEDULE_TASKS: ScheduleTask[] = [
  {
    id: 'st-001',
    name: 'Site Clearing',
    startDate: '2025-12-17',
    endDate: '2025-12-24',
    progress: 100,
    status: 'Completed',
    dependencies: [],
    assignedTo: ['u5'],
    isCritical: true
  },
  {
    id: 'st-002',
    name: 'Excavation Work',
    startDate: '2025-12-20',
    endDate: '2026-01-10',
    progress: 85,
    status: 'On Track',
    dependencies: MOCK_TASK_DEPENDENCIES,
    assignedTo: ['u3'],
    isCritical: true
  },
  {
    id: 'st-003',
    name: 'GSB Laying',
    startDate: '2026-01-05',
    endDate: '2026-01-25',
    progress: 40,
    status: 'On Track',
    dependencies: [{ taskId: 'st-002', type: 'FS', lag: 0 }],
    assignedTo: ['u3'],
    isCritical: true
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    itemName: 'Cement (OPC 53 Grade)',
    quantity: 1250,
    unit: 'bags',
    location: 'Main Warehouse',
    lastUpdated: '2025-12-25',
    reorderLevel: 200
  },
  {
    id: 'inv-002',
    itemName: 'River Sand',
    quantity: 450,
    unit: 'cu.m',
    location: 'Material Yard',
    lastUpdated: '2025-12-25',
    reorderLevel: 100
  },
  {
    id: 'inv-003',
    itemName: 'Coarse Aggregate (20mm)',
    quantity: 680,
    unit: 'cu.m',
    location: 'Material Yard',
    lastUpdated: '2025-12-25',
    reorderLevel: 150
  },
  {
    id: 'inv-004',
    itemName: 'Steel Reinforcement Bars',
    quantity: 45,
    unit: 'tonnes',
    location: 'Reinforcement Yard',
    lastUpdated: '2025-12-24',
    reorderLevel: 10
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v-001',
    plateNumber: 'BA 1 JA 2001',
    type: 'Tipper Truck',
    driver: 'Ram Bahadur',
    status: 'Active',
    geofenceStatus: 'Inside',
    agencyId: 'agency-001'
  },
  {
    id: 'v-002',
    plateNumber: 'BA 1 JA 2002',
    type: 'Excavator',
    driver: 'Hari Prasad',
    status: 'Maintenance',
    geofenceStatus: 'Inside',
    agencyId: 'agency-002'
  },
  {
    id: 'v-003',
    plateNumber: 'BA 1 JA 2003',
    type: 'Motor Grader',
    driver: 'Shyam Sundar',
    status: 'Active',
    geofenceStatus: 'Outside',
    agencyId: 'agency-001'
  }
];

export const MOCK_VEHICLE_LOGS: VehicleLog[] = [
  {
    id: 'vl-001',
    vehicleId: 'v-001',
    plateNumber: 'BA 1 JA 2001',
    date: '2025-12-24',
    startKm: 24500,
    endKm: 24500,
    totalKm: 150,
    fuelConsumed: 65,
    workingHours: 8.5,
    activityDescription: 'Transporting earthwork material'
  },
  {
    id: 'vl-002',
    vehicleId: 'v-001',
    plateNumber: 'BA 1 JA 2001',
    date: '2025-12-25',
    startKm: 24650,
    endKm: 24780,
    totalKm: 130,
    fuelConsumed: 55,
    workingHours: 7.5,
    activityDescription: 'Shifting GSB material'
  },
  {
    id: 'vl-003',
    vehicleId: 'v-003',
    plateNumber: 'BA 1 JA 2003',
    date: '2025-12-25',
    startKm: 18900,
    endKm: 18950,
    totalKm: 50,
    fuelConsumed: 30,
    workingHours: 6.0,
    activityDescription: 'Grading work at KM 12+400'
  }
];

export const MOCK_DOCUMENTS: ProjectDocument[] = [
  {
    id: 'doc-001',
    name: 'Design Drawings Vol 1',
    type: 'PDF',
    date: '2025-12-17',
    size: '4.2 MB',
    folder: 'Design',
    subject: 'Road Design Drawings',
    tags: ['design', 'drawings', 'volume-1'],
    currentVersion: 1,
    versions: [],
    createdBy: 'admin',
    lastModified: '2025-12-17',
    status: 'Active'
  },
  {
    id: 'doc-002',
    name: 'BOQ Revised',
    type: 'XLS',
    date: '2025-12-18',
    size: '1.8 MB',
    folder: 'Commercial',
    subject: 'Revised Bill of Quantities',
    tags: ['boq', 'commercial', 'revised'],
    refNo: 'BOQ-R-001',
    currentVersion: 2,
    versions: [],
    createdBy: 'admin',
    lastModified: '2025-12-18',
    status: 'Active'
  },
  {
    id: 'doc-003',
    name: 'Daily Report 2025-12-25',
    type: 'PDF',
    date: '2025-12-25',
    size: '2.1 MB',
    folder: 'Progress',
    subject: 'Daily Progress Report',
    tags: ['daily', 'report', 'progress'],
    currentVersion: 1,
    versions: [],
    createdBy: 'admin',
    lastModified: '2025-12-25',
    status: 'Active'
  }
];

export const MOCK_DAILY_WORK_ITEMS: DailyWorkItem[] = [
  {
    id: 'dwi-001',
    location: 'KM 12+200 to 12+400',
    quantity: 450,
    description: 'Excavation work'
  }
];

export const MOCK_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'dr-001',
    date: '2025-12-24',
    reportNumber: 'DR-2025-12-24-001',
    status: 'Submitted',
    submittedBy: 'u3',
    workToday: MOCK_DAILY_WORK_ITEMS
  },
  {
    id: 'dr-002',
    date: '2025-12-25',
    reportNumber: 'DR-2025-12-25-001',
    status: 'Submitted',
    submittedBy: 'u5',
    workToday: [
      {
        id: 'dwi-002',
        location: 'KM 12+400 to 12+500',
        quantity: 800,
        description: 'GSB laying'
      },
      {
        id: 'dwi-003',
        location: 'KM 12+400 to 12+500',
        quantity: 800,
        description: 'Compaction work'
      }
    ]
  }
];

export const MOCK_PRE_CONSTRUCTION: PreConstructionTask[] = [
  {
    id: 'pct-001',
    category: 'Survey',
    description: 'Establish control points and benchmarks for construction',
    status: 'Completed',
    targetDate: '2025-12-15',
    progress: 100,
    estStartDate: '2025-12-10',
    estEndDate: '2025-12-15',
    remarks: 'All control points established successfully'
  },
  {
    id: 'pct-002',
    category: 'Design',
    description: 'Obtain necessary environmental permits',
    status: 'In Progress',
    targetDate: '2025-12-20',
    progress: 65,
    estStartDate: '2025-12-10',
    estEndDate: '2025-12-20',
    remarks: 'Application submitted, awaiting approval'
  },
  {
    id: 'pct-003',
    category: 'Survey',
    description: 'Conduct safety training for all site personnel',
    status: 'Pending',
    targetDate: '2025-12-28',
    progress: 0,
    estStartDate: '2025-12-25',
    estEndDate: '2025-12-28',
    remarks: 'Trainer confirmed for safety induction'
  }
];

export const MOCK_AGENCY_PAYMENTS: AgencyPayment[] = [
  {
    id: 'ap-001',
    agencyId: 'agency-001',
    date: '2025-12-20',
    amount: 1250000,
    reference: 'PAY-2025-12-001',
    type: 'Bill Payment',
    description: 'Payment for excavation work completed',
    status: 'Confirmed'
  },
  {
    id: 'ap-002',
    agencyId: 'agency-002',
    date: '2025-12-22',
    amount: 2100000,
    reference: 'PAY-2025-12-002',
    type: 'Bill Payment',
    description: 'Payment for concrete work completed',
    status: 'Confirmed'
  },
  {
    id: 'ap-003',
    agencyId: 'agency-003',
    date: '2025-12-25',
    amount: 850000,
    reference: 'PAY-2025-12-003',
    type: 'Advance',
    description: 'Advance payment for paving materials',
    status: 'Confirmed'
  }
];

export const MOCK_RESOURCES: ResourceMatrix[] = [
  {
    id: 'res-001',
    name: 'Cement (OPC 53 Grade)',
    type: 'Material',
    category: 'Building Materials',
    unit: 'bag',
    unitCost: 850,
    totalQuantity: 2000,
    availableQuantity: 1250,
    allocatedQuantity: 750,
    status: 'Available',
    criticality: 'High',
    supplier: 'Nepal Cement Ltd',
    leadTime: 3,
    reorderLevel: 300,
    lastUpdated: '2025-12-25',
    notes: 'Standard grade cement for concrete works'
  },
  {
    id: 'res-002',
    name: 'River Sand',
    type: 'Material',
    category: 'Aggregates',
    unit: 'cubic meter',
    unitCost: 2500,
    totalQuantity: 1000,
    availableQuantity: 450,
    allocatedQuantity: 550,
    status: 'Available',
    criticality: 'Medium',
    supplier: 'Local Sand Suppliers',
    leadTime: 2,
    reorderLevel: 150,
    lastUpdated: '2025-12-25',
    notes: 'Well-graded river sand for concrete and mortar'
  },
  {
    id: 'res-003',
    name: 'Coarse Aggregate (20mm)',
    type: 'Material',
    category: 'Aggregates',
    unit: 'cubic meter',
    unitCost: 2200,
    totalQuantity: 1200,
    availableQuantity: 680,
    allocatedQuantity: 520,
    status: 'Available',
    criticality: 'Medium',
    supplier: 'Local Stone Crushers',
    leadTime: 2,
    reorderLevel: 200,
    lastUpdated: '2025-12-25',
    notes: '20mm graded coarse aggregate for concrete'
  },
  {
    id: 'res-004',
    name: 'Steel Reinforcement Bars (Fe500)',
    type: 'Material',
    category: 'Reinforcement',
    unit: 'tonne',
    unitCost: 120000,
    totalQuantity: 100,
    availableQuantity: 45,
    allocatedQuantity: 55,
    status: 'Available',
    criticality: 'High',
    supplier: 'Mukunda Steel',
    leadTime: 5,
    reorderLevel: 15,
    lastUpdated: '2025-12-24',
    notes: 'High yield strength steel bars'
  },
  {
    id: 'res-005',
    name: 'Excavator Operator',
    type: 'Labor',
    category: 'Skilled Labor',
    unit: 'person',
    unitCost: 1500,
    totalQuantity: 10,
    availableQuantity: 7,
    allocatedQuantity: 3,
    status: 'Allocated',
    criticality: 'Medium',
    supplier: 'Internal Team',
    leadTime: 1,
    reorderLevel: 2,
    lastUpdated: '2025-12-25',
    notes: 'Experienced excavator operators'
  },
  {
    id: 'res-006',
    name: 'Hydraulic Excavator (20-25 ton)',
    type: 'Equipment',
    category: 'Earthmoving',
    unit: 'unit',
    unitCost: 18000,
    totalQuantity: 8,
    availableQuantity: 5,
    allocatedQuantity: 3,
    status: 'Allocated',
    criticality: 'High',
    supplier: 'Equipment Rental Co.',
    leadTime: 2,
    reorderLevel: 1,
    lastUpdated: '2025-12-25',
    notes: 'Modern hydraulic excavators with various attachments'
  }
];

export const MOCK_RESOURCE_ALLOCATIONS: ResourceAllocation[] = [
  {
    id: 'alloc-001',
    resourceId: 'res-001',
    resourceType: 'Material',
    allocatedTo: 'st-003',
    allocatedQuantity: 300,
    startDate: '2026-01-05',
    endDate: '2026-01-15',
    status: 'Planned',
    notes: 'For GSB laying concrete works'
  },
  {
    id: 'alloc-002',
    resourceId: 'res-006',
    resourceType: 'Equipment',
    allocatedTo: 'st-002',
    allocatedQuantity: 1,
    startDate: '2025-12-20',
    endDate: '2026-01-10',
    status: 'In Progress',
    notes: 'Excavation work for current phase'
  },
  {
    id: 'alloc-003',
    resourceId: 'res-005',
    resourceType: 'Labor',
    allocatedTo: 'st-002',
    allocatedQuantity: 2,
    startDate: '2025-12-20',
    endDate: '2026-01-10',
    status: 'In Progress',
    notes: 'Skilled operators for excavators'
  }
];

export const MOCK_LINEAR_WORK_LOGS: LinearWorkLog[] = [
  {
    id: 'lwl-001',
    category: 'Pavement',
    layer: 'GSB',
    startChainage: 12400,
    endChainage: 12500,
    date: '2025-12-24',
    side: 'Both',
    status: 'Completed'
  },
  {
    id: 'lwl-002',
    category: 'Pavement',
    layer: 'PCC Bedding',
    startChainage: 12500,
    endChainage: 12550,
    date: '2025-12-25',
    side: 'Both',
    status: 'Completed'
  },
  {
    id: 'lwl-003',
    category: 'Pavement',
    layer: 'Asphalt',
    startChainage: 12550,
    endChainage: 12600,
    date: '2025-12-26',
    side: 'Both',
    status: 'In Progress'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Urban Resilience and Livability Improvement Project (URLIP)',
    code: 'URLIP/TT/CWO1',
    logo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Tilottama Municipality, Rupandehi',
    client: 'Tilottama Municipality',
    engineer: 'BDA-BN-UDAYA JV',
    contractor: 'M/S LONGJHAIN-SAGUN Joint Venture',
    contractNo: 'URLIP/TT/CWO1',
    startDate: '2025-12-17',
    endDate: '2027-12-17',
    lastSynced: new Date().toISOString(),
    boq: MOCK_BOQ_ITEMS,
    variationOrders: MOCK_VARIATION_ORDERS,
    rfis: MOCK_RFIS,
    labTests: MOCK_LAB_TESTS,
    schedule: MOCK_SCHEDULE_TASKS,
    inventory: MOCK_INVENTORY,
    inventoryTransactions: [],
    vehicles: MOCK_VEHICLES,
    vehicleLogs: MOCK_VEHICLE_LOGS,
    documents: MOCK_DOCUMENTS,
    dailyReports: MOCK_DAILY_REPORTS,
    preConstruction: MOCK_PRE_CONSTRUCTION,
    structures: [
      {
        id: 'str-001',
        name: '2x2 Box Culvert',
        type: 'Box Culvert',
        location: '12+400',
        status: 'Completed',
        completionDate: '2025-12-28',
        components: [
          {
            id: 'comp-001',
            name: 'Excavation',
            unit: 'cum',
            totalQuantity: 120,
            completedQuantity: 120,
            verifiedQuantity: 120,
            workLogs: [
              {
                id: 'wl-001',
                date: '2025-12-25',
                quantity: 60,
                remarks: 'Initial excavation completed',
                subcontractorId: 'sub-001',
                boqItemId: 'boq-001',
                rfiId: '',
                labTestId: ''
              },
              {
                id: 'wl-002',
                date: '2025-12-27',
                quantity: 60,
                remarks: 'Final excavation completed',
                subcontractorId: 'sub-001',
                boqItemId: 'boq-001',
                rfiId: '',
                labTestId: ''
              }
            ]
          },
          {
            id: 'comp-002',
            name: 'Reinforcement',
            unit: 'kg',
            totalQuantity: 2500,
            completedQuantity: 2500,
            verifiedQuantity: 2500,
            workLogs: [
              {
                id: 'wl-003',
                date: '2025-12-28',
                quantity: 2500,
                remarks: 'All reinforcement installed',
                subcontractorId: 'sub-002',
                boqItemId: 'boq-002',
                rfiId: '',
                labTestId: ''
              }
            ]
          }
        ]
      },
      {
        id: 'str-002',
        name: 'Retaining Wall',
        type: 'Retaining Wall',
        location: '15+200',
        status: 'In Progress',
        components: [
          {
            id: 'comp-003',
            name: 'Foundation',
            unit: 'cum',
            totalQuantity: 80,
            completedQuantity: 60,
            verifiedQuantity: 60,
            workLogs: [
              {
                id: 'wl-004',
                date: '2025-12-26',
                quantity: 60,
                remarks: 'Foundation concrete poured',
                subcontractorId: 'sub-001',
                boqItemId: 'boq-003',
                rfiId: '',
                labTestId: ''
              }
            ]
          }
        ]
      }
    ],
    landParcels: [],
    mapOverlays: [],
    hindrances: [],
    ncrs: [],
    contractBills: [],
    measurementSheets: [],
    staffLocations: [],
    agencies: [
      {
        id: 'agency-001',
        name: 'ABC Excavation Services',
        trade: 'Earthwork',
        contactPerson: 'Rajesh Kumar',
        phone: '+977-9812345678',
        email: 'rajesh@abcexcavation.com',
        address: 'Kathmandu, Nepal',
        status: 'Active',
        contractValue: 5000000,
        startDate: '2025-12-17',
        endDate: '2027-12-17',
        avatar: 'https://ui-avatars.com/api/?name=ABC+Excavation&background=random',
        type: 'subcontractor'
      },
      {
        id: 'agency-002',
        name: 'XYZ Concrete Works',
        trade: 'Structural',
        contactPerson: 'Sita Sharma',
        phone: '+977-9809876543',
        email: 'sita@xyzconcrete.com',
        address: 'Pokhara, Nepal',
        status: 'Active',
        contractValue: 7500000,
        startDate: '2025-12-17',
        endDate: '2027-12-17',
        avatar: 'https://ui-avatars.com/api/?name=XYZ+Concrete&background=random',
        type: 'subcontractor'
      },
      {
        id: 'agency-003',
        name: 'PQR Paving Solutions',
        trade: 'Pavement',
        contactPerson: 'Hari Gautam',
        phone: '+977-9845678901',
        email: 'hari@pqrpaving.com',
        address: 'Chitwan, Nepal',
        status: 'Active',
        contractValue: 6200000,
        startDate: '2025-12-17',
        endDate: '2027-12-17',
        avatar: 'https://ui-avatars.com/api/?name=PQR+Paving&background=random',
        type: 'subcontractor'
      }
    ],
    agencyPayments: MOCK_AGENCY_PAYMENTS,
    linearWorks: MOCK_LINEAR_WORK_LOGS,
    resources: MOCK_RESOURCES,
    resourceAllocations: MOCK_RESOURCE_ALLOCATIONS
  },
  {
    id: 'proj-002',
    name: 'National Highway Expansion Project',
    code: 'NHEP/KTM/PH2',
    logo: 'https://images.unsplash.com/photo-1503758678766-5b8e0b3bde90?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Kathmandu Valley, Bagmati Province',
    client: 'Department of Roads',
    engineer: 'Asian Development Bank Consultants',
    contractor: 'M/S Himalayan Infrastructure Pvt Ltd',
    contractNo: 'NHEP/KTM/PH2',
    startDate: '2025-11-01',
    endDate: '2027-10-31',
    lastSynced: new Date().toISOString(),
    boq: [
      {
        id: 'boq-nh-001',
        itemNo: '1.1',
        description: 'Bituminous road construction - 75mm BC + 40mm SMA',
        unit: 'sq.m',
        quantity: 85000,
        rate: 1200,
        amount: 85000 * 1200,
        location: 'Ring Road Extension',
        completedQuantity: 35000,
        variationQuantity: 0,
        revisedQuantity: 85000,
        category: 'Pavement'
      },
      {
        id: 'boq-nh-002',
        itemNo: '2.1',
        description: 'Reinforced concrete bridge (30m span)',
        unit: 'm',
        quantity: 30,
        rate: 250000,
        amount: 30 * 250000,
        location: 'Bishnumati River Crossing',
        completedQuantity: 20,
        variationQuantity: 0,
        revisedQuantity: 30,
        category: 'Structures'
      }
    ],
    variationOrders: [
      {
        id: 'vo-nh-001',
        voNumber: 'NH-VO-001',
        title: 'Additional guardrails installation',
        date: '2025-12-15',
        status: 'Approved',
        items: [
          {
            id: 'vi-nh-001',
            boqItemId: 'boq-nh-001',
            isNewItem: false,
            description: 'Additional safety barriers',
            unit: 'm',
            quantityDelta: 1200,
            rate: 850
          }
        ],
        reason: 'Safety requirements as per new DOT standards',
        totalImpact: 1020000
      }
    ],
    rfis: [
      {
        id: 'rfi-nh-001',
        rfiNumber: 'NHR-001',
        date: '2025-12-20',
        location: 'Ring Road Extension',
        description: 'Request for approval of modified asphalt mix design',
        status: RFIStatus.PENDING_INSPECTION,
        requestedBy: 'u3',
        inspectionDate: '2025-12-27',
        workflowLog: []
      }
    ],
    labTests: [
      {
        id: 'lt-nh-001',
        testName: 'Asphalt Marshall Stability Test',
        category: 'Asphalt',
        sampleId: 'AT-001',
        date: '2025-12-22',
        location: 'Mix Plant',
        result: 'Pass',
        technician: 'u4'
      }
    ],
    schedule: [
      {
        id: 'st-nh-001',
        name: 'Asphalt Laying',
        startDate: '2025-12-01',
        endDate: '2026-03-31',
        progress: 41,
        status: 'On Track',
        dependencies: [],
        assignedTo: ['u5'],
        isCritical: true
      },
      {
        id: 'st-nh-002',
        name: 'Bridge Construction',
        startDate: '2025-11-15',
        endDate: '2026-05-15',
        progress: 67,
        status: 'Delayed',
        dependencies: [],
        assignedTo: ['u3'],
        isCritical: true
      }
    ],
    inventory: [
      {
        id: 'inv-nh-001',
        itemName: 'Asphalt (PG 64-22)',
        quantity: 1200,
        unit: 'tonnes',
        location: 'Asphalt Plant',
        lastUpdated: '2025-12-25',
        reorderLevel: 300
      },
      {
        id: 'inv-nh-002',
        itemName: 'Reinforcement Steel (Fe500)',
        quantity: 85,
        unit: 'tonnes',
        location: 'Steel Yard',
        lastUpdated: '2025-12-24',
        reorderLevel: 20
      }
    ],
    inventoryTransactions: [],
    vehicles: [
      {
        id: 'v-nh-001',
        plateNumber: 'BA 2 KHA 1567',
        type: 'Asphalt Paver',
        driver: 'Gopal Thapa',
        status: 'Active',
        geofenceStatus: 'Inside',
        agencyId: 'agency-nh-001'
      },
      {
        id: 'v-nh-002',
        plateNumber: 'BA 2 KHA 1568',
        type: 'Roller (12 Ton)',
        driver: 'Krishna Shrestha',
        status: 'Active',
        geofenceStatus: 'Inside',
        agencyId: 'agency-nh-001'
      }
    ],
    vehicleLogs: [
      {
        id: 'vl-nh-001',
        vehicleId: 'v-nh-001',
        plateNumber: 'BA 2 KHA 1567',
        date: '2025-12-24',
        startKm: 15600,
        endKm: 15720,
        totalKm: 120,
        fuelConsumed: 85,
        workingHours: 9.0,
        activityDescription: 'Asphalt laying on Ring Road'
      }
    ],
    documents: [
      {
        id: 'doc-nh-001',
        name: 'Asphalt Mix Design Report',
        type: 'PDF',
        date: '2025-12-15',
        size: '2.5 MB',
        folder: 'Technical',
        subject: 'Modified asphalt mix design approval',
        tags: ['asphalt', 'mix-design', 'approval'],
        currentVersion: 1,
        versions: [],
        createdBy: 'admin',
        lastModified: '2025-12-15',
        status: 'Active'
      }
    ],
    dailyReports: [
      {
        id: 'dr-nh-001',
        date: '2025-12-25',
        reportNumber: 'DR-NH-2025-12-25-001',
        status: 'Submitted',
        submittedBy: 'u3',
        workToday: [
          {
            id: 'dwi-nh-001',
            location: 'Ring Road Extension (K15+000-K15+500)',
            quantity: 2500,
            description: 'Asphalt laying'
          }
        ]
      }
    ],
    preConstruction: [
      {
        id: 'pct-nh-001',
        category: 'Survey',
        description: 'Traffic management plan implementation',
        status: 'Completed',
        targetDate: '2025-11-10',
        progress: 100,
        estStartDate: '2025-11-05',
        estEndDate: '2025-11-10',
        remarks: 'Traffic diversions established successfully'
      }
    ],
    structures: [
      {
        id: 'str-nh-001',
        name: 'Bishnumati River Bridge',
        type: 'Major Bridge',
        location: 'Kathmandu-Bhaktapur Road',
        status: 'In Progress',
        components: [
          {
            id: 'comp-nh-001',
            name: 'Pile Foundation',
            unit: 'nos',
            totalQuantity: 24,
            completedQuantity: 24,
            verifiedQuantity: 24,
            workLogs: [
              {
                id: 'wl-nh-001',
                date: '2025-12-10',
                quantity: 24,
                remarks: 'All pile foundations completed',
                subcontractorId: 'sub-nh-001',
                boqItemId: 'boq-nh-002',
                rfiId: '',
                labTestId: ''
              }
            ]
          }
        ]
      }
    ],
    landParcels: [],
    mapOverlays: [],
    hindrances: [],
    ncrs: [],
    contractBills: [],
    measurementSheets: [],
    staffLocations: [
      {
        id: 'sl-nh-001',
        userId: 'u3',
        userName: 'John Doe',
        role: 'Site Engineer',
        latitude: 27.7172,
        longitude: 85.324,
        status: 'Active',
        timestamp: new Date().toISOString()
      }
    ],
    agencies: [
      {
        id: 'agency-nh-001',
        name: 'Asphalt Works Pvt Ltd',
        trade: 'Pavement',
        contactPerson: 'Bikash Adhikari',
        phone: '+977-9841234567',
        email: 'bikash@asphaltworks.com.np',
        address: 'Lalitpur, Nepal',
        status: 'Active',
        contractValue: 8500000,
        startDate: '2025-11-01',
        endDate: '2027-10-31',
        avatar: 'https://ui-avatars.com/api/?name=Asphalt+Works&background=random',
        type: 'subcontractor'
      }
    ],
    agencyPayments: [
      {
        id: 'ap-nh-001',
        agencyId: 'agency-nh-001',
        date: '2025-12-20',
        amount: 2100000,
        reference: 'NH-PAY-2025-12-001',
        type: 'Bill Payment',
        description: 'Payment for asphalt laying work',
        status: 'Confirmed'
      }
    ],
    linearWorks: [
      {
        id: 'lwl-nh-001',
        category: 'Pavement',
        layer: 'Binder Course',
        startChainage: 15000,
        endChainage: 15500,
        date: '2025-12-24',
        side: 'Both',
        status: 'Completed'
      }
    ],
    resources: [
      {
        id: 'res-nh-001',
        name: 'Asphalt (PG 64-22)',
        type: 'Material',
        category: 'Asphalt',
        unit: 'tonne',
        unitCost: 120000,
        totalQuantity: 2000,
        availableQuantity: 1200,
        allocatedQuantity: 800,
        status: 'Available',
        criticality: 'High',
        supplier: 'Local Asphalt Plant',
        leadTime: 1,
        reorderLevel: 300,
        lastUpdated: '2025-12-25',
        notes: 'Polymer modified asphalt binder'
      }
    ],
    resourceAllocations: [
      {
        id: 'alloc-nh-001',
        resourceId: 'res-nh-001',
        resourceType: 'Material',
        allocatedTo: 'st-nh-001',
        allocatedQuantity: 500,
        startDate: '2025-12-20',
        endDate: '2026-01-20',
        status: 'In Progress',
        notes: 'Asphalt allocation for Ring Road extension'
      }
    ]
  },
  {
    id: 'proj-003',
    name: 'Rural Connectivity Improvement Project',
    code: 'RCIP/DAILEKH/RWP3',
    logo: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Dailekh District, Karnali Province',
    client: 'Rural Access Program',
    engineer: 'Karnali Engineering Consultancy',
    contractor: 'M/S Mountain Road Builders',
    contractNo: 'RCIP/DAILEKH/RWP3',
    startDate: '2025-10-15',
    endDate: '2027-04-15',
    lastSynced: new Date().toISOString(),
    boq: [
      {
        id: 'boq-rc-001',
        itemNo: '1.1',
        description: 'Gravel road construction with stone pitching',
        unit: 'km',
        quantity: 25,
        rate: 4500000,
        amount: 25 * 4500000,
        location: 'Dailekh-Chandannath Road',
        completedQuantity: 12,
        variationQuantity: 0,
        revisedQuantity: 25,
        category: 'Earthwork'
      }
    ],
    variationOrders: [],
    rfis: [
      {
        id: 'rfi-rc-001',
        rfiNumber: 'RCR-001',
        date: '2025-12-22',
        location: 'Chandannath Rural Municipality',
        description: 'Request for approval of alternative stone material source',
        status: RFIStatus.OPEN,
        requestedBy: 'u3',
        inspectionDate: '2025-12-29',
        workflowLog: []
      }
    ],
    labTests: [
      {
        id: 'lt-rc-001',
        testName: 'Stone Aggregate Crushing Value',
        category: 'Aggregate',
        sampleId: 'SA-001',
        date: '2025-12-20',
        location: 'Local Quarry',
        result: 'Pass',
        technician: 'u4'
      }
    ],
    schedule: [
      {
        id: 'st-rc-001',
        name: 'Road Construction',
        startDate: '2025-11-01',
        endDate: '2026-08-31',
        progress: 48,
        status: 'On Track',
        dependencies: [],
        assignedTo: ['u5'],
        isCritical: true
      }
    ],
    inventory: [
      {
        id: 'inv-rc-001',
        itemName: 'Stone Aggregate (20mm)',
        quantity: 1200,
        unit: 'cubic meter',
        location: 'Stockyard',
        lastUpdated: '2025-12-25',
        reorderLevel: 200
      }
    ],
    inventoryTransactions: [],
    vehicles: [
      {
        id: 'v-rc-001',
        plateNumber: 'BHA 1 CHA 1234',
        type: 'Dump Truck',
        driver: 'Baburam BK',
        status: 'Active',
        geofenceStatus: 'Outside',
        agencyId: 'agency-rc-001'
      }
    ],
    vehicleLogs: [
      {
        id: 'vl-rc-001',
        vehicleId: 'v-rc-001',
        plateNumber: 'BHA 1 CHA 1234',
        date: '2025-12-25',
        startKm: 8500,
        endKm: 8750,
        totalKm: 250,
        fuelConsumed: 120,
        workingHours: 10.5,
        activityDescription: 'Material transportation'
      }
    ],
    documents: [
      {
        id: 'doc-rc-001',
        name: 'Environmental Clearance Certificate',
        type: 'PDF',
        date: '2025-10-20',
        size: '1.8 MB',
        folder: 'Compliance',
        subject: 'Environmental clearance for road construction',
        tags: ['environment', 'clearance', 'compliance'],
        currentVersion: 1,
        versions: [],
        createdBy: 'admin',
        lastModified: '2025-10-20',
        status: 'Active'
      }
    ],
    dailyReports: [
      {
        id: 'dr-rc-001',
        date: '2025-12-25',
        reportNumber: 'DR-RC-2025-12-25-001',
        status: 'Submitted',
        submittedBy: 'u5',
        workToday: [
          {
            id: 'dwi-rc-001',
            location: 'Dailekh-Chandannath Road (K12+000-K12+500)',
            quantity: 0.5,
            description: 'Road construction'
          }
        ]
      }
    ],
    preConstruction: [
      {
        id: 'pct-rc-001',
        category: 'Land Acquisition',
        description: 'Finalize land acquisition for road alignment',
        status: 'Completed',
        targetDate: '2025-10-10',
        progress: 100,
        estStartDate: '2025-09-15',
        estEndDate: '2025-10-10',
        remarks: 'All land acquisition completed'
      }
    ],
    structures: [
      {
        id: 'str-rc-001',
        name: 'Mountain Stream Culvert',
        type: 'Pipe Culvert',
        location: 'K15+200',
        status: 'Not Started',
        components: []
      }
    ],
    landParcels: [
      {
        id: 'lp-rc-001',
        parcelNumber: 'DAIL-001',
        area: 1.2,
        unit: 'hectares',
        ownerName: 'Gopal Tamang',
        acquisitionStatus: 'Acquired',
        compensationAmount: 450000,
        acquisitionDate: '2025-10-05'
      }
    ],
    mapOverlays: [],
    hindrances: [],
    ncrs: [],
    contractBills: [],
    measurementSheets: [],
    staffLocations: [
      {
        id: 'sl-rc-001',
        userId: 'u5',
        userName: 'Vikram Singh',
        role: 'Supervisor',
        latitude: 28.9167,
        longitude: 81.7167,
        status: 'Active',
        timestamp: new Date().toISOString()
      }
    ],
    agencies: [
      {
        id: 'agency-rc-001',
        name: 'Mountain Transport Services',
        trade: 'Logistics',
        contactPerson: 'Kiran Shahi',
        phone: '+977-9865432109',
        email: 'kiran@mountaintransport.com.np',
        address: 'Dailekh, Nepal',
        status: 'Active',
        contractValue: 1200000,
        startDate: '2025-10-15',
        endDate: '2027-04-15',
        avatar: 'https://ui-avatars.com/api/?name=Mountain+Transport&background=random',
        type: 'agency'
      }
    ],
    agencyPayments: [
      {
        id: 'ap-rc-001',
        agencyId: 'agency-rc-001',
        date: '2025-12-15',
        amount: 350000,
        reference: 'RC-PAY-2025-12-001',
        type: 'Bill Payment',
        description: 'Payment for material transportation',
        status: 'Confirmed'
      }
    ],
    linearWorks: [
      {
        id: 'lwl-rc-001',
        category: 'Earthwork',
        layer: 'Formation',
        startChainage: 12000,
        endChainage: 12500,
        date: '2025-12-20',
        side: 'Both',
        status: 'Completed'
      }
    ],
    resources: [
      {
        id: 'res-rc-001',
        name: 'Stone Aggregate',
        type: 'Material',
        category: 'Aggregates',
        unit: 'cubic meter',
        unitCost: 2200,
        totalQuantity: 1500,
        availableQuantity: 1200,
        allocatedQuantity: 300,
        status: 'Available',
        criticality: 'Medium',
        supplier: 'Local Quarry',
        leadTime: 2,
        reorderLevel: 200,
        lastUpdated: '2025-12-25',
        notes: 'Local stone aggregate for road construction'
      }
    ],
    resourceAllocations: [
      {
        id: 'alloc-rc-001',
        resourceId: 'res-rc-001',
        resourceType: 'Material',
        allocatedTo: 'st-rc-001',
        allocatedQuantity: 300,
        startDate: '2025-12-15',
        endDate: '2026-01-15',
        status: 'In Progress',
        notes: 'Stone aggregate allocation for road construction'
      }
    ]
  }
];