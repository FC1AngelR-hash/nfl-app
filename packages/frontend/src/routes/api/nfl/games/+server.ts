import { json } from '@sveltejs/kit';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';

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
    throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET({ url }) {
  try {
    const season = url.searchParams.get('season') || '2024';
    const league = url.searchParams.get('league') || '1';

    const data = await fetchFromRapidAPI('/v3/fixtures', { season, league });
    return json(data);
  } catch (error) {
    console.error('Error fetching NFL games:', error);
    return json({ error: 'Failed to fetch NFL games' }, { status: 500 });
  }
}
