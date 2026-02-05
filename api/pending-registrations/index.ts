// api/pending-registrations/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../_utils/dbConnect';
import mongoose from 'mongoose';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { PendingRegistration } = await connectToDatabase();
      const pending = await PendingRegistration.find({ status: 'pending' });
      res.status(200).json(pending);
    } catch (error: any) {
      console.error('Failed to fetch pending registrations:', error);
      res.status(500).json({ error: 'Failed to fetch pending registrations', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { PendingRegistration } = await connectToDatabase();
      const { name, email, phone, requestedRole } = req.body;

      if (!name || !email || !requestedRole) {
        return res.status(400).json({ error: 'Name, email, and requested role are required' });
      }
      
      // Check if registration already exists
      const existing = await PendingRegistration.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ error: 'Registration already pending' });
      }
      
      const registration = new PendingRegistration({
        id: `pending-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone,
        requestedRole
      });
      
      await registration.save();
      res.status(201).json(registration);
    } catch (error: any) {
      console.error('Failed to submit registration:', error);
      res.status(500).json({ error: 'Failed to submit registration', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
