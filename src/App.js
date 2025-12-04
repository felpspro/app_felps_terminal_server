import express from 'express';
import http from "http";
import cors from 'cors';
import db from '#database/mongo';
import WSService from '#services/index';
import uploadRoute from '#services/upload';

db(true);

const app = express();

// middlewares devem ficar no app, não no server
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app.project.felps.cc',
    'https://app.felps.cc'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/json', limit: '50mb' }));

// cria o servidor http baseado no app
const server = http.createServer(app);

// inicia WebSocket
WSService.init(server);
app.use(uploadRoute);

export { app, server };
