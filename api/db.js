import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let db;

export async function connectToServer() {
  if (db) {
    return;
  }
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`[DEBUG] MONGODB_URI: ${uri ? 'Loaded' : 'Not Loaded'}`);
    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env');
    }

    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    db = client.db("pharmia");
    
  } catch(err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
}