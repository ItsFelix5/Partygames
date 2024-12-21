let score: any;

export function receive(event: string, data: any) {
	if (event == 'broadcast') {
		if (!data.excludeSelf) return [data.event, data.data];
	} else if (event == 'start') return ['game', { type: "pictionary", host: 'Felix', modifier: data != undefined ? ["Onzichtbaar", "Altijd tekenen", "Sneller", "Zwart-wit"][~~(Math.random() * 4)] : null }];
	else if (event == 'score') score = data;
	else if (event == 'data') {
		if (data == "scores") return ['data', [score, { name: "fred", round: 1000, multiplier: 1.5, score: 6 }]];
		else if (data == "quiz") return ['data', {
			"question": "Vraag?",
			"answer": 0,
			"options": ["Antwoord", "Fout", "Niet juist", "wawaaawwawaaa"]
		}];
		else return ['data', "woord"];
	}
}
