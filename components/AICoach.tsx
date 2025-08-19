import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiTarget, FiAward } from 'react-icons/fi'; // Remplacement de FiZap par FiAward
import ReactMarkdown from 'react-markdown'; // Importation de ReactMarkdown
import { getChallengeSuggestion, AISuggestion } from '../services/aiCoachService';
import { useData } from '../App';
import { User } from '../types/user';

// --- Persona du Coach PharmIA (Ton ajusté) ---

const coachPersona = {
    greetings: [
        "Bonjour. Prêt à poursuivre votre parcours de formation continue ?",
        "Bienvenue. Analysons ensemble vos progrès et définissons vos prochains objectifs.",
        "Bonjour. Je suis prêt à vous accompagner pour votre session d'aujourd'hui.",
    ],
    recommendationHooks: [
        "En analysant vos récents résultats, une nouvelle opportunité d'apprentissage se présente.",
        "Compte tenu de votre progression, je vous propose de nous concentrer sur le sujet suivant.",
        "Pour approfondir vos connaissances, j'ai identifié une fiche pertinente pour vous.",
    ],
    recommendationPhrases: (title: string) => [
        `Je vous suggère la mémofiche sur **${title}**. C'est un sujet fondamental.`,
        `Approfondissons vos connaissances sur **${title}**. C'est une compétence clé.`,
        `Le défi du jour : la mémofiche sur **${title}**. Prêt à commencer ?`,
    ],
    encouragements: [
        "Votre régularité est la clé de votre succès. Continuez ainsi.",
        "Excellent travail. Votre progression est notable.",
        "Félicitations pour votre engagement dans votre formation continue.",
    ],
    noRecommendation: "Pour le moment, je n'ai pas de nouvelles recommandations spécifiques. Votre parcours est à jour. Excellent travail.",
    error: "Une erreur est survenue lors de la récupération de vos recommandations. Veuillez réessayer ultérieurement.",
    createSummary: (user: User) => {
        const fichesCount = user.readFicheIds?.length || 0;
        const quizCount = user.quizHistory?.length || 0;
        let averageScore = 0;
        if (quizCount > 0) {
            const totalScore = user.quizHistory.reduce((sum, attempt) => sum + attempt.score, 0);
            averageScore = Math.round(totalScore / quizCount);
        }

        let summary = `Bilan de votre parcours : **${fichesCount} mémofiche${fichesCount > 1 ? 's' : ''} consultée${fichesCount > 1 ? 's' : ''}**`;
        if (quizCount > 0) {
            summary += ` et **${quizCount} quiz réalisé${quizCount > 1 ? 's' : ''}** avec un score moyen de **${averageScore}%**.`;
        } else {
            summary += ". C'est un excellent point de départ.";
        }

        if (averageScore > 80) {
            summary += " Vos résultats sont excellents.";
        } else if (averageScore > 60) {
            summary += " Votre performance est solide et progresse.";
        } else {
            summary += " Chaque étape est un progrès significatif.";
        }
        return summary;
    }
};

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// --- Composant AICoach ---

const AICoach: React.FC = () => {
    const { learnerData: user } = useData();
    
    const getInitialMessage = () => ({
        sender: 'coach',
        text: getRandomItem(coachPersona.greetings),
        actions: [
            { text: 'Consulter mon bilan', type: 'recommendation' },
            { text: 'Pas maintenant', type: 'delay' },
        ]
    });

    const [messages, setMessages] = useState([getInitialMessage()]);
    const [loading, setLoading] = useState(false);

    const fetchRecommendations = async () => {
        if (!user) return;
        setLoading(true);

        setMessages(prev => [...prev, { sender: 'user', text: 'Oui, montrez-moi mon bilan.' }]);

        try {
            const summaryMessage = coachPersona.createSummary(user);
            setMessages(prev => [...prev, { sender: 'coach', text: summaryMessage }]);

            const suggestion: AISuggestion = await getChallengeSuggestion();
            
            setTimeout(() => {
                if (suggestion) {
                    const hook = getRandomItem(coachPersona.recommendationHooks);
                    const suggestionText = getRandomItem(coachPersona.recommendationPhrases(suggestion.title));
                    const encouragement = getRandomItem(coachPersona.encouragements);

                    setMessages(prev => [...prev, {
                        sender: 'coach',
                        text: `${hook} ${suggestionText}`,
                        recommendation: {
                            title: suggestion.title,
                            reason: suggestion.reasoning,
                        },
                        actions: [
                            { text: 'Commencer l\'étude', type: 'study', ficheId: suggestion.ficheId },
                            { text: 'Autre suggestion', type: 'suggestion' },
                        ]
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        sender: 'coach',
                        text: coachPersona.noRecommendation,
                    }]);
                }
                setLoading(false);
            }, 1200);

        } catch (error) {
            console.error("Failed to fetch recommendations", error);
            setMessages(prev => [...prev, {
                sender: 'coach',
                text: coachPersona.error,
            }]);
            setLoading(false);
        }
    };

    const handleAction = (actionType: string, ficheId?: string) => {
        if (actionType === 'recommendation') {
            fetchRecommendations();
        } else if (actionType === 'study' && ficheId) {
            window.location.href = `#/fiches/${ficheId}`;
        }
    };

    return (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-lg max-w-3xl mx-auto border border-gray-200">
            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                <FiMessageSquare className="text-green-600 mr-3" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Coach PharmIA</h2>
            </div>

            <div className="space-y-4 pr-2 max-h-[50vh] overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'coach' && <FiAward className="text-gray-400 mb-2" size={20} />}
                        <div className={`text-sm leading-relaxed px-4 py-3 max-w-md shadow-sm ${msg.sender === 'coach' ? 'bg-white text-gray-800 rounded-2xl rounded-bl-none' : 'bg-green-500 text-white rounded-2xl rounded-br-none'}`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                            {msg.recommendation && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <h3 className="text-md font-bold text-gray-800">{msg.recommendation.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{msg.recommendation.reason}</p>
                                </div>
                            )}
                            {msg.actions && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.actions.map((action, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAction(action.type, action.ficheId)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 px-3 rounded-full transition-colors"
                                            disabled={loading}
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {loading && <div className="text-center text-gray-500 py-4">Chargement...</div>}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                 <div className="flex items-center mb-2">
                    <FiTarget className="text-green-600 mr-3" size={20} />
                    <h3 className="text-lg font-semibold text-gray-700">Définir un objectif</h3>
                </div>
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Ex: Maîtriser les anticoagulants" className="border p-2 rounded-lg w-full text-sm" />
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
