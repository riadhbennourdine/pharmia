const { getDb } = require('../db.js');
const { GoogleGenAI } = require("@google/genai");

if (!process.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const askChatbot = async (prompt, responseSchema = null, responseMimeType = "text/plain") => {
    const prompt = `
        Tu es un chatbot expert en pharmacie d'officine et tu réponds aux questions des utilisateurs de l'application PharmIA.
        Réponds à la question suivante en te basant sur tes connaissances en pharmacie. Sois concis et précis.

        Question: ${question}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash", // Use a suitable model for chat
            contents: prompt,
            generationConfig: {
                responseMimeType: responseMimeType,
            },
            safetySettings: [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
            ],
            ...(responseSchema && { responseSchema: responseSchema }),
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error asking chatbot:", error);
        throw new Error("Impossible de contacter le chatbot pour le moment. Veuillez réessayer.");
    }
};


const askChatbot = async (prompt, responseSchema = null, responseMimeType = "text/plain") => {
    const structuredResponseSchema = {
        type: "object",
        properties: {
            casComptoir: { type: "string", description: "Description du cas comptoir." },
            questionsAPoser: { type: "string", description: "Questions clés à poser au patient." },
            maladie: { type: "string", description: "Informations sur la maladie." },
            traitement: { type: "string", description: "Détails du traitement." },
            conseilsAssocies: { type: "string", description: "Conseils hygiéno-diététiques et autres." },
        },
        required: ["casComptoir", "questionsAPoser", "maladie", "traitement", "conseilsAssocies"],
    };

const askWithMemofiches = async (question) => {
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
    ---
    ${context || "No relevant memofiches found."} 
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


module.exports = { askWithMemofiches };

