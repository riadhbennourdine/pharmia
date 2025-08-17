import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { User } from '../../types/user';
import { LoadingSpinner } from '../LoadingSpinner';

const TrainerManagement: React.FC = () => {
    const { token } = useAuth();
    const [formateurs, setFormateurs] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFormateurs = async () => {
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/formateurs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch formateurs: ${response.statusText}`);
                }
                const data: User[] = await response.json();
                setFormateurs(data);
            } catch (err: any) {
                console.error('Error fetching formateurs:', err);
                setError(err.message || 'Failed to load formateur data.');
            } finally {
                setLoading(false);
            }
        };

        fetchFormateurs();
    }, [token]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">Gestion des Formateurs</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liste des Formateurs</h2>
                {formateurs.length === 0 ? (
                    <p className="text-gray-600">Aucun formateur trouvé pour le moment.</p>
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
                                        Dernière Visite
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {formateurs.map((formateur) => (
                                    <tr key={formateur._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formateur.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formateur.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formateur.skillLevel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formateur.lastLogin ? new Date(formateur.lastLogin).toLocaleDateString('fr-FR') : 'N/A'}
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

export default TrainerManagement;
