import { MongoClient, ServerApiVersion } from 'mongodb';

let client;

export async function connectToDb() {
  if (client) {
    return client;
  }

  const primaryUri = process.env.MONGODB_URI;
  if (!primaryUri) {
    throw new Error('MONGODB_URI environment variable not found.');
  }

  try {
    console.log('Attempting to connect to primary MongoDB URI...');
    client = new MongoClient(primaryUri, {
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
    return client;
  } catch (err) {
    console.error('Failed to connect to MongoDB.', err);
    throw err;
  }
}

export function getDb() {
  if (!client) {
    throw new Error("Database not initialized. Call connectToDb first.");
  }
  return client.db("pharmia");
}

export async function closeDb() {
    if (client) {
        await client.close();
        client = null;
        console.log("MongoDB connection closed.");
    }
}
