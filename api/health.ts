// api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './_utils/dbConnect';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { conn } = await connectToDatabase();
    const dbStatus = conn.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
}