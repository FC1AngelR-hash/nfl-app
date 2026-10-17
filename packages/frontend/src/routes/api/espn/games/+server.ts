import { json } from '@sveltejs/kit';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

async function fetchFromESPN(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${ESPN_API_BASE}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  console.log('Fetching from ESPN:', url.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET({ url }) {
  try {
    const week = url.searchParams.get('week');
    const dates = url.searchParams.get('dates');

    console.log('Fetching ESPN games with params:', { week, dates });

    // Default to current week if no parameters provided
    const params: Record<string, string> = {};
    if (week) params.week = week;
    if (dates) params.dates = dates;

    const data = await fetchFromESPN('/scoreboard', params);
    console.log('ESPN Response structure:', {
      hasEvents: !!data.events,
      eventsCount: data.events?.length || 0,
      sampleEvent: data.events?.[0] ? JSON.stringify(data.events[0]).substring(0, 200) : 'none'
    });

    return json(data);
  } catch (error) {
    console.error('Error fetching ESPN games:', error);
    return json({ error: 'Failed to fetch ESPN games', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
