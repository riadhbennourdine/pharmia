import { getDb } from '../db.js';
import { GoogleGenAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askWithMemofiches = async (question) => {
  const db = getDb();
  const memofichesCollection = db.collection('memofiches');

  // Basic keyword search for relevant memofiches
  // In a real application, this would be a more sophisticated semantic search or vector search
  const keywords = question.split(' ').filter(word => word.length > 2);
  let relevantMemofiches = [];

  if (keywords.length > 0) {
    const searchRegex = new RegExp(keywords.join('|'), 'i'); // Case-insensitive OR search
    relevantMemofiches = await memofichesCollection.find({
      $or: [
        { title: { $regex: searchRegex } },
        { shortDescription: { $regex: searchRegex } },
        { 'memoContent.content': { $regex: searchRegex } } // Search within memoContent sections
      ]
    }).limit(5).toArray(); // Limit to top 5 relevant fiches
  }

  let context = "";
  if (relevantMemofiches.length > 0) {
    context = relevantMemofiches.map(fiche => `Title: ${fiche.title}\nShort Description: ${fiche.shortDescription}\nContent: ${fiche.memoContent.map(sec => sec.content).join('\n')}`).join('\n\n');
  }

  const prompt = `
    You are a PharmIA chatbot, an expert in pharmacy. Your task is to answer user questions based SOLELY on the provided context from PharmIA memofiches.
    Format your response as a JSON object with the following keys: casComptoir, questionsAPoser, maladie, traitement, conseilsAssocies.

    If the question cannot be answered from the provided context, you MUST respond with a JSON object containing a single key 'error' with the value: "Je suis désolé, ma base de connaissances actuelle ne me permet pas de répondre à cette question. Pour une réponse plus approfondie, veuillez laisser votre email et numéro de téléphone."

    Context from PharmIA Memofiches:
    ---\n    ${context || "No relevant memofiches found."} 
    ---

    User Question: ${question}

    Your Answer (based ONLY on the context, in JSON format):
  `;

  try {
    const response = await askChatbot(prompt, structuredResponseSchema, "application/json"); // Use the existing askChatbot function
    return response;
  } catch (error) {
    console.error("Error asking chatbot with RAG:", error);
    throw error;
  }
};