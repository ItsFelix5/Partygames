import './style.css';
//@ts-ignore
import App from './App.svelte';
//@ts-ignore
import WaitingRoom from './pages/WaitingRoom.svelte';
import { Connection } from './websocket.ts';
import type { ComponentType, SvelteComponent } from 'svelte';
import { store } from "./util/utils.ts";
import type { score } from "./types.ts";

declare global {
	var DEBUG: boolean;
	interface Window {
		connection: Connection;
		start: (b?: boolean) => void;
		restore: (s: number) => void;
		endTimer: () => void;
		endRound: () => void;
	}
}

globalThis.DEBUG = false; // I broke this c:

oncontextmenu = () => false;
//onbeforeunload = () => 'Weet je zeker dat je de pagina wilt verlaten?';
if ("wakelock" in navigator) {
	navigator.wakeLock.request();
	document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && navigator.wakeLock.request());
}

export const connection = window.connection = new Connection(undefined, DEBUG);
connection.name = 'server';

export let name = '???';
export let gameMaster = false;
export const setName = (n: string) => {
	name = n;
	if (name === 'Felix') gameMaster = true;
	connection.init(new WebSocket('/ws'));
	connection.once('open', () => {
		connection.send('join', name);
		app.$set({ content: WaitingRoom });
	});
};

const app: SvelteComponent<{ content: ComponentType<SvelteComponent> }, {}, {}> = new App({
	target: document.body,
	props: { content: undefined }
});

let round = 15;
let score = 0;
export const setScore = (s: number) => (round = Math.max(s, 15));
export function getScore(multiplier: number): score {
	const result = { name, round, multiplier, score };
	score += ~~(round * multiplier);
	round = 15;
	return result;
}

const _players: string[] = [];
export let players = store(_players);

if (DEBUG) {
	setName('Felix');
	_players.push('Felix');
	_players.push('Fred');
}

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
window.restore = (s: number, name?: string) => {
	if (name) connection.send('send', { name, event: 'restore', data: s });
	else score = s;
}

window.endRound = () => connection.broadcast('endround');

connection.on('endround', () => {
	app.$set({ content: WaitingRoom });
	round = 15;
});
