import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ObjectId } from 'mongodb';
import { connectToServer, getDb } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto'; // Added for crypto.randomUUID()

// --- AI Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
let genAI;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// --- Badge Definitions ---
const BADGES = {
    FIRST_QUIZ: { id: 'FIRST_QUIZ', name: "Premier Pas", description: "Terminez votre premier quiz.", icon: "FiAward" },
    READ_3_FICHES: { id: 'READ_3_FICHES', name: "Lecteur Assidu", description: "Lisez 3 fiches.", icon: "FiBookOpen" },
    PERFECT_SCORE: { id: 'PERFECT_SCORE', name: "Maître du Quiz", description: "Obtenez un score de 100% à un quiz.", icon: "FiTarget" },
    LEVEL_INTERMEDIATE: { id: 'LEVEL_INTERMEDIATE', name: "Apprenti Intermédiaire", description: "Atteignez le niveau Intermédiaire.", icon: "FiTrendingUp" },
    LEVEL_EXPERT: { id: 'LEVEL_EXPERT', name: "Expert Confirmé", description: "Atteignez le niveau Expert.", icon: "FiStar" },
};


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
const allowedOrigins = [
    'https://pharmia-frontend-new.onrender.com',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
            badges: Object.values(BADGES) // Also send badge definitions to the frontend
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
        
        // Find existing theme by Nom
        if (newFiche.theme && newFiche.theme.Nom) {
            let theme = await db.collection('themes').findOne({ Nom: newFiche.theme.Nom });
            if (!theme) {
                const result = await db.collection('themes').insertOne({ Nom: newFiche.theme.Nom });
                newFiche.theme.id = result.insertedId.toString();
            } else {
                newFiche.theme.id = theme._id.toString();
            }
        }

        // Find existing systeme_organe by Nom, or create a default if it doesn't exist
        if (newFiche.systeme_organe && newFiche.systeme_organe.Nom) {
            let systemeOrgane = await db.collection('systemesOrganes').findOne({ Nom: newFiche.systeme_organe.Nom });
            if (!systemeOrgane) {
                const newSystemId = crypto.randomUUID();
                const result = await db.collection('systemesOrganes').insertOne({ id: newSystemId, Nom: newFiche.systeme_organe.Nom });
                newFiche.systeme_organe.id = newSystemId;
            } else {
                newFiche.systeme_organe.id = systemeOrgane.id;
            }
        } else {
            // If it doesn't exist, create a default placeholder to avoid breaking the data model
            newFiche.systeme_organe = { id: 'N/A', Nom: 'Non applicable' };
        }

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



app.delete('/api/memofiches/:id', verifyToken, authorizeRoles(['Admin', 'Formateur']), async (req, res) => {
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
            let theme = await db.collection('themes').findOne({ Nom: updatedFiche.theme.Nom });
            if (!theme) {
                const result = await db.collection('themes').insertOne({ Nom: updatedFiche.theme.Nom });
                updatedFiche.theme.id = result.insertedId.toString();
            } else {
                updatedFiche.theme.id = theme._id.toString();
            }
        }
        if (updatedFiche.systeme_organe) {
            let systemeOrgane = await db.collection('systemesOrganes').findOne({ Nom: updatedFiche.systeme_organe.Nom });
            if (!systemeOrgane) {
                const result = await db.collection('systemesOrganes').insertOne({ Nom: updatedFiche.systeme_organe.Nom });
                updatedFiche.systeme_organe.id = result.insertedId.toString();
            } else {
                updatedFiche.systeme_organe.id = systemeOrgane._id.toString();
            }
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
            skillLevel: 'Débutant',
            readFicheIds: [],
            quizHistory: [],
            badges: [], // <-- Add badges array
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

// Get Learner Space Data
app.get('/api/learner-space', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user.userId);

        const user = await db.collection('users').findOne(
            { _id: userId },
            { projection: { password: 0 } } // Exclude password from the result
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // If the user is a "Preparateur", fetch their referring pharmacist's data
        if (user.role === 'Preparateur' && user.pharmacienResponsableId) {
            const pharmacien = await db.collection('users').findOne(
                { _id: new ObjectId(user.pharmacienResponsableId) },
                { projection: { username: 1, email: 1 } } // Only fetch username and email
            );
            user.pharmacienReferent = pharmacien;
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching learner space data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Record a read memo fiche for the current user
app.post('/api/users/me/read-fiches', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user.userId);
        const { ficheId } = req.body;

        if (!ficheId) {
            return res.status(400).json({ message: 'ficheId is required.' });
        }

        // Add the ficheId to the user's readFicheIds array if it's not already there
        const result = await db.collection('users').updateOne(
            { _id: userId },
            { $addToSet: { readFicheIds: ficheId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Check for badges after updating
        await checkAndAwardBadges(userId);

        res.status(200).json({ message: 'Fiche read status updated.' });

    } catch (error) {
        console.error('Error updating read fiches:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Record a quiz result for the current user
app.post('/api/users/me/quiz-history', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user.userId);
        const { quizId, score } = req.body;

        if (!quizId || score === undefined) {
            return res.status(400).json({ message: 'quizId and score are required.' });
        }

        const newQuizEntry = {
            quizId,
            score,
            completedAt: new Date(),
        };

        // Add the new quiz result to the user's quizHistory array
        const result = await db.collection('users').updateOne(
            { _id: userId },
            { $push: { quizHistory: newQuizEntry } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        // Update skill level and check for badges
        await calculateAndSetSkillLevel(userId);
        await checkAndAwardBadges(userId, { latestScore: score });


        res.status(200).json({ message: 'Quiz history updated.' });

    } catch (error) {
        console.error('Error updating quiz history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- AI Coach Endpoint ---
app.post('/api/ai-coach/suggest-challenge', verifyToken, async (req, res) => {
    try {
        // Add a check for the API key
        if (!GEMINI_API_KEY) {
            return res.status(503).json({ message: 'AI Coach is not configured on the server. Missing API Key.' });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.userId);

        // Fetch user and all fiches
        const user = await db.collection('users').findOne({ _id: userId });
        const allFiches = await db.collection('memofiches').find({}).toArray();

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Filter out sensitive or large data before sending to AI
        const userProfile = {
            skillLevel: user.skillLevel,
            readFicheIds: user.readFicheIds,
            quizHistory: user.quizHistory.map(q => ({ quizId: q.quizId, score: q.score })),
        };

        const availableContent = allFiches.map(f => ({
            id: f._id.toString(),
            title: f.title,
            hasQuiz: f.quiz && f.quiz.questions && f.quiz.questions.length > 0,
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const prompt = `
            You are an expert AI coach for pharmacy students, named PharmiaCoach. Your goal is to suggest a personalized daily challenge.
            The challenge can be to read a memo card ('fiche') or to take a quiz.
            You must respond in valid JSON format only.

            Here is the user's profile:
            - Skill Level: ${userProfile.skillLevel}
            - Fiches already read (by ID): ${JSON.stringify(userProfile.readFicheIds)}
            - Quiz history (quizId and score): ${JSON.stringify(userProfile.quizHistory)}

            Here is the list of all available content:
            ${JSON.stringify(availableContent)}

            Your task:
            1. Analyze the user's profile and history.
            2. Choose a single, relevant challenge:
               - Prefer suggesting a quiz for a fiche the user has already read but hasn't been quizzed on yet.
               - If not, suggest reading a new, unread fiche that is appropriate for their skill level.
               - If the user has poor scores on a specific quiz, you can suggest they retake it.
            3. Provide a brief, encouraging reason for your choice in French.
            4. Your entire response must be a single JSON object with the following structure:
               { "type": "fiche" | "quiz", "ficheId": "...", "title": "...", "reasoning": "..." }
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        // Clean the response to ensure it's valid JSON
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestion = JSON.parse(cleanedJson);

        res.status(200).json(suggestion);

    } catch (error) {
        console.error('Error with AI Coach:', error);
        res.status(500).json({ message: 'Error generating suggestion from AI Coach.' });
    }
});


// --- Chatbot Endpoint ---
app.post('/api/chatbot/message', verifyToken, async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(503).json({ message: 'Chatbot is not configured on the server. Missing API Key.' });
        }

        const db = getDb();
        const userId = new ObjectId(req.user.userId);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        // Find or create conversation for the user
        let conversation = await db.collection('conversations').findOne({ userId: userId });

        if (!conversation) {
            conversation = {
                userId: userId,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await db.collection('conversations').insertOne(conversation);
        }

        // Add user message to conversation
        conversation.messages.push({ sender: 'user', text: message, timestamp: new Date() });
        await db.collection('conversations').updateOne(
            { _id: conversation._id },
            { $set: { messages: conversation.messages, updatedAt: new Date() } }
        );

        // Prepare prompt for AI (last 5 messages for context)
        const conversationHistory = conversation.messages.slice(-5).map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const prompt = `You are PharmiaBot, a helpful and concise AI assistant for pharmacy students. Provide short and relevant answers.        
        Conversation history:
        ${conversationHistory}
        user: ${message}
        PharmiaBot:`

        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Add AI response to conversation
        conversation.messages.push({ sender: 'ai', text: aiResponse, timestamp: new Date() });
        await db.collection('conversations').updateOne(
            { _id: conversation._id },
            { $set: { messages: conversation.messages, updatedAt: new Date() } }
        );

        res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('Error with Chatbot:', error);
        res.status(500).json({ message: 'Error generating chatbot response.' });
    }
});


// --- Badge Awarding Logic ---
const checkAndAwardBadges = async (userId, options = {}) => {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });


    if (!user) return;

    const newBadges = [];

    // 1. "Premier Pas" Badge: First quiz completed
    if (user.quizHistory && user.quizHistory.length > 0 && !user.badges?.includes(BADGES.FIRST_QUIZ.id)) {
        newBadges.push(BADGES.FIRST_QUIZ.id);
    }

    // 2. "Lecteur Assidu" Badge: 3 fiches read
    if (user.readFicheIds && user.readFicheIds.length >= 3 && !user.badges?.includes(BADGES.READ_3_FICHES.id)) {
        newBadges.push(BADGES.READ_3_FICHES.id);
    }

    // 3. "Maître du Quiz" Badge: 100% score on the latest quiz
    if (options.latestScore === 100 && !user.badges?.includes(BADGES.PERFECT_SCORE.id)) {
        newBadges.push(BADGES.PERFECT_SCORE.id);
    }

    // 4. "Apprenti Intermédiaire" Badge
    if (user.skillLevel === 'Intermédiaire' && !user.badges?.includes(BADGES.LEVEL_INTERMEDIATE.id)) {
        newBadges.push(BADGES.LEVEL_INTERMEDIATE.id);
    }

    // 5. "Expert Confirmé" Badge
    if (user.skillLevel === 'Expert' && !user.badges?.includes(BADGES.LEVEL_EXPERT.id)) {
        newBadges.push(BADGES.LEVEL_EXPERT.id);
    }

    if (newBadges.length > 0) {
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { badges: { $each: newBadges } } }
        );
    }
};


// Function to calculate and set skill level
const calculateAndSetSkillLevel = async (userId) => {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user || !user.quizHistory || user.quizHistory.length === 0) {
        return; // Cannot calculate skill level without quiz history
    }

    const totalScore = user.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = totalScore / user.quizHistory.length;

    let newSkillLevel = user.skillLevel || 'Débutant';

    if (user.skillLevel === 'Débutant' && user.quizHistory.length >= 5 && averageScore >= 60) {
        newSkillLevel = 'Intermédiaire';
    } else if (user.skillLevel === 'Intermédiaire' && user.quizHistory.length >= 10 && averageScore >= 80) {
        newSkillLevel = 'Expert';
    }

    if (newSkillLevel !== user.skillLevel) {
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { skillLevel: newSkillLevel } }
        );
    }
};

// API to trigger skill level update (called after quiz completion)
app.post('/api/users/me/update-skill-level', verifyToken, async (req, res) => {
    try {
        await calculateAndSetSkillLevel(req.user.userId);
        // After skill level update, check for new level-based badges
        await checkAndAwardBadges(req.user.userId);
        res.status(200).json({ message: 'Skill level updated successfully.' });
    } catch (error) {
        console.error('Error updating skill level:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Temporary route to get user ID by email (Admin only)
app.get('/api/users/find-by-email', verifyToken, authorizeRoles(['Admin', 'Formateur']), async (req, res) => {
    try {
        const db = getDb();
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        const user = await db.collection('users').findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ userId: user._id, email: user.email, role: user.role });

    } catch (error) {
        console.error('Error finding user by email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Get Pharmacien users for Preparateur selection
app.get('/api/pharmaciens', async (req, res) => {
    try {
        const db = getDb();
        const pharmaciens = await db.collection('users').find({ role: 'Pharmacien' }).project({ password: 0 }).toArray();
        res.status(200).json(pharmaciens);
    } catch (error) {
        console.error('Error fetching pharmaciens:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get Preparateurs for a Pharmacien (Pharmacien only)
app.get('/api/pharmacien/preparateurs', verifyToken, authorizeRoles(['Pharmacien']), async (req, res) => {
    try {
        const db = getDb();
        const pharmacienId = new ObjectId(req.user.userId);

        const preparateurs = await db.collection('users').find(
            { role: 'Preparateur', pharmacienResponsableId: pharmacienId },
            { projection: { password: 0 } } // Exclude password
        ).toArray();

        // For each preparateur, calculate fiches read count and quiz average score
        const preparateursWithStats = preparateurs.map(p => ({
            ...p,
            fichesReadCount: p.readFicheIds ? p.readFicheIds.length : 0,
            averageQuizScore: p.quizHistory && p.quizHistory.length > 0
                ? (p.quizHistory.reduce((sum, q) => sum + q.score, 0) / p.quizHistory.length).toFixed(1)
                : 'N/A'
        }));

        res.status(200).json(preparateursWithStats);
    } catch (error) {
        console.error('Error fetching preparateurs for pharmacien:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Migration endpoint to fix memo fiche theme/system IDs
app.put('/api/migrate-memofiches-ids', verifyToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const db = getDb();
        const memofiches = await db.collection('memofiches').find({}).toArray();
        let updatedCount = 0;

        for (const fiche of memofiches) {
            let needsUpdate = false;
            const updateFields = {};

            // Process theme
            if (fiche.theme && fiche.theme.Nom) {
                const existingTheme = await db.collection('themes').findOne({ Nom: fiche.theme.Nom });
                if (existingTheme && fiche.theme.id !== existingTheme._id.toString()) {
                    updateFields['theme.id'] = existingTheme._id.toString();
                    needsUpdate = true;
                } else if (!existingTheme) {
                    // If theme by Nom doesn't exist, create it and update fiche
                    const result = await db.collection('themes').insertOne({ Nom: fiche.theme.Nom });
                    updateFields['theme.id'] = result.insertedId.toString();
                    needsUpdate = true;
                }
            }

            // Process systeme_organe
            if (fiche.systeme_organe && fiche.systeme_organe.Nom) {
                const existingSystem = await db.collection('systemesOrganes').findOne({ Nom: fiche.systeme_organe.Nom });
                if (existingSystem && fiche.systeme_organe.id !== existingSystem._id.toString()) {
                    updateFields['systeme_organe.id'] = existingSystem._id.toString();
                    needsUpdate = true;
                } else if (!existingSystem) {
                    // If systeme_organe by Nom doesn't exist, create it and update fiche
                    const result = await db.collection('systemesOrganes').insertOne({ Nom: fiche.systeme_organe.Nom });
                    updateFields['systeme_organe.id'] = result.insertedId.toString();
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await db.collection('memofiches').updateOne(
                    { _id: fiche._id },
                    { $set: updateFields }
                );
                updatedCount++;
            }
        }

        res.status(200).json({ message: `Migration complete. ${updatedCount} memo fiches updated.`, updatedCount });

    } catch (error) {
        console.error('Error during memo fiche ID migration:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- Admin Routes ---
// Get all users (Admin only)
app.get('/api/admin/users', verifyToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray(); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update a user (Admin only)
app.put('/api/admin/users/:id', verifyToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { role, subscriptionStatus } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const updateFields = {};
        if (role) updateFields.role = role;
        if (subscriptionStatus) updateFields.subscriptionStatus = subscriptionStatus;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No update fields provided.' });
        }

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a user (Admin only)
app.delete('/api/admin/users/:id', verifyToken, authorizeRoles(['admin']), async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start server after DB connection
connectToServer().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
});
