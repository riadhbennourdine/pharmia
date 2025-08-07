import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ObjectId } from 'mongodb';
import { connectToServer, getDb } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
        req.user = verified; // Attach user payload to request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token.' });
    }
};

// Middleware to check user roles
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied: Insufficient permissions.' });
        }
        next();
    };
};

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'https://pharmia-frontend-new.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Initial Data for Seeding
const INITIAL_DATA = {
  themes: [
    { id: 'maladies-courantes', Nom: 'Maladies courantes', description: 'Pathologies fréquemment rencontrées à l\'officine' },
    { id: 'ordonnances', Nom: 'Ordonnances', description: 'Analyse et validation des prescriptions' },
    { id: 'micronutrition', Nom: 'Micronutrition', description: 'Conseils nutritionnels et compléments alimentaires' },
    { id: 'dermocosmetique', Nom: 'Dermocosmétique', description: 'Produits de beauté et soins cutanés' },
    { id: 'dispositifs-medicaux', Nom: 'Dispositifs Médicaux', description: 'Matériel médical et paramédical' },
    { id: 'pharmacie-veterinaire', Nom: 'Pharmacie vétérinaire', description: 'Médicaments et soins pour animaux' },
    { id: 'communication', Nom: 'Communication', description: 'Techniques de conseil et relation client' },
  ],
  systemesOrganes: [
    { id: 'orl-respiration', Nom: 'ORL & Respiration', description: 'Troubles respiratoires et ORL' },
    { id: 'digestion', Nom: 'Digestion', description: 'Pathologies digestives et gastro-intestinales' },
    { id: 'sante-cutanee', Nom: 'Santé cutanée', description: 'Dermatologie et soins de la peau' },
    { id: 'muscles-articulations', Nom: 'Muscles & Articulations', description: 'Rhumatologie et traumatologie' },
    { id: 'sante-feminine', Nom: 'Santé Féminine', description: 'Gynécologie et contraception' },
    { id: 'cardio-circulation', Nom: 'Cardio & Circulation', description: 'Cardiologie et troubles vasculaires' },
    { id: 'pediatrie', Nom: 'Pédiatrie', description: 'Soins spécifiques aux enfants' },
    { id: 'sommeil-stress', Nom: 'Sommeil & Stress', description: 'Troubles du sommeil et gestion du stress' },
  ],
  memofiches: [],
};


