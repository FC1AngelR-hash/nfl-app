import { json } from '@sveltejs/kit';

// Mock data for demonstration
const mockGames = [
  {
    id: 1,
    teams: {
      home: { name: 'Kansas City Chiefs', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Kansas_City_Chiefs_logo.svg/1200px-Kansas_City_Chiefs_logo.svg.png' },
      away: { name: 'Buffalo Bills', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Buffalo_Bills_logo.svg/1200px-Buffalo_Bills_logo.svg.png' }
    },
    score: { home: 28, away: 24 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  },
  {
    id: 2,
    teams: {
      home: { name: 'San Francisco 49ers', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/49/San_Francisco_49ers_logo.svg/1200px-San_Francisco_49ers_logo.svg.png' },
      away: { name: 'Dallas Cowboys', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Dallas_Cowboys_logo.svg/1200px-Dallas_Cowboys_logo.svg.png' }
    },
    score: { home: 35, away: 21 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  },
  {
    id: 3,
    teams: {
      home: { name: 'Philadelphia Eagles', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Philadelphia_Eagles_logo.svg/1200px-Philadelphia_Eagles_logo.svg.png' },
      away: { name: 'New York Giants', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/New_York_Giants_logo.svg/1200px-New_York_Giants_logo.svg.png' }
    },
    score: { home: 31, away: 17 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  },
  {
    id: 4,
    teams: {
      home: { name: 'Miami Dolphins', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Miami_Dolphins_logo.svg/1200px-Miami_Dolphins_logo.svg.png' },
      away: { name: 'New England Patriots', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/New_England_Patriots_logo.svg/1200px-New_England_Patriots_logo.svg.png' }
    },
    score: { home: 24, away: 20 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  },
  {
    id: 5,
    teams: {
      home: { name: 'Green Bay Packers', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Green_Bay_Packers_logo.svg/1200px-Green_Bay_Packers_logo.svg.png' },
      away: { name: 'Chicago Bears', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Chicago_Bears_logo.svg/1200px-Chicago_Bears_logo.svg.png' }
    },
    score: { home: 27, away: 23 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  },
  {
    id: 6,
    teams: {
      home: { name: 'Denver Broncos', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Denver_Broncos_logo.svg/1200px-Denver_Broncos_logo.svg.png' },
      away: { name: 'Las Vegas Raiders', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Las_Vegas_Raiders_logo.svg/1200px-Las_Vegas_Raiders_logo.svg.png' }
    },
    score: { home: 22, away: 19 },
    status: { long: 'Final' },
    league: { name: 'NFL 2024' }
  }
];

export async function GET({ url }) {
  try {
    const useMock = url.searchParams.get('mock') === 'true';

    if (useMock || !process.env.RAPIDAPI_KEY) {
      console.log('Using mock data');
      return json({ response: mockGames });
    }

    // Try to fetch from RapidAPI
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = 'american-football-nfl.p.rapidapi.com';

    const apiUrl = new URL(`https://${RAPIDAPI_HOST}/api/v1/games`);
    apiUrl.searchParams.append('season', url.searchParams.get('season') || '2024');

    console.log('Fetching from RapidAPI:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      console.error('RapidAPI error:', response.status, await response.text());
      // Fall back to mock data if API fails
      console.log('Falling back to mock data');
      return json({ response: mockGames, source: 'mock' });
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('Error fetching NFL games:', error);
    // Return mock data on error
    return json({ response: mockGames, source: 'mock', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
