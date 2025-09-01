import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MemoFiche } from '../types';
import MemoCard from '../components/MemoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BASE_URL } from '../src/constants';

const SharedFichePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [fiches, setFiches] = useState<MemoFiche[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordRequired, setPasswordRequired] = useState(true); // Assume password might be needed

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}api/shares/${shareId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password: password || undefined }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (data.passwordRequired) {
                    setError('Mot de passe incorrect ou requis.');
                } else {
                    setError(data.message || 'Une erreur est survenue.');
                }
                setFiches(null);
            } else {
                setFiches(data);
                setPasswordRequired(false); // Password was correct, no longer need the form
                setError(null);
            }
        } catch (err) {
            setError('Impossible de contacter le serveur.');
            setFiches(null);
        } finally {
            setLoading(false);
        }
    };

    if (fiches) {
        // Display the shared content if successfully fetched
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold text-center my-6">Contenu Partagé</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fiches.map((fiche) => (
                        <MemoCard key={fiche.id} fiche={fiche} />
                    ))}
                </div>
            </div>
        );
    }

    // Display the password form
    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-2xl font-bold text-center mb-6">Contenu Protégé</h2>
                    <p className="text-center text-gray-600 mb-6">
                        Ce contenu est protégé par un mot de passe. Veuillez le saisir pour y accéder.
                    </p>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="******************"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                        >
                            {loading ? <LoadingSpinner /> : 'Accéder au contenu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SharedFichePage;