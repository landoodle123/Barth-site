<!-- src/routes/leaderboard/+page.svelte -->
<script lang="ts">
  export let data;
</script>

<p>You are not supposed to see this</p>
<h1>Leaderboard</h1>

<ol>
  {#each data.leaderboard as entry}
    <li>{entry.user.name ?? 'Unnamed'}: {entry.count}</li>
  {/each}
</ol>
