import { User } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Fetch all users
export const getAllUsers = async (): Promise<User[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

// Update a user's data
export const updateUser = async (userId: string, data: { role?: string; subscriptionStatus?: string }): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
    }
    return response.json();
};

// Delete a user
export const deleteUser = async (userId: string): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
    }
    return response.json();
};
