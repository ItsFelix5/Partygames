<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { connection } from '../main';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	export let drawer: boolean;
	let queue = [];

	onMount(() => {
		ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
		if (drawer) {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			ctx.fillStyle = '#DDD';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			queue.push({ type: 'dimensions', x: canvas.width, y: canvas.height });
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 10;
			ctx.lineCap = 'round';
			setInterval(() => {
				if (queue.length == 0) return;
				if (!DEBUG) connection.broadcast('draw', queue, true);
				queue = [];
			}, 50);
		} else
			connection.on('draw', queue => {
				let task: { type: string; x?: number; y?: number; color?: string; size?: number };
				while ((task = queue.shift())) {
					if (task.type == 'floodFill') floodFill(task.x, task.y);
					else if (task.type == 'start') startDraw(task.x, task.y);
					else if (task.type == 'draw') draw(task.x, task.y);
					else if (task.type == 'stop') stopDraw(task.x, task.y);
					else if (task.type == 'color') ctx.strokeStyle = task.color;
					else if (task.type == 'size') ctx.lineWidth = task.size;
					else if (task.type == 'dimensions') {
						canvas.width = task.x;
						canvas.height = task.y;
						ctx.fillStyle = '#DDD';
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 10;
						ctx.lineCap = 'round';
					}
				}
			});
	});

	if (!drawer) onDestroy(() => connection.removeListener('draw'));

	function getPixel(pixelData: ImageData, x: number, y: number) {
		const i = (y * pixelData.width + x) * 4;
		return [pixelData.data[i], pixelData.data[i + 1], pixelData.data[i + 2]];
	}

	function setPixel(pixelData: ImageData, x: number, y: number, color: number[]) {
		const i = (y * pixelData.width + x) * 4;
		pixelData.data[i] = color[0];
		pixelData.data[i + 1] = color[1];
		pixelData.data[i + 2] = color[2];
	}

	const similar = (c1: number[], c2: number[]) => (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2 < 6500;

	export function floodFill(x: number, y: number) {
		x = ~~x;
		y = ~~y;
		const int = parseInt(ctx.strokeStyle.toString().slice(1), 16);
		const replacementColor = [(int >> 16) & 255, (int >> 8) & 255, int & 255];
		const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const targetColor = getPixel(pixelData, x, y);
		if (drawer && similar(targetColor, replacementColor)) return;
		if (drawer) queue.push({ type: 'floodFill', x, y });

		const done: boolean[][] = [];
		for (let x = 0; x < canvas.width; x++) done[x] = [];
		done[x][y] = true;

		const stack = [[x, y]];
		let current: number[];
		while ((current = stack.pop())) {
			let cx = current[0];
			let cy = current[1];

			if (similar(getPixel(pixelData, cx, cy), targetColor)) {
				setPixel(pixelData, cx, cy, replacementColor);

				let e,
					w = (e = cx);
				// Check left
				while (w > 0 && similar(getPixel(pixelData, w - 1, cy), targetColor)) {
					--w;
					if (done[w][cy]) break;
					setPixel(pixelData, w, cy, replacementColor);
				}
				// Check right
				while (e < pixelData.width - 1 && similar(getPixel(pixelData, e + 1, cy), targetColor)) {
					++e;
					if (done[e][cy]) break;
					setPixel(pixelData, e, cy, replacementColor);
				}

				for (cx = w; cx <= e; cx++) {
					// Check up
					if (cy > 0 && similar(getPixel(pixelData, cx, cy - 1), targetColor) && !done[cx][cy - 1]) {
						stack.push([cx, cy - 1]);
						done[cx][cy - 1] = true;
					}
					// Check down
					if (cy < canvas.height - 1 && similar(getPixel(pixelData, cx, cy + 1), targetColor) && !done[cx][cy + 1]) {
						stack.push([cx, cy + 1]);
						done[cx][cy + 1] = true;
					}
				}
			}
		}

		ctx.putImageData(pixelData, 0, 0, 0, 0, canvas.width, canvas.height);
	}

	export function startDraw(x: number, y: number) {
		if (drawer) queue.push({ type: 'start', x, y });
		ctx.moveTo(x, y);
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	export function draw(x: number, y: number) {
		if (drawer) queue.push({ type: 'draw', x, y });
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	export function stopDraw(x: number, y: number) {
		if (x < 0) return;
		if (drawer) queue.push({ type: 'stop', x, y });
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.beginPath();
	}

	export function setColor(c: string) {
		const prev = ctx.strokeStyle.toString().toUpperCase();
		if (prev.charAt(1) == c.charAt(1) && prev.charAt(3) == c.charAt(2) && prev.charAt(5) == c.charAt(3)) return;
		queue.push({ type: 'color', color: c });
		ctx.strokeStyle = c;
	}

	export function setSize(s: number) {
		if (s == ctx.lineWidth) return;
		if (s < 1) s = 1;
		queue.push({ type: 'size', size: s });
		ctx.lineWidth = s;
	}
</script>

<canvas bind:this={canvas} on:pointerdown on:mousemove on:mouseup on:touchmove on:touchend on:pointerout></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		border: 1px solid black;
		border-radius: 10px;
	}
</style>
