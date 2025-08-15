import React, { useState } from 'react';
import { useData } from '../App';
import { LoadingSpinner } from '../components/LoadingSpinner';
import PharmacienDashboard from '../components/PharmacienDashboard';
import LearnerProfile from '../components/LearnerProfile';

const LearnerSpacePage: React.FC = () => {
    const { learnerData: user, data, loading, error } = useData();
    const [activeTab, setActiveTab] = useState('learner');

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user || !data) {
        return <div className="text-center mt-10">Aucune donnée utilisateur trouvée.</div>;
    }

    const isPharmacien = user.role === 'Pharmacien';

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">
                {isPharmacien ? 'Espace Pharmacien' : 'Espace Apprenant'}
            </h1>

            {isPharmacien && (
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('learner')}
                            className={`${
                                activeTab === 'learner'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Mon Espace Apprentissage
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`${
                                activeTab === 'dashboard'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Tableau de Bord
                        </button>
                    </nav>
                </div>
            )}

            {activeTab === 'learner' && <LearnerProfile user={user} data={data} />}
            
            {isPharmacien && activeTab === 'dashboard' && (
                <PharmacienDashboard pharmacienId={user._id} />
            )}

            {!isPharmacien && <LearnerProfile user={user} data={data} />}
        </div>
    );
};

export default LearnerSpacePage;
