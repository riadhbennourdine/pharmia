import express from 'express';

const app = express();

app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Hello from Vercel Backend!' });
});

export default async (req, res) => {
    app(req, res);
};
