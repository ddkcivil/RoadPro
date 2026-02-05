// api/_utils/dbConnect.ts
import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Pending Registration Schema
const pendingRegistrationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  requestedRole: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Project Schema
const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String },
  location: { type: String },
  contractor: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  client: { type: String },
  engineer: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Models (ensure models are not recompiled)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const PendingRegistration = mongoose.models.PendingRegistration || mongoose.model('PendingRegistration', pendingRegistrationSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

// Cached connection for serverless functions
let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return { conn: cachedDb, User, PendingRegistration, Project };
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined!');
  }

  const conn = await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedDb = conn;
  return { conn, User, PendingRegistration, Project };
}