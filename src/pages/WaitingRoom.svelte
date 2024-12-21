<script type="ts">
	import { name, players } from '../main';
</script>

<main>
	<div class="row">
		{#each $players.slice(0, 4) as player}
			<div class="item">{player}</div>
		{/each}
	</div>
	<div class="row">
		{#each $players.slice(4, 8) as player}
			<div class="item">{player}</div>
		{/each}
	</div>
	<div class="row">
		{#each $players.slice(8, 12) as player}
			<div class="item">{player}</div>
		{/each}
	</div>
</main>

{#if name == 'Felix'}
	<button on:click={() => window.start()}>Start</button>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 90%;
		padding: 3%;
	}

	.row {
		display: flex;
		height: 33%;
		width: 100%;
		margin-bottom: 2.5%;
	}

	.item {
		width: 100%;
		height: 100%;
		background-color: #1a1a1a;
		border-radius: 10px;
		margin: 1%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: xx-large;
	}

	button {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background-color: #222;
		border: 1px solid #111;
		border-radius: 6px;
		padding: 5px;
	}
</style>
