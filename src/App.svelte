<script lang="ts">
	import { onMount, type ComponentType, type SvelteComponent } from 'svelte';
	import { connection, name } from './main';

	import Quiz from './pages/Quiz.svelte';
	import Pictionary from './pages/Pictionary.svelte';
	import Scoreboard from './pages/Scoreboard.svelte';
	import Name from './pages/Name.svelte';

	export let content: ComponentType<SvelteComponent> = Name;

	let data: any;
	onMount(() => {
		connection.on('pictionary', d => {
			content = Pictionary;
			data = d;
		});

		connection.on('quiz', d => {
			if (content != Pictionary) return;
			content = Quiz;
			data = d;
		});

		connection.on('scores', d => {
			content = Scoreboard;
			data = d;
		});
	});

	let fullscreen = false;
	document.onfullscreenchange = () => (fullscreen = document.fullscreenElement != null);
</script>

<svelte:component this={content} {data} />

{#if !fullscreen}
	<svg on:click={() => document.documentElement.requestFullscreen({ navigationUI: 'hide' })} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
		<path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
	</svg>
{/if}

<style>
	svg {
		position: fixed;
		bottom: 10px;
		left: 10px;
		cursor: pointer;
		border-radius: 100%;
		padding: 5px;
		background-color: #222;
	}
</style>
