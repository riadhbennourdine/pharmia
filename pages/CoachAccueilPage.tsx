import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { useData } from '../App';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CoachAccueilPage: React.FC = () => {
    const { username } = useAuth();
    const { learnerData, loading } = useData();

    if (loading) {
        return <div className="mt-20"><LoadingSpinner /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bonjour ! <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">{username}</span>
            </h1>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Votre Progression</h2>
                {learnerData?.progression ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                        <div>
                            <p className="text-gray-600">Fiches terminées</p>
                            <p className="font-bold text-green-500">{learnerData.progression.completedFiches} / {learnerData.progression.totalFiches}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Score Moyen</p>
                            <p className="font-bold text-green-500">{learnerData.progression.averageScore}%</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Temps Passé</p>
                            <p className="font-bold text-green-500">{Math.floor(learnerData.progression.timeSpent / 60)}h {learnerData.progression.timeSpent % 60}min</p>
                        </div>
                    </div>
                ) : (
                    <p>Les données de progression ne sont pas disponibles.</p>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Consigne du Jour</h2>
                <p className="text-gray-600">Aujourd'hui, nous allons nous concentrer sur les interactions médicamenteuses. Essayez de compléter 3 fiches sur ce sujet.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Fonctionnalités du Coach</h2>
                <ul className="list-disc list-inside text-left text-gray-600">
                    <li>Analyse de vos forces et faiblesses.</li>
                    <li>Recommandations de fiches personnalisées.</li>
                    <li>Suivi de vos objectifs d'apprentissage.</li>
                    <li>Simulation de cas patients.</li>
                </ul>
            </div>

            <Link to="/fiches">
                <button className="bg-green-600 text-white font-bold px-8 py-4 rounded-lg shadow-md hover:bg-green-700 transition text-xl">
                    Commencer à apprendre
                </button>
            </Link>
        </div>
    );
};

export default CoachAccueilPage;
