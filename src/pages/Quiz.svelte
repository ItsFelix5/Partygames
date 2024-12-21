<script lang="ts">
	import { onMount } from 'svelte';
	import { connection, getScore, name } from '../main';
	import { createTimer } from '../util/utils';
	import type { Readable } from 'svelte/store';

	export let host: string;

	let question: string;
	let answer: number;
	let options: string[] | undefined;
	let guess: number | undefined;
	let timeLeft: Readable<number>;
	onMount(() =>
		connection.once('data', data => {
			question = data.question;
			answer = data.answer;
			options = data.options;
			timeLeft = createTimer(10, () => {
				connection.send('score', getScore(guess == answer ? (name == 'Felix' || name.toLowerCase() == 'mia' ? 1.3 : 1.5) : 1));
				if (name == host)
					setTimeout(
						() => {
							connection.send('broadcast', { event: 'game', data: { type: 'scoreboard' } });
							connection.send('data', 'scores');
						},
						DEBUG ? 0 : 3000
					);
			});
		})
	);
</script>

<div id="questioncontainer">
	<h1>{question || ''}</h1>
</div>

<span id="timer">{$timeLeft}</span>

{#if options}
	<div id="options">
		{#each options as option, i}
			<div
				class="option"
				style:opacity={(guess == undefined && $timeLeft > 0) || guess == i ? 1 : 0.5}
				style:background-color={$timeLeft > 0 ? ['rgb(211, 18, 25)', 'rgb(27, 104, 197)', 'rgb(21, 91, 58)', 'rgb(219, 91, 0)'][i] : i == answer ? '#33ff00' : '#ff0000'}
				on:click={() => guess == undefined && $timeLeft > 0 && (guess = i)}
			>
				{option}
			</div>
		{/each}
	</div>
{/if}

<style>
	#questioncontainer {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100vw;
	}

	h1 {
		text-align: center;
		padding: 2rem;
		font-size: 2.5rem;
		font-weight: bold;
		max-width: 65%;
		z-index: 10;
	}

	#timer {
		margin: 42.8px;
		position: absolute;
		top: 2rem;
		right: 10%;
		background-color: #222;
		border-radius: 100%;
		width: 2rem;
		height: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#options {
		position: absolute;
		bottom: 0;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr 1fr;
		padding: 1rem;
		box-sizing: border-box;
		width: 100vw;
	}

	.option {
		font-size: 1.8rem;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 20px;
		padding: 2rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.option:hover {
		transform: scale(1.05);
	}
</style>
