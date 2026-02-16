import { Sequelize, DataTypes, Model } from 'sequelize';

// Use SQLite for local development, MySQL for production
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

let sequelize: Sequelize;

if (isProduction) {
  // Production: Use MySQL
  const mysqlUri = process.env.MYSQL_URI;
  if (!mysqlUri) {
    console.error('MYSQL_URI environment variable is not defined for production!');
    throw new Error('MYSQL_URI environment variable is not defined!');
  }
  sequelize = new Sequelize(mysqlUri, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false,
      // },
    },
  });
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  });
}

// User Model
class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public password!: string;
  public role!: string;
  public avatar?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true // Sequelize will manage createdAt/updatedAt
});

// PendingRegistration Model
class PendingRegistration extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone?: string;
  public requestedRole!: string;
  public status?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PendingRegistration.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
  },
  requestedRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'PendingRegistration',
  tableName: 'pending_registrations',
  timestamps: true
});

// Project Model (complex types stored as JSON)
class Project extends Model {
  public id!: string;
  public name!: string;
  public code?: string;
  public location?: string;
  public contractor?: string;
  public startDate?: Date;
  public endDate?: Date;
  public contractPeriod?: string;
  public projectManager?: string;
  public supervisor?: string;
  public consultantName?: string;
  public clientName?: string;
  public logo?: string;
  public client!: string;
  public engineer?: string;
  public contractNo?: string;
  public boq?: any;
  public variationOrders?: any;
  public rfis?: any;
  public labTests?: any;
  public schedule?: any;
  public structures?: any;
  public agencies?: any;
  public agencyPayments?: any;
  public agencyMaterials?: any;
  public agencyBills?: any;
  public materials?: any;
  public subcontractorPayments?: any;
  public linearWorks?: any;
  public inventory?: any;
  public purchaseOrders?: any;
  public inventoryTransactions?: any;
  public vehicles?: any;
  public vehicleLogs?: any;
  public documents?: any;
  public sitePhotos?: any;
  public dailyReports?: any;
  public preConstruction?: any;
  public preConstructionTasks?: any;
  public landParcels?: any;
  public mapOverlays?: any;
  public kmlData?: any;
  public hindrances?: any;
  public ncrs?: any;
  public contractBills?: any;
  public subcontractorBills?: any;
  public measurementSheets?: any;
  public staffLocations?: any;
  public environmentRegistry?: any;
  public weather?: any;
  public lastSynced?: string;
  public spreadsheetId?: string;
  public settings?: any;
  public resources?: any;
  public resourceAllocations?: any;
  public milestones?: any;
  public comments?: any;
  public checklists?: any;
  public defects?: any;
  public complianceWorkflows?: any;
  public auditLogs?: any;
  public structureTemplates?: any;
  public accountingIntegrations?: any;
  public accountingTransactions?: any;
  public personnel?: any;
  public fleet?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init({
  id: { type: DataTypes.STRING, primaryKey: true, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: DataTypes.STRING,
  location: DataTypes.STRING,
  contractor: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  contractPeriod: DataTypes.STRING,
  projectManager: DataTypes.STRING,
  supervisor: DataTypes.STRING,
  consultantName: DataTypes.STRING,
  clientName: DataTypes.STRING,
  logo: DataTypes.STRING,
  client: { type: DataTypes.STRING, allowNull: false },
  engineer: DataTypes.STRING,
  contractNo: DataTypes.STRING,
  // Complex types stored as JSON
  boq: { type: DataTypes.JSON, defaultValue: [] },
  variationOrders: { type: DataTypes.JSON, defaultValue: [] },
  rfis: { type: DataTypes.JSON, defaultValue: [] },
  labTests: { type: DataTypes.JSON, defaultValue: [] },
  schedule: { type: DataTypes.JSON, defaultValue: [] },
  structures: { type: DataTypes.JSON, defaultValue: [] },
  agencies: { type: DataTypes.JSON, defaultValue: [] },
  agencyPayments: { type: DataTypes.JSON, defaultValue: [] },
  agencyMaterials: { type: DataTypes.JSON, defaultValue: [] },
  agencyBills: { type: DataTypes.JSON, defaultValue: [] },
  materials: { type: DataTypes.JSON, defaultValue: [] },
  subcontractorPayments: { type: DataTypes.JSON, defaultValue: [] },
  linearWorks: { type: DataTypes.JSON, defaultValue: [] },
  inventory: { type: DataTypes.JSON, defaultValue: [] },
  purchaseOrders: { type: DataTypes.JSON, defaultValue: [] },
  inventoryTransactions: { type: DataTypes.JSON, defaultValue: [] },
  vehicles: { type: DataTypes.JSON, defaultValue: [] },
  vehicleLogs: { type: DataTypes.JSON, defaultValue: [] },
  documents: { type: DataTypes.JSON, defaultValue: [] },
  sitePhotos: { type: DataTypes.JSON, defaultValue: [] },
  dailyReports: { type: DataTypes.JSON, defaultValue: [] },
  preConstruction: { type: DataTypes.JSON, defaultValue: [] },
  preConstructionTasks: { type: DataTypes.JSON, defaultValue: [] },
  landParcels: { type: DataTypes.JSON, defaultValue: [] },
  mapOverlays: { type: DataTypes.JSON, defaultValue: [] },
  kmlData: { type: DataTypes.JSON, defaultValue: [] },
  hindrances: { type: DataTypes.JSON, defaultValue: [] },
  ncrs: { type: DataTypes.JSON, defaultValue: [] },
  contractBills: { type: DataTypes.JSON, defaultValue: [] },
  subcontractorBills: { type: DataTypes.JSON, defaultValue: [] },
  measurementSheets: { type: DataTypes.JSON, defaultValue: [] },
  staffLocations: { type: DataTypes.JSON, defaultValue: [] },
  environmentRegistry: { type: DataTypes.JSON, defaultValue: {} },
  weather: { type: DataTypes.JSON, defaultValue: {} },
  lastSynced: DataTypes.STRING,
  spreadsheetId: DataTypes.STRING,
  settings: { type: DataTypes.JSON, defaultValue: {} },
  resources: { type: DataTypes.JSON, defaultValue: [] },
  resourceAllocations: { type: DataTypes.JSON, defaultValue: [] },
  milestones: { type: DataTypes.JSON, defaultValue: [] },
  comments: { type: DataTypes.JSON, defaultValue: [] },
  checklists: { type: DataTypes.JSON, defaultValue: [] },
  defects: { type: DataTypes.JSON, defaultValue: [] },
  complianceWorkflows: { type: DataTypes.JSON, defaultValue: [] },
  auditLogs: { type: DataTypes.JSON, defaultValue: [] },
  structureTemplates: { type: DataTypes.JSON, defaultValue: [] },
  accountingIntegrations: { type: DataTypes.JSON, defaultValue: [] },
  accountingTransactions: { type: DataTypes.JSON, defaultValue: [] },
  personnel: { type: DataTypes.JSON, defaultValue: [] },
  fleet: { type: DataTypes.JSON, defaultValue: [] },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  timestamps: true
});

export async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection has been established successfully.');
    // Synchronize all models
    // `alter: true` will update table schemas without dropping them
    // Use `force: true` only in development to drop and recreate tables on every sync
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
    return { sequelize, User, PendingRegistration, Project };
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}
