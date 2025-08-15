import React, { useState } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { askChatbot } from '../services/geminiService';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Bonjour! Comment puis-je vous aider aujourd\'aujourd\'hui?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async () => {
        if (inputValue.trim()) {
            const userMessage = { sender: 'user', text: inputValue };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setLoading(true);

            try {
                const botResponse = await askChatbot(inputValue);
                setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
            } catch (error) {
                console.error("Error asking chatbot:", error);
                setMessages(prev => [...prev, { sender: 'bot', text: "Désolé, je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer." }]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Ouvrir le chatbot"
            >
                <FiMessageCircle size={28} />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
                    <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-lg">
                        <h3 className="font-bold text-lg">PharmIA Chatbot</h3>
                        <button onClick={() => setIsOpen(false)}><FiX size={20} /></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end mb-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                <div className={`px-3 py-2 rounded-lg ${msg.sender === 'bot' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-end mb-3">
                                <div className="px-3 py-2 rounded-lg bg-blue-100 text-blue-900">
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t flex">
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Posez votre question..."
                            className="flex-grow border rounded-md p-2"
                            disabled={loading}
                        />
                        <button 
                            onClick={handleSendMessage} 
                            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                            disabled={loading}
                        >
                            Envoyer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
