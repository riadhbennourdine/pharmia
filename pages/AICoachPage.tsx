import React from 'react';
import AICoach from '../components/AICoach';

const AICoachPage: React.FC = () => {
    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">Votre Coach IA</h1>
            <AICoach />
        </div>
    );
};

export default AICoachPage;
