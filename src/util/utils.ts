export function store<T>(value: T) {
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

export function createTimer(time: number, cb?: () => void, speed = 1000) {
    const subscribers: ((value: number) => void)[] = [];
    const end = Date.now() + time * speed;

    let ended = false;
    window.endTimer = (runCb = true) => {
        if (ended) return;
        ended = true;
        clearInterval(interval);
        if (runCb) cb?.();
    }

    const interval = setInterval(() => {
        time = Math.max(0, Math.round((end - Date.now()) / speed));
        subscribers.forEach(s => s(time));
        if (time == 0) window.endTimer();
    }, speed);

    return {
        subscribe(subscriber: (value: number) => void): () => void {
            subscribers.push(subscriber);
            subscriber(time);
            return () => subscribers.splice(subscribers.indexOf(subscriber), 1);
        },
        end: window.endTimer
    };
}

export function choose<T>(choices: T[]) {
    return choices[~~(Math.random() * choices.length)];
}

export function shuffled<T>(array: T[]) {
    let items = array.toSorted(() => Math.random() - 0.5);
    return () => {
        if (items.length == 0) items = array.toSorted(() => Math.random() - 0.5);
        return items.pop() as T;
    };
}
