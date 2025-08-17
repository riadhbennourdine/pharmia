import { GoogleGenAI, Type } from "@google/genai";
import { MemoFiche, Theme, SystemeOrgane, ExternalResource } from '../types';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const sectionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING, description: "Content in Markdown format." },
        children: {
            type: Type.ARRAY,
            description: "Nested sub-sections. Keep this one level deep.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Content in Markdown format." },
                },
                required: ["id", "title", "content"],
            }
        }
    },
    required: ["id", "title", "content"]
};

const externalResourceSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['video', 'podcast', 'quiz', 'article'], description: "Type of the external resource." },
        title: { type: Type.STRING, description: "Title of the resource." },
        url: { type: Type.STRING, description: "Direct URL to the resource." }
    },
    required: ["type", "title", "url"]
};

const memoFicheItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique ID for the memo fiche. Use a UUID-like string." },
        title: { type: Type.STRING, description: "Titre de la mémofiche." },
        shortDescription: { type: Type.STRING, description: "A very brief, one-sentence summary for card previews." },
        imageUrl: { type: Type.STRING, description: "A placeholder image URL from picsum.photos" },
        imagePosition: { type: Type.STRING, enum: ['top', 'middle', 'bottom'], description: "Position of the image within its container. Default to 'middle'." },
        flashSummary: { type: Type.STRING, description: "Synthèse flash de 2-3 phrases (résumé)." },
        level: { type: Type.STRING, description: "Niveau de difficulté (e.g., 'Débutant', 'Intermédiaire', 'Expert')." },
        createdAt: { type: Type.STRING, description: "Date of creation in YYYY-MM-DD format. Use today's date." },
        kahootUrl: { type: Type.STRING, description: "Optional URL to a relevant Kahoot! quiz. Must be a valid Kahoot URL if provided." },
        memoContent: {
            type: Type.ARRAY,
            description: "Sections with titles: 'Mémo : Cas comptoir', 'Questions à poser', 'Limites du conseil', 'Conseil traitement Produits', 'Conseils Hygiène de vie', 'Références bibliographiques'. Content should be in Markdown and not exceed 10-15 lines per section.",
            items: sectionSchema
        },
        theme: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                Nom: { type: Type.STRING },
            },
                required: ["id", "Nom"],
        },
        systeme_organe: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                Nom: { type: Type.STRING },
            },
                required: ["id", "Nom"],
        },
        flashcards: {
            type: Type.ARRAY,
            description: "Exactly 10 flashcards (question/answer format).",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ["question", "answer"],
            },
        },
        quiz: {
            type: Type.ARRAY,
            description: "Exactly 10 quiz questions (MCQ or true/false) with answers and pedagogical explanations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["mcq", "truefalse"] },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                    required: ["question", "type", "options", "correctAnswer", "explanation"],
            },
        },
        glossaryTerms: {
            type: Type.ARRAY,
            description: "Exactly 10 technical terms with their simple definitions, derived from the source text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
            },
        },
        externalResources: {
            type: Type.ARRAY,
            description: "A list of relevant external resources (video, podcast, etc.).",
            items: externalResourceSchema
        },
    },
    required: ["id", "title", "shortDescription", "imageUrl", "imagePosition", "flashSummary", "memoContent", "theme", "systeme_organe", "flashcards", "quiz", "glossaryTerms", "level", "createdAt", "externalResources"],
};

interface GenerationOptions {
    imageUrl?: string;
    kahootUrl?: string;
    videoUrl?: string;
    podcastUrl?: string;
}

