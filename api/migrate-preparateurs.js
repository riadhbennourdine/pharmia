import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

async function migratePreparateurs() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    const db = client.db("pharmia"); // Remplacez "pharmia"
    const usersCollection = db.collection('users');

    console.log('Starting preparateur migration...');

    const result = await usersCollection.updateMany(
      {
        $or: [
          { role: 'Préparateur' },
          { role: 'Preparateur', pharmacienResponsableId: { $exists: false } }
        ]
      },
      {
        $set: { role: 'Preparateur', pharmacienResponsableId: null }
      }
    );

    

  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    await client.close();
  }
}

migratePreparateurs();