
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types/user';
import { MemoFiche, Badge } from '../types';
import * as FiIcons from 'react-icons/fi';

// Helper to render a badge icon with a tooltip
const BadgeIcon: React.FC<{ badge: Badge }> = ({ badge }) => {
    const IconComponent = FiIcons[badge.icon as keyof typeof FiIcons] || FiIcons.FiHelpCircle;
    return (
        <div className="relative group">
            <IconComponent className="w-8 h-8 text-yellow-500" />
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <p className="font-bold">{badge.name}</p>
                <p>{badge.description}</p>
            </div>
        </div>
    );
};

interface LearnerProfileProps {
    user: User;
    data: {
        memofiches: MemoFiche[];
        badges: Badge[];
    };
}

const LearnerProfile: React.FC<LearnerProfileProps> = ({ user, data }) => {
    // --- Calculations ---
    const totalFiches = data.memofiches?.length || 0;
    const fichesRead = user.readFicheIds?.length || 0;
    const fichesReadProgress = totalFiches > 0 ? (fichesRead / totalFiches) * 100 : 0;

    const totalQuizzes = data.memofiches?.filter(f => f.quiz && f.quiz.questions && f.quiz.questions.length > 0).length || 0;
    const quizzesCompleted = user.quizHistory?.length || 0;
    const quizzesCompletedProgress = totalQuizzes > 0 ? (quizzesCompleted / totalQuizzes) * 100 : 0;

    const getFicheTitle = (id: string) => {
        return data.memofiches.find(f => f.id === id)?.title || 'Fiche inconnue';
    };

    const earnedBadges = data.badges?.filter(b => user.badges?.includes(b.id)) || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Personal Info */}
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Mes Informations</h2>
                <p className="text-gray-800"><strong>Nom d'utilisateur:</strong> {user.username}</p>
                <p className="text-gray-800"><strong>Pharmacie:</strong> {user.pharmacienReferent?.username || 'N/A'}</p>
                <p className="text-gray-800"><strong>Rôle:</strong> {user.role}</p>
                <p className="text-gray-800"><strong>Niveau:</strong> <span className="font-semibold text-green-600">{user.skillLevel || 'Débutant'}</span></p>
                {user.pharmacienReferent && (
                    <p className="text-gray-800"><strong>Pharmacien Référent:</strong> {user.pharmacienReferent.username}</p>
                )}
            </div>

            {/* Right Column: Progression, Badges, and AI Coach */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ma Progression</h2>
                
                {/* Top Stats */}
                <div className="flex justify-around text-center mb-6">
                    <div>
                        <p className="text-3xl font-bold text-green-600">{fichesRead}</p>
                        <p className="text-gray-500">Fiches Lues</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600">{quizzesCompleted}</p>
                        <p className="text-gray-500">Quiz Effectués</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600">{Math.round((user.quizHistory?.reduce((acc, q) => acc + q.score, 0) || 0) / (user.quizHistory?.length || 1))}%</p>
                        <p className="text-gray-500">Score Moyen</p>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-gray-800">Progression des Fiches</span>
                            <span className="text-sm font-medium text-green-600">{Math.round(fichesReadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${fichesReadProgress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-gray-800">Progression des Quiz</span>
                            <span className="text-sm font-medium text-green-600">{Math.round(quizzesCompletedProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${quizzesCompletedProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Earned Badges & AI Coach */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Badges Obtenus</h3>
                    {earnedBadges.length > 0 ? (
                        <div className="flex items-center space-x-4">
                            {earnedBadges.map(badge => <BadgeIcon key={badge.id} badge={badge} />)}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Continuez votre progression pour débloquer des badges !</p>
                    )}
                </div>

                
            </div>

            {/* Bottom Section: Detailed Lists */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Fiches Récemment Lues</h3>
                        {fichesRead > 0 ? (
                            <ul className="list-disc list-inside text-gray-800">{
                                user.readFicheIds.map(id => (
                                    <li key={id}>
                                        <Link to={`/fiches/${id}`} className="text-green-600 hover:underline">{getFicheTitle(id)}</Link>
                                    </li>
                                ))
                            }</ul>
                        ) : (
                            <p className="text-gray-500">Aucune fiche lue pour le moment.</p>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Historique des Quiz</h3>
                        {quizzesCompleted > 0 ? (
                            <ul className="list-disc list-inside text-gray-800">
                                {user.quizHistory.map((quiz, index) => (
                                    <li key={index}>
                                        <Link to={`/fiches/${quiz.quizId}`} className="hover:underline">{getFicheTitle(quiz.quizId)}</Link>: <span className="font-bold text-green-600">{Math.round(quiz.score)}%</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Aucun quiz effectué pour le moment.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnerProfile;