const ORDONNANCES_TEMPLATE = `
Template fiche conseil associé à l’ordonnance

Fiche CAO [Maladie] concernée " destinées aux pharmaciens et aux  préparateurs en pharmacie:
Analyse de l'ordonnance
la prescription médicale et des besoins du patient
- Déterminer s'il s'agit d'une première prescription ou d'un renouvellement
- Collecter des informations sur l'âge, les antécédents médicaux et le motif de consultation du patient

Conseils sur le traitement médicamenteux
- La propriété et le mode d'action de chaque médicament.
- Expliquer le mode d'administration, les horaires de prise et les effets indésirables possibles
- Informer sur les interactions médicamenteuses ou alimentaires et les contre-indications

Informations sur la maladie
- Présenter les informations essentielles sur la [Maladie]
- Expliquer les spécificités de la pathologie qui peuvent affecter le traitement
- Donner une idée sur l objectif du traitement

Conseils hygiéno-diététiques
- Fournir des conseils dhygiène de vie, y compris lexercice et le sommeil
- Offrir des conseils alimentaires adaptés à la pathologie

Vente complémentaire
- Identifier les produits ou accessoires complémentaires pertinents quon peut proposer au patient
- Expliquer comment ces produits peuvent améliorer lefficacité, la tolérance ou le confort du traitement, ou alors assurer la prévention contre les récidives et les complications.

Mettre les références bibliographiques qui ont servi pour la rédaction de cette fiche, en liste numérotée sous format citation APA 7th edition, comme indiqué dans le titre de la source. Ne pas citer dans la liste la référence Template fiche CAO.


Cette procédure vise à assurer un suivi complet et personnalisé du patient, optimiser lefficacité du traitement prescrit et améliorer le confort du patient
`;

