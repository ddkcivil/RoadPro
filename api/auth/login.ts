// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../_utils/dbConnect';
import mongoose from 'mongoose'; // Import mongoose to use its types

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { User } = await connectToDatabase();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user data (without password, as it's not stored in this schema)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    
    res.status(200).json({
      success: true,
      user: userData,
      token: `token-${user.id}-${Date.now()}` // Simulated token
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}
