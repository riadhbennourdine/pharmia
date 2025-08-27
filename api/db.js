import { MongoClient, ServerApiVersion } from 'mongodb';

let db;

export async function connectToServer() {
  if (db) {
    return db;
  }

  const primaryUri = process.env.MONGODB_URI;
  if (!primaryUri) {
    throw new Error('MONGODB_URI environment variable not found.');
  }

  try {
    console.log('Attempting to connect to primary MongoDB URI...');
    const client = new MongoClient(primaryUri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 10000, // Increased timeout
    });
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(`Successfully connected to MongoDB.`);
    db = client.db("pharmia");
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB.', err);
    throw err;
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
}