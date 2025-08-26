import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let db;

// Add a fallback URI for local development
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/pharmia';

async function tryConnect(uri, isPrimary = false) {
  try {
    const mongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // Set a shorter timeout to fail faster if the DB is not available
      serverSelectionTimeoutMS: isPrimary ? 5000 : 2000, 
    });
    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    console.log(`Successfully connected to MongoDB at ${uri.split('@')[1] ? 'remote URI' : 'local URI'}`);
    client = mongoClient;
    db = client.db("pharmia");
    return true;
  } catch (err) {
    console.warn(`Failed to connect to MongoDB at ${uri.split('@')[1] ? 'remote URI' : 'local URI'}.`, err.message);
    return false;
  }
}

export async function connectToServer() {
  if (db) {
    return;
  }

  const primaryUri = process.env.MONGODB_URI;
  let connected = false;

  if (primaryUri) {
    console.log('Attempting to connect to primary MongoDB URI...');
    connected = await tryConnect(primaryUri, true);
  } else {
    console.log('Primary MONGODB_URI not found in .env');
  }

  if (!connected) {
    console.log('Primary connection failed. Attempting to connect to local fallback MongoDB URI...');
    connected = await tryConnect(LOCAL_MONGODB_URI);
  }

  if (!connected) {
    console.error('Failed to connect to both primary and fallback MongoDB instances.');
    // Exit the process if no database connection can be established
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
}