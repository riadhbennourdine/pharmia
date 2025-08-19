import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiTarget, FiUser, FiAward } from 'react-icons/fi';
import { findFicheByObjective, getChallengeSuggestion, AISuggestion } from '../services/aiCoachService';
import { useData } from '../App';
import { useNavigate } from 'react-router-dom';
import { MemoFiche } from '../types';
import MemoCard from './MemoCard';

type Message = {
    sender: 'user' | 'ai';
    type: 'text' | 'bilan' | 'suggestion' | 'objective' | 'consigne';
    content: string | React.ReactNode;
    timestamp: string;
};

const AICoach: React.FC = () => {
    const { learnerData: user, data } = useData();
    const [objective, setObjective] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const navigate = useNavigate();

    console.log('[DEBUG] AICoach component rendered with user data:', user); // DEBUG LOG

    useEffect(() => {
        const initializeConversation = async () => {
            setLoading(true);
            const initialMessages: Message[] = [];

            // 1. Welcome message
            initialMessages.push({
                sender: 'ai',
                type: 'text',
                content: `Bonjour, ${user?.name || 'admin'} ! Prêt à définir votre prochain objectif ?`,
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            });

            // 2. Bilan
            if (user) {
                const bilanContent = (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-bold text-lg text-green-800 mb-2">Votre Bilan Initial</h4>
                        <p><strong>Fiches lues:</strong> {user.readFicheIds?.length || 0}</p>
                        <p><strong>Quiz réussis:</strong> {user.quizHistory?.filter(q => q.score >= 80).length || 0}</p>
                    </div>
                );
                initialMessages.push({
                    sender: 'ai',
                    type: 'bilan',
                    content: bilanContent,
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                });
            }

            // 3. Add suggestion button
            initialMessages.push({
                sender: 'ai',
                type: 'text',
                content: (
                    <button
                        onClick={() => handleSuggestFiche()}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Proposition de Mémofiche
                    </button>
                ),
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            });

            setMessages(initialMessages);
            setLoading(false);
        };

        if (user && data) {
            initializeConversation();
        }
    }, [user, data, navigate]);

    const handleSuggestFiche = async (excludeId?: string) => {
        setLoading(true);
        try {
            const suggestion = await getChallengeSuggestion(excludeId);
            if (suggestion && suggestion.ficheId && data) {
                const fiche = data.memofiches.find(f => f.id === suggestion.ficheId);
                if (fiche) {
                    const suggestionContent = (
                        <div>
                            <p>{suggestion.reasoning}</p>
                            <div className="mt-2 cursor-pointer" onClick={() => navigate(`/fiches/${fiche.id}`)}>
                                <MemoCard memofiche={fiche} />
                            </div>
                            <button
                                onClick={() => handleSuggestFiche(fiche.id)}
                                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm"
                            >
                                Une autre proposition
                            </button>
                        </div>
                    );
                    const newSuggestionMessage: Message = {
                        sender: 'ai',
                        type: 'suggestion',
                        content: suggestionContent,
                        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    };

                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage && (lastMessage.type === 'suggestion' || (lastMessage.type === 'text' && lastMessage.content.toString().includes('Proposition de Mémofiche')))) {
                            // Replace the last message if it was a suggestion or the initial prompt
                            return [...prev.slice(0, -1), newSuggestionMessage];
                        } else {
                            // Otherwise, just add the new suggestion
                            return [...prev, newSuggestionMessage];
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Failed to get suggestion:", err);
            const errorResponse: Message = {
                sender: 'ai',
                type: 'text',
                content: "Oups, une erreur s'est produite lors de la recherche d'une suggestion.",
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setLoading(false);
        }
    };


    const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setObjective(e.target.value);
    };

    const handleValidateObjective = async () => {
        if (!objective.trim()) {
            setError('Veuillez définir un objectif.');
            return;
        }
        setLoading(true);
        setError(null);

        const userMessage: Message = {
            sender: 'user',
            type: 'objective',
            content: objective,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const suggestion: AISuggestion = await findFicheByObjective(objective);
            let aiResponse: Message;

            if (suggestion && suggestion.ficheId && data) {
                const fiche = data.memofiches.find(f => f.id === suggestion.ficheId);
                if (fiche) {
                    const suggestionContent = (
                        <div>
                            <p>{suggestion.text}</p>
                            <div className="mt-2 cursor-pointer" onClick={() => navigate(`/fiches/${fiche.id}`)}>
                                <MemoCard memofiche={fiche} />
                            </div>
                        </div>
                    );
                    aiResponse = {
                        sender: 'ai',
                        type: 'suggestion',
                        content: suggestionContent,
                        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    };
                } else {
                     aiResponse = {
                        sender: 'ai',
                        type: 'text',
                        content: "Désolé, nous n'avons pas trouvé de fiche correspondante à votre objectif.",
                        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    };
                }
            } else {
                aiResponse = {
                    sender: 'ai',
                    type: 'text',
                    content: "Désolé, nous n'avons pas trouvé de fiche correspondante à votre objectif.",
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                };
            }
            setMessages(prev => [...prev, aiResponse]);
        } catch (err) {
            setError("Une erreur est survenue lors de la recherche de votre objectif. Veuillez réessayer.");
            console.error(err);
            const errorResponse: Message = {
                sender: 'ai',
                type: 'text',
                content: "Oups, une erreur s'est produite. Réessayez.",
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setLoading(false);
            setObjective('');
        }
    };

    const handleConsultBilan = () => {
        if (!user) return;

        const bilanContent = (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-lg text-green-800 mb-2">Bilan d'Apprentissage</h4>
                <p><strong>Fiches lues:</strong> {user.readFicheIds?.length || 0}</p>
                <p><strong>Quiz réussis:</strong> {user.quizHistory?.filter(q => q.score >= 80).length || 0}</p>
                <p><strong>Objectifs atteints:</strong> 0</p>
            </div>
        );

        const bilanMessage: Message = {
            sender: 'ai',
            type: 'bilan',
            content: bilanContent,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, bilanMessage]);
    };

    const handlePharmacienConsigne = () => {
        if (!user) return;

        const consigneMessage: Message = {
            sender: 'ai',
            type: 'consigne',
            content: user.consigne || "Votre pharmacien n'a pas encore défini de consigne pour vous.",
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, consigneMessage]);
    };

    const renderMessageContent = (message: Message) => {
        const senderClass = message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
        const alignmentClass = message.sender === 'user' ? 'self-end' : 'self-start';
        const Icon = message.sender === 'user' ? FiUser : FiMessageSquare;

        return (
            <div key={message.timestamp + message.content?.toString()} className={`flex items-end gap-2 my-2 ${alignmentClass}`}>
                {message.sender === 'ai' && <Icon className="text-green-600 mb-4" size={24} />}
                <div className={`max-w-lg p-3 rounded-lg ${senderClass} shadow-sm`}>
                    {message.content}
                    <div className="text-xs mt-1 text-right opacity-70">{message.timestamp}</div>
                </div>
                 {message.sender === 'user' && <Icon className="text-blue-500 mb-4" size={24} />}
            </div>
        );
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-200">
            <div className="flex items-center mb-4 border-b pb-4 border-gray-200">
                <FiAward className="text-green-600 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">Coach PharmIA</h2>
            </div>

            {/* Message Thread */}
            <div className="h-96 overflow-y-auto pr-4 mb-4 flex flex-col">
                {messages.map(renderMessageContent)}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-6">
                <button
                    onClick={handleConsultBilan}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Consulter mon bilan
                </button>
                <button
                    onClick={handlePharmacienConsigne}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm"
                >
                    Consigne du Pharmacien
                </button>
            </div>

            {/* Objective Input */}
            <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center mb-3">
                    <FiTarget className="text-green-600 mr-3" size={22} />
                    <h3 className="text-xl font-semibold text-gray-700">Définir un objectif</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Ex: Maîtriser les anticoagulants
                </p>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={objective}
                        onChange={handleObjectiveChange}
                        placeholder="Votre objectif..."
                        className="border-gray-300 border p-3 rounded-lg w-full text-base focus:ring-2 focus:ring-green-500"
                        disabled={loading}
                        onKeyPress={(e) => e.key === 'Enter' && handleValidateObjective()}
                    />
                    <button
                        onClick={handleValidateObjective}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Valider'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default AICoach;
