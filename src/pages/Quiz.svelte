<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { connection, gameMaster, getScore, name } from '../main';
	import { createTimer } from '../util/utils';
	import type { question, timer } from '../types';

	export let data: question;

	let guess: number | undefined;
	let timeLeft: timer;
	onMount(
		() =>
			(timeLeft = createTimer(10, () => {
				connection.send('score', getScore(guess == data.answer ? (gameMaster || name.toLowerCase() == 'mia' ? 1.3 : 1.5) : 1));
				if (gameMaster) setTimeout(() => connection.send('scores'), DEBUG ? 0 : 3000);
			}))
	);
	onDestroy(() => timeLeft?.end(false));
</script>

<div id="questioncontainer">
	<h1>{data.question || ''}</h1>
</div>

<span id="timer">{$timeLeft}</span>

{#if data.options}
	<div id="options">
		{#each data.options as option, i}
			<div
				class="option"
				style:opacity={(guess == undefined && $timeLeft > 0) || guess == i ? 1 : 0.5}
				style:background-color={$timeLeft > 0 ? ['rgb(211, 18, 25)', 'rgb(27, 104, 197)', 'rgb(21, 91, 58)', 'rgb(219, 91, 0)'][i] : i == data.answer ? '#33ff00' : '#ff0000'}
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