// API Routes
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/api/data', async (req, res) => {
    try {
        const db = getDb();
        const collections = {
            themes: db.collection('themes'),
            systemesOrganes: db.collection('systemesOrganes'),
            memofiches: db.collection('memofiches')
        };

        // Seed database if empty
        if (await collections.themes.countDocuments() === 0) {
            await collections.themes.insertMany(INITIAL_DATA.themes);
        }
        if (await collections.systemesOrganes.countDocuments() === 0) {
            await collections.systemesOrganes.insertMany(INITIAL_DATA.systemesOrganes);
        }

        // Fetch all data
        const themes = await collections.themes.find({}).sort({ Nom: 1 }).toArray();
        const systemesOrganes = await collections.systemesOrganes.find({}).sort({ Nom: 1 }).toArray();
        const memofiches = await collections.memofiches.find({}).sort({ createdAt: -1 }).toArray();
        
        // The frontend expects `id`, but Mongo uses `_id`. Let's remap for consistency.
        const remapId = (item) => ({ ...item, id: item._id.toString() });
        
        res.json({
            themes: themes.map(remapId),
            systemesOrganes: systemesOrganes.map(remapId),
            memofiches: memofiches.map(remapId),
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/memofiches', verifyToken, authorizeRoles(['Admin', 'Formateur']), async (req, res) => {
    try {
        const db = getDb();
        const newFiche = req.body;
        
        // Ensure theme and system exist, create if they don't
        await db.collection('themes').updateOne(
            { id: newFiche.theme.id },
            { $setOnInsert: { id: newFiche.theme.id, Nom: newFiche.theme.Nom } },
            { upsert: true }
        );
        await db.collection('systemesOrganes').updateOne(
            { id: newFiche.systeme_organe.id },
            { $setOnInsert: { id: newFiche.systeme_organe.id, Nom: newFiche.systeme_organe.Nom } },
            { upsert: true }
        );

        // Insert the new memo fiche
        const result = await db.collection('memofiches').insertOne(newFiche);
        
        // Return the newly created document with its DB ID
        const savedFiche = { ...newFiche, id: result.insertedId.toString() };
        res.status(201).json(savedFiche);

    } catch (error) {
        console.error('Error creating memo fiche:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/api/memofiches/:id', async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const result = await db.collection('memofiches').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Memo fiche not found' });
        }

        res.status(200).json({ message: 'Memo fiche deleted successfully' });

    } catch (error) {
        console.error('Error deleting memo fiche:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update Memo Fiche
app.put('/api/memofiches/:id', verifyToken, authorizeRoles(['Admin', 'Formateur']), async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const updatedFiche = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Ensure theme and system exist, create if they don't (similar to POST)
        if (updatedFiche.theme) {
            await db.collection('themes').updateOne(
                { id: updatedFiche.theme.id },
                { $setOnInsert: { id: updatedFiche.theme.id, Nom: updatedFiche.theme.Nom } },
                { upsert: true }
            );
        }
        if (updatedFiche.systeme_organe) {
            await db.collection('systemesOrganes').updateOne(
                { id: updatedFiche.systeme_organe.id },
                { $setOnInsert: { id: updatedFiche.systeme_organe.id, Nom: updatedFiche.systeme_organe.Nom } },
                { upsert: true }
            );
        }

        // Remove _id from updatedFiche to prevent immutable field error
        const { _id, ...fieldsToUpdate } = updatedFiche;

        const result = await db.collection('memofiches').updateOne(
            { _id: new ObjectId(id) },
            { $set: fieldsToUpdate }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Memo fiche not found' });
        }

        // Return the updated document
        const savedFiche = await db.collection('memofiches').findOne({ _id: new ObjectId(id) });
        res.status(200).json({ ...savedFiche, id: savedFiche._id.toString() });

    } catch (error) {
        console.error('Error updating memo fiche:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const db = getDb();
        const { email, password, role, username, pharmacienResponsableId } = req.body;

        if (!email || !password || !role || !username) {
            return res.status(400).json({ message: 'Email, password, role, and username are required.' });
        }

        if (role === 'Preparateur' && !pharmacienResponsableId) {
            return res.status(400).json({ message: 'Pharmacien Responsable is required for Preparateur role.' });
        }

        const existingUserByEmail = await db.collection('users').findOne({ email });
        if (existingUserByEmail) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const existingUserByUsername = await db.collection('users').findOne({ username });
        if (existingUserByUsername) {
            return res.status(409).json({ message: 'User with this username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds

        const newUser = {
            email,
            username,
            password: hashedPassword,
            role,
            createdAt: new Date(),
        };

        if (role === 'Preparateur') {
            newUser.pharmacienResponsableId = new ObjectId(pharmacienResponsableId);
        }

        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const db = getDb();
        const { loginIdentifier, password } = req.body; // loginIdentifier can be email or username

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'Login identifier and password are required.' });
        }

        // Try to find user by email or username
        const user = await db.collection('users').findOne({
            $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'supersecretjwtkey', // Use a strong secret from .env
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Logged in successfully', token, role: user.role });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Pharmacien users for Preparateur selection
app.get('/api/pharmaciens', verifyToken, authorizeRoles(['Preparateur', 'Admin']), async (req, res) => {
    try {
        const db = getDb();
        const pharmaciens = await db.collection('users').find({ role: 'Pharmacien' }).project({ password: 0 }).toArray();
        res.status(200).json(pharmaciens);
    } catch (error) {
        console.error('Error fetching pharmaciens:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start server after DB connection
connectToServer().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
});
