import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ObjectId } from 'mongodb';
import { connectToServer, getDb } from './db.js';

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
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

app.post('/api/memofiches', async (req, res) => {
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

// Start server after DB connection
connectToServer().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
});
