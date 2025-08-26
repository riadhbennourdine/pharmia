import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // Allow all origins for this test

app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Hello from Vercel Backend!' });
});

export default async (req, res) => {
    app(req, res);
};