import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

export const sendMessageToChatbot = async (message: string): Promise<string> => {
    try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const response = await fetch(
            `${API_BASE_URL}/chatbot/message`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            }
        );
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        throw error;
    }
};