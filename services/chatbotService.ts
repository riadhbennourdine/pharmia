import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const sendMessageToChatbot = async (message: string): Promise<string> => {
    try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const response = await axios.post(
            `${API_BASE_URL}/api/chatbot/message`,
            { message },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data.response;
    } catch (error) {
        console.error('Error sending message to chatbot:', error);
        throw error;
    }
};