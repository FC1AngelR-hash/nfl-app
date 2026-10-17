<script lang="ts">
  import { onMount } from 'svelte';

  interface Game {
    id?: string;
    teams?: any[];
    score?: any[];
    status?: any;
    shortName?: string;
    date?: string;
    [key: string]: any;
  }

  interface Prediction {
    gameId?: string;
    prediction: string;
    confidence: number;
    analysis: string;
    keyFactors: string[];
    scorePrediction: { home: number; away: number };
    winProbability: { home: number; away: number };
    error?: boolean;
    source?: string;
  }

  let games: Game[] = $state([]);
  let predictions: Map<string, Prediction> = $state(new Map());
  let loading = $state(true);
  let generatingPredictions = $state(false);
  let error: string | null = $state(null);

  onMount(async () => {
    await fetchGames();
  });

  async function fetchGames() {
    try {
      loading = true;
      error = null;

      // Try ESPN API first
      const response = await fetch('/api/espn/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games from ESPN');
      }
      const data = await response.json();
      console.log('ESPN API Response:', data);

      // Extract games from ESPN response
      if (data.events) {
        games = data.events;
        console.log('Loaded', games.length, 'games from ESPN');
        // Log first game structure for debugging
        if (games.length > 0) {
          console.log('First game structure:', JSON.stringify(games[0], null, 2).substring(0, 500));
        }
      } else if (Array.isArray(data)) {
        games = data;
        console.log('Loaded', games.length, 'games as array');
      } else {
        console.error('Unexpected data structure:', data);
        games = [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  }

  async function generatePredictions() {
    try {
      generatingPredictions = true;
      console.log('Starting predictions generation for', games.length, 'games');

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ games })
      });

      console.log('Prediction API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Prediction API error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate predictions');
      }

      const data = await response.json();
      console.log('Predictions received:', data);

      // Store predictions in a map
      if (data.predictions && Array.isArray(data.predictions)) {
        data.predictions.forEach((pred: Prediction) => {
          predictions.set(pred.gameId || '', pred);
        });
        console.log('Stored', predictions.size, 'predictions');
      } else {
        console.error('Invalid predictions format:', data);
        throw new Error('Invalid predictions response format');
      }
    } catch (err) {
      console.error('Error generating predictions:', err);
      alert(`Failed to generate predictions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      generatingPredictions = false;
    }
  }

  function getTeamLogo(team: any): string {
    // Try multiple possible paths for the logo
    const logo = team?.team?.logo ||
                 team?.logo ||
                 team?.team?.logos?.[0]?.href ||
                 team?.logos?.[0]?.href ||
                 '';

    // If no logo from ESPN, try to construct one from team abbreviation
    if (!logo && team?.team?.abbreviation) {
      const abbrev = team.team.abbreviation.toLowerCase();
      return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev}.png`;
    }

    return logo;
  }

  function getTeamName(team: any): string {
    return team?.team?.displayName ||
           team?.team?.name ||
           team?.displayName ||
           team?.name ||
           team?.abbreviation ||
           'Unknown';
  }

  function getTeamRecord(team: any): string {
    return team?.records?.[0]?.summary ||
           team?.record ||
           team?.team?.record ||
           '';
  }

  function getScore(team: any): number {
    return team?.score ||
           team?.scoreValue ||
           team?.team?.score ||
           0;
  }

  function getGameStatus(game: Game): string {
    return game?.status?.type?.short ||
           game?.status?.short ||
           game?.status?.state ||
           'Scheduled';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-12">
      <h1 class="text-5xl font-bold text-white mb-4">NFL Games & Predictions</h1>
      <p class="text-purple-300 text-lg">Live scores powered by ESPN, predictions by Claude</p>
    </header>

    <div class="flex justify-center mb-8">
      <button
        onclick={generatePredictions}
        disabled={generatingPredictions || games.length === 0}
        class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2"
      >
        {#if generatingPredictions}
          <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Generating...
        {:else}
          Generate AI Predictions
        {/if}
      </button>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-md mx-auto">
        <p class="font-semibold">Error loading games</p>
        <p class="text-sm">{error}</p>
      </div>
    {:else if games.length === 0}
      <div class="text-center text-purple-300 py-12">
        <p class="text-xl">No games available at the moment</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each games as game}
          {@const prediction = predictions.get(game.id || '')}
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div class="text-center mb-4">
              <span class="text-purple-300 text-sm font-medium">{game.shortName || 'NFL Game'}</span>
              <div class="text-xs text-purple-400 mt-1">{getGameStatus(game)}</div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="text-center flex-1">
                {#if getTeamLogo(game.teams?.[0])}
                  <img src={getTeamLogo(game.teams[0])} alt={getTeamName(game.teams[0])} class="w-16 h-16 mx-auto mb-2 object-contain" />
                {/if}
                <p class="text-white font-semibold text-sm">{getTeamName(game.teams?.[0])}</p>
                <p class="text-xs text-purple-400">{getTeamRecord(game.teams?.[0])}</p>
              </div>

              <div class="text-center px-4">
                <div class="text-3xl font-bold text-white mb-1">
                  {getScore(game.teams?.[0])} - {getScore(game.teams?.[1])}
                </div>
              </div>

              <div class="text-center flex-1">
                {#if getTeamLogo(game.teams?.[1])}
                  <img src={getTeamLogo(game.teams[1])} alt={getTeamName(game.teams[1])} class="w-16 h-16 mx-auto mb-2 object-contain" />
                {/if}
                <p class="text-white font-semibold text-sm">{getTeamName(game.teams?.[1])}</p>
                <p class="text-xs text-purple-400">{getTeamRecord(game.teams?.[1])}</p>
              </div>
            </div>

            {#if prediction}
              <div class="mt-4 pt-4 border-t border-white/20">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-purple-300 text-sm font-medium">
                    {prediction.source === 'local' ? 'Local Prediction' : 'AI Prediction (Claude)'}
                  </span>
                  <span class="text-white text-sm font-bold">{prediction.confidence}% confidence</span>
                </div>
                {#if prediction.source === 'local'}
                  <div class="bg-blue-500/20 rounded px-2 py-1 mb-2">
                    <p class="text-blue-300 text-xs">Using local algorithm (Claude API unavailable)</p>
                  </div>
                {/if}
                <div class="bg-purple-500/20 rounded-lg p-3 mb-2">
                  <p class="text-white text-sm">{prediction.analysis}</p>
                </div>
                <div class="flex justify-between text-xs text-purple-300 mb-2">
                  <span>Win Prob: {prediction.winProbability.away}% (Away)</span>
                  <span>Win Prob: {prediction.winProbability.home}% (Home)</span>
                </div>
                <div class="flex justify-between text-xs text-purple-300">
                  <span>Predicted Score: {prediction.scorePrediction.away}</span>
                  <span>Predicted Score: {prediction.scorePrediction.home}</span>
                </div>
                <div class="mt-2">
                  <p class="text-xs text-purple-400">Key Factors:</p>
                  <ul class="text-xs text-purple-300 list-disc list-inside">
                    {#each prediction.keyFactors as factor}
                      <li>{factor}</li>
                    {/each}
                  </ul>
                </div>
              </div>
            {:else}
              <div class="mt-4 pt-4 border-t border-white/20 text-center">
                <p class="text-purple-400 text-sm">Click "Generate AI Predictions" to see analysis</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
