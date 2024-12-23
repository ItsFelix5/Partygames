<script lang="ts">
	import StartButton from './../components/StartButton.svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import type { score } from '../types';

	export let data: score[] = [];
	onMount(() => {
		data = data.sort((a, b) => b.score - a.score);
		setTimeout(() => (data = data.map(p => ({ ...p, score: ~~(p.score + p.round * p.multiplier) }))), 1000);
		setTimeout(() => (data = data.sort((a, b) => b.score - a.score)), 2500);
	});
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
			{#each data as player (player.name)}
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

<StartButton />

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
</style>
