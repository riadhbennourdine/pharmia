import { getDb } from '../db.js';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment variables.");
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
        // DeepSeek API endpoint (replace with actual DeepSeek chat completion endpoint)
        const DEEPSEEK_API_ENDPOINT = "https://api.deepseek.com/chat/completions"; // Placeholder

        const response = await fetch(DEEPSEEK_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                // DeepSeek API request body (adjust based on DeepSeek's documentation)
                model: "deepseek-chat", // Or "deepseek-coder" or other specific model
                messages: [
                    { role: "system", content: "You are a helpful assistant." }, // System message
                    { role: "user", content: prompt }
                ],
                // You might need to add parameters for response_format, temperature, etc.
                // For structured output, DeepSeek might have a specific way to handle schema.
                // If DeepSeek doesn't directly support responseSchema like Gemini,
                // you might need to instruct the model in the prompt to return JSON.
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        // Extract the generated text from DeepSeek's response (adjust based on DeepSeek's documentation)
        // Example: data.choices[0].message.content
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Error in askChatbot (DeepSeek):", error);
        throw error;
    }
};

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
    const response = await askChatbot(prompt, structuredResponseSchema, "application/json");
    return response;
  } catch (error) {
    console.error("Error asking chatbot with RAG:", error);
    throw error;
  }
};
