import React from 'react';
import AICoach from '../components/AICoach';
import { useAuth } from '../App'; // Importer useAuth

const CoachAccueilPage: React.FC = () => {
    const { username } = useAuth(); // Récupérer le nom de l'utilisateur

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Message d'accueil personnalisé */}
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
                Bonjour, <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">{username}</span> !
            </h1>
            
            {/* Composant du Coach IA */}
            <AICoach />
        </div>
    );
};

export default CoachAccueilPage;
