// api/pending-registrations/[id]/approve.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../_utils/dbConnect';
import mongoose from 'mongoose';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { User, PendingRegistration } = await connectToDatabase();
    const { id } = req.query; // Access id from req.query for dynamic routes

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Registration ID is required' });
    }

    const registration = await PendingRegistration.findById(id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    // Create user from registration
    const user = new User({
      id: `user-${Date.now()}`,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      role: registration.requestedRole,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registration.name)}&background=random`
    });
    
    await user.save();
    
    // Delete pending registration
    await PendingRegistration.findByIdAndDelete(id);
    
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Failed to approve registration:', error);
    res.status(500).json({ error: 'Failed to approve registration', details: error.message });
  }
}
