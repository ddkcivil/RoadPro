// api/users/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../_utils/dbConnect';
import mongoose from 'mongoose';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { User } = await connectToDatabase();
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { User } = await connectToDatabase();
      const { name, email, phone, role } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
      
      const user = new User({
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone,
        role: role || 'SITE_ENGINEER', // Default role if not provided
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });
      
      await user.save();
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}