import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

const app = express();

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

app.get('/api/data', async (req, res) => {
  try {
    const db = getDb();
    const themes = await db.collection('themes').find({}).toArray();
    const systemesOrganes = await db.collection('systemesOrganes').find({}).toArray();
    const memofiches = await db.collection('memofiches').find({}).toArray();
    res.json({ themes, systemesOrganes, memofiches });
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

// Vercel expects a default export for serverless functions
export default app;