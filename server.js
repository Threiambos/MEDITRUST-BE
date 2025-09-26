import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { ServerTest } from './src/constants/ServerTest.js';
import AuthController from './src/controllers/AuthController.js'; // fixed relative path
import databaseConnector from './src/configs/DatabaseConnector.js'; // example for DB connection

dotenv.config();

const PORT = process.env.PORT || 8081;
const app = express();

// Middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
app.use(express.json());

databaseConnector();

app.use('/api/auth', AuthController);

app.get('/health', (req, res) => {
  res.json(ServerTest);
});

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
