<script lang="ts">
	import { onMount } from 'svelte';
	import { connection, getScore, name, set } from '../main';
	import Scoreboard from './Scoreboard.svelte';
	export let host: string;
	let question: string;
	let answer: number;
	let options: string[] | undefined;
	let guess: number | undefined;
	let timeLeft = 10;
	let end;
	onMount(() => {
		end = Date.now() + timeLeft * 1000;
		connection.once('data', data => {
			question = data.question;
			answer = data.answer;
			options = data.options;
			let interval = setInterval(() => {
				timeLeft = Math.max(0, Math.floor((end - Date.now()) / 1000));
				if (timeLeft != 0) return;
				clearInterval(interval);
				connection.send('score', getScore(guess == answer ? 1.5 : 1));
				setTimeout(() => {
					set(Scoreboard);
					if (name == host) connection.send('data', 'scores');
				}, 3000);
			}, 1000);
		});
	});
</script>

<h1>{question || 'Aan het laden...'}</h1>

<span id="timer">{timeLeft}</span>

{#if options}
	<div id="options">
		{#each options as option, i}
			<div
				class="option"
				style:opacity={(guess == undefined && timeLeft > 0) || guess == i ? 1 : 0.5}
				style:background-color={timeLeft > 0
					? ['rgb(211, 18, 25)', 'rgb(27, 104, 197)', 'rgb(21, 91, 58)', 'rgb(219, 91, 0)'][i]
					: i == answer
						? '#33ff00'
						: '#ff0000'}
				on:click={() => !guess && timeLeft > 0 && (guess = i)}
			>
				{option}
			</div>
		{/each}
	</div>
{/if}

<style>
	h1 {
		text-align: center;
		padding: 2rem;
		font-size: 2.5rem;
		font-weight: bold;
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
		margin-top: 20%;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr 1fr;
		padding: 1rem;
		box-sizing: border-box;
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
