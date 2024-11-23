import './style.css';
//@ts-ignore
import App from './App.svelte';
//@ts-ignore
import Name from './pages/Name.svelte';
import { Connection } from './websocket.ts';
import type { ComponentType, SvelteComponent } from 'svelte';

document.oncontextmenu = () => false;

export const connection = new Connection(new WebSocket('/ws'));
connection.name = 'server';

export let name = 'unknown';
export const setName = (n: string) => (name = n);

const app: SvelteComponent<{ content: ComponentType<SvelteComponent> }, {}, {}> = new App({
	target: document.body,
	props: { content: undefined }
});
export const set = (content: ComponentType<SvelteComponent>) => app.$set({ content });

let round = 0;
let score = 0;
export const setScore = (s: number) => (round = s);
export function getScore(multiplier: number) {
	const result = { name, round, multiplier, score };
	score += ~~(round * multiplier);
	round = 0;
	return result;
}

function store<T>(value: T) {
	const subscribers: ((value: T) => void)[] = [];
	return {
		update() {
			for (const subscriber of subscribers) subscriber(value);
		},
		set(new_value: T) {
			if (value === new_value) return;
			value = new_value;
			for (const subscriber of subscribers) subscriber(value);
		},
		subscribe(subscriber: (value: T) => void): () => void {
			subscribers.push(subscriber);
			subscriber(value);
			return () => subscribers.splice(subscribers.indexOf(subscriber), 1);
		},
		get: () => value
	};
}

const _players: string[] = [];
export let players = store(_players);

connection.once('open', () => set(Name));

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

(window as any).set = set;
(window as any).connection = connection;
(window as any).start = (b?: boolean) => connection.send('start', b);
(window as any).restore = (s: number) => (score = s);
