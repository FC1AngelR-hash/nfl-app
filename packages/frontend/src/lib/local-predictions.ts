interface GameData {
  homeTeam: any;
  awayTeam: any;
  homeRecord: string;
  awayRecord: string;
  homeScore: number;
  awayScore: number;
  status: string;
}

interface Prediction {
  prediction: string;
  confidence: number;
  analysis: string;
  keyFactors: string[];
  scorePrediction: { home: number; away: number };
  winProbability: { home: number; away: number };
}

function parseRecord(record: string): number {
  // Parse record like "5-2" to win percentage
  const match = record.match(/(\d+)-(\d+)/);
  if (match) {
    const wins = parseInt(match[1]);
    const losses = parseInt(match[2]);
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : 50;
  }
  return 50;
}

function getTeamName(team: any): string {
  return team?.displayName || team?.name || team?.abbreviation || 'Unknown';
}

function analyzeGame(gameData: GameData): Prediction {
  const homeWinPercent = parseRecord(gameData.homeRecord);
  const awayWinPercent = parseRecord(gameData.awayRecord);
  const homeTeamName = getTeamName(gameData.homeTeam);
  const awayTeamName = getTeamData(gameData.awayTeam);

  const scoreDiff = gameData.homeScore - gameData.awayScore;
  const isGameInProgress = gameData.status !== 'Scheduled' && gameData.status !== 'Pre';

  let homeProbability = 50;
  let awayProbability = 50;

  // Base probability from records
  if (homeWinPercent > awayWinPercent) {
    const diff = homeWinPercent - awayWinPercent;
    homeProbability += diff * 0.5;
    awayProbability -= diff * 0.5;
  } else {
    const diff = awayWinPercent - homeWinPercent;
    awayProbability += diff * 0.5;
    homeProbability -= diff * 0.5;
  }

  // Adjust for home field advantage (typically +3%)
  homeProbability += 3;
  awayProbability -= 3;

  // Adjust for current score if game is in progress
  if (isGameInProgress) {
    if (scoreDiff > 0) {
      homeProbability += scoreDiff * 2;
      awayProbability -= scoreDiff * 2;
    } else if (scoreDiff < 0) {
      awayProbability += Math.abs(scoreDiff) * 2;
      homeProbability -= Math.abs(scoreDiff) * 2;
    }
  }

  // Clamp probabilities between 5% and 95%
  homeProbability = Math.max(5, Math.min(95, homeProbability));
  awayProbability = 100 - homeProbability;

  // Determine prediction
  const prediction = homeProbability > awayProbability ? 'Home' : 'Away';
  const confidence = Math.abs(homeProbability - awayProbability) + 40; // Base 40% + diff

  // Generate key factors
  const keyFactors: string[] = [];

  if (homeWinPercent > awayWinPercent + 10) {
    keyFactors.push(`${homeTeamName} has better record (${gameData.homeRecord})`);
  } else if (awayWinPercent > homeWinPercent + 10) {
    keyFactors.push(`${awayTeamName} has better record (${gameData.awayRecord})`);
  }

  if (isGameInProgress) {
    if (scoreDiff > 7) {
      keyFactors.push(`${homeTeamName} leading by ${scoreDiff} points`);
    } else if (scoreDiff < -7) {
      keyFactors.push(`${awayTeamName} leading by ${Math.abs(scoreDiff)} points`);
    }
  }

  keyFactors.push('Home field advantage');

  // Predict final score
  let predictedHomeScore = 24;
  let predictedAwayScore = 21;

  if (isGameInProgress) {
    // If game is in progress, project final score
    const avgScorePerQuarter = 7;
    const quartersRemaining = gameData.status === 'Q1' ? 3 : gameData.status === 'Q2' ? 2 : gameData.status === 'Q3' ? 1 : 0;
    predictedHomeScore = gameData.homeScore + (quartersRemaining * avgScorePerQuarter);
    predictedAwayScore = gameData.awayScore + (quartersRemaining * avgScorePerQuarter);
  } else {
    // Adjust predicted score based on win probability
    const scoreAdvantage = (homeProbability - 50) / 10;
    predictedHomeScore = 24 + scoreAdvantage;
    predictedAwayScore = 21 - scoreAdvantage;
  }

  // Generate analysis
  let analysis = '';
  if (isGameInProgress) {
    analysis = `${prediction === 'Home' ? homeTeamName : awayTeamName} favored to win with ${confidence.toFixed(0)}% confidence. Current score ${gameData.awayScore}-${gameData.homeScore} with ${gameData.status} remaining.`;
  } else {
    analysis = `${prediction === 'Home' ? homeTeamName : awayTeamName} favored to win with ${confidence.toFixed(0)}% confidence based on record comparison and home field advantage.`;
  }

  return {
    prediction,
    confidence: Math.round(confidence),
    analysis,
    keyFactors,
    scorePrediction: {
      home: Math.round(predictedHomeScore),
      away: Math.round(predictedAwayScore)
    },
    winProbability: {
      home: Math.round(homeProbability),
      away: Math.round(awayProbability)
    }
  };
}

function getTeamData(team: any): string {
  return team?.displayName || team?.name || team?.abbreviation || 'Unknown';
}

export function generateLocalPrediction(gameData: GameData): Prediction {
  return analyzeGame(gameData);
}

export function generateBatchLocalPredictions(games: any[]): Map<string, Prediction> {
  const predictions = new Map<string, Prediction>();

  games.forEach((game: any) => {
    try {
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
      predictions.set(game.id || game.gameId || '', prediction);
    } catch (error) {
      console.error('Error generating local prediction for game:', error);
    }
  });

  return predictions;
}
