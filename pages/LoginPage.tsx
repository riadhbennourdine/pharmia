
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole>(UserRole.Pharmacien);
    const [loginIdentifier, setLoginIdentifier] = useState(''); // Can be email or username
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState(''); // For registration
    const [pharmacienResponsableId, setPharmacienResponsableId] = useState('');
    const [pharmaciens, setPharmaciens] = useState<any[]>([]);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      if (isLoggedIn) {
        navigate('/coach-accueil');
      }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (isRegisterMode && role === UserRole.Preparateur) {
            const fetchPharmaciens = async () => {
                try {
                    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/pharmaciens', {
                        headers: {
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setPharmaciens(data);
                        if (data.length > 0) {
                            setPharmacienResponsableId(data[0]._id); // Select first by default
                        }
                    } else {
                        setError('Erreur lors du chargement des pharmaciens.');
                    }
                } catch (err) {
                    console.error('Error fetching pharmaciens:', err);
                    setError('Erreur réseau lors du chargement des pharmaciens.');
                }
            };
            fetchPharmaciens();
        }
    }, [isRegisterMode, role]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(''); // Clear previous errors

        if (isRegisterMode) {
            if (password !== confirmPassword) {
                setError('Les mots de passe ne correspondent pas.');
                return;
            }
            if (!username) {
                setError('Le nom d\'utilisateur est requis pour l\'inscription.');
                return;
            }
        }

        const endpoint = isRegisterMode ? '/api/register' : '/api/login';
        const body = isRegisterMode
            ? { email: loginIdentifier, password, role, username, ...(role === UserRole.Preparateur && { pharmacienResponsableId }) }
            : { loginIdentifier, password }; // For login, loginIdentifier can be email or username

        

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                if (isRegisterMode) {
                    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    setIsRegisterMode(false); // Switch to login mode after successful registration
                } else {
                    // Decode token to get username
                    const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
                    login(data.role || role, data.token, tokenPayload.username); // Pass token and username to login
                    navigate('/coach-accueil');
                }
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (err) {
            console.error('Network or server error:', err);
            setError('Impossible de se connecter au serveur. Veuillez réessayer.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
                       <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">PharmIA</span>
                    </h1>
                    <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">
                        {isRegisterMode ? 'Créez votre compte' : 'Accédez à votre espace'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isRegisterMode ? 'Remplissez les champs pour vous inscrire.' : 'Connectez-vous avec vos identifiants.'}
                    </p>
                    {/* New text for trial */}
                    <p className="mt-6 text-center text-lg font-semibold text-green-700">
                        Essayez Gratuitement nos Mémofiches !
                    </p>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Période d'essai de 14 jours
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {isRegisterMode && (
                            <div>
                                <label htmlFor="username" className="sr-only">Nom d'utilisateur</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="Nom d'utilisateur"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="login-identifier" className="sr-only">Email ou Nom d'utilisateur</label>
                            <input
                                id="login-identifier"
                                name="login-identifier"
                                type="text"
                                autoComplete="email username"
                                required
                                className={`appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${isRegisterMode ? 'rounded-none' : 'rounded-t-md'}`}
                                placeholder="Email ou Nom d'utilisateur"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {isRegisterMode && (
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Confirmer le mot de passe</label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="Confirmer le mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}
                        {isRegisterMode && (
                            <div>
                                <label htmlFor="role-selector" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                <select
                                    id="role-selector"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value={UserRole.Pharmacien}>Pharmacien</option>
                                    <option value={UserRole.Preparateur}>Préparateur</option>
                                </select>
                            </div>
                        )}
                        {isRegisterMode && role === UserRole.Preparateur && (
                            <div>
                                <label htmlFor="pharmacien-responsable" className="block text-sm font-medium text-gray-700 mb-1">Pharmacien Responsable</label>
                                <select
                                    id="pharmacien-responsable"
                                    value={pharmacienResponsableId}
                                    onChange={(e) => setPharmacienResponsableId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                >
                                    {pharmaciens.map((ph) => (
                                        <option key={ph._id} value={ph._id}>
                                            {ph.username} ({ph.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {isRegisterMode ? 'S\'inscrire' : 'Se connecter'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsRegisterMode(!isRegisterMode)}
                            className="font-medium text-green-600 hover:text-green-500"
                        >
                            {isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
