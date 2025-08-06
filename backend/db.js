import { MongoClient, ServerApiVersion } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

export async function connectToServer() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    db = client.db("pharmia");
    console.log("Successfully connected to MongoDB.");
  } catch(err) {
    console.error("Failed to connect to MongoDB", err);
    // Exit process with failure in case of connection error
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
}
