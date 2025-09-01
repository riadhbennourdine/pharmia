import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { User } from '../types/user';
import { LoadingSpinner } from './LoadingSpinner';
import { BASE_URL } from '../src/constants';
import { BASE_URL } from '../src/constants';

interface PharmacienDashboardProps {
    pharmacienId: string;
}

const ConsigneModal: React.FC<{ preparateur: User; token: string | null; onClose: () => void; onSave: () => void; }> = ({ preparateur, token, onClose, onSave }) => {
    const [consigne, setConsigne] = useState(preparateur.consigne || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${BASE_URL}api/pharmacien/preparateurs/${preparateur._id}/consigne`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ consigne }),
            });
            if (!response.ok) {
                throw new Error('Failed to save consigne');
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving consigne:', error);
            // Here you could show an error message to the user
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Consigne pour {preparateur.username}</h3>
                <textarea
                    value={consigne}
                    onChange={(e) => setConsigne(e.target.value)}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Saisissez votre consigne ici..."
                />
                <div className="mt-4 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                        Annuler
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PharmacienDashboard: React.FC<PharmacienDashboardProps> = ({ pharmacienId }) => {
    const { token } = useAuth();
    const [preparateurs, setPreparateurs] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPreparateur, setSelectedPreparateur] = useState<User | null>(null);

    const fetchPreparateurs = async () => {
        if (!token) {
            setError('Authentication token not found.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}api/pharmacien/preparateurs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch preparateurs: ${response.statusText}`);
            }
            const data: User[] = await response.json();
            setPreparateurs(data);
        } catch (err: any) {
            console.error('Error fetching preparateurs:', err);
            setError(err.message || 'Failed to load preparateur data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreparateurs();
    }, [token, pharmacienId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    const getScoreColorClass = (score: number): string => {
        if (score >= 80) {
            return 'bg-green-500';
        } else if (score >= 50) {
            return 'bg-orange-500';
        } else {
            return 'bg-red-500';
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">Tableau de Bord Pharmacien</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mes Préparateurs</h2>
                {preparateurs.length === 0 ? (
                    <p className="text-gray-600">Aucun préparateur associé pour le moment.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom d'utilisateur
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Niveau
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fiches Lues
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Score Quiz Moyen
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {preparateurs.map((preparateur) => (
                                    <tr key={preparateur._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {preparateur.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {preparateur.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {preparateur.skillLevel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {preparateur.fichesReadCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {preparateur.averageQuizScore !== 'N/A' ? (
                                                <div className="flex items-center">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${getScoreColorClass(parseFloat(preparateur.averageQuizScore))}`}></span>
                                                    {preparateur.averageQuizScore}%
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {preparateur.lastLogin ? new Date(preparateur.lastLogin).toLocaleDateString('fr-FR') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedPreparateur(preparateur)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Modifier Consigne
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selectedPreparateur && (
                <ConsigneModal
                    preparateur={selectedPreparateur}
                    token={token}
                    onClose={() => setSelectedPreparateur(null)}
                    onSave={fetchPreparateurs}
                />
            )}
        </div>
    );
};

export default PharmacienDashboard;
