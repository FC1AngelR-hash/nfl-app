import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// RapidAPI configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';

// Helper function to make requests to RapidAPI
async function fetchFromRapidAPI(endpoint, params = {}) {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  });

  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Get NFL games
app.get('/api/nfl/games', async (req, res) => {
  try {
    const { season, league } = req.query;
    const data = await fetchFromRapidAPI('/v3/fixtures', {
      season: season || '2024',
      league: league || '1'
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching NFL games:', error);
    res.status(500).json({ error: 'Failed to fetch NFL games' });
  }
});

// Get NFL game details
app.get('/api/nfl/game/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromRapidAPI('/v3/fixtures', { id });
    res.json(data);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

// Get NFL teams
app.get('/api/nfl/teams', async (req, res) => {
  try {
    const { league } = req.query;
    const data = await fetchFromRapidAPI('/v3/teams', {
      league: league || '1'
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching NFL teams:', error);
    res.status(500).json({ error: 'Failed to fetch NFL teams' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
