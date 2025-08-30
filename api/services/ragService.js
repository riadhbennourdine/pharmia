import { getDb } from '../db.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const structuredResponseSchema = {
    type: "object",
    properties: {
        casComptoir: { type: "string", description: "Description du cas comptoir." },
        questionsAPoser: { type: "string", description: "Questions à poser au patient." },
        maladie: { type: "string", description: "Nom de la maladie." },
        traitement: { type: "string", description: "Conseils de traitement." },
        conseilsAssocies: { type: "string", description: "Conseils associés." },
        error: { type: "string", description: "Message d'erreur si la question ne peut être traitée." }
    },
    required: [] // Fields are optional as an error might be returned
};

const askChatbot = async (prompt, schema, mimeType) => {
    try {
        console.log(`[${new Date().toISOString()}] askChatbot: Starting Gemini API call.`);
        const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: mimeType,
                responseSchema: schema,
            },
        });
        console.log(`[${new Date().toISOString()}] askChatbot: Gemini API call finished.`);
        return response.text();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in askChatbot:`, error);
        throw error;
    }
};

export const askWithMemofiches = async (question) => {
  console.log(`[${new Date().toISOString()}] askWithMemofiches: Starting for question: "${question}"`);
  const db = getDb();
  const memofichesCollection = db.collection('memofiches');

  // Basic keyword search for relevant memofiches
  // In a real application, this would be a more sophisticated semantic search or vector search
  const keywords = question.split(' ').filter(word => word.length > 2);
  let relevantMemofiches = [];

  if (keywords.length > 0) {
    console.log(`[${new Date().toISOString()}] askWithMemofiches: Starting memofiches search.`);
    const searchRegex = new RegExp(keywords.join('|'), 'i'); // Case-insensitive OR search
    relevantMemofiches = await memofichesCollection.find({
      $or: [
        { title: { $regex: searchRegex } },
        { shortDescription: { $regex: searchRegex } },
        { 'memoContent.content': { $regex: searchRegex } } // Search within memoContent sections
      ]
    }).limit(5).toArray(); // Limit to top 5 relevant fiches
    console.log(`[${new Date().toISOString()}] askWithMemofiches: Finished memofiches search. Found ${relevantMemofiches.length} fiches.`);
  }

  let context = "";
  if (relevantMemofiches.length > 0) {
    context = relevantMemofiches.map(fiche => `Title: ${fiche.title}\nShort Description: ${fiche.shortDescription}\nContent: ${fiche.memoContent.map(sec => sec.content).join('\n')}`).join('\n\n');
  }

  const prompt = `
    You are a PharmIA chatbot, an expert in pharmacy. Your task is to answer user questions based SOLELY on the provided context from PharmIA memofiches.
    Format your response as a JSON object with the following keys: casComptoir, questionsAPoser, maladie, traitement, conseilsAssocies.

    If the question cannot be answered from the provided context, you MUST respond with a JSON object containing a single key 'error' with the value: