import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────
const SELLCO_BASE_URL = process.env.SELLCO_API_URL || 'https://api.sellco.ai';
const SELLCO_API_KEY  = process.env.SELLCO_API_KEY  || '';

/**
 * Forward a request to the Sellco API and return the parsed JSON response.
 * Throws on non-2xx responses so callers can handle errors uniformly.
 */
async function sellcoFetch(path, options = {}) {
  const url = `${SELLCO_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(SELLCO_API_KEY ? { Authorization: `Bearer ${SELLCO_API_KEY}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const text = await response.text();
    const err  = new Error(`Sellco API error ${response.status}: ${text}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /amazon
 * Healthcheck endpoint — also returns a summary of available Amazon data
 * endpoints exposed by this MCP server.
 */
app.get('/amazon', (_req, res) => {
  res.status(200).json({
    service: 'sellco-amazon-mcp',
    version: '2.0.0',
    status:  'ok',
    endpoints: [
      'GET  /amazon',
      'GET  /amazon/listings',
      'GET  /amazon/orders',
      'GET  /amazon/inventory',
      'GET  /amazon/analytics',
    ],
  });
});

/**
 * GET /amazon/listings
 * Returns Amazon product listings from the Sellco platform.
 */
app.get('/amazon/listings', async (req, res) => {
  try {
    const data = await sellcoFetch('/api/amazon/listings', {
      method: 'GET',
    });
    res.json(data);
  } catch (err) {
    console.error('[/amazon/listings]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /amazon/orders
 * Returns Amazon orders from the Sellco platform.
 */
app.get('/amazon/orders', async (req, res) => {
  try {
    const data = await sellcoFetch('/api/amazon/orders', {
      method: 'GET',
    });
    res.json(data);
  } catch (err) {
    console.error('[/amazon/orders]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /amazon/inventory
 * Returns Amazon inventory levels from the Sellco platform.
 */
app.get('/amazon/inventory', async (req, res) => {
  try {
    const data = await sellcoFetch('/api/amazon/inventory', {
      method: 'GET',
    });
    res.json(data);
  } catch (err) {
    console.error('[/amazon/inventory]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

/**
 * GET /amazon/analytics
 * Returns Amazon sales analytics from the Sellco platform.
 */
app.get('/amazon/analytics', async (req, res) => {
  try {
    const data = await sellcoFetch('/api/amazon/analytics', {
      method: 'GET',
    });
    res.json(data);
  } catch (err) {
    console.error('[/amazon/analytics]', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`sellco-amazon-mcp listening on port ${PORT}`);
});
