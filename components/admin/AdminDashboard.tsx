import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { User } from '../../types/user';
import { LoadingSpinner } from '../LoadingSpinner';
import SummaryCards from './SummaryCards';
import UserTable from './UserTable';
import SubscriptionManagement from './SubscriptionManagement';
import LearningProgress from './LearningProgress';
import { getAdminStats, getAllUsers, updateUser } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('users');

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
                            className={`${
                                activeTab === 'users'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`${
                                activeTab === 'subscriptions'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Abonnements
                        </button>
                        <button
                            onClick={() => setActiveTab('progress')}
                            className={`${
                                activeTab === 'progress'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Progression de l'Apprentissage
                        </button>
                    </nav>
                </div>

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
