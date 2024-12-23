// Pictionary
export enum Modifier {
    Onzichtbaar = "Onzichtbaar",
    Sneller = "Sneller",
    Altijd_tekenen = "Altijd tekenen",
    Zwart_wit = "Zwart-wit",
}

// Quiz
export type question = {
    question: string;
    options: string[];
    answer: number;
}

// Scoreboard
export type score = {
    name: string;
    round: number;
    multiplier: number;
    score: number;
}

// Utils
export type timer = {
    subscribe(subscriber: (value: number) => void): () => void;
    end: (runCb?: boolean) => void;
}
