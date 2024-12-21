<script lang="ts">
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { connection, name } from '../main';

	let players: { name: string; round: number; multiplier: number; score: number }[] = [];
	onMount(() =>
		connection.once('data', scores => {
			players = scores.sort((a, b) => b.score - a.score);
			setTimeout(() => (players = players.map(p => ({ ...p, score: ~~(p.score + p.round * p.multiplier) }))), 1000);
			setTimeout(() => (players = players.sort((a, b) => b.score - a.score)), 2500);
		})
	);

	let modifier = false;
</script>

<main>
	<table>
		<thead>
			<tr>
				<th>Naam</th>
				<th>Score</th>
				<th>Quiz</th>
				<th>Ronde</th>
				<th>Totaal</th>
			</tr>
		</thead>
		<tbody>
			{#each players as player (player.name)}
				<tr animate:flip={{ duration: 1500 }}>
					<td>{player.name}</td>
					<td>{player.round}</td>
					<td style:color={player.multiplier > 1 ? '#0E0' : player.multiplier < 1 ? '#F00' : ''}>
						x{player.multiplier}
					</td>
					<td>{~~(player.round * player.multiplier)}</td>
					<td class="score" style:--score={player.score}></td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>

{#if name == 'Felix'}
	<div id="start">
		<input type="checkbox" bind:checked={modifier} />
		<button on:click={() => window.start(modifier)}>Start</button>
	</div>
{/if}

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	table {
		background-color: #222;
		border-radius: 20px;
		width: 90vw;
		height: 90vh;
		border-collapse: collapse;
	}

	thead th {
		padding-left: 10%;
	}

	tr:not(:last-child),
	tr:first-child {
		border-bottom: 1px solid #333;
	}

	td:not(:first-child) {
		text-align: end;
		padding-right: 3%;
	}

	td {
		padding: 0.5rem;
		font-weight: 600;
		width: 15%;
	}

	td:first-child {
		width: 10%;
		padding-left: 2%;
	}

	@property --score {
		syntax: '<integer>';
		initial-value: 0;
		inherits: false;
	}

	.score {
		transition: --score 2s;
		counter-set: score var(--score);
	}

	.score::after {
		content: counter(score);
	}

	#start {
		position: absolute;
		bottom: 10px;
		right: 10px;
	}

	button {
		background-color: #222;
		border: 1px solid #111;
		border-radius: 6px;
		padding: 5px;
	}
</style>
