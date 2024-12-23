import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { connect } from './server/index.ts';

function startWss() {
	Deno.serve({ port: 8080 }, async req => {
		if (req.headers.get('upgrade') !== 'websocket')
			return new Response('Not a websocket request', { status: 400 });
		const { socket, response } = Deno.upgradeWebSocket(req);
		connect(socket);
		return response;
	});
}

export default defineConfig({
	plugins: [
		svelte(),
		{
			name: 'wss',
			configureServer: startWss,
			configurePreviewServer: startWss,
		},
	],
	server: {
		proxy: {
			'/ws': {
				target: 'ws://localhost:8080',
				ws: true,
				rewriteWsOrigin: true,
			},
		},
		hmr: false,
		port: 80
	},
});
