import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: [vitePreprocess({ script: true })],
	onwarn: (warning, handler) => {
		if (!warning.code.includes('a11y')) handler(warning);
	},
};
