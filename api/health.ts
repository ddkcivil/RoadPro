// api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_utils/dbConnect.js';
import { withErrorHandler } from './_utils/errorHandler.js';

export default withErrorHandler(async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mongoose } = await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected (MongoDB)'
      });
    } else {
      res.status(500).json({ error: 'Database not connected' });
    }
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
})