export const generateSingleMemoFiche = async (
    rawText: string, 
    theme: Theme, 
    system: SystemeOrgane,
    options: GenerationOptions = {}
): Promise<MemoFiche> => {
    
    let providedResourcesInstructions = "";
    if (options.videoUrl) {
        providedResourcesInstructions += `- Vidéo YouTube à inclure OBLIGATOIREMENT : ${options.videoUrl}\n`;
    }
    if (options.podcastUrl) {
        providedResourcesInstructions += `- Podcast à inclure OBLIGATOIREMENT : ${options.podcastUrl}\n`;
    }

    let prompt = "";

    if (theme.Nom.trim().toLowerCase() === "ordonnances") {
        console.log("[DEBUG] Generating 'Ordonnances' prompt."); // DEBUG LOG
        // For "Ordonnances" theme, use the specific template
        // We need to extract the [Maladie] from the rawText or assume it's part of the title
        // For now, let's assume the rawText is the "Maladie" or contains it.
        // The AI will need to figure out the [Maladie] from the rawText for the title.
        prompt = `
            Tu es un expert en pharmacie d’officine et en pédagogie active. À partir du texte brut ci-dessous, génère une mémofiche pédagogique complète en FRANÇAIS.
            La réponse DOIT être un objet JSON valide qui respecte scrupuleusement le schéma fourni.

            ${ORDONNANCES_TEMPLATE}

            **Texte Brut à Analyser:**
            ---
            ${rawText}
            ---

            **Instructions de Génération Spécifiques pour Ordonnances:**
            - Le titre de la mémofiche doit être "Fiche CAO [Maladie] concernée", où [Maladie] est déduit du texte brut.
            - Assure-toi que toutes les sections de la "Template fiche conseil associé à l’ordonnance" sont remplies de manière pertinente.
            - Pour les "Références bibliographiques", utilise des sources crédibles et formatées en APA 7th edition. Ne pas inclure "Template fiche CAO" dans les références.
            - **Catégorisation Imposée**: Tu DOIS utiliser les informations suivantes pour la classification. Ne les modifie PAS.
              - Thème: { id: "${theme.id}", Nom: "${theme.Nom}" }
              - Système/Organe: { id: "${system.id}", Nom: "${system.Nom}" }
            - **Réponse JSON**: Remplis les champs 'theme' et 'systeme_organe' de l'objet JSON de sortie avec EXACTEMENT ces valeurs.
            - **Éviter la Redondance**: Ne pas inclure les informations sur le Thème ou le Système/Organe dans les sections de `memoContent`, car elles sont déjà spécifiées dans leurs champs dédiés.
            - **Contenu Pédagogique**: Crée EXACTEMENT 10 flashcards, et 10 questions de quiz (variées, QCM et Vrai/Faux).
            - **Termes Techniques**: Identifie 10 termes techniques pertinents dans le texte et fournis leurs définitions pour le glossaire.
            - **Image**: ${options.imageUrl ? `Utilise CETTE URL EXACTE pour 'imageUrl': ${options.imageUrl}` : "Utilise 'https://picsum.photos/800/600' pour imageUrl."}
            - **Position Image**: Pour 'imagePosition', utilise 'middle' par défaut, ou 'top' ou 'bottom' si le sujet le suggère.
            - **Kahoot**: ${options.kahootUrl ? `Utilise CETTE URL EXACTE pour 'kahootUrl': ${options.kahootUrl}` : "Si pertinent, fournis un lien vers un quiz Kahoot public sur le sujet dans 'kahootUrl'. Sinon, laisse ce champ vide ou null."}
            - **Ressources Externes**: 
              ${providedResourcesInstructions || "Suggère 1 ou 2 liens pertinents (vidéos YouTube, articles, podcasts). Pour les vidéos, utilise des URLs 'embed'."}
            - **IDs**: Assure-toi que l'ID de la fiche et les IDs des sections sont des chaînes de caractères uniques (similaire à un UUID).
        `;
    } else {
        console.log(`[DEBUG] Generating generic prompt for theme: ${theme.Nom}`); // DEBUG LOG
        // Existing generic prompt for other themes
        prompt = `
            Tu es un expert en pharmacie d’officine et en pédagogie active. À partir du texte brut ci-dessous, génère une mémofiche pédagogique complète en FRANÇAIS.
            La réponse DOIT être un objet JSON valide qui respecte scrupuleusement le schéma fourni.

            **Texte Brut à Analyser:**
            ---
            ${rawText}
            ---

            **Instructions de Génération:**
            - **Structure Complète**: Génère tous les champs requis par le schéma JSON.
            - **Titre, Niveau**: Déduis ces informations du texte. Le niveau doit être 'Débutant', 'Intermédiaire', ou 'Expert'.
            - **Date**: Pour le champ 'createdAt', utilise la date d'aujourd'hui au format YYYY-MM-DD.
            - **Catégorisation Imposée**: Tu DOIS utiliser les informations suivantes pour la classification. Ne les modifie PAS.
              - Thème: { id: "${theme.id}", Nom: "${theme.Nom}" }
              - Système/Organe: { id: "${system.id}", Nom: "${system.Nom}" }
            - **Réponse JSON**: Remplis les champs 'theme' et 'systeme_organe' de l'objet JSON de sortie avec EXACTEMENT ces valeurs.
            - **Sections**: Crée les sections avec les titres suivants : 'Mémo : Cas comptoir', 'Questions à poser', 'Limites du conseil', 'Conseil traitement Produits', 'Conseils Hygiène de vie', 'Références bibliographiques'.
            - **Contenu**: Le contenu de chaque section doit être en Markdown, avec des paragraphes bien délimités et des retours à la ligne. Chaque section ne doit pas dépasser 10-15 lines. Si le contenu est plus long, crée une nouvelle section accordéon avec un titre numéroté (par exemple, 'Conseil traitement Produits (1/2)', 'Conseil traitement Produits (2/2)').
            - **Références**: Inclure des références bibliographiques dans la section dédiée.
            - **Contenu Pédagogique**: Crée EXACTEMENT 10 flashcards, et 10 questions de quiz (variées, QCM et Vrai/Faux).
            - **Termes Techniques**: Identifie 10 termes techniques pertinents dans le texte et fournis leurs définitions pour le glossaire.
            - **Image**: ${options.imageUrl ? `Utilise CETTE URL EXACTE pour 'imageUrl': ${options.imageUrl}` : "Utilise 'https://picsum.photos/800/600' pour imageUrl."}
            - **Position Image**: Pour 'imagePosition', utilise 'middle' par défaut, ou 'top' ou 'bottom' si le sujet le suggère.
            - **Kahoot**: ${options.kahootUrl ? `Utilise CETTE URL EXACTE pour 'kahootUrl': ${options.kahootUrl}` : "Si pertinent, fournis un lien vers un quiz Kahoot public sur le sujet dans 'kahootUrl'. Sinon, laisse ce champ vide ou null."}
            - **Ressources Externes**: 
              ${providedResourcesInstructions || "Suggère 1 ou 2 liens pertinents (vidéos YouTube, articles, podcasts). Pour les vidéos, utilise des URLs 'embed')."}
            - **IDs**: Assure-toi que l'ID de la fiche et les IDs des sections sont des chaînes de caractères uniques (similaire à un UUID).
        `;
    }
    
    console.log("[DEBUG] Final Prompt for Gemini:", prompt); // DEBUG LOG
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: memoFicheItemSchema,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as MemoFiche;
        
        data.createdAt = new Date().toISOString().split('T')[0];

        // Ensure provided resources are present
        const finalResources: ExternalResource[] = data.externalResources || [];
        if (options.videoUrl && !finalResources.some(r => r.url === options.videoUrl)) {
            finalResources.push({ type: 'video', title: 'Vidéo recommandée', url: options.videoUrl });
        }
        if (options.podcastUrl && !finalResources.some(r => r.url === options.podcastUrl)) {
            finalResources.push({ type: 'podcast', title: 'Podcast recommandé', url: options.podcastUrl });
        }
        data.externalResources = finalResources;

        return data;

    } catch (error) {
        console.error("Error generating single memo fiche with Gemini:", error);
        throw new Error("Impossible de générer la mémofiche depuis l'IA. Veuillez réessayer.");
    }
};

