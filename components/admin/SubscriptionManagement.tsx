import React, { useState, useMemo } from 'react';
import { User } from '../../types/user';

interface SubscriptionManagementProps {
  users: User[];
  onUpdateSubscription: (userId: string, subscriptionStatus: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ users, onUpdateSubscription, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        if (filter === 'all') return true;
        return user.subscriptionStatus === filter;
      })
      .filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, filter]);

  if (loading) {
    return <div className="text-center p-8">Chargement des abonnements...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Gestion des Abonnements</h2>
      
      <div className="flex justify-between mb-4">
        <input 
          type="text"
          placeholder="Rechercher par nom ou email..."
          className="border p-2 rounded-md w-1/3"
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="border p-2 rounded-md"
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Tous les abonnements</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d'utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonnement</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.subscriptionStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onUpdateSubscription(user._id, user.subscriptionStatus === 'premium' ? 'free' : 'premium')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {user.subscriptionStatus === 'premium' ? 'Passer en Free' : 'Passer en Premium'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
