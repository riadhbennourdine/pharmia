import React, { useState, useMemo } from 'react';
import { User } from '../../types/user';
import { FiEdit, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';

interface UserTableProps {
  users: User[];
  onUpdateUser: (userId: string, data: { role?: string; subscriptionStatus?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUpdateUser, onDeleteUser, loading, error }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setEditedUser({ role: user.role, subscriptionStatus: user.subscriptionStatus });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedUser({});
  };

  const handleSave = async (userId: string) => {
    await onUpdateUser(userId, { 
        role: editedUser.role,
        subscriptionStatus: editedUser.subscriptionStatus
    });
    setEditingId(null);
    setEditedUser({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        if (roleFilter === 'all') return true;
        return user.role === roleFilter;
      })
      .filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, roleFilter]);

  if (loading) {
    return <div className="text-center p-8">Chargement des utilisateurs...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Gestion des Utilisateurs</h2>
        
        <div className="flex justify-between mb-4">
            <input 
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="border p-2 rounded-md w-1/3"
                onChange={e => setSearchTerm(e.target.value)}
            />
            <select 
                className="border p-2 rounded-md"
                onChange={e => setRoleFilter(e.target.value)}
            >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="pharmacien">Pharmacien</option>
                <option value="préparateur">Préparateur</option>
            </select>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d'utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
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
                        {editingId === user._id ? (
                        <select name="role" value={editedUser.role} onChange={handleChange} className="border p-1 rounded-md">
                            <option value="pharmacien">Pharmacien</option>
                            <option value="préparateur">Préparateur</option>
                            <option value="admin">Admin</option>
                        </select>
                        ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {user.role}
                        </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === user._id ? (
                        <select name="subscriptionStatus" value={editedUser.subscriptionStatus} onChange={handleChange} className="border p-1 rounded-md">
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                        </select>
                        ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.subscriptionStatus}
                        </span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === user._id ? (
                        <>
                            <button onClick={() => handleSave(user._id)} className="text-green-600 hover:text-green-900 mr-4"><FiSave size={18} /></button>
                            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900"><FiXCircle size={18} /></button>
                        </>
                        ) : (
                        <>
                            <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><FiEdit size={18} /></button>
                            <button onClick={() => onDeleteUser(user._id)} className="text-red-600 hover:text-red-900"><FiTrash2 size={18} /></button>
                        </>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default UserTable;
