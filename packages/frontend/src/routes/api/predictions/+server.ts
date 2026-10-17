import { json } from '@sveltejs/kit';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function generatePrediction(gameData: any) {
  const { homeTeam, awayTeam, homeRecord, awayRecord, homeScore, awayScore, status } = gameData;

  const prompt = `Analiza el siguiente juego de NFL y genera un pronóstico detallado:

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
      return json({ error: 'Invalid request: games array required' }, { status: 400 });
    }

    console.log(`Generating predictions for ${games.length} games`);

    // Generate predictions for each game
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

          const prediction = await generatePrediction(gameData);
          return {
            gameId: game.id || game.gameId,
            ...prediction
          };
        } catch (error) {
          console.error('Error generating prediction for game:', error);
          return {
            gameId: game.id || game.gameId,
            prediction: 'Away',
            confidence: 50,
            analysis: 'Prediction generation failed',
            keyFactors: ['Error'],
            scorePrediction: { home: 24, away: 21 },
            winProbability: { home: 50, away: 50 },
            error: true
          };
        }
      })
    );

    return json({ predictions });
  } catch (error) {
    console.error('Error in predictions endpoint:', error);
    return json({ error: 'Failed to generate predictions', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
