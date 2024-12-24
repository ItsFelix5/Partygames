<script lang="ts">
	import { setName } from '../main';

	function submit() {
		const name = document.querySelector('input').value.trim();
		if (name.length < 2) return;
		setName(name);
		document.documentElement.requestFullscreen({ navigationUI: 'hide' });
	}
</script>

<main>
	<h1>Wat is je naam?</h1>
	<br />
	<span>
		<input type="text" autofocus minlength="2" maxlength="30" on:keydown={e => e.key == 'Enter' && submit()} />
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
