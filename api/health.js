/**
 * Vercel Serverless Function: GET /api/health
 * Returns immediate 200 OK health status for PlastiVision AI.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'running',
    model_loaded: true,
    model_error: null,
    backend: 'Vercel Serverless AI / Hybrid Engine',
    classes: ['Biodegradable', 'Non_Biodegradable'],
    timestamp: new Date().toISOString(),
  });
}
