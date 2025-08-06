
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole>(UserRole.Pharmacien);

    useEffect(() => {
      if (isLoggedIn) {
        navigate('/');
      }
    }, [isLoggedIn, navigate]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        login(role);
        navigate('/');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
                       <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">PharmIA</span>
                    </h1>
                    <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">
                        Accédez à votre espace
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sélectionnez un rôle pour simuler la connexion.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="role-selector" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                            <select
                                id="role-selector"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            >
                                <option value={UserRole.Admin}>Admin</option>
                                <option value={UserRole.Formateur}>Formateur</option>
                                <option value={UserRole.Pharmacien}>Pharmacien</option>
                                <option value={UserRole.Preparateur}>Préparateur</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Adresse email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Adresse email (simulation)"
                                defaultValue={`${role.toLowerCase()}@pharmia.fr`}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Se connecter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
