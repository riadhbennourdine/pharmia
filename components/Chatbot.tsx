import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { CSSTransition } from 'react-transition-group';
import ReactMarkdown from 'react-markdown';
import { sendMessageToChatbot } from '../services/chatbotService';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Bonjour! Comment puis-je vous aider aujourd\'aujourd\'hui?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nodeRef = useRef(null); // Create a ref for the transition node

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen) {
            scrollToBottom();
        }
    }, [messages, loading, isOpen]);

    const handleSendMessage = async () => {
        if (inputValue.trim()) {
            const userMessage = { sender: 'user', text: inputValue };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setLoading(true);

            try {
                const botResponse = await sendMessageToChatbot(inputValue);
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
                className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Ouvrir le chatbot"
            >
                <FiMessageCircle size={28} />
            </button>

            <CSSTransition in={isOpen} timeout={300} classNames="chatbot-window" unmountOnExit nodeRef={nodeRef}>
                <div ref={nodeRef} className="font-sans fixed bottom-24 right-8 w-96 max-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    <div className="flex-shrink-0 flex justify-between items-center p-4 bg-green-600 text-white rounded-t-xl">
                        <h3 className="font-bold text-lg">PharmIA Coach</h3>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-green-700 p-1 rounded-full"><FiX size={20} /></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto bg-gray-50 min-h-0">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`text-sm leading-relaxed px-4 py-2 max-w-xs md:max-w-sm shadow-sm ${msg.sender === 'bot' ? 'bg-white text-gray-800 rounded-2xl rounded-bl-none' : 'bg-green-500 text-white rounded-2xl rounded-br-none'}`}>
                                    <ReactMarkdown
                                        components={{
                                            a: ({node, ...props}) => <a {...props} className="text-green-700 font-bold hover:underline" target="_blank" rel="noopener noreferrer" />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-end mb-4 justify-start">
                                <div className="px-4 py-2 bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex items-center justify-center space-x-1">
                                        <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex-shrink-0 p-3 border-t bg-white">
                        <div className="flex items-center bg-gray-100 rounded-full px-2">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Posez votre question..."
                                className="flex-grow bg-transparent border-none p-2 text-gray-700 focus:outline-none text-sm"
                                disabled={loading}
                            />
                            <button 
                                onClick={handleSendMessage} 
                                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                disabled={loading || !inputValue.trim()}
                            >
                                <FiSend size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </>
    );
};

export default Chatbot;




