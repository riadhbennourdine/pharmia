import React, { useState } from 'react';
import { FiMessageSquare, FiZap, FiTarget } from 'react-icons/fi';

const AICoach: React.FC = () => {
    const [messages, setMessages] = useState([
        {
            sender: 'coach',
            text: "Bonjour! Je suis votre coach IA. Prêt à booster vos connaissances aujourd'hui?",
            actions: [
                { text: 'Oui, montrez-moi! ', type: 'recommendation' },
                { text: 'Pas maintenant', type: 'delay' },
            ]
        }
    ]);

    const handleAction = (actionType: string) => {
        if (actionType === 'recommendation') {
            setMessages(prev => [...prev, {
                sender: 'user',
                text: 'Oui, montrez-moi!',
            }, {
                sender: 'coach',
                text: 'Excellent! En fonction de vos derniers quiz, je vous suggère de revoir la fiche sur les **anti-hypertenseurs**. C\'est un sujet clé!',
                recommendation: {
                    title: 'Cardiologie: Les anti-hypertenseurs',
                    reason: "J'ai remarqué que vous avez eu des difficultés avec les quiz sur la cardiologie. Je vous recommande de revoir cette fiche pour renforcer vos connaissances.",
                },
                actions: [
                    { text: 'Commencer à étudier', type: 'study' },
                    { text: 'Une autre suggestion?', type: 'suggestion' },
                ]
            }]);
        } else {
            // Handle other actions later
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
                <FiMessageSquare className="text-blue-500 mr-3" size={24} />
                <h2 className="text-2xl font-semibold text-gray-800">Votre Coach IA</h2>
            </div>

            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'coach' && <FiZap className="text-yellow-500 mr-2 mb-1" size={20} />}
                        <div className={`px-4 py-2 rounded-lg ${msg.sender === 'coach' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                            <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                            {msg.recommendation && (
                                <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-800">{msg.recommendation.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{msg.recommendation.reason}</p>
                                </div>
                            )}
                            {msg.actions && (
                                <div className="mt-3 flex space-x-2">
                                    {msg.actions.map((action, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleAction(action.type)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-full"
                                        >
                                            {action.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t">
                 <div className="flex items-center mb-2">
                    <FiTarget className="text-green-500 mr-3" size={22} />
                    <h3 className="text-xl font-semibold text-gray-700">Mes Objectifs</h3>
                </div>
                <div className="flex items-center">
                    <input type="text" placeholder="Ex: Maîtriser la diabétologie en 1 semaine" className="border p-2 rounded-md w-full" />
                    <button className="ml-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                        Définir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
