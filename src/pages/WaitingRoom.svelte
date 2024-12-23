<script type="ts">
	import StartButton from './../components/StartButton.svelte';
	import { players } from '../main';
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

<StartButton />

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
		height: 90%;
		background-color: #1a1a1a;
		border-radius: 10px;
		margin: 1%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: xx-large;
	}
</style>
