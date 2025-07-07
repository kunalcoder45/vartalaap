// utils/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get auth token (you'll need to implement this based on your auth system)
const getAuthToken = () => {
    // Replace this with your actual token retrieval logic
    return localStorage.getItem('authToken') || '';
};

// Mark status as viewed
export const markStatusAsViewed = async (statusId) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/status/view/${statusId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Mark as viewed response:', data);
        return data;
    } catch (error) {
        console.error('[API] Error marking status as viewed:', error);
        throw error;
    }
};


// Fetch user details for viewedBy
export const fetchUserDetails = async (userIds) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/status/user-details`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Fetch user details response:', data);
        return data;
    } catch (error) {
        console.error('[API] Error fetching user details:', error);
        throw error;
    }
};

// Delete status
export const deleteStatus = async (statusId) => {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/status/${statusId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Delete status response:', data);
        return data;
    } catch (error) {
        console.error('[API] Error deleting status:', error);
        throw error;
    }
};