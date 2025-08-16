import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { User } from '../types/user';
import { LoadingSpinner } from './LoadingSpinner';

interface PharmacienDashboardProps {
    pharmacienId: string;
}

const PharmacienDashboard: React.FC<PharmacienDashboardProps> = ({ pharmacienId }) => {
    const { token } = useAuth();
    const [preparateurs, setPreparateurs] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreparateurs = async () => {
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pharmacien/preparateurs`, {
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
                                        Dernière Visite
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacienDashboard;
