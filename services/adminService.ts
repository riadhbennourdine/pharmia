import { User } from '../types/user';

import { BASE_URL as API_BASE_URL } from '../src/constants';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Fetch admin stats
export const getAdminStats = async (): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
    }
    return response.json();
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

// Fetch a single user by ID
export const getUserById = async (userId: string): Promise<User> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
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

// Assign a preparateur to a pharmacist
export const assignPreparateurToPharmacien = async (preparateurId: string, pharmacienId: string): Promise<any> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${preparateurId}/assign-pharmacien`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pharmacienId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign preparateur to pharmacist.');
    }
    return response.json();
};
