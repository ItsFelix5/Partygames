import { Connection } from '../src/websocket.ts';
import dataFile from './data.json' with { type: "json" };

const clients: Connection[] = [];
const data: { quiz: { question: string; answer: number; options?: string[] }[]; pictionary: string[] } = {
	quiz: [],
	pictionary: [],
};
let scores: {name: string, round: number, multiplier: number, score: number}[] = [];

export function connect(ws: WebSocket) {
	const connection = new Connection(ws);
	clients.push(connection);
	connection.once('join', name => {
		if (clients.some(p => p.name == name)) connection.send('close');
		connection.name = name;
		clients.forEach(client => {
			if(client.name == 'unknown') return;
			client.send('join', name);
			if (client.name != name) connection.send('join', client.name);
		});
	});
	connection.on('broadcast', ({ event, data, excludeSelf }) => clients.forEach(client => (!excludeSelf || client != connection) && client.send(event, data)));
	connection.once('close', () => {
		clients.splice(clients.indexOf(connection), 1);
		clients.forEach(client => client.send('leave', connection.name));
	});
	connection.on('start', () => {
		const type = ['pictionary'][0];
		const host = clients[~~(Math.random()*clients.length)].name;
		clients.forEach(client => client.send('game', { type, host }));
	});
	connection.on('score', (score) => {
		scores.push(score);
	});
	connection.on('data', (type: 'quiz' | 'pictionary' | 'scores') => {
		if(type == 'scores') {
			clients.forEach(client => client.send('data', scores));
			scores = [];
			return;
		}
		let list = data[type];
		if (list.length == 0) (data[type] as any) = list = dataFile[type].sort(() => Math.random() - 0.5);
		const item = list.pop();
		clients.forEach(client => client.send('data', item));
	});
}
