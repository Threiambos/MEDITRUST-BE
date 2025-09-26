import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
