import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { User } from '../../types/user';
import { LoadingSpinner } from '../LoadingSpinner';
import SummaryCards from './SummaryCards';
import UserTable from './UserTable';
import { getAdminStats, getAllUsers } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }
            try {
                const [statsData, usersData] = await Promise.all([
                    getAdminStats(token),
                    getAllUsers(token)
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

        fetchData();
    }, [token]);

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
                <UserTable users={users} />
            </div>
        </div>
    );
};

export default AdminDashboard;
