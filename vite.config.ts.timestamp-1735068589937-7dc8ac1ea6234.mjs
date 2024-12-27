// vite.config.ts
import { defineConfig } from "file:///home/gebruiker/partygames/node_modules/.deno/vite@5.4.11/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/gebruiker/partygames/node_modules/.deno/@sveltejs+vite-plugin-svelte@3.1.2/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";

// src/types.ts
var Modifier = /* @__PURE__ */ ((Modifier2) => {
  Modifier2["Onzichtbaar"] = "Onzichtbaar";
  Modifier2["Sneller"] = "Sneller";
  Modifier2["Altijd_tekenen"] = "Altijd tekenen";
  Modifier2["Zwart_wit"] = "Zwart-wit";
  return Modifier2;
})(Modifier || {});

// src/util/utils.ts
function choose(choices) {
  return choices[~~(Math.random() * choices.length)];
}
function shuffled(array) {
  let items = array.toSorted(() => Math.random() - 0.5);
  return () => {
    if (items.length == 0) items = array.toSorted(() => Math.random() - 0.5);
    return items.pop();
  };
}

// src/util/debugServer.ts
var score;
function receive(event, data) {
  if (event == "broadcast") {
    if (!data.excludeSelf) return [data.event, data.data];
  } else if (event == "start") return ["game", { type: "pictionary", host: "Felix", modifier: data != void 0 ? choose(["Onzichtbaar", "Altijd tekenen", "Sneller", "Zwart-wit"]) : null }];
  else if (event == "score") score = data;
  else if (event == "data") {
    if (data == "scores") return ["data", [score, { name: "fred", round: 1e3, multiplier: 1.5, score: 6 }]];
    else if (data == "quiz") return ["data", {
      "question": "Vraag?",
      "answer": 0,
      "options": ["Antwoord", "Fout", "Niet juist", "wawaaawwawaaa"]
    }];
    else return ["data", "woord"];
  }
}

// src/websocket.ts
var Connection = class {
  unhandled = {};
  listeners = {};
  send = () => console.warn("Message sent before connection was established! (" + this.name + ")");
  name = "???";
  constructor(socket, debug = false) {
    if (debug) {
      this.send = (event, data, log = true) => {
        const r = receive(event, data);
        if (r?.length == 2) {
          if (log) console.log("Sent:", event, data, "and received", r[0], r[1]);
          this.getListener(r[0])(r[1]);
        } else if (log) console.log("Sent:", event, data);
      };
      setTimeout(() => this.listeners["open"]?.(), 10);
    } else if (socket) this.init(socket);
  }
  init(socket) {
    socket.onclose = () => {
      this.send = () => console.warn("Message sent after connection was closed! (" + this.name + ")");
      this.listeners["close"]?.();
      console.log("Connection with " + this.name + " closed!");
    };
    socket.onerror = (e) => console.error(this.name + " threw an error: ", e.message);
    socket.onmessage = ({ data: msg }) => {
      if (!msg.startsWith("broadcast;")) console.log("Received", msg, "from", this.name);
      const split = msg.indexOf(";");
      if (split == -1) this.getListener(msg)();
      else this.getListener(msg.substring(0, split))(JSON.parse(msg.substring(split + 1)));
    };
    socket.onopen = () => {
      console.log("Connection established!");
      this.send = (event, data, log = true) => {
        if (socket.readyState != socket.OPEN) {
          this.send = () => console.warn("Message sent after connection was closed! (" + this.name + ")");
          this.listeners["close"]?.();
          console.warn("Message sent after connection was closed and not deleted! (" + this.name + ")");
          return;
        }
        if (log) console.log("Sent:", event, data, "to", this.name);
        if (event == "close") return delete this.listeners["close"], socket.close();
        socket.send(event + (data ? ";" + JSON.stringify(data) : ""));
      };
      this.listeners["open"]?.();
    };
  }
  on(event, listener) {
    if (this.listeners[event]) console.warn("Listener for", event, "was overwritten! (" + this.name + ")");
    this.listeners[event] = listener;
    this.unhandled[event]?.forEach((d) => listener(d));
    delete this.unhandled[event];
  }
  getListener(event) {
    return this.listeners[event] || (event == "draw" || event == "chat" ? () => {
    } : (data) => {
      console.warn("Message received from", this.name, "but not handled (" + event, data + ")");
      (this.unhandled[event] ??= []).push(data);
    });
  }
  removeListener(event) {
    delete this.listeners[event];
  }
  once(event, listener) {
    this.on(event, (data) => {
      listener(data);
      this.removeListener(event);
    });
  }
  broadcast(event, data, excludeSelf = false) {
    if (event != "draw") console.log("Broadcasting", event, data);
    this.send("broadcast", { event, data, excludeSelf }, false);
  }
};

