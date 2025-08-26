import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { LoadingSpinner } from '../LoadingSpinner';
import { User } from '../../types/user';

interface AssignFichesModalProps {
  ficheIds: string[];
  onClose: () => void;
  onAssign: (userIds: string[]) => Promise<void>;
}

const AssignFichesModal: React.FC<AssignFichesModalProps> = ({ ficheIds, onClose, onAssign }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  };

  const handleAssign = async () => {
    await onAssign(Array.from(selectedUserIds));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Assigner les mémofiches</h2>
        {loading && <LoadingSpinner />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            <div className="max-h-64 overflow-y-auto border rounded-md p-2 mb-4">
              {users.map(user => (
                <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-100">
                  <span>{user.username} ({user.email})</span>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(user._id)}
                    onChange={() => handleUserSelect(user._id)}
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400">
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedUserIds.size === 0}
                className="px-4 py-2 rounded-md bg-blue-500 text-white disabled:bg-gray-400"
              >
                Assigner
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignFichesModal;
