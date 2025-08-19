import React, { useState } from 'react';
import { FiMessageSquare, FiTarget } from 'react-icons/fi';
import { findFicheByObjective, AISuggestion } from '../services/aiCoachService';
import { useData } from '../App';
import { useNavigate } from 'react-router-dom';


const AICoach: React.FC = () => {
    const { learnerData: user } = useData();
    const [objective, setObjective] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
        try {
            const suggestion: AISuggestion = await findFicheByObjective(objective);
            if (suggestion && suggestion.ficheId) {
                navigate(`/fiches/${suggestion.ficheId}`);
            } else {
                setError("Désolé, nous n'avons pas trouvé de fiche correspondante à votre objectif.");
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la recherche de votre objectif. Veuillez réessayer.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsultBilan = () => {
        // Placeholder for where the bilan/assessment page would be navigated to
        // For now, it can navigate to the learner space or another relevant page
        navigate('/learner-space');
    };

    const handlePasMaintenant = () => {
        // Placeholder for "Not now" action.
        // Can close a modal, or navigate away, etc.
        // For now, we can just log it or do nothing.
        console.log("L'utilisateur a cliqué sur 'Pas maintenant'");
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto border border-gray-200">
            <div className="flex items-center mb-4">
                <FiMessageSquare className="text-green-600 mr-3" size={28} />
                <h2 className="text-2xl font-bold text-gray-800">Coach PharmIA</h2>
            </div>

            <div className="mb-6">
                <p className="text-lg text-gray-700">
                    Bonjour, {user?.name || 'admin'} !
                </p>
                <p className="text-md text-gray-600">
                    Bienvenue. Analysons ensemble vos progrès et définissons vos prochains objectifs.
                </p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <button
                    onClick={handleConsultBilan}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
                >
                    Consulter mon bilan
                </button>
                <button
                    onClick={handlePasMaintenant}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm"
                >
                    Pas maintenant
                </button>
            </div>

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
                    />
                    <button
                        onClick={handleValidateObjective}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors"
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