import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../App';
import { User } from '../types/user';
import { LoadingSpinner } from '../components/LoadingSpinner';
import LearnerProfile from '../components/LearnerProfile';
import { getUserById } from '../services/adminService'; // Assuming you have this service function
import { useData } from '../App';

const UserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { token } = useAuth();
    const { data, loading: dataLoading, error: dataError } = useData();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token || !userId) {
                setError('User ID or token not found.');
                setLoading(false);
                return;
            }
            try {
                const userData = await getUserById(token, userId);
                setUser(userData);
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                setError(err.message || 'Failed to load user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token, userId]);

    if (loading || dataLoading) {
        return <LoadingSpinner />;
    }

    if (error || dataError) {
        return <div className="text-red-500 text-center mt-10">{error || dataError}</div>;
    }

    if (!user || !data) {
        return <div className="text-center mt-10">Aucune donnée utilisateur trouvée.</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-black mb-8">Profil de l'utilisateur</h1>
            <LearnerProfile user={user} data={data} />
        </div>
    );
};

export default UserDetailPage;
