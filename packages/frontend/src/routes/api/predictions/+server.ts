import { json } from '@sveltejs/kit';
import { generateLocalPrediction } from '#lib/local-predictions';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Read the prompt from promptbot.md
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const promptPath = join(__dirname, '../../../../promptbot.md');
let SYSTEM_PROMPT = '';

try {
  SYSTEM_PROMPT = readFileSync(promptPath, 'utf-8');
} catch (error) {
  console.error('Could not read promptbot.md, using default prompt');
  SYSTEM_PROMPT = 'You are an expert NFL analyst. Generate predictions based on team records, home field advantage, and current score.';
}

async function generatePrediction(gameData: any) {
  const { homeTeam, awayTeam, homeRecord, awayRecord, homeScore, awayScore, status } = gameData;

  const prompt = `${SYSTEM_PROMPT}

Juego: ${awayTeam.name} @ ${homeTeam.name}
Récord visitante: ${awayRecord}
Récord local: ${homeRecord}
Marcador actual: ${awayScore} - ${homeScore}
Estado: ${status}

Genera un pronóstico en formato JSON con la siguiente estructura:
{
  "prediction": "ganador esperado (Home/Away)",
  "confidence": número del 1 al 100,
  "analysis": "análisis breve de 2-3 oraciones",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "scorePrediction": {
    "home": número esperado,
    "away": número esperado
  },
  "winProbability": {
    "home": porcentaje,
    "away": porcentaje
  }
}

Solo responde con el JSON, sin texto adicional.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON from the response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (e) {
    console.error('Failed to parse prediction:', content);
    // Return a default prediction if parsing fails
    return {
      prediction: 'Away',
      confidence: 50,
      analysis: 'Unable to generate detailed analysis',
      keyFactors: ['Data unavailable'],
      scorePrediction: { home: 24, away: 21 },
      winProbability: { home: 50, away: 50 }
    };
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { games } = body;

    if (!games || !Array.isArray(games)) {
      console.error('Invalid request: games array required');
      return json({ error: 'Invalid request: games array required' }, { status: 400 });
    }

    console.log(`Generating predictions for ${games.length} games`);
    console.log('Sample game data:', JSON.stringify(games[0]).substring(0, 300));

    // If ANTHROPIC_API_KEY is not set, use local predictions
    if (!ANTHROPIC_API_KEY) {
      console.log('ANTHROPIC_API_KEY not set, using local predictions');
      const predictions = games.map((game: any) => {
        const gameData = {
          homeTeam: game.teams?.[1] || game.homeTeam,
          awayTeam: game.teams?.[0] || game.awayTeam,
          homeRecord: game.teams?.[1]?.records?.[0]?.summary || game.teams?.[1]?.record || game.homeRecord || '0-0',
          awayRecord: game.teams?.[0]?.records?.[0]?.summary || game.teams?.[0]?.record || game.awayRecord || '0-0',
          homeScore: game.teams?.[1]?.score || game.score?.[1] || game.homeScore || 0,
          awayScore: game.teams?.[0]?.score || game.score?.[0] || game.awayScore || 0,
          status: game.status?.type?.state || game.status?.short || game.status || 'Scheduled'
        };

        const prediction = generateLocalPrediction(gameData);
        return {
          gameId: game.id || game.gameId,
          ...prediction,
          source: 'local'
        };
      });

      console.log('Generated', predictions.length, 'local predictions');
      return json({ predictions, source: 'local' });
    }

    // Generate predictions for each game using Claude API
    const predictions = await Promise.all(
      games.map(async (game: any) => {
        try {
          const gameData = {
            homeTeam: game.teams?.[1] || game.homeTeam,
            awayTeam: game.teams?.[0] || game.awayTeam,
            homeRecord: game.teams?.[1]?.record || game.homeRecord,
            awayRecord: game.teams?.[0]?.record || game.awayRecord,
            homeScore: game.score?.[1] || game.homeScore || 0,
            awayScore: game.score?.[0] || game.awayScore || 0,
            status: game.status?.type?.state || game.status || 'Scheduled'
          };

          console.log('Game data for prediction:', gameData);
          const prediction = await generatePrediction(gameData);
          return {
            gameId: game.id || game.gameId,
            ...prediction,
            source: 'claude'
          };
        } catch (error) {
          console.error('Error generating prediction for game:', error);
          // Fall back to local prediction on error
          const gameData = {
            homeTeam: game.teams?.[1] || game.homeTeam,
            awayTeam: game.teams?.[0] || game.awayTeam,
            homeRecord: game.teams?.[1]?.records?.[0]?.summary || game.teams?.[1]?.record || game.homeRecord || '0-0',
            awayRecord: game.teams?.[0]?.records?.[0]?.summary || game.teams?.[0]?.record || game.awayRecord || '0-0',
            homeScore: game.teams?.[1]?.score || game.score?.[1] || game.homeScore || 0,
            awayScore: game.teams?.[0]?.score || game.score?.[0] || game.awayScore || 0,
            status: game.status?.type?.state || game.status?.short || game.status || 'Scheduled'
          };

          const localPrediction = generateLocalPrediction(gameData);
          return {
            gameId: game.id || game.gameId,
            ...localPrediction,
            source: 'local-fallback',
            error: true
          };
        }
      })
    );

    console.log('Generated', predictions.length, 'predictions');
    return json({ predictions, source: 'claude' });
  } catch (error) {
    console.error('Error in predictions endpoint:', error);
    return json({ error: 'Failed to generate predictions', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
