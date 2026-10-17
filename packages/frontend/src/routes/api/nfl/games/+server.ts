import { json } from '@sveltejs/kit';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'american-football-nfl.p.rapidapi.com';

async function fetchFromRapidAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('RapidAPI error:', response.status, errorText);
    throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET({ url }) {
  try {
    const season = url.searchParams.get('season') || '2024';

    console.log('Fetching NFL games with params:', { season, hasKey: !!RAPIDAPI_KEY });

    const data = await fetchFromRapidAPI('/api/v1/games', { season });
    return json(data);
  } catch (error) {
    console.error('Error fetching NFL games:', error);
    return json({ error: 'Failed to fetch NFL games', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
