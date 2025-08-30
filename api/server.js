import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToServer, getDb } from './db.js';
import { askWithMemofiches } from './services/ragService.js';
import { generateSingleMemoFiche, generateCommunicationMemoFiche } from './services/generationService.js';

const app = express();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user payload to the request
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to connect to DB
app.use(async (req, res, next) => {
  try {
    await connectToServer();
    next();
  } catch (err) {
    console.error("Failed to connect to the database", err);
    res.status(500).send("Failed to connect to the database");
  }
});


// Routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express Backend on Vercel!' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({ status: 'success', message: 'Successfully connected to MongoDB' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to connect to MongoDB', error: err.message });
  }
});

app.get('/api/check-env', (req, res) => {
  const jwtSecretSet = !!process.env.JWT_SECRET;
  res.json({ JWT_SECRET_SET: jwtSecretSet });
});

app.get('/api/data', async (req, res) => {
  try {
    const db = getDb();
    const themes = await db.collection('themes').find({}).toArray();
    const systemesOrganes = await db.collection('systemesOrganes').find({}).toArray();
    const memofiches = await db.collection('memofiches').find({}).toArray();
    const badges = await db.collection('badges').find({}).toArray();
    res.json({ themes, systemesOrganes, memofiches, badges });
  } catch (err) {
    console.error("Failed to fetch data from MongoDB", err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch data', error: err.message });
  }
});

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const db = getDb();
    const { username, email, password, role, pharmacienResponsableId } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email or username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role,
      pharmacienResponsableId: role === 'Preparateur' ? pharmacienResponsableId : undefined,
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(newUser);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const db = getDb();
    const { loginIdentifier, password } = req.body;

    // Find user by email or username
    const user = await db.collection('users').findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Chatbot Message Route
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message } = req.body;
    const botResponse = await askWithMemofiches(message);
    res.json({ response: botResponse });
  } catch (err) {
    console.error("Error processing chatbot message:", err);
    res.status(500).json({ message: 'Server error processing chatbot message.' });
  }
});

app.get('/api/chatbot/history', (req, res) => {
  // This is a placeholder implementation. In a real application, you would fetch
  // the chat history from a database for the logged-in user.
  res.json([]);
});

// AI Coach Routes
app.post('/api/ai-coach/suggest-challenge', (req, res) => {
  // Placeholder - in a real app, this would use AI to suggest a challenge
  // based on user's progress, etc.
  res.json({
    type: "quiz",
    ficheId: "60d5ecb8d7f8f8001f8e8c8c", // Example ID
    title: "Quiz: Interactions Médicamenteuses Courantes",
    reasoning: "Pour renforcer vos connaissances sur un sujet crucial."
  });
});

app.post('/api/ai-coach/find-by-objective', (req, res) => {
  const { objective } = req.body;
  // Placeholder - in a real app, this would use AI to find a fiche
  // based on the provided objective.
  res.json({
    type: "fiche",
    ficheId: "60d5ecb8d7f8f8001f8e8c8d", // Example ID
    title: `Fiche sur : ${objective}`,
    reasoning: `Cette fiche est une excellente ressource pour l'objectif : ${objective}`
  });
});

// Generation routes
app.post('/api/generate/single', async (req, res) => {
  try {
    const { rawText, theme, system, options } = req.body;
    const fiche = await generateSingleMemoFiche(rawText, theme, system, options);
    res.json(fiche);
  } catch (err) {
    console.error("Error generating single memo fiche:", err);
    res.status(500).json({ message: 'Server error generating single memo fiche.' });
  }
});

app.post('/api/generate/communication', async (req, res) => {
  try {
    const { rawText, theme, options } = req.body;
    const fiche = await generateCommunicationMemoFiche(rawText, theme, options);
    res.json(fiche);
  } catch (err) {
    console.error("Error generating communication memo fiche:", err);
    res.status(500).json({ message: 'Server error generating communication memo fiche.' });
  }
});

// Update MemoFiche Route
app.put('/api/memofiches/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updatedFiche = req.body;

    // Ensure the ID is a valid MongoDB ObjectId if using ObjectId for _id
    const { ObjectId } = await import('mongodb');
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid MemoFiche ID.' });
    }

    // Remove _id from updatedFiche to prevent immutable field error
    delete updatedFiche._id;

    const result = await db.collection('memofiches').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFiche }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'MemoFiche not found.' });
    }

    res.json({ message: 'MemoFiche updated successfully.', updatedFiche: { _id: id, ...updatedFiche } });
  } catch (err) {
    console.error("Error updating memo fiche:", err);
    res.status(500).json({ message: 'Server error updating memo fiche.' });
  }
});

// Learner Space Route
app.get('/api/learner-space', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    // req.user.userId is a string, but _id in MongoDB is an ObjectId
    // We need to convert req.user.userId to ObjectId
    const user = await db.collection('users').findOne({ _id: new (await import('mongodb')).ObjectId(req.user.userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching learner data:", err);
    res.status(500).json({ message: 'Server error fetching learner data.' });
  }
});

// Vercel expects a default export for serverless functions
export default app;
