<script lang="ts">
	import { set, connection, setName } from '../main';
	import WaitingRoom from './WaitingRoom.svelte';

	function submit() {
		const name = document.querySelector('input').value;
		if (name.length < 2) return;
		setName(name);
		set(WaitingRoom);
		connection.send('join', name);
	}
</script>

<main>
	<h1>Wat is je naam?</h1>
	<br />
	<span>
		<input type="text" autofocus on:keydown={e => e.key == 'Enter' && submit()} />
		<button on:click={submit}>Volgende</button>
	</span>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 85vh;
	}

	input {
		font-size: 1.5rem;
		border-radius: 6px;
		border: 1px solid #ccc;
	}

	span {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	button {
		border-radius: 5px;
		border: 1px solid black;
		background-color: rgb(20, 20, 20);
		margin-left: 10px;
		padding: 0.5rem;
	}
</style>
