import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncMatches } from './matchSync';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello Bolão API');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/admin/sync-matches', async (req, res) => {
  const syncSecret = process.env.SYNC_SECRET;
  const requestSecret = req.header('x-sync-secret');

  if (!syncSecret || requestSecret !== syncSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await syncMatches();
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
