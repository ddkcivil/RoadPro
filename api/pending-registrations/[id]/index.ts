// api/pending-registrations/[id]/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../_utils/dbConnect.js';
import { withErrorHandler } from '../../_utils/errorHandler.js';

export default withErrorHandler(async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Registration ID is required' });
    return;
  }

  try {
    const { PendingRegistration } = await connectToDatabase();

    // Find and delete the pending registration
    const deletedReg = await PendingRegistration.findOneAndDelete({ id });
    if (!deletedReg) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    res.status(200).json({
      message: 'Pending registration deleted successfully',
      deletedRegistration: {
        id: deletedReg.id,
        name: deletedReg.name,
        email: deletedReg.email
      }
    });
  } catch (error: any) {
    console.error('Failed to delete pending registration:', error);
    res.status(500).json({ error: 'Failed to delete pending registration', details: error.message });
  }
});
