import './style.css';
//@ts-ignore
import App from './App.svelte';
//@ts-ignore
import Name from './pages/Name.svelte';
//@ts-ignore
import WaitingRoom from './pages/WaitingRoom.svelte';
import { Connection } from './websocket.ts';
import type { ComponentType, SvelteComponent } from 'svelte';
import { store } from "./util/utils.ts";

declare global {
	var DEBUG: boolean;
	interface Window {
		connection: Connection;
		start: (b?: boolean) => void;
		restore: (s: number) => void;
		endRound: () => void;
	}
}

globalThis.DEBUG = false;

oncontextmenu = () => false;
//onbeforeunload = () => 'Weet je zeker dat je de pagina wilt verlaten?';

export const connection = window.connection = new Connection(DEBUG ? (null as any as WebSocket) : new WebSocket('/ws'));
connection.name = 'server';

export let name = 'unknown';
export const setName = (n: string) => {
	name = n;
	app.$set({ content: WaitingRoom });
};

const app: SvelteComponent<{ content: ComponentType<SvelteComponent> }, {}, {}> = new App({
	target: document.body,
	props: { content: undefined }
});

let round = 0;
let score = 0;
export const setScore = (s: number) => (round = s);
export function getScore(multiplier: number) {
	const result = { name, round, multiplier, score };
	score += ~~(round * multiplier);
	round = 0;
	return result;
}

const _players: string[] = [];
export let players = store(_players);

connection.once('open', () => {
	if (DEBUG) {
		setName('Felix');
		_players.push('Felix');
		_players.push('Fred');
	} else app.$set({ content: Name });
});

connection.once('close', () => {
	document.body.innerHTML = 'Verbinding verbroken!';
});

connection.on('join', (name: string) => {
	_players.push(name);
	players.update();
});

connection.on('leave', (name: string) => {
	if (!_players.includes(name)) return; //My code is perfect
	_players.splice(
		_players.findIndex(n => n === name),
		1
	);
	players.update();
});

const { error } = console;
console.error = (...args: any[]) => {
	error(...args);
	connection.send('error', args.join(' '));
};
window.onerror = (message, source, lineno, colno, error) => connection.send('error', `${message} (${source} ${lineno}:${colno}`);
window.onunhandledrejection = error => connection.send('error', error.reason);

window.start = (b?: boolean) => connection.send('start', b);
window.restore = (s: number) => (score = s);
