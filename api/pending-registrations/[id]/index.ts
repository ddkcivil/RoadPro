// api/pending-registrations/[id]/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../../_utils/dbConnect';
import mongoose from 'mongoose';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { PendingRegistration } = await connectToDatabase();
    const { id } = req.query; // Access id from req.query for dynamic routes

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Registration ID is required' });
    }

    const result = await PendingRegistration.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.status(204).send(''); // 204 No Content for successful deletion
  } catch (error: any) {
    console.error('Failed to reject registration:', error);
    res.status(500).json({ error: 'Failed to reject registration', details: error.message });
  }
}