// server/data.json
var data_default = {
  quiz: [
    {
      question: "Hoe heet de Kerstman?",
      answer: 3,
      options: ["sentaklaus", "santa klaus", "sinterklaas", "santa"]
    },
    {
      question: "Welk soort dieren heeft de Kerstman?",
      answer: 2,
      options: ["koeien", "elanden", "rendieren", "herten"]
    },
    {
      question: "Hoe heet het bekendste rendier van de kerstman?",
      answer: 3,
      options: ["Felix", "bard", "roodneus", "rudolf"]
    },
    {
      question: "Welk soort boom is een kerstboom?",
      answer: 0,
      options: ["eik", "den", "spar", "anders"]
    },
    {
      question: "Wat is 1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1?",
      answer: 2,
      options: ["37", "29", "33", "41"]
    },
    {
      question: "Wat vieren we met kerst?",
      answer: 2,
      options: ["De dood van eva", "De geboorte van Jezus", "iets anders", "cadeautjes"]
    },
    {
      question: "Wie kwam Maria zeggen dat Jezus op komst was?",
      answer: 1,
      options: ["God", "Gabriel", "Adam", "Onze Lieve Vrouw"]
    },
    {
      question: "Hoe heet de vrouw van de kerstman?",
      answer: 2,
      options: ["kerstvrouw", "mevrouw elf", "mevrouw claus", "bestaat niet"]
    },
    {
      question: "Elke kaars van advent staat voor 1 van de wat?",
      answer: 1,
      options: ["4 zaterdagen", "4 zondagen", "4 weken voor de Advent", "5 zondagen"]
    },
    {
      question: "Waar woonde Maria?",
      answer: 1,
      options: ["Betlehem", "Nazareth", "Jeruzalem", "Babylon"]
    },
    {
      question: "Wanneer is Jezus geboren?",
      answer: 3,
      options: ["oudjaar", "kerstdag", "nieuwjaar", "kerstavond"]
    },
    {
      question: "Wie is de opa van koning Filip?",
      answer: 2,
      options: ["Albert II", "Boudewijn", "Leopold III", "Leopold II"]
    },
    {
      question: "Waar werd kerstmis het eerst gevierd?",
      answer: 3,
      options: ["Jeruzalem", "Onbekend", "Amerika", "Rome"]
    },
    {
      question: "Waar word kerstmis elk jaar het eerst gevierd?",
      answer: 0,
      options: ["Kerst eiland", "Rome", "Japan", "Alaska"]
    },
    {
      question: "Hoe veel jaren oud is de kerstman?",
      answer: 3,
      options: ["2025", "1000", "2000", "dat weet niemand"]
    },
    {
      question: "Waaruit is de kerstman ontstaan?",
      answer: 1,
      options: ["een burgemeester die graag cadeaus uitdeelt", "sinterklaas", "coca cola", "iets anders"]
    },
    { question: "Krijgt iedereen vakantie op kerstmis?", answer: 1, options: ["ja", "nee"] },
    {
      question: "Waar vieren ze geen kerst?",
      answer: 2,
      options: ["USA", "Japan", "Saudi Arabi\xEB", "Duitsland"]
    },
    {
      question: "Wat stellen kerstballen voor?",
      answer: 3,
      options: ["appels", "niets", "kaarsen", "vruchten"]
    },
    {
      question: "Wat hoort bij kerst?",
      answer: 1,
      options: ["wortel", "piek", "voetbal", "klok"]
    },
    {
      question: "Wat hingen mensen vroeger in hun boom?",
      answer: 1,
      options: ["onderbroeken", "appels", "koekjes", "sokken"]
    },
    {
      question: "Wat zijn de kleuren van advent?",
      answer: 2,
      options: ["groen en rood", "rood en paars", "rood groen en geel", "groen en geel"]
    },
    {
      question: "Wie zijn de drie koningen?",
      answer: 1,
      options: ["casper, balthasar, melchor", "caspar, balthasar, melchior", "casper, balthasar, melchior", "caspar, baltasar, melchior"]
    },
    {
      question: "Waar is Jezus geboren?",
      answer: 3,
      options: ["Jeruzalem", "Kotshoven", "Nazareth", "Betlehem"]
    },
    {
      question: "Hoeveel rendieren heeft de kerstman?",
      answer: 1,
      options: ["geen", "9", "10", "13"]
    },
    {
      question: "Hoe zeg je gelukkig nieuwjaar in het engels?",
      answer: 2,
      options: ["marry christmas", "happy christmas", "happy new year", "marry newyear"]
    },
    {
      question: "Hoe noemt de oma van Jezus?",
      answer: 1,
      options: ["Eva", "Anna", "Ava", "Maria"]
    },
    {
      question: "Wat is de kerstgedachte?",
      answer: 0,
      options: ["vrede op aarde", "jezus is verjaard", "ik wil cadeaus", "dat bestaat niet"]
    },
    {
      question: "Wanneer word drie koningen gevierd?",
      answer: 2,
      options: ["1/6", "1/1", "6/1", "6/2"]
    },
    {
      question: "Hoe zijn Maria en Jozef naar Betlehem gegaan?",
      answer: 1,
      options: ["met een boot", "te voet", "op een ezel", "niet"]
    },
    {
      question: "In welk land ligt Jeruzalem?",
      answer: 3,
      options: ["Isra\xEBl", "Egypte", "Syri\xEB", "Hangt er vanaf"]
    },
    {
      question: "Wat is de kerstman?",
      answer: 1,
      options: ["een kabouter", "een mens", "een elf", "dat weten we niet"]
    },
    {
      question: "Wat vieren we met pasen?",
      answer: 2,
      options: ["De dood van eva", "De geboorte van Jezus", "Iets anders", "De dood van Josef"]
    },
    {
      question: "Wat is de voornaam van de paus?",
      answer: 2,
      options: ["Franciscus", "Benedictus", "Jorge", "Josef"]
    },
    {
      question: "Wat is de gekozen naam van de paus?",
      answer: 0,
      options: ["Franciscus", "Benedictus", "Jorge", "Josef"]
    },
    {
      question: "Hoeveel pausen zijn er (geweest)?",
      answer: 2,
      options: ["264", "265", "266", "287"]
    },
    {
      question: "Wat is het symbool van de katholieke kerk?",
      answer: 3,
      options: ["Adventskrans", "Kerk", "Kruis", "Crucifix"]
    },
    {
      question: "Hoeveel zijden heeft een vijfhoekige ster?",
      answer: 3,
      options: ["4", "5", "6", "10"]
    },
    {
      question: "Hoeveel zijden heeft ster?",
      answer: 3,
      options: ["10", "5", "6", "geen"]
    },
    {
      question: "In welk jaar werd de eerste kerstkaart verzonden?",
      answer: 0,
      options: ["1843", "1898", "1951", "0"]
    },
    {
      question: "Hoe zeg je 'Fijne kerst' in het Italiaans?",
      answer: 2,
      options: ["Buon Fine Settimana", "Buona Pasqua", "Buon Natale", "Fijne kerst"]
    },
    {
      question: "Hoe stuurden mensen elkaar kerstgroeten in de Middeleeuwen?",
      answer: 2,
      options: ["met brieven", "met geverfde stenen", "met een houtsnijwerk", "Niet"]
    },
    {
      question: "Welke geschenken brachten de drie wijzen mee naar Jezus?",
      answer: 3,
      options: ["Zilver, olie, mirre", "Goud, geurige olie en mirre", "Goud, zilver en mirre", "Goud, wierook en mirre"]
    },
    {
      question: "Welk woord schrijf je volgens de offici\xEBle regels met een hoofdletter?",
      answer: 2,
      options: ["Kerst", "Kerstmis", "Kerstfeest", "3 Koningen"]
    },
    {
      question: "Waar is de piek bovenop de kerstboom op gebaseerd?",
      answer: 1,
      options: ["Het vroeg pieken tijdens het kerstontbijt", "De Ster van Bethlehem", "De helderste ster aan de hemel in de nacht voor kerst", "Niets"]
    },
    {
      question: "Hoe vaak hebben wij een witte kerst gehad in de laatste 100 jaar?",
      answer: 0,
      options: ["8", "13", "14", "65"]
    },
    {
      question: "Hoe lang duurt het voor een kerstboom volwassen is?",
      answer: 3,
      options: ["6 maanden", "1 jaar", "3 jaar", "8 jaar"]
    },
    {
      question: "Hoe veel echte kerstbomen worden ongeveer per jaar verkocht?",
      answer: 3,
      options: ["900000", "2500000", "4700000", "5392000"]
    },
    {
      question: "Waar vier je sowiso geen witte kerst?",
      answer: 1,
      options: ["Tokyo", "Canberra", "New York", "Belgi\xEB"]
    },
    {
      question: "Wat moet je doen om je kerstboom zo lang mogelijk mooi te houden?",
      answer: 1,
      options: ["Eierschalen in de grond steken", "Elke dag 1l water geven", "Elke week 5l water geven", "Elke dag 5dl water geven"]
    }
  ],
  pictionary: [
    "Kerstboom",
    "Snowboard",
    "Jezus",
    "Ezel",
    "Stal",
    "Kip",
    "Kaas",
    "Os",
    "Melk",
    "Lied",
    "Modder",
    "Koning",
    "Zonsondergang",
    "Gitaar",
    "Ridder",
    "Auto",
    "Kalkoen",
    "Huis",
    "Telefoon",
    "Rendier",
    "Kerstman",
    "Slee",
    "Sneeuwvlok",
    "Kaars",
    "Sfeer",
    "Emmer",
    "Kerstquiz",
    "Vuurwerk",
    "Advent",
    "Oma",
    "Jezus",
    "Jaguar"
  ]
};

// server/index.ts
var clients = [];
var scores = [];
var words = shuffled(data_default.pictionary);
var quiz = shuffled(data_default.quiz);
function broadcast(event, data) {
  console.log("Broadcasting", event, data);
  clients.forEach((client) => client.send(event, data, false));
}
function connect(ws) {
  const connection = new Connection(ws);
  connection.once("join", (name) => {
    if (clients.some((p) => p.name == name)) return connection.send("close");
    clients.push(connection);
    connection.name = name;
    clients.forEach((client) => {
      client.send("join", name);
      if (client.name != name) connection.send("join", client.name);
    });
  });
  connection.on("broadcast", ({ event, data, excludeSelf }) => clients.forEach((client) => (!excludeSelf || client != connection) && client.send(event, data, false)));
  connection.once("close", () => {
    clients.splice(clients.indexOf(connection), 1);
    broadcast("leave", connection.name);
  });
  connection.on("start", (m) => {
    broadcast("pictionary", { host: clients[0].name, modifier: m ? choose(Object.values(Modifier)) : null, word: words() });
    clients.push(clients.shift());
  });
  connection.on("score", (score2) => scores.push(score2));
  connection.on("scores", () => {
    broadcast("scores", scores.filter((score2) => scores.filter((s) => s.name == score2.name).length == 1));
    scores = [];
  });
  connection.on("quiz", () => broadcast("quiz", quiz()));
  connection.on("error", (error) => console.error(connection.name, "threw a client error:", error));
  connection.on("send", ({ name, event, data }) => clients.find((client) => client.name == name)?.send(event, data));
}

