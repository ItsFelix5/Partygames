import { receive } from "./util/debugServer.ts";

export class Connection {
	private unhandled: Record<string, any[]> = {};
	private listeners: Record<string, (data?: any) => void> = {};
	send: (event: string, data?: any, log?: boolean) => void = () => console.warn('Message sent before connection was established! (' + this.name + ')');
	name = '???';

	constructor(socket?: WebSocket, debug = false) {
		if (debug) {
			this.send = (event, data, log = true) => {
				const r = receive(event, data);
				if (r?.length == 2) {
					if (log) console.log('Sent:', event, data, 'and received', r[0], r[1]);
					this.getListener(r[0])(r[1]);
				} else if (log) console.log('Sent:', event, data);
			};
			setTimeout(() => this.listeners['open']?.(), 10);
		} else if (socket) this.init(socket);
	}

	init(socket: WebSocket) {
		socket.onclose = () => {
			this.send = () => console.warn('Message sent after connection was closed! (' + this.name + ')');
			this.listeners['close']?.();
			console.log('Connection with ' + this.name + ' closed!');
		};
		socket.onerror = e => console.error(this.name + ' threw an error: ', (e as ErrorEvent).message);
		socket.onmessage = ({ data: msg }: { data: string }) => {
			if (!msg.startsWith('broadcast;')) console.log('Received', msg, 'from', this.name);
			const split = msg.indexOf(';');
			if (split == -1) this.getListener(msg)();
			else this.getListener(msg.substring(0, split))(JSON.parse(msg.substring(split + 1)));
		};
		socket.onopen = () => {
			console.log('Connection established!');
			this.send = (event, data, log = true) => {
				if (socket.readyState != socket.OPEN) { // idk if this is useful but it is too late to remove it
					this.send = () => console.warn('Message sent after connection was closed! (' + this.name + ')');
					this.listeners['close']?.();
					console.warn('Message sent after connection was closed and not deleted! (' + this.name + ')');
					return;
				}
				if (log) console.log('Sent:', event, data, 'to', this.name);
				if (event == 'close') return delete this.listeners['close'], socket.close();
				socket.send(event + (data ? ';' + JSON.stringify(data) : ''));
			};
			this.listeners['open']?.();
		};
	}

	on(event: string, listener: (data?: any) => void) {
		if (this.listeners[event]) console.warn('Listener for', event, 'was overwritten! (' + this.name + ')');
		this.listeners[event] = listener;
		this.unhandled[event]?.forEach(d => listener(d)); // Not good for once but write better code I guess
		delete this.unhandled[event];
	}

	getListener(event: string) {
		return this.listeners[event] || (event == "draw" || event == "chat" ? () => { } :
			((data?: any) => {
				console.warn('Message received from', this.name, 'but not handled (' + event, data + ')');
				(this.unhandled[event] ??= []).push(data);
			})
		);
	}

	removeListener(event: string) {
		delete this.listeners[event];
	}

	once(event: string, listener: (data?: any) => void) {
		this.on(event, (data?: any) => {
			listener(data);
			this.removeListener(event);
		});
	}

	broadcast(event: string, data?: any, excludeSelf = false) { // Client only but haha
		if (event != "draw") console.log('Broadcasting', event, data);
		this.send('broadcast', { event, data, excludeSelf }, false);
	}
}
