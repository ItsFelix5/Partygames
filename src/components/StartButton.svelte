<script lang="ts">
	import { gameMaster } from '../main';

	let modifier = false;
</script>

{#if gameMaster}
	<div id="start">
		<input type="checkbox" bind:checked={modifier} />
		<button on:click={() => window.start(modifier)}>Start</button>
	</div>
{/if}

<style>
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
