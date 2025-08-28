import { connectToServer, getDb } from '../db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
const embeddingModel = ai.getGenerativeModel({ model: "text-embedding-004" });

export const indexMemofiches = async () => {
  let client;
  try {
    console.log("Connecting to the database...");
    client = await connectToServer();
    const db = getDb();
    const memofichesCollection = db.collection('memofiches');

    console.log("Fetching all memofiches from the database...");
    const allFiches = await memofichesCollection.find({}).toArray();
    console.log(`Found ${allFiches.length} memofiches to process.`);

    for (const fiche of allFiches) {
      // Skip if the vector already exists and is recent
      if (fiche.contentVector && fiche.vectorUpdatedAt && new Date(fiche.vectorUpdatedAt) > new Date(Date.now() - 86400000)) { // 24 hours
        console.log(`Skipping fiche '${fiche.title}' (ID: ${fiche._id}) - vector is recent.`);
        continue;
      }

      console.log(`Processing fiche '${fiche.title}' (ID: ${fiche._id})...
`);

      // 1. Consolidate text content for embedding
      const textToEmbed = [
        fiche.title,
        fiche.shortDescription,
        fiche.flashSummary,
        ...fiche.memoContent.map(section => `${section.title} ${section.content}`)
      ].join('\n');

      // 2. Generate the embedding
      console.log("  Generating embedding...");
      const result = await embeddingModel.embedContent(textToEmbed);
      const embedding = result.embedding.values;

      // 3. Update the document in MongoDB...
      console.log("  Updating document in MongoDB...");
      await memofichesCollection.updateOne(
        { _id: fiche._id },
        {
          $set: {
            contentVector: embedding,
            vectorUpdatedAt: new Date()
          }
        }
      );

      console.log(`  Successfully generated and stored vector for fiche '${fiche.title}'.`);
    }

    console.log("\nIndexing process completed successfully!");

  } catch (error) {
    console.error("An error occurred during the indexing process:", error);
  } finally {
    // The connectToServer function from db.js manages the connection.
    // We don't close the client here as it might be shared.
    console.log("Indexing script finished.");
  }
};