// api/pending-registrations/[id]/approve.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../_utils/dbConnect.js';
import bcrypt from 'bcrypt';
import { withErrorHandler } from '../../_utils/errorHandler.js';

export default withErrorHandler(async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const { User, PendingRegistration } = await connectToDatabase();

    // Find the pending registration
    const pendingReg = await PendingRegistration.findOne({ id });
    if (!pendingReg) {
      res.status(404).json({ error: 'Pending registration not found' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: pendingReg.email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password (using a default password, in real app this should be set by user)
    const defaultPassword = 'password123'; // TODO: Implement proper password setting
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create the user
    const newUser = new User({
      id: pendingReg.id,
      name: pendingReg.name,
      email: pendingReg.email.toLowerCase(),
      phone: pendingReg.phone,
      password: hashedPassword,
      role: pendingReg.requestedRole,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pendingReg.name)}&background=random`
    });

    await newUser.save();

    // Delete the pending registration
    await PendingRegistration.deleteOne({ id });

    res.status(200).json({
      message: 'Registration approved successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: 'Failed to approve registration', details: error.message });
  }
});
