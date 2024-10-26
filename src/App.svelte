<script lang="ts">
	import Quiz from './pages/Quiz.svelte';
	import { onMount, type ComponentType, type SvelteComponent } from 'svelte';
	import { connection } from './main';
	import Pictionary from './pages/Pictionary.svelte';
	export let content: ComponentType<SvelteComponent> | undefined;
	let page: SvelteComponent<{ host?: string; modifier?: string }, any, any>;
	let host: string;
	let modifier: string;
	onMount(() => {
		connection.on('game', data => {
			if (data.type == 'pictionary') content = Pictionary;
			else if (data.type == 'quiz') content = Quiz;
			else console.error('Unknown game type:', data.type);
			if (data.host) host = data.host;
			modifier = data.modifier as string | '';
		});
	});
</script>

<svelte:component this={content} bind:this={page} {host} {modifier} />
