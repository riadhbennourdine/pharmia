import React from 'react';

const AICoach: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommandations du Coach</h2>
            <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-lg text-gray-700">
                    Bonjour! Je suis votre coach IA. Voici ce que je vous recommande d'étudier aujourd'hui:
                </p>
            </div>

            <div className="mt-8">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-xl font-bold text-gray-800">Cardiologie: Les anti-hypertenseurs</h3>
                    <p className="text-gray-600 mt-2">
                        J'ai remarqué que vous avez eu des difficultés avec les quiz sur la cardiologie. Je vous recommande de revoir cette fiche pour renforcer vos connaissances.
                    </p>
                    <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Commencer à étudier
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Définir un objectif</h2>
                <div className="flex items-center">
                    <input type="text" placeholder="Ex: Maîtriser la diabétologie en 1 semaine" className="border p-2 rounded-md w-full" />
                    <button className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Définir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
