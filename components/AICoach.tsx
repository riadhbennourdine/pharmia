import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiZap, FiTarget } from 'react-icons/fi';
import { getRecommendations, Recommendation } from '../services/aiCoachService';
import { useData } from '../App';
import { User } from '../types/user'; // Importer le type User

// --- Persona du Coach PharmIA ---

const coachPersona = {
    greetings: [
        "Salut ! Prêt(e) à faire chauffer les neurones aujourd'hui ? 🧠",
        "Bonjour ! Votre dose de savoir quotidienne est prête. On commence ?",
        "Hello ! C'est l'heure de la formation continue. Plus efficace qu'une cure de vitamines !",
        "Bienvenue ! J'ai préparé un petit programme sur mesure pour vous. Ça vous dit ?",
    ],
    recommendationHooks: [
        "J'ai jeté un œil à vos derniers résultats... et j'ai une idée pour vous !",
        "Vu votre progression fulgurante, je pense qu'on peut corser un peu les choses.",
        "En parlant de sujets d'actualité, j'ai justement une fiche qui pourrait vous intéresser.",
    ],
    recommendationPhrases: (title: string) => [
        `Je vous suggère de jeter un œil à la fiche sur **${title}**. C'est un sujet aussi incontournable que le paracétamol !`,
        `Que diriez-vous de renforcer vos connaissances sur **${title}** ? On va devenir incollable !`,
        `Le défi du jour : la fiche sur **${title}**. Prêt(e) à relever le gant ?`,
    ],
    encouragements: [
        "Bravo pour votre régularité ! La motivation vous va aussi bien qu'une blouse blanche bien repassée !",
        "Excellent travail ! Vous progressez plus vite qu'un Doliprane sur une migraine.",
        "Continuez comme ça ! Bientôt, vous en saurez plus que le Vidal.",
    ],
    noRecommendation: "Je n'ai pas de nouvelles recommandations pour le moment. Vous êtes à jour, bravo ! C'est le moment de souffler (ou de faire un cas pratique pour le fun !).",
    error: "Oups, mon ordonnance de recommandations a un problème. Le serveur doit être en pause-café. Veuillez réessayer plus tard.",
    // --- NOUVEAU : Messages de bilan ---
    createSummary: (user: User) => {
        const fichesCount = user.readFicheIds?.length || 0;
        const quizCount = user.quizHistory?.length || 0;
        let averageScore = 0;
        if (quizCount > 0) {
            const totalScore = user.quizHistory.reduce((sum, attempt) => sum + attempt.score, 0);
            averageScore = Math.round(totalScore / quizCount);
        }

        let summary = `Jusqu'ici, vous avez lu **${fichesCount} mémofiche${fichesCount > 1 ? 's' : ''}**`;
        if (quizCount > 0) {
            summary += ` et réalisé **${quizCount} quiz** avec un score moyen de **${averageScore}%** ! `;
        } else {
            summary += ". C'est un excellent début ! ";
        }

        if (averageScore > 80) {
            summary += "Vos résultats sont excellents, on continue sur cette lancée !";
        } else if (averageScore > 60) {
            summary += "C'est du solide ! On continue de grimper ?";
        } else {
            summary += "Beau travail ! Chaque quiz est une étape pour devenir un expert.";
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
            { text: 'Voir mon bilan et suggestions', type: 'recommendation' },
            { text: 'Pas maintenant', type: 'delay' },
        ]
    });

    const [messages, setMessages] = useState([getInitialMessage()]);
    const [loading, setLoading] = useState(false);

    const fetchRecommendations = async () => {
        if (!user) return;
        setLoading(true);

        setMessages(prev => [...prev, { sender: 'user', text: 'Oui, montrez-moi !' }]);

        try {
            // 1. Créer et ajouter le message de bilan
            const summaryMessage = coachPersona.createSummary(user);
            setMessages(prev => [...prev, { sender: 'coach', text: summaryMessage }]);

            // 2. Récupérer les recommandations
            const recommendations = await getRecommendations(user._id);
            
            // 3. Ajouter le message de recommandation (avec un petit délai pour le naturel)
            setTimeout(() => {
                if (recommendations.length > 0) {
                    const firstRecommendation = recommendations[0];
                    const hook = getRandomItem(coachPersona.recommendationHooks);
                    const suggestion = getRandomItem(coachPersona.recommendationPhrases(firstRecommendation.fiche.title));
                    const encouragement = getRandomItem(coachPersona.encouragements);

                    setMessages(prev => [...prev, {
                        sender: 'coach',
                        text: `${hook} ${suggestion} <br/><br/> *${encouragement}*`,
                        recommendation: {
                            title: firstRecommendation.fiche.title,
                            reason: firstRecommendation.reason,
                        },
                        actions: [
                            { text: 'Commencer à étudier', type: 'study', ficheId: firstRecommendation.fiche.id },
                            { text: 'Une autre suggestion ?', type: 'suggestion' },
                        ]
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        sender: 'coach',
                        text: coachPersona.noRecommendation,
                    }]);
                }
                setLoading(false);
            }, 1200); // Délai de 1.2s

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
        } else {
            // Gérer d'autres actions plus tard
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
                <FiMessageSquare className="text-green-500 mr-3" size={24} />
                <h2 className="text-2xl font-semibold text-gray-800">Coach PharmIA</h2>
            </div>

            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'coach' && <FiZap className="text-yellow-500 mr-2 mb-1" size={20} />}
                        <div className={`px-4 py-2 rounded-lg ${msg.sender === 'coach' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                            <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                            {msg.recommendation && (
                                <div className="mt-4 bg-white p-4 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-bold text-gray-800">{msg.recommendation.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{msg.recommendation.reason}</p>
                                </div>
                            )}
                            {msg.actions && (
                                <div className="mt-3 flex space-x-2">
                                    {msg.actions.map((action, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAction(action.type, action.ficheId)}
                                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-full"
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
                 {loading && <div className="text-center text-gray-500">Chargement...</div>}
            </div>

            <div className="mt-8 pt-4 border-t">
                 <div className="flex items-center mb-2">
                    <FiTarget className="text-green-500 mr-3" size={22} />
                    <h3 className="text-xl font-semibold text-gray-700">Mes Objectifs</h3>
                </div>
                <div className="flex items-center">
                    <input type="text" placeholder="Ex: Devenir le roi des anti-inflammatoires" className="border p-2 rounded-md w-full" />
                    <button className="ml-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                        Définir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICoach;


export default AICoach;