// vite.config.ts
function startWss() {
  Deno.serve({ port: 8080 }, async (req) => {
    if (req.headers.get("upgrade") !== "websocket")
      return new Response("Not a websocket request", { status: 400 });
    const { socket, response } = Deno.upgradeWebSocket(req);
    connect(socket);
    return response;
  });
}
var vite_config_default = defineConfig({
  plugins: [
    svelte(),
    {
      name: "wss",
      configureServer: startWss,
      configurePreviewServer: startWss
    }
  ],
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        rewriteWsOrigin: true
      }
    },
    hmr: false
  },
  preview: {
    port: 80
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3R5cGVzLnRzIiwgInNyYy91dGlsL3V0aWxzLnRzIiwgInNyYy91dGlsL2RlYnVnU2VydmVyLnRzIiwgInNyYy93ZWJzb2NrZXQudHMiLCAic2VydmVyL2RhdGEuanNvbiIsICJzZXJ2ZXIvaW5kZXgudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZ2VicnVpa2VyL3BhcnR5Z2FtZXMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZ2VicnVpa2VyL3BhcnR5Z2FtZXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnO1xuaW1wb3J0IHsgY29ubmVjdCB9IGZyb20gJy4vc2VydmVyL2luZGV4LnRzJztcblxuZnVuY3Rpb24gc3RhcnRXc3MoKSB7XG5cdERlbm8uc2VydmUoeyBwb3J0OiA4MDgwIH0sIGFzeW5jIHJlcSA9PiB7XG5cdFx0aWYgKHJlcS5oZWFkZXJzLmdldCgndXBncmFkZScpICE9PSAnd2Vic29ja2V0Jylcblx0XHRcdHJldHVybiBuZXcgUmVzcG9uc2UoJ05vdCBhIHdlYnNvY2tldCByZXF1ZXN0JywgeyBzdGF0dXM6IDQwMCB9KTtcblx0XHRjb25zdCB7IHNvY2tldCwgcmVzcG9uc2UgfSA9IERlbm8udXBncmFkZVdlYlNvY2tldChyZXEpO1xuXHRcdGNvbm5lY3Qoc29ja2V0KTtcblx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbXG5cdFx0c3ZlbHRlKCksXG5cdFx0e1xuXHRcdFx0bmFtZTogJ3dzcycsXG5cdFx0XHRjb25maWd1cmVTZXJ2ZXI6IHN0YXJ0V3NzLFxuXHRcdFx0Y29uZmlndXJlUHJldmlld1NlcnZlcjogc3RhcnRXc3MsXG5cdFx0fSxcblx0XSxcblx0c2VydmVyOiB7XG5cdFx0cHJveHk6IHtcblx0XHRcdCcvd3MnOiB7XG5cdFx0XHRcdHRhcmdldDogJ3dzOi8vbG9jYWxob3N0OjgwODAnLFxuXHRcdFx0XHR3czogdHJ1ZSxcblx0XHRcdFx0cmV3cml0ZVdzT3JpZ2luOiB0cnVlLFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdGhtcjogZmFsc2UsXG5cdH0sXG5cdHByZXZpZXc6IHtcblx0XHRwb3J0OiA4MCxcblx0fSxcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NyYy90eXBlcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zcmMvdHlwZXMudHNcIjsvLyBQaWN0aW9uYXJ5XG5leHBvcnQgZW51bSBNb2RpZmllciB7XG4gICAgT256aWNodGJhYXIgPSBcIk9uemljaHRiYWFyXCIsXG4gICAgU25lbGxlciA9IFwiU25lbGxlclwiLFxuICAgIEFsdGlqZF90ZWtlbmVuID0gXCJBbHRpamQgdGVrZW5lblwiLFxuICAgIFp3YXJ0X3dpdCA9IFwiWndhcnQtd2l0XCIsXG59XG5cbi8vIFF1aXpcbmV4cG9ydCB0eXBlIHF1ZXN0aW9uID0ge1xuICAgIHF1ZXN0aW9uOiBzdHJpbmc7XG4gICAgb3B0aW9uczogc3RyaW5nW107XG4gICAgYW5zd2VyOiBudW1iZXI7XG59XG5cbi8vIFNjb3JlYm9hcmRcbmV4cG9ydCB0eXBlIHNjb3JlID0ge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByb3VuZDogbnVtYmVyO1xuICAgIG11bHRpcGxpZXI6IG51bWJlcjtcbiAgICBzY29yZTogbnVtYmVyO1xufVxuXG4vLyBVdGlsc1xuZXhwb3J0IHR5cGUgdGltZXIgPSB7XG4gICAgc3Vic2NyaWJlKHN1YnNjcmliZXI6ICh2YWx1ZTogbnVtYmVyKSA9PiB2b2lkKTogKCkgPT4gdm9pZDtcbiAgICBlbmQ6IChydW5DYj86IGJvb2xlYW4pID0+IHZvaWQ7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NyYy91dGlsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zcmMvdXRpbC91dGlscy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zcmMvdXRpbC91dGlscy50c1wiO2V4cG9ydCBmdW5jdGlvbiBzdG9yZTxUPih2YWx1ZTogVCkge1xuICAgIGNvbnN0IHN1YnNjcmliZXJzOiAoKHZhbHVlOiBUKSA9PiB2b2lkKVtdID0gW107XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXBkYXRlKCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSBzdWJzY3JpYmVyKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KG5ld192YWx1ZTogVCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBuZXdfdmFsdWUpIHJldHVybjtcbiAgICAgICAgICAgIHZhbHVlID0gbmV3X3ZhbHVlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSBzdWJzY3JpYmVyKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3Vic2NyaWJlKHN1YnNjcmliZXI6ICh2YWx1ZTogVCkgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICAgICAgICAgICAgc3Vic2NyaWJlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHN1YnNjcmliZXJzLnNwbGljZShzdWJzY3JpYmVycy5pbmRleE9mKHN1YnNjcmliZXIpLCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiAoKSA9PiB2YWx1ZVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUaW1lcih0aW1lOiBudW1iZXIsIGNiPzogKCkgPT4gdm9pZCwgc3BlZWQgPSAxMDAwKSB7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnM6ICgodmFsdWU6IG51bWJlcikgPT4gdm9pZClbXSA9IFtdO1xuICAgIGNvbnN0IGVuZCA9IERhdGUubm93KCkgKyB0aW1lICogc3BlZWQ7XG5cbiAgICBsZXQgZW5kZWQgPSBmYWxzZTtcbiAgICB3aW5kb3cuZW5kVGltZXIgPSAocnVuQ2IgPSB0cnVlKSA9PiB7XG4gICAgICAgIGlmIChlbmRlZCkgcmV0dXJuO1xuICAgICAgICBlbmRlZCA9IHRydWU7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICBpZiAocnVuQ2IpIGNiPy4oKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KDAsIE1hdGgucm91bmQoKGVuZCAtIERhdGUubm93KCkpIC8gc3BlZWQpKTtcbiAgICAgICAgc3Vic2NyaWJlcnMuZm9yRWFjaChzID0+IHModGltZSkpO1xuICAgICAgICBpZiAodGltZSA9PSAwKSB3aW5kb3cuZW5kVGltZXIoKTtcbiAgICB9LCBzcGVlZCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmUoc3Vic2NyaWJlcjogKHZhbHVlOiBudW1iZXIpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLnB1c2goc3Vic2NyaWJlcik7XG4gICAgICAgICAgICBzdWJzY3JpYmVyKHRpbWUpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHN1YnNjcmliZXJzLnNwbGljZShzdWJzY3JpYmVycy5pbmRleE9mKHN1YnNjcmliZXIpLCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiB3aW5kb3cuZW5kVGltZXJcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hvb3NlPFQ+KGNob2ljZXM6IFRbXSkge1xuICAgIHJldHVybiBjaG9pY2VzW35+KE1hdGgucmFuZG9tKCkgKiBjaG9pY2VzLmxlbmd0aCldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZWQ8VD4oYXJyYXk6IFRbXSkge1xuICAgIGxldCBpdGVtcyA9IGFycmF5LnRvU29ydGVkKCgpID0+IE1hdGgucmFuZG9tKCkgLSAwLjUpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChpdGVtcy5sZW5ndGggPT0gMCkgaXRlbXMgPSBhcnJheS50b1NvcnRlZCgoKSA9PiBNYXRoLnJhbmRvbSgpIC0gMC41KTtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLnBvcCgpIGFzIFQ7XG4gICAgfTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvZ2VicnVpa2VyL3BhcnR5Z2FtZXMvc3JjL3V0aWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NyYy91dGlsL2RlYnVnU2VydmVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NyYy91dGlsL2RlYnVnU2VydmVyLnRzXCI7aW1wb3J0IHsgY2hvb3NlIH0gZnJvbSBcIi4vdXRpbHMudHNcIjtcblxubGV0IHNjb3JlOiBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNlaXZlKGV2ZW50OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuXHRpZiAoZXZlbnQgPT0gJ2Jyb2FkY2FzdCcpIHtcblx0XHRpZiAoIWRhdGEuZXhjbHVkZVNlbGYpIHJldHVybiBbZGF0YS5ldmVudCwgZGF0YS5kYXRhXTtcblx0fSBlbHNlIGlmIChldmVudCA9PSAnc3RhcnQnKSByZXR1cm4gWydnYW1lJywgeyB0eXBlOiBcInBpY3Rpb25hcnlcIiwgaG9zdDogJ0ZlbGl4JywgbW9kaWZpZXI6IGRhdGEgIT0gdW5kZWZpbmVkID8gY2hvb3NlKFtcIk9uemljaHRiYWFyXCIsIFwiQWx0aWpkIHRla2VuZW5cIiwgXCJTbmVsbGVyXCIsIFwiWndhcnQtd2l0XCJdKSA6IG51bGwgfV07XG5cdGVsc2UgaWYgKGV2ZW50ID09ICdzY29yZScpIHNjb3JlID0gZGF0YTtcblx0ZWxzZSBpZiAoZXZlbnQgPT0gJ2RhdGEnKSB7XG5cdFx0aWYgKGRhdGEgPT0gXCJzY29yZXNcIikgcmV0dXJuIFsnZGF0YScsIFtzY29yZSwgeyBuYW1lOiBcImZyZWRcIiwgcm91bmQ6IDEwMDAsIG11bHRpcGxpZXI6IDEuNSwgc2NvcmU6IDYgfV1dO1xuXHRcdGVsc2UgaWYgKGRhdGEgPT0gXCJxdWl6XCIpIHJldHVybiBbJ2RhdGEnLCB7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiVnJhYWc/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAwLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkFudHdvb3JkXCIsIFwiRm91dFwiLCBcIk5pZXQganVpc3RcIiwgXCJ3YXdhYWF3d2F3YWFhXCJdXG5cdFx0fV07XG5cdFx0ZWxzZSByZXR1cm4gWydkYXRhJywgXCJ3b29yZFwiXTtcblx0fVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NyYy93ZWJzb2NrZXQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZ2VicnVpa2VyL3BhcnR5Z2FtZXMvc3JjL3dlYnNvY2tldC50c1wiO2ltcG9ydCB7IHJlY2VpdmUgfSBmcm9tIFwiLi91dGlsL2RlYnVnU2VydmVyLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uIHtcblx0cHJpdmF0ZSB1bmhhbmRsZWQ6IFJlY29yZDxzdHJpbmcsIGFueVtdPiA9IHt9O1xuXHRwcml2YXRlIGxpc3RlbmVyczogUmVjb3JkPHN0cmluZywgKGRhdGE/OiBhbnkpID0+IHZvaWQ+ID0ge307XG5cdHNlbmQ6IChldmVudDogc3RyaW5nLCBkYXRhPzogYW55LCBsb2c/OiBib29sZWFuKSA9PiB2b2lkID0gKCkgPT4gY29uc29sZS53YXJuKCdNZXNzYWdlIHNlbnQgYmVmb3JlIGNvbm5lY3Rpb24gd2FzIGVzdGFibGlzaGVkISAoJyArIHRoaXMubmFtZSArICcpJyk7XG5cdG5hbWUgPSAnPz8/JztcblxuXHRjb25zdHJ1Y3Rvcihzb2NrZXQ/OiBXZWJTb2NrZXQsIGRlYnVnID0gZmFsc2UpIHtcblx0XHRpZiAoZGVidWcpIHtcblx0XHRcdHRoaXMuc2VuZCA9IChldmVudCwgZGF0YSwgbG9nID0gdHJ1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCByID0gcmVjZWl2ZShldmVudCwgZGF0YSk7XG5cdFx0XHRcdGlmIChyPy5sZW5ndGggPT0gMikge1xuXHRcdFx0XHRcdGlmIChsb2cpIGNvbnNvbGUubG9nKCdTZW50OicsIGV2ZW50LCBkYXRhLCAnYW5kIHJlY2VpdmVkJywgclswXSwgclsxXSk7XG5cdFx0XHRcdFx0dGhpcy5nZXRMaXN0ZW5lcihyWzBdKShyWzFdKTtcblx0XHRcdFx0fSBlbHNlIGlmIChsb2cpIGNvbnNvbGUubG9nKCdTZW50OicsIGV2ZW50LCBkYXRhKTtcblx0XHRcdH07XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHRoaXMubGlzdGVuZXJzWydvcGVuJ10/LigpLCAxMCk7XG5cdFx0fSBlbHNlIGlmIChzb2NrZXQpIHRoaXMuaW5pdChzb2NrZXQpO1xuXHR9XG5cblx0aW5pdChzb2NrZXQ6IFdlYlNvY2tldCkge1xuXHRcdHNvY2tldC5vbmNsb3NlID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5zZW5kID0gKCkgPT4gY29uc29sZS53YXJuKCdNZXNzYWdlIHNlbnQgYWZ0ZXIgY29ubmVjdGlvbiB3YXMgY2xvc2VkISAoJyArIHRoaXMubmFtZSArICcpJyk7XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1snY2xvc2UnXT8uKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnQ29ubmVjdGlvbiB3aXRoICcgKyB0aGlzLm5hbWUgKyAnIGNsb3NlZCEnKTtcblx0XHR9O1xuXHRcdHNvY2tldC5vbmVycm9yID0gZSA9PiBjb25zb2xlLmVycm9yKHRoaXMubmFtZSArICcgdGhyZXcgYW4gZXJyb3I6ICcsIChlIGFzIEVycm9yRXZlbnQpLm1lc3NhZ2UpO1xuXHRcdHNvY2tldC5vbm1lc3NhZ2UgPSAoeyBkYXRhOiBtc2cgfTogeyBkYXRhOiBzdHJpbmcgfSkgPT4ge1xuXHRcdFx0aWYgKCFtc2cuc3RhcnRzV2l0aCgnYnJvYWRjYXN0OycpKSBjb25zb2xlLmxvZygnUmVjZWl2ZWQnLCBtc2csICdmcm9tJywgdGhpcy5uYW1lKTtcblx0XHRcdGNvbnN0IHNwbGl0ID0gbXNnLmluZGV4T2YoJzsnKTtcblx0XHRcdGlmIChzcGxpdCA9PSAtMSkgdGhpcy5nZXRMaXN0ZW5lcihtc2cpKCk7XG5cdFx0XHRlbHNlIHRoaXMuZ2V0TGlzdGVuZXIobXNnLnN1YnN0cmluZygwLCBzcGxpdCkpKEpTT04ucGFyc2UobXNnLnN1YnN0cmluZyhzcGxpdCArIDEpKSk7XG5cdFx0fTtcblx0XHRzb2NrZXQub25vcGVuID0gKCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Nvbm5lY3Rpb24gZXN0YWJsaXNoZWQhJyk7XG5cdFx0XHR0aGlzLnNlbmQgPSAoZXZlbnQsIGRhdGEsIGxvZyA9IHRydWUpID0+IHtcblx0XHRcdFx0aWYgKHNvY2tldC5yZWFkeVN0YXRlICE9IHNvY2tldC5PUEVOKSB7IC8vIGlkayBpZiB0aGlzIGlzIHVzZWZ1bCBidXQgaXQgaXMgdG9vIGxhdGUgdG8gcmVtb3ZlIGl0XG5cdFx0XHRcdFx0dGhpcy5zZW5kID0gKCkgPT4gY29uc29sZS53YXJuKCdNZXNzYWdlIHNlbnQgYWZ0ZXIgY29ubmVjdGlvbiB3YXMgY2xvc2VkISAoJyArIHRoaXMubmFtZSArICcpJyk7XG5cdFx0XHRcdFx0dGhpcy5saXN0ZW5lcnNbJ2Nsb3NlJ10/LigpO1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybignTWVzc2FnZSBzZW50IGFmdGVyIGNvbm5lY3Rpb24gd2FzIGNsb3NlZCBhbmQgbm90IGRlbGV0ZWQhICgnICsgdGhpcy5uYW1lICsgJyknKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGxvZykgY29uc29sZS5sb2coJ1NlbnQ6JywgZXZlbnQsIGRhdGEsICd0bycsIHRoaXMubmFtZSk7XG5cdFx0XHRcdGlmIChldmVudCA9PSAnY2xvc2UnKSByZXR1cm4gZGVsZXRlIHRoaXMubGlzdGVuZXJzWydjbG9zZSddLCBzb2NrZXQuY2xvc2UoKTtcblx0XHRcdFx0c29ja2V0LnNlbmQoZXZlbnQgKyAoZGF0YSA/ICc7JyArIEpTT04uc3RyaW5naWZ5KGRhdGEpIDogJycpKTtcblx0XHRcdH07XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1snb3BlbiddPy4oKTtcblx0XHR9O1xuXHR9XG5cblx0b24oZXZlbnQ6IHN0cmluZywgbGlzdGVuZXI6IChkYXRhPzogYW55KSA9PiB2b2lkKSB7XG5cdFx0aWYgKHRoaXMubGlzdGVuZXJzW2V2ZW50XSkgY29uc29sZS53YXJuKCdMaXN0ZW5lciBmb3InLCBldmVudCwgJ3dhcyBvdmVyd3JpdHRlbiEgKCcgKyB0aGlzLm5hbWUgKyAnKScpO1xuXHRcdHRoaXMubGlzdGVuZXJzW2V2ZW50XSA9IGxpc3RlbmVyO1xuXHRcdHRoaXMudW5oYW5kbGVkW2V2ZW50XT8uZm9yRWFjaChkID0+IGxpc3RlbmVyKGQpKTsgLy8gTm90IGdvb2QgZm9yIG9uY2UgYnV0IHdyaXRlIGJldHRlciBjb2RlIEkgZ3Vlc3Ncblx0XHRkZWxldGUgdGhpcy51bmhhbmRsZWRbZXZlbnRdO1xuXHR9XG5cblx0Z2V0TGlzdGVuZXIoZXZlbnQ6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmxpc3RlbmVyc1tldmVudF0gfHwgKGV2ZW50ID09IFwiZHJhd1wiIHx8IGV2ZW50ID09IFwiY2hhdFwiID8gKCkgPT4geyB9IDpcblx0XHRcdCgoZGF0YT86IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ01lc3NhZ2UgcmVjZWl2ZWQgZnJvbScsIHRoaXMubmFtZSwgJ2J1dCBub3QgaGFuZGxlZCAoJyArIGV2ZW50LCBkYXRhICsgJyknKTtcblx0XHRcdFx0KHRoaXMudW5oYW5kbGVkW2V2ZW50XSA/Pz0gW10pLnB1c2goZGF0YSk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXHRyZW1vdmVMaXN0ZW5lcihldmVudDogc3RyaW5nKSB7XG5cdFx0ZGVsZXRlIHRoaXMubGlzdGVuZXJzW2V2ZW50XTtcblx0fVxuXG5cdG9uY2UoZXZlbnQ6IHN0cmluZywgbGlzdGVuZXI6IChkYXRhPzogYW55KSA9PiB2b2lkKSB7XG5cdFx0dGhpcy5vbihldmVudCwgKGRhdGE/OiBhbnkpID0+IHtcblx0XHRcdGxpc3RlbmVyKGRhdGEpO1xuXHRcdFx0dGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCk7XG5cdFx0fSk7XG5cdH1cblxuXHRicm9hZGNhc3QoZXZlbnQ6IHN0cmluZywgZGF0YT86IGFueSwgZXhjbHVkZVNlbGYgPSBmYWxzZSkgeyAvLyBDbGllbnQgb25seSBidXQgaGFoYVxuXHRcdGlmIChldmVudCAhPSBcImRyYXdcIikgY29uc29sZS5sb2coJ0Jyb2FkY2FzdGluZycsIGV2ZW50LCBkYXRhKTtcblx0XHR0aGlzLnNlbmQoJ2Jyb2FkY2FzdCcsIHsgZXZlbnQsIGRhdGEsIGV4Y2x1ZGVTZWxmIH0sIGZhbHNlKTtcblx0fVxufVxuIiwgIntcblx0XCJxdWl6XCI6IFtcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiSG9lIGhlZXQgZGUgS2Vyc3RtYW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcInNlbnRha2xhdXNcIiwgXCJzYW50YSBrbGF1c1wiLCBcInNpbnRlcmtsYWFzXCIsIFwic2FudGFcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXZWxrIHNvb3J0IGRpZXJlbiBoZWVmdCBkZSBLZXJzdG1hbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDIsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wia29laWVuXCIsIFwiZWxhbmRlblwiLCBcInJlbmRpZXJlblwiLCBcImhlcnRlblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZSBoZWV0IGhldCBiZWtlbmRzdGUgcmVuZGllciB2YW4gZGUga2Vyc3RtYW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkZlbGl4XCIsIFwiYmFyZFwiLCBcInJvb2RuZXVzXCIsIFwicnVkb2xmXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2VsayBzb29ydCBib29tIGlzIGVlbiBrZXJzdGJvb20/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAwLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcImVpa1wiLCBcImRlblwiLCBcInNwYXJcIiwgXCJhbmRlcnNcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYXQgaXMgMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzErMSsxKzE/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIjM3XCIsIFwiMjlcIiwgXCIzM1wiLCBcIjQxXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2F0IHZpZXJlbiB3ZSBtZXQga2Vyc3Q/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkRlIGRvb2QgdmFuIGV2YVwiLCBcIkRlIGdlYm9vcnRlIHZhbiBKZXp1c1wiLCBcImlldHMgYW5kZXJzXCIsIFwiY2FkZWF1dGplc1wiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldpZSBrd2FtIE1hcmlhIHplZ2dlbiBkYXQgSmV6dXMgb3Aga29tc3Qgd2FzP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMSxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJHb2RcIiwgXCJHYWJyaWVsXCIsIFwiQWRhbVwiLCBcIk9uemUgTGlldmUgVnJvdXdcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2UgaGVldCBkZSB2cm91dyB2YW4gZGUga2Vyc3RtYW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcImtlcnN0dnJvdXdcIiwgXCJtZXZyb3V3IGVsZlwiLCBcIm1ldnJvdXcgY2xhdXNcIiwgXCJiZXN0YWF0IG5pZXRcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJFbGtlIGthYXJzIHZhbiBhZHZlbnQgc3RhYXQgdm9vciAxIHZhbiBkZSB3YXQ/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAxLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIjQgemF0ZXJkYWdlblwiLCBcIjQgem9uZGFnZW5cIiwgXCI0IHdla2VuIHZvb3IgZGUgQWR2ZW50XCIsIFwiNSB6b25kYWdlblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhYXIgd29vbmRlIE1hcmlhP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMSxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJCZXRsZWhlbVwiLCBcIk5hemFyZXRoXCIsIFwiSmVydXphbGVtXCIsIFwiQmFieWxvblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhbm5lZXIgaXMgSmV6dXMgZ2Vib3Jlbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wib3VkamFhclwiLCBcImtlcnN0ZGFnXCIsIFwibmlldXdqYWFyXCIsIFwia2Vyc3Rhdm9uZFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldpZSBpcyBkZSBvcGEgdmFuIGtvbmluZyBGaWxpcD9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDIsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiQWxiZXJ0IElJXCIsIFwiQm91ZGV3aWpuXCIsIFwiTGVvcG9sZCBJSUlcIiwgXCJMZW9wb2xkIElJXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2FhciB3ZXJkIGtlcnN0bWlzIGhldCBlZXJzdCBnZXZpZXJkP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMyxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJKZXJ1emFsZW1cIiwgXCJPbmJla2VuZFwiLCBcIkFtZXJpa2FcIiwgXCJSb21lXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2FhciB3b3JkIGtlcnN0bWlzIGVsayBqYWFyIGhldCBlZXJzdCBnZXZpZXJkP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMCxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJLZXJzdCBlaWxhbmRcIiwgXCJSb21lXCIsIFwiSmFwYW5cIiwgXCJBbGFza2FcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2UgdmVlbCBqYXJlbiBvdWQgaXMgZGUga2Vyc3RtYW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIjIwMjVcIiwgXCIxMDAwXCIsIFwiMjAwMFwiLCBcImRhdCB3ZWV0IG5pZW1hbmRcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYWFydWl0IGlzIGRlIGtlcnN0bWFuIG9udHN0YWFuP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMSxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJlZW4gYnVyZ2VtZWVzdGVyIGRpZSBncmFhZyBjYWRlYXVzIHVpdGRlZWx0XCIsIFwic2ludGVya2xhYXNcIiwgXCJjb2NhIGNvbGFcIiwgXCJpZXRzIGFuZGVyc1wiXVxuXHRcdH0sXG5cdFx0eyBcInF1ZXN0aW9uXCI6IFwiS3Jpamd0IGllZGVyZWVuIHZha2FudGllIG9wIGtlcnN0bWlzP1wiLCBcImFuc3dlclwiOiAxLCBcIm9wdGlvbnNcIjogW1wiamFcIiwgXCJuZWVcIl0gfSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2FhciB2aWVyZW4gemUgZ2VlbiBrZXJzdD9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDIsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiVVNBXCIsIFwiSmFwYW5cIiwgXCJTYXVkaSBBcmFiaVx1MDBFQlwiLCBcIkR1aXRzbGFuZFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhdCBzdGVsbGVuIGtlcnN0YmFsbGVuIHZvb3I/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcImFwcGVsc1wiLCBcIm5pZXRzXCIsIFwia2FhcnNlblwiLCBcInZydWNodGVuXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2F0IGhvb3J0IGJpaiBrZXJzdD9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wid29ydGVsXCIsIFwicGlla1wiLCBcInZvZXRiYWxcIiwgXCJrbG9rXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2F0IGhpbmdlbiBtZW5zZW4gdnJvZWdlciBpbiBodW4gYm9vbT9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wib25kZXJicm9la2VuXCIsIFwiYXBwZWxzXCIsIFwia29la2plc1wiLCBcInNva2tlblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhdCB6aWpuIGRlIGtsZXVyZW4gdmFuIGFkdmVudD9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDIsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiZ3JvZW4gZW4gcm9vZFwiLCBcInJvb2QgZW4gcGFhcnNcIiwgXCJyb29kIGdyb2VuIGVuIGdlZWxcIiwgXCJncm9lbiBlbiBnZWVsXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2llIHppam4gZGUgZHJpZSBrb25pbmdlbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiY2FzcGVyLCBiYWx0aGFzYXIsIG1lbGNob3JcIiwgXCJjYXNwYXIsIGJhbHRoYXNhciwgbWVsY2hpb3JcIiwgXCJjYXNwZXIsIGJhbHRoYXNhciwgbWVsY2hpb3JcIiwgXCJjYXNwYXIsIGJhbHRhc2FyLCBtZWxjaGlvclwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhYXIgaXMgSmV6dXMgZ2Vib3Jlbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiSmVydXphbGVtXCIsIFwiS290c2hvdmVuXCIsIFwiTmF6YXJldGhcIiwgXCJCZXRsZWhlbVwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZXZlZWwgcmVuZGllcmVuIGhlZWZ0IGRlIGtlcnN0bWFuP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMSxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJnZWVuXCIsIFwiOVwiLCBcIjEwXCIsIFwiMTNcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2UgemVnIGplIGdlbHVra2lnIG5pZXV3amFhciBpbiBoZXQgZW5nZWxzP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMixcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJtYXJyeSBjaHJpc3RtYXNcIiwgXCJoYXBweSBjaHJpc3RtYXNcIiwgXCJoYXBweSBuZXcgeWVhclwiLCBcIm1hcnJ5IG5ld3llYXJcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2Ugbm9lbXQgZGUgb21hIHZhbiBKZXp1cz9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiRXZhXCIsIFwiQW5uYVwiLCBcIkF2YVwiLCBcIk1hcmlhXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2F0IGlzIGRlIGtlcnN0Z2VkYWNodGU/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAwLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcInZyZWRlIG9wIGFhcmRlXCIsIFwiamV6dXMgaXMgdmVyamFhcmRcIiwgXCJpayB3aWwgY2FkZWF1c1wiLCBcImRhdCBiZXN0YWF0IG5pZXRcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYW5uZWVyIHdvcmQgZHJpZSBrb25pbmdlbiBnZXZpZXJkP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMixcblx0XHRcdFwib3B0aW9uc1wiOiBbXCIxLzZcIiwgXCIxLzFcIiwgXCI2LzFcIiwgXCI2LzJcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2UgemlqbiBNYXJpYSBlbiBKb3plZiBuYWFyIEJldGxlaGVtIGdlZ2Fhbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wibWV0IGVlbiBib290XCIsIFwidGUgdm9ldFwiLCBcIm9wIGVlbiBlemVsXCIsIFwibmlldFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkluIHdlbGsgbGFuZCBsaWd0IEplcnV6YWxlbT9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiSXNyYVx1MDBFQmxcIiwgXCJFZ3lwdGVcIiwgXCJTeXJpXHUwMEVCXCIsIFwiSGFuZ3QgZXIgdmFuYWZcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYXQgaXMgZGUga2Vyc3RtYW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAxLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcImVlbiBrYWJvdXRlclwiLCBcImVlbiBtZW5zXCIsIFwiZWVuIGVsZlwiLCBcImRhdCB3ZXRlbiB3ZSBuaWV0XCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2F0IHZpZXJlbiB3ZSBtZXQgcGFzZW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkRlIGRvb2QgdmFuIGV2YVwiLCBcIkRlIGdlYm9vcnRlIHZhbiBKZXp1c1wiLCBcIklldHMgYW5kZXJzXCIsIFwiRGUgZG9vZCB2YW4gSm9zZWZcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYXQgaXMgZGUgdm9vcm5hYW0gdmFuIGRlIHBhdXM/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkZyYW5jaXNjdXNcIiwgXCJCZW5lZGljdHVzXCIsIFwiSm9yZ2VcIiwgXCJKb3NlZlwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhdCBpcyBkZSBnZWtvemVuIG5hYW0gdmFuIGRlIHBhdXM/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAwLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkZyYW5jaXNjdXNcIiwgXCJCZW5lZGljdHVzXCIsIFwiSm9yZ2VcIiwgXCJKb3NlZlwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZXZlZWwgcGF1c2VuIHppam4gZXIgKGdld2Vlc3QpP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMixcblx0XHRcdFwib3B0aW9uc1wiOiBbXCIyNjRcIiwgXCIyNjVcIiwgXCIyNjZcIiwgXCIyODdcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYXQgaXMgaGV0IHN5bWJvb2wgdmFuIGRlIGthdGhvbGlla2Uga2Vyaz9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiQWR2ZW50c2tyYW5zXCIsIFwiS2Vya1wiLCBcIktydWlzXCIsIFwiQ3J1Y2lmaXhcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2V2ZWVsIHppamRlbiBoZWVmdCBlZW4gdmlqZmhvZWtpZ2Ugc3Rlcj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiNFwiLCBcIjVcIiwgXCI2XCIsIFwiMTBcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2V2ZWVsIHppamRlbiBoZWVmdCBzdGVyP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMyxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCIxMFwiLCBcIjVcIiwgXCI2XCIsIFwiZ2VlblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkluIHdlbGsgamFhciB3ZXJkIGRlIGVlcnN0ZSBrZXJzdGthYXJ0IHZlcnpvbmRlbj9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDAsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiMTg0M1wiLCBcIjE4OThcIiwgXCIxOTUxXCIsIFwiMFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZSB6ZWcgamUgJ0Zpam5lIGtlcnN0JyBpbiBoZXQgSXRhbGlhYW5zP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMixcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJCdW9uIEZpbmUgU2V0dGltYW5hXCIsIFwiQnVvbmEgUGFzcXVhXCIsIFwiQnVvbiBOYXRhbGVcIiwgXCJGaWpuZSBrZXJzdFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZSBzdHV1cmRlbiBtZW5zZW4gZWxrYWFyIGtlcnN0Z3JvZXRlbiBpbiBkZSBNaWRkZWxlZXV3ZW4/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIm1ldCBicmlldmVuXCIsIFwibWV0IGdldmVyZmRlIHN0ZW5lblwiLCBcIm1ldCBlZW4gaG91dHNuaWp3ZXJrXCIsIFwiTmlldFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldlbGtlIGdlc2NoZW5rZW4gYnJhY2h0ZW4gZGUgZHJpZSB3aWp6ZW4gbWVlIG5hYXIgSmV6dXM/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIlppbHZlciwgb2xpZSwgbWlycmVcIiwgXCJHb3VkLCBnZXVyaWdlIG9saWUgZW4gbWlycmVcIiwgXCJHb3VkLCB6aWx2ZXIgZW4gbWlycmVcIiwgXCJHb3VkLCB3aWVyb29rIGVuIG1pcnJlXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiV2VsayB3b29yZCBzY2hyaWpmIGplIHZvbGdlbnMgZGUgb2ZmaWNpXHUwMEVCbGUgcmVnZWxzIG1ldCBlZW4gaG9vZmRsZXR0ZXI/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAyLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIktlcnN0XCIsIFwiS2Vyc3RtaXNcIiwgXCJLZXJzdGZlZXN0XCIsIFwiMyBLb25pbmdlblwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhYXIgaXMgZGUgcGllayBib3Zlbm9wIGRlIGtlcnN0Ym9vbSBvcCBnZWJhc2VlcmQ/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAxLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIkhldCB2cm9lZyBwaWVrZW4gdGlqZGVucyBoZXQga2Vyc3RvbnRiaWp0XCIsIFwiRGUgU3RlciB2YW4gQmV0aGxlaGVtXCIsIFwiRGUgaGVsZGVyc3RlIHN0ZXIgYWFuIGRlIGhlbWVsIGluIGRlIG5hY2h0IHZvb3Iga2Vyc3RcIiwgXCJOaWV0c1wiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIkhvZSB2YWFrIGhlYmJlbiB3aWogZWVuIHdpdHRlIGtlcnN0IGdlaGFkIGluIGRlIGxhYXRzdGUgMTAwIGphYXI/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAwLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIjhcIiwgXCIxM1wiLCBcIjE0XCIsIFwiNjVcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJIb2UgbGFuZyBkdXVydCBoZXQgdm9vciBlZW4ga2Vyc3Rib29tIHZvbHdhc3NlbiBpcz9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDMsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiNiBtYWFuZGVuXCIsIFwiMSBqYWFyXCIsIFwiMyBqYWFyXCIsIFwiOCBqYWFyXCJdXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcInF1ZXN0aW9uXCI6IFwiSG9lIHZlZWwgZWNodGUga2Vyc3Rib21lbiB3b3JkZW4gb25nZXZlZXIgcGVyIGphYXIgdmVya29jaHQ/XCIsXG5cdFx0XHRcImFuc3dlclwiOiAzLFxuXHRcdFx0XCJvcHRpb25zXCI6IFtcIjkwMDAwMFwiLCBcIjI1MDAwMDBcIiwgXCI0NzAwMDAwXCIsIFwiNTM5MjAwMFwiXVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0XCJxdWVzdGlvblwiOiBcIldhYXIgdmllciBqZSBzb3dpc28gZ2VlbiB3aXR0ZSBrZXJzdD9cIixcblx0XHRcdFwiYW5zd2VyXCI6IDEsXG5cdFx0XHRcIm9wdGlvbnNcIjogW1wiVG9reW9cIiwgXCJDYW5iZXJyYVwiLCBcIk5ldyBZb3JrXCIsIFwiQmVsZ2lcdTAwRUJcIl1cblx0XHR9LFxuXHRcdHtcblx0XHRcdFwicXVlc3Rpb25cIjogXCJXYXQgbW9ldCBqZSBkb2VuIG9tIGplIGtlcnN0Ym9vbSB6byBsYW5nIG1vZ2VsaWprIG1vb2kgdGUgaG91ZGVuP1wiLFxuXHRcdFx0XCJhbnN3ZXJcIjogMSxcblx0XHRcdFwib3B0aW9uc1wiOiBbXCJFaWVyc2NoYWxlbiBpbiBkZSBncm9uZCBzdGVrZW5cIiwgXCJFbGtlIGRhZyAxbCB3YXRlciBnZXZlblwiLCBcIkVsa2Ugd2VlayA1bCB3YXRlciBnZXZlblwiLCBcIkVsa2UgZGFnIDVkbCB3YXRlciBnZXZlblwiXVxuXHRcdH1cblx0XSxcblx0XCJwaWN0aW9uYXJ5XCI6IFtcblx0XHRcIktlcnN0Ym9vbVwiLFxuXHRcdFwiU25vd2JvYXJkXCIsXG5cdFx0XCJKZXp1c1wiLFxuXHRcdFwiRXplbFwiLFxuXHRcdFwiU3RhbFwiLFxuXHRcdFwiS2lwXCIsXG5cdFx0XCJLYWFzXCIsXG5cdFx0XCJPc1wiLFxuXHRcdFwiTWVsa1wiLFxuXHRcdFwiTGllZFwiLFxuXHRcdFwiTW9kZGVyXCIsXG5cdFx0XCJLb25pbmdcIixcblx0XHRcIlpvbnNvbmRlcmdhbmdcIixcblx0XHRcIkdpdGFhclwiLFxuXHRcdFwiUmlkZGVyXCIsXG5cdFx0XCJBdXRvXCIsXG5cdFx0XCJLYWxrb2VuXCIsXG5cdFx0XCJIdWlzXCIsXG5cdFx0XCJUZWxlZm9vblwiLFxuXHRcdFwiUmVuZGllclwiLFxuXHRcdFwiS2Vyc3RtYW5cIixcblx0XHRcIlNsZWVcIixcblx0XHRcIlNuZWV1d3Zsb2tcIixcblx0XHRcIkthYXJzXCIsXG5cdFx0XCJTZmVlclwiLFxuXHRcdFwiRW1tZXJcIixcblx0XHRcIktlcnN0cXVpelwiLFxuXHRcdFwiVnV1cndlcmtcIixcblx0XHRcIkFkdmVudFwiLFxuXHRcdFwiT21hXCIsXG5cdFx0XCJKZXp1c1wiLFxuXHRcdFwiSmFndWFyXCJcblx0XVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zZXJ2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2dlYnJ1aWtlci9wYXJ0eWdhbWVzL3NlcnZlci9pbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9nZWJydWlrZXIvcGFydHlnYW1lcy9zZXJ2ZXIvaW5kZXgudHNcIjtpbXBvcnQgeyBNb2RpZmllciwgdHlwZSBzY29yZSB9IGZyb20gXCIuLi9zcmMvdHlwZXMudHNcIjtcbmltcG9ydCB7IGNob29zZSwgc2h1ZmZsZWQgfSBmcm9tIFwiLi4vc3JjL3V0aWwvdXRpbHMudHNcIjtcbmltcG9ydCB7IENvbm5lY3Rpb24gfSBmcm9tICcuLi9zcmMvd2Vic29ja2V0LnRzJztcbmltcG9ydCBkYXRhIGZyb20gJy4vZGF0YS5qc29uJyB3aXRoIHsgdHlwZTogXCJqc29uXCIgfTtcblxuY29uc3QgY2xpZW50czogQ29ubmVjdGlvbltdID0gW107XG5sZXQgc2NvcmVzOiBzY29yZVtdID0gW107XG5sZXQgd29yZHMgPSBzaHVmZmxlZChkYXRhLnBpY3Rpb25hcnkpO1xubGV0IHF1aXogPSBzaHVmZmxlZChkYXRhLnF1aXopO1xuXG5mdW5jdGlvbiBicm9hZGNhc3QoZXZlbnQ6IHN0cmluZywgZGF0YT86IGFueSkge1xuXHRjb25zb2xlLmxvZygnQnJvYWRjYXN0aW5nJywgZXZlbnQsIGRhdGEpO1xuXHRjbGllbnRzLmZvckVhY2goY2xpZW50ID0+IGNsaWVudC5zZW5kKGV2ZW50LCBkYXRhLCBmYWxzZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdCh3czogV2ViU29ja2V0KSB7XG5cdGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbih3cyk7XG5cdGNvbm5lY3Rpb24ub25jZSgnam9pbicsIChuYW1lOiBzdHJpbmcpID0+IHtcblx0XHRpZiAoY2xpZW50cy5zb21lKHAgPT4gcC5uYW1lID09IG5hbWUpKSByZXR1cm4gY29ubmVjdGlvbi5zZW5kKCdjbG9zZScpO1xuXHRcdGNsaWVudHMucHVzaChjb25uZWN0aW9uKTtcblx0XHRjb25uZWN0aW9uLm5hbWUgPSBuYW1lO1xuXHRcdGNsaWVudHMuZm9yRWFjaChjbGllbnQgPT4ge1xuXHRcdFx0Y2xpZW50LnNlbmQoJ2pvaW4nLCBuYW1lKTtcblx0XHRcdGlmIChjbGllbnQubmFtZSAhPSBuYW1lKSBjb25uZWN0aW9uLnNlbmQoJ2pvaW4nLCBjbGllbnQubmFtZSk7XG5cdFx0fSk7XG5cdH0pO1xuXHRjb25uZWN0aW9uLm9uKCdicm9hZGNhc3QnLCAoeyBldmVudCwgZGF0YSwgZXhjbHVkZVNlbGYgfSkgPT4gY2xpZW50cy5mb3JFYWNoKGNsaWVudCA9PiAoIWV4Y2x1ZGVTZWxmIHx8IGNsaWVudCAhPSBjb25uZWN0aW9uKSAmJiBjbGllbnQuc2VuZChldmVudCwgZGF0YSwgZmFsc2UpKSk7XG5cdGNvbm5lY3Rpb24ub25jZSgnY2xvc2UnLCAoKSA9PiB7XG5cdFx0Y2xpZW50cy5zcGxpY2UoY2xpZW50cy5pbmRleE9mKGNvbm5lY3Rpb24pLCAxKTtcblx0XHRicm9hZGNhc3QoJ2xlYXZlJywgY29ubmVjdGlvbi5uYW1lKTtcblx0fSk7XG5cdGNvbm5lY3Rpb24ub24oJ3N0YXJ0JywgKG06IGJvb2xlYW4pID0+IHtcblx0XHRicm9hZGNhc3QoJ3BpY3Rpb25hcnknLCB7IGhvc3Q6IGNsaWVudHNbMF0ubmFtZSwgbW9kaWZpZXI6IG0gPyBjaG9vc2UoT2JqZWN0LnZhbHVlcyhNb2RpZmllcikpIDogbnVsbCwgd29yZDogd29yZHMoKSB9KTtcblx0XHRjbGllbnRzLnB1c2goY2xpZW50cy5zaGlmdCgpISk7XG5cdH0pO1xuXHRjb25uZWN0aW9uLm9uKCdzY29yZScsIChzY29yZTogc2NvcmUpID0+IHNjb3Jlcy5wdXNoKHNjb3JlKSk7XG5cdGNvbm5lY3Rpb24ub24oJ3Njb3JlcycsICgpID0+IHtcblx0XHRicm9hZGNhc3QoJ3Njb3JlcycsIHNjb3Jlcy5maWx0ZXIoc2NvcmUgPT4gc2NvcmVzLmZpbHRlcihzID0+IHMubmFtZSA9PSBzY29yZS5uYW1lKS5sZW5ndGggPT0gMSkpO1xuXHRcdHNjb3JlcyA9IFtdO1xuXHR9KTtcblx0Y29ubmVjdGlvbi5vbigncXVpeicsICgpID0+IGJyb2FkY2FzdCgncXVpeicsIHF1aXooKSkpO1xuXHRjb25uZWN0aW9uLm9uKCdlcnJvcicsIGVycm9yID0+IGNvbnNvbGUuZXJyb3IoY29ubmVjdGlvbi5uYW1lLCAndGhyZXcgYSBjbGllbnQgZXJyb3I6JywgZXJyb3IpKTtcblx0Y29ubmVjdGlvbi5vbignc2VuZCcsICh7IG5hbWUsIGV2ZW50LCBkYXRhIH0pID0+IGNsaWVudHMuZmluZChjbGllbnQgPT4gY2xpZW50Lm5hbWUgPT0gbmFtZSk/LnNlbmQoZXZlbnQsIGRhdGEpKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1EsU0FBUyxvQkFBb0I7QUFDN1IsU0FBUyxjQUFjOzs7QUNBaEIsSUFBSyxXQUFMLGtCQUFLQSxjQUFMO0FBQ0gsRUFBQUEsVUFBQSxpQkFBYztBQUNkLEVBQUFBLFVBQUEsYUFBVTtBQUNWLEVBQUFBLFVBQUEsb0JBQWlCO0FBQ2pCLEVBQUFBLFVBQUEsZUFBWTtBQUpKLFNBQUFBO0FBQUEsR0FBQTs7O0FDK0NMLFNBQVMsT0FBVSxTQUFjO0FBQ3BDLFNBQU8sUUFBUSxDQUFDLEVBQUUsS0FBSyxPQUFPLElBQUksUUFBUSxPQUFPO0FBQ3JEO0FBRU8sU0FBUyxTQUFZLE9BQVk7QUFDcEMs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
