import React, { useEffect, useState, useCallback } from 'react';
import { User } from '../types/user';
import { getAllUsers, updateUser, deleteUser } from '../services/adminService';
import SummaryCards from '../components/admin/SummaryCards';
import UserTable from '../components/admin/UserTable';
import Header from '../components/Header'; // Assuming a Header component exists

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs. Veuillez vérifier votre connexion ou vos permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (userId: string, data: { role?: string; subscriptionStatus?: string }) => {
    try {
        await updateUser(userId, data);
        // Refresh user list after update
        fetchUsers();
    } catch (error) {
        console.error('Failed to update user:', error);
        setError('La mise à jour de l\'utilisateur a échoué.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
        try {
            await deleteUser(userId);
            // Refresh user list after deletion
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            setError('La suppression de l\'utilisateur a échoué.');
        }
    }
  };

  const premiumUsersCount = users.filter(u => u.subscriptionStatus === 'premium').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord Administrateur</h1>
        
        <SummaryCards totalUsers={users.length} premiumUsers={premiumUsersCount} />

        <UserTable 
            users={users} 
            onUpdateUser={handleUpdateUser} 
            onDeleteUser={handleDeleteUser}
            loading={loading}
            error={error}
        />
      </main>
    </div>
  );
};

export default AdminDashboardPage;
