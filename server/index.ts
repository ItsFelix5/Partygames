import { Modifier, type score } from "../src/types.ts";
import { choose, shuffled } from "../src/util/utils.ts";
import { Connection } from '../src/websocket.ts';
import data from './data.json' with { type: "json" };

const clients: Connection[] = [];
let scores: score[] = [];
let words = shuffled(data.pictionary);
let quiz = shuffled(data.quiz);

function broadcast(event: string, data?: any) {
	console.log('Broadcasting', event, data);
	clients.forEach(client => client.send(event, data, false));
}

export function connect(ws: WebSocket) {
	const connection = new Connection(ws);
	connection.once('join', (name: string) => {
		if (clients.some(p => p.name == name)) return connection.send('close');
		clients.push(connection);
		connection.name = name;
		clients.forEach(client => {
			client.send('join', name);
			if (client.name != name) connection.send('join', client.name);
		});
	});
	connection.on('broadcast', ({ event, data, excludeSelf }) => clients.forEach(client => (!excludeSelf || client != connection) && client.send(event, data, false)));
	connection.once('close', () => {
		clients.splice(clients.indexOf(connection), 1);
		broadcast('leave', connection.name);
	});
	connection.on('start', (m: boolean) => {
		broadcast('pictionary', { host: clients[0].name, modifier: m ? choose(Object.values(Modifier)) : null, word: words() });
		clients.push(clients.shift()!);
	});
	connection.on('score', (score: score) => scores.push(score));
	connection.on('scores', () => {
		broadcast('scores', scores.filter(score => scores.filter(s => s.name == score.name).length == 1));
		scores = [];
	});
	connection.on('quiz', () => broadcast('quiz', quiz()));
	connection.on('error', error => console.error(connection.name, 'threw a client error:', error));
	connection.on('send', ({ name, event, data }) => clients.find(client => client.name == name)?.send(event, data));
}