// New schema for communication fiches
const communicationMemoFicheSchema = {
    ...memoFicheItemSchema,
    properties: {
        ...memoFicheItemSchema.properties,
        memoContent: {
            type: Type.ARRAY,
            description: "The main content of the memo fiche, structured into sections based on the provided text's paragraph titles. The 'Références bibliographiques' section should be last, if present.",
            items: sectionSchema
        },
    }
};

// New function for generating communication fiches
export const generateCommunicationMemoFiche = async (
    rawText: string,
    theme: Theme,
    options: GenerationOptions = {}
): Promise<MemoFiche> => {

    const prompt = `
        Vous êtes un expert en ingénierie pédagogique et en communication pharmaceutique. Votre mission de transformer un texte brut sur une technique ou une situation de communication à l'officine en une mémofiche structurée et prête à l'emploi pour l'application PharmIA.

        **Thème :** Communication

        **Instructions :**
        Analysez le texte fourni ci-dessous. Extrayez sa structure, son contenu et ses informations clés pour générer une mémofiche complète au format JSON. Le contenu des flashcards, du quiz et du glossaire doit être **exclusivement basé sur les informations présentes dans le texte fourni**.

        **Texte à traiter :**
        ---\n        ${rawText}
        ---

        **Format de sortie JSON attendu et consignes :**
        - La réponse DOIT être un objet JSON valide qui respecte scrupuleusement le schéma fourni.
        - **title**: Le titre du sujet de communication (à extraire du texte).
        - **shortDescription**: Une description courte (1-2 phrases) qui résume le contenu du texte fourni.
        - **flashSummary**: Un résumé ultra-rapide en 3 points clés maximum, basés sur les conseils les plus importants du texte.
        - **memoContent**: Le texte fourni contient des paragraphes avec des titres. Chaque paragraphe doit devenir un objet dans le tableau 
memoContent
. Le 
Title
 de l'objet JSON sera le titre du paragraphe, et le 
content
 sera le texte de ce paragraphe.
        - **Références bibliographiques**: Si le texte fourni contient une section de références, assurez-vous qu'elle soit la dernière entrée dans le tableau 
memoContent
.
        - **Catégorisation Imposée**: Tu DOIS utiliser les informations suivantes pour la classification. Ne les modifie PAS.
          - Thème: { id: "${theme.id}", Nom: "${theme.Nom}" }
          - Système/Organe: { id: "communication", Nom: "Communication" } // Hardcoded for this theme
        - **Contenu Pédagogique**: Crée EXACTEMENT 10 flashcards, et 10 questions de quiz (variées, QCM et Vrai/Faux).
        - **Termes Techniques**: Identifie 10 termes techniques pertinents dans le texte et fournis leurs définitions pour le glossaire.
        - **Génération**: Tout le contenu (descriptions, résumés, flashcards, quiz, glossaire) doit être dérivé uniquement du texte que vous fournissez.
        - **Position Image**: Pour 'imagePosition', utilise 'middle' par défaut, ou 'top' ou 'bottom' si le sujet le suggère.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: communicationMemoFicheSchema,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as MemoFiche;
        
        data.createdAt = new Date().toISOString().split('T')[0];

        return data;

    } catch (error) {
        console.error("Error generating communication memo fiche with Gemini:", error);
        throw new Error("Impossible de générer la mémofiche de communication depuis l'IA. Veuillez réessayer.");
    }
};

export const askChatbot = async (question: string): Promise<string> => {
    const prompt = `
        Tu es un chatbot expert en pharmacie d'officine et tu réponds aux questions des utilisateurs de l'application PharmIA.
        Réponds à la question suivante en te basant sur tes connaissances en pharmacie. Sois concis et précis.

        Question: ${question}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-pro", // Use a suitable model for chat
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error asking chatbot:", error);
        throw new Error("Impossible de contacter le chatbot pour le moment. Veuillez réessayer.");
    }
};