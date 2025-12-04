import { WebSocketServer } from "ws";
import {CLIENTS} from "#database/entities";

class WSService {
    constructor() {
        this.wss = null;
        this.clients = new Map();
    }

    init(server) {
        this.wss = new WebSocketServer({ server });
        this.wss.on("connection", (ws) => {
            ws.on("message", (m) => this.onMsg(ws, m));
            ws.on("close", () => this.onClose(ws));
        });
    }

    async onMsg(ws, m) {
        let d;
        try { 
            d = JSON.parse(m); 
        } catch { 
            return; 
        }
        const { event, payload } = d;
        // 
        if (event == "connect:init") {
            const { id } = (payload || {});
            if (!id) return;
            ws._id = id;
            // 
            const cfg = payload?.config;
            const data = {
                code: parseInt(id),
                name: payload.name,
                online: true,
                configs: {
                    isPublic: cfg.isPublic ?? false,
                    isPrinter_capaPedido: {
                        enabled: cfg.isPrinter_capaPedido?.enabled ?? false,
                        printer: cfg.isPrinter_capaPedido?.printer ?? null,
                    },
                    isPrinter_danfeSimple: {
                        enabled: cfg.isPrinter_danfeSimple?.enabled ?? false,
                        printer: cfg.isPrinter_danfeSimple?.printer ?? null,
                    },
                    isPrinter_shippingLabel: {
                        enabled: cfg.isPrinter_shippingLabel?.enabled ?? false,
                        printer: cfg.isPrinter_shippingLabel?.printer ?? null,
                    },
                }
            };
            await CLIENTS.findOneAndUpdate(
                { code:id },
                { $set: data },
                { upsert: true }
            );
            this.clients.set(id, { ws, data });

            // ✅ envia mensagem de confirmação para o cliente
            ws.send(JSON.stringify({
                event: "connect:ack",
                payload: { message: "Conectado com sucesso!", id }
            }));

            return;
        }

        if(event == 'host:name'){
            const { id, hostName } = payload;
            await CLIENTS.findOneAndUpdate(
                { code:id },
                { $set: { name:hostName } },
            );
            return;
        }

        if(event == 'host:config'){
            const { id = null, config = {} } = payload;
            await CLIENTS.findOneAndUpdate(
                { code:id },
                { $set: { 'params.configs':config } },
            );
            return;
        }

        if(event == 'client:print'){
            // Printer
            ;
            /* const { id = null, config = {} } = payload;
            await CLIENTS.findOneAndUpdate(
                { code:id },
                { $set: { 'params.configs':config } },
            );
            return; */
        }

        if(event == 'printer:update'){
            // Printer
            const { id = null, printers = [] } = payload;
            await CLIENTS.findOneAndUpdate(
                { code:id },
                { $set: { 'params.printers':printers } },
            );
            return;
        }

        if(event == 'client:print'){
            // Printer action
            const { 
                host = null,
                printer = null,
                base64 = null,
                type:fileType = null,
            } = payload;
            // 
            this.sendTo(host, 'printer:action', {
                printer: printer,
                type: fileType,
                base64
            })
            return;
        }
        

        if (event === "printer:job") {
            return;
        }
    }


    async onClose(ws) {
        const id = ws._id;
        if (!id) return;

        const old = this.clients.get(id);
        if (!old) return;

        await CLIENTS.findOneAndUpdate(
            { code:id },
            { $set: { online: false } }
        );

        this.clients.set(id, {
            ws: null,
            data: { ...old.data, online: false }
        });
    }

    sendTo(id, event, payload) {
        const c = this.clients.get(id);
        if (!c?.ws || c.ws.readyState !== 1) return;
        c.ws.send(JSON.stringify({ event, payload }));
    }

    broadcast(event, payload) {
        const msg = JSON.stringify({ event, payload });
        for (const c of this.clients.values()) {
            if (c.ws && c.ws.readyState === 1) c.ws.send(msg);
        }
    }

    getClient(id) {
        return this.clients.get(id)?.data || null;
    }
}

export default new WSService();
