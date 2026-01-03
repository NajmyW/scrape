const WebSocket = require("ws");

class TravelBotSession {
    constructor() {
        this.ws = null;
        this.queue = [];
        this.processing = false;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket("ws://3.16.159.231:8090/ws");

            this.ws.on("open", () => {
                this.connected = true;
                resolve();
            });

            this.ws.on("error", err => reject(err));
        });
    }

    ask(text) {
        return new Promise((resolve, reject) => {
            this.queue.push({ text, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (!this.connected || this.processing || this.queue.length === 0) return;

        this.processing = true;

        const { text, resolve, reject } = this.queue.shift();

        let sawThinking = false;
        let finalMessage = null;

        const onMessage = data => {
            let res;
            try { res = JSON.parse(data.toString()); }
            catch { return; }

            if (res.type === "message" && !sawThinking) return;

            if (res.type === "thinking") {
                sawThinking = true;
                return;
            }

            if (res.type === "message" && sawThinking) {
                finalMessage = res;
                cleanup();
                resolve(res.content);
            }
        };

        const cleanup = () => {
            this.ws.off("message", onMessage);
            this.processing = false;
            this.processQueue();
        };

        this.ws.on("message", onMessage);

        this.ws.send(JSON.stringify({
            type: "message",
            content: text
        }));
    }

    close() {
        if (this.ws) this.ws.close();
    }
}

/*
(async () => {
    const session = new TravelBotSession();
    await session.connect();

    console.log(await session.ask("halo"));
    console.log(await session.ask("aku mau ke jepang"));
    console.log(await session.ask("buat 2 orang bulan depan"));

    session.close();
})();
*/
