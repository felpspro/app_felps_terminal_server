import express from 'express';
import http from "http";
import cors from 'cors';
import db from '#database/mongo';
import WSService from '#services/index';
import uploadRoute from '#services/upload';

db(true);

const app = express();

// middlewares devem ficar no app PARA NAO DAR PROBLEMA NO TERMINAL
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/json', limit: '50mb' }));

// cria o servidor http baseado no app
const server = http.createServer(app);

// inicia WebSocket
WSService.init(server);
app.use(uploadRoute);

export { app, server };
