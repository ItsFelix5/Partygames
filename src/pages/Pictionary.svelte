<script lang="ts">
	import Chat from '../components/Chat.svelte';
	import { fly } from 'svelte/transition';
	import { connection, getScore, name, players, setScore } from '../main';
	import SynchronizedCanvas from '../components/SynchronizedCanvas.svelte';
	import { onMount } from 'svelte';
	import { createTimer } from '../util/utils';

	export let host: string;
	export let modifier: string;

	let canvas: SynchronizedCanvas;
	let drawer = host == name;
	let correct: number;
	let drawing = false;
	let canChat = !drawer;

	let filling = false;
	let size = 10;
	let color = '#000';

	let selectingSize = false;
	let timeLeft: { subscribe(subscriber: (value: number) => void): () => void; end: () => void };
	let done = false;
	onMount(
		() =>
			(timeLeft = createTimer(
				100,
				() => {
					if (done) return;
					done = true;
					canChat = false;
					if (drawer) {
						drawer = false;
						setTimeout(
							() => {
								if ($timeLeft == 0 && correct == 0) {
									connection.send('broadcast', { event: 'game', data: { type: 'scoreboard' } });
									connection.send('data', 'scores');
								} else {
									connection.send('broadcast', { event: 'game', data: { type: 'quiz' } });
									connection.send('data', 'quiz');
								}
							},
							DEBUG ? 0 : 5000
						);
						setScore(~~Math.max($timeLeft + (modifier ? 70 : 50 / (players.get().length - 1)) * correct, 0));
					}
					if ($timeLeft == 0 && correct == 0) connection.send('score', getScore(1));
				},
				modifier == 'Sneller' ? 500 : 10
			))
	);
</script>

<div id="canvas" style:opacity={modifier == 'Onzichtbaar' && drawing ? 0 : 100}>
	<SynchronizedCanvas
		bind:this={canvas}
		{drawer}
		on:pointerdown={e => {
			if (!drawer) return;
			if (modifier != 'Altijd tekenen') {
				if (filling || e.button == 1) return canvas.floodFill(e.offsetX, e.offsetY);
				if (e.button == 3) return canvas.setSize((size -= 5));
				if (e.button == 4) return canvas.setSize((size += 5));
				if (e.button == 2) {
					canvas.setColor('#DDD');
					canvas.setSize(size + 10);
				}
			} else if (drawing) return;
			drawing = true;
			canvas.startDraw(e.offsetX, e.offsetY);
		}}
		on:mousemove={e => {
			if (drawing && (e.buttons == 2 || e.buttons == 1 || modifier == 'Altijd tekenen')) canvas.draw(e.offsetX, e.offsetY);
		}}
		on:touchmove={e => {
			if (!drawing) return;
			const ele = e.touches[0].target;
			// @ts-ignore
			canvas.draw(e.touches[0].pageX - ele.offsetLeft, e.touches[0].pageY - ele.offsetTop);
		}}
		on:touchend={e => {
			if (!drawing || modifier == 'Altijd tekenen') return;
			drawing = false;
			const ele = e.changedTouches[0].target;
			// @ts-ignore
			canvas.stopDraw(e.changedTouches[0].pageX - ele.offsetLeft, e.changedTouches[0].pageY - ele.offsetTop);
		}}
		on:mouseup={e => {
			if (!drawing || modifier == 'Altijd tekenen') return;
			drawing = false;
			canvas.stopDraw(e.offsetX, e.offsetY);
			canvas.setColor(color);
			canvas.setSize(size);
		}}
		on:pointerout={e => drawing && canvas.stopDraw(e.offsetX, e.offsetY)}
	/>
</div>

<div id="bottom">
	{#if drawer}
		<div id="pallette">
			{#if modifier != 'Altijd tekenen'}
				<div on:click={() => (filling = !filling)}>{filling ? 'teken' : 'vul'}</div>
			{/if}
			{#each modifier == 'Zwart-wit' ? ['#DDD', '#000'] : ['#DDD', '#888', '#000', '#F00', '#F70', '#FF0', '#0C0', '#060', '#0BF', '#21D', '#92B', '#D6A', '#FA8', '#630'] as c}
				<div class="color" style:background-color={c} style:border-color={color == c ? '#190bd3' : ''} on:click={() => canvas.setColor((color = c))} />
			{/each}
			<div on:mouseenter={() => (selectingSize = true)} on:mouseleave={() => (selectingSize = false)}>
				<div on:click={() => (selectingSize = true)}>{size}</div>
				{#if selectingSize}
					<div id="brushSizes" transition:fly={{ y: 200, duration: 300 }}>
						{#each [30, 25, 20, 15, 10, 5, 3, 1] as s}
							<div
								on:pointerdown={() => {
									canvas.setSize((size = s));
									selectingSize = false;
								}}
							>
								{s}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{:else if $timeLeft == 0}
		<span>De tijd is op!</span>
	{:else if done}
		<span>Iedereen heeft het antwoord geraden!</span>
	{:else}
		<span>{host} is aan het tekenen!{modifier ? ' | ' + modifier : ''}</span>
	{/if}
</div>

<div id="chat">
	<Chat timeLeft={$timeLeft} {canChat} finish={timeLeft?.end} bind:correct />
</div>

<style>
	#canvas {
		width: 70%;
		height: 85%;
		margin: 1%;
		user-select: none;
		transition: opacity 0.3s;
	}

	#chat {
		margin: 1%;
		width: 26%;
		height: 97%;
		border-radius: 10px;
		background: #2a2a2a;
		position: absolute;
		top: 0;
		right: 0;
	}

	#bottom {
		background-color: #222;
		width: 70%;
		height: 9%;
		border-radius: 8px;
		margin-left: 1%;
		overflow: visible;
	}

	#pallette {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		overflow: visible;
	}

	#pallette > * {
		margin: auto;
		width: 1.5rem;
		height: 1.5rem;
		cursor: pointer;
		overflow: visible;
	}

	#bottom > span {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90%;
		font-size: larger;
	}

	#brushSizes {
		background-color: #222;
		border: 2px solid #111;
		border-radius: 10px;
		width: 2rem;
		text-align: center;
		position: relative;
		top: -250px;
		left: -1rem;
	}

	#brushSizes * {
		padding: 5px;
		cursor: pointer;
	}

	.color {
		border-radius: 100px;
		border: #222 3px solid;
	}

	.color:hover {
		border: #190bd3 3px solid;
	}
</style>
