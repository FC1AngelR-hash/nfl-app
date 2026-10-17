<script lang="ts">
  import { onMount } from 'svelte';

  interface Game {
    id?: number;
    teams?: {
      home: { name: string; logo: string };
      away: { name: string; logo: string };
    };
    score?: {
      home: number;
      away: number;
    };
    status?: {
      long: string;
    };
    league?: {
      name: string;
    };
    [key: string]: any;
  }

  let games: Game[] = [];
  let loading = true;
  let error: string | null = null;
  let rawResponse: any = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/nfl/games?season=2024');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch games');
      }
      const data = await response.json();
      rawResponse = data;
      console.log('API Response:', data);

      // Try to extract games from different possible response structures
      if (data.response) {
        games = data.response;
      } else if (data.games) {
        games = data.games;
      } else if (Array.isArray(data)) {
        games = data;
      } else {
        games = [];
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-12">
      <h1 class="text-5xl font-bold text-white mb-4">NFL Games</h1>
      <p class="text-purple-300 text-lg">Live scores and game information</p>
    </header>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-2xl mx-auto">
        <p class="font-semibold text-lg mb-2">Error loading games</p>
        <p class="text-sm mb-4">{error}</p>
        {#if rawResponse}
          <details class="mt-4">
            <summary class="cursor-pointer text-sm underline">View API response</summary>
            <pre class="mt-2 text-xs bg-black/30 p-4 rounded overflow-auto max-h-64">{JSON.stringify(rawResponse, null, 2)}</pre>
          </details>
        {/if}
      </div>
    {:else if games.length === 0}
      <div class="text-center text-purple-300 py-12">
        <p class="text-xl mb-4">No games available at the moment</p>
        {#if rawResponse}
          <details class="mt-4 max-w-2xl mx-auto">
            <summary class="cursor-pointer text-sm underline">View API response</summary>
            <pre class="mt-2 text-xs bg-black/30 p-4 rounded overflow-auto max-h-64">{JSON.stringify(rawResponse, null, 2)}</pre>
          </details>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each games as game}
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div class="text-center mb-4">
              <span class="text-purple-300 text-sm font-medium">{game.league?.name || 'NFL'}</span>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="text-center flex-1">
                {#if game.teams?.away?.logo}
                  <img src={game.teams.away.logo} alt={game.teams.away.name} class="w-16 h-16 mx-auto mb-2 object-contain" />
                {/if}
                <p class="text-white font-semibold text-sm">{game.teams?.away?.name || 'Away Team'}</p>
              </div>

              <div class="text-center px-4">
                <div class="text-3xl font-bold text-white mb-1">
                  {game.score?.away ?? 0} - {game.score?.home ?? 0}
                </div>
                <div class="text-xs text-purple-300">{game.status?.long || 'Scheduled'}</div>
              </div>

              <div class="text-center flex-1">
                {#if game.teams?.home?.logo}
                  <img src={game.teams.home.logo} alt={game.teams.home.name} class="w-16 h-16 mx-auto mb-2 object-contain" />
                {/if}
                <p class="text-white font-semibold text-sm">{game.teams?.home?.name || 'Home Team'}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
