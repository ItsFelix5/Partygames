<script lang="ts">
	import { fly } from 'svelte/transition';
	import { connection, name, players, setScore } from '../main';
	import { onDestroy, onMount } from 'svelte';

	export let timeLeft: number;
	export let canChat: boolean;
	export let finish: () => void;
	export let correct = 0;
	let word = '';

	let messages: HTMLDivElement;
	let chatMessages: string[] = [];
	let chatMessage = '';
	function submit() {
		if ('ontouchstart'! in window && navigator.maxTouchPoints <= 0) document.querySelector('input').focus();
		if (chatMessage.length < 2) return;
		canChat = chatMessage.trim().toLowerCase() != word.toLowerCase();
		if (!canChat) {
			setScore(timeLeft);
			connection.send('broadcast', { event: 'chat', data: name + ' heeft het antwoord geraden!' });
		} else connection.send('broadcast', { event: 'chat', data: name + ': ' + chatMessage });
		chatMessage = '';
	}

	onMount(() => {
		if (!canChat) connection.send('data', 'pictionary');
		connection.on('chat', data => {
			chatMessages = [...chatMessages, data];
			requestAnimationFrame(() => messages.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' }));
			if (data.includes(' heeft het antwoord geraden!')) correct++; // Not perfect but it works I guess
			if (correct == players.get().length - 1 && timeLeft > 7) finish();
		});
		connection.once('data', data => (word = data));
	});
	onDestroy(() => connection.removeListener('chat'));
</script>

<div id="word">{canChat ? word.replaceAll(' ', '/').replaceAll(/[^ /]/g, '_ ') : word} - {timeLeft}</div>
<div id="messages" bind:this={messages} style:height={canChat ? '76%' : '83%'}>
	{#each chatMessages as msg}
		<div transition:fly={{ y: 20, duration: 100 }} style:color={msg.includes(':') ? '' : '#0E0'}>
			{msg}
		</div>
	{/each}
</div>
<!-- svelte-ignore missing-declaration -->
{#if canChat || DEBUG}
	<span id="messageBox">
		<input
			autofocus={!('ontouchstart' in window) && navigator.maxTouchPoints <= 0}
			on:keydown={e => e.key == 'Enter' && submit()}
			bind:value={chatMessage}
			type="text"
			placeholder="Typ hier wat jij denkt dat jij ziet"
			maxlength="30"
		/>
		<button on:click={submit}>Raad</button>
	</span>
{/if}

<style>
	#word {
		background-color: #111;
		height: 7.5%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.75rem;
		font-size: 1.5rem;
		border-radius: 10px;
		box-shadow: 0 1px 20px #111;
	}

	#messages {
		padding: 1rem;
		overflow: scroll;
	}

	#messages div {
		padding: 6px;
		background-color: #222;
		border-radius: 6px;
		margin-bottom: 6px;
	}

	#messageBox {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 1%;
		position: absolute;
		bottom: 0.5%;
		width: 98%;
	}

	input {
		width: 70%;
		height: 30px;
		border-radius: 5px;
		border: 1px solid black;
		padding: 2px;
		padding-left: 10px;
		margin-right: 10px;
	}

	button {
		width: 20%;
		height: 30px;
		border-radius: 5px;
		border: 1px solid black;
		background-color: rgb(10, 10, 10);
		padding: 2px;
	}
</style>
