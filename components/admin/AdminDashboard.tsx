import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { User } from '../../types/user';
import { LoadingSpinner } from '../LoadingSpinner';
import SummaryCards from './SummaryCards';
import UserTable from './UserTable';
import SubscriptionManagement from './SubscriptionManagement';
import LearningProgress from './LearningProgress';
import { getAdminStats, getAllUsers, updateUser, assignPreparateurToPharmacien } from '../../services/adminService'; // Added assignPreparateurToPharmacien

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('users');

    // State for preparateur assignment
    const [selectedPreparateurId, setSelectedPreparateurId] = useState<string>('');
    const [selectedPharmacienId, setSelectedPharmacienId] = useState<string>('');
    const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);

    const fetchData = async () => {
        if (!token) {
            setError('Authentication token not found.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [statsData, usersData] = await Promise.all([
                getAdminStats(),
                getAllUsers()
            ]);
            setStats(statsData);
            setUsers(usersData);
        } catch (err: any) {
            console.error('Error fetching admin data:', err);
            setError(err.message || 'Failed to load admin data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleUpdateUser = async (userId: string, data: { role?: string; subscriptionStatus?: string }) => {
        if (!token) return;
        try {
            await updateUser(userId, data);
            fetchData(); // Refetch data to update the UI
        } catch (error) {
            console.error('Failed to update user', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!token) return;
        // Implement delete functionality
    };

    // Filter users for assignment dropdowns
    const preparateurs = users.filter(user => user.role === 'Preparateur');
    const pharmaciens = users.filter(user => user.role === 'Pharmacien');

    const handleAssignPreparateur = async () => {
        if (!selectedPreparateurId || !selectedPharmacienId) {
            setAssignmentMessage('Veuillez sélectionner un préparateur et un pharmacien.');
            return;
        }
        setAssignmentMessage(null);
        try {
            await assignPreparateurToPharmacien(selectedPreparateurId, selectedPharmacienId);
            setAssignmentMessage('Préparateur assigné avec succès !');
            fetchData(); // Refetch all data to update tables
        } catch (err: any) {
            console.error('Error assigning preparateur:', err);
            setAssignmentMessage(err.message || 'Échec de l\'affectation du préparateur.');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">Tableau de Bord Administrateur</h1>
            {stats && <SummaryCards stats={stats} />}

            <div className="mt-8">
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${ activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`${ activeTab === 'subscriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Abonnements
                        </button>
                        <button
                            onClick={() => setActiveTab('progress')}
                            className={`${ activeTab === 'progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Progression de l\'Apprentissage
                        </button>
                        <button
                            onClick={() => setActiveTab('assign')}
                            className={`${ activeTab === 'assign' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Affecter Préparateur
                        </button>
                    </nav>
                </div>

                {activeTab === 'assign' && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Affecter un Préparateur à un Pharmacien</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="preparateur-select" className="block text-sm font-medium text-gray-700">Sélectionner un Préparateur</label>
                                <select
                                    id="preparateur-select"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={selectedPreparateurId}
                                    onChange={(e) => setSelectedPreparateurId(e.target.value)}
                                >
                                    <option value="">-- Choisir un préparateur --</option>
                                    {preparateurs.map(prep => (
                                        <option key={prep._id} value={prep._id}>{prep.username} ({prep.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="pharmacien-select" className="block text-sm font-medium text-gray-700">Sélectionner un Pharmacien</label>
                                <select
                                    id="pharmacien-select"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={selectedPharmacienId}
                                    onChange={(e) => setSelectedPharmacienId(e.target.value)}
                                >
                                    <option value="">-- Choisir un pharmacien --</option>
                                    {pharmaciens.map(pharm => (
                                        <option key={pharm._id} value={pharm._id}>{pharm.username} ({pharm.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleAssignPreparateur}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Affecter
                        </button>
                        {assignmentMessage && (
                            <p className={`mt-3 text-sm ${assignmentMessage.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
                                {assignmentMessage}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <UserTable 
                        users={users} 
                        onUpdateUser={handleUpdateUser} 
                        onDeleteUser={handleDeleteUser} 
                        loading={loading} 
                        error={error} 
                    />
                )}
                {activeTab === 'subscriptions' && (
                    <SubscriptionManagement 
                        users={users} 
                        onUpdateSubscription={handleUpdateUser}
                        loading={loading} 
                        error={error} 
                    />
                )}
                {activeTab === 'progress' && (
                    <LearningProgress 
                        users={users} 
                        loading={loading} 
                        error={error} 
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
