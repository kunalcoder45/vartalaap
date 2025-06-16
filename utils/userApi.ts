// utils/userApi.js (or .ts if you're using TypeScript)

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

/**
 * Fetches the MongoDB user ID for a given Firebase UID from the backend.
 * This assumes your backend has an endpoint to look up a user by their Firebase UID
 * and return their MongoDB _id.
 *
 * @param {string} firebaseUid The Firebase User ID.
 * @param {string} authToken The authentication token (e.g., Firebase ID token).
 * @returns {Promise<string | null>} The MongoDB user ID or null if not found/error.
 */
export async function fetchMongoUserId(firebaseUid, authToken) {
    if (!firebaseUid || !authToken) {
        console.warn("Firebase UID or Auth Token missing for fetchMongoUserId.");
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/by-firebase-uid/${firebaseUid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to fetch MongoDB user ID: ${errorData.message || response.statusText}`);
            return null;
        }

        const data = await response.json();
        // Assuming your backend returns an object like { _id: "mongoUserId123" }
        return data._id || null;
    } catch (error) {
        console.error("Error fetching MongoDB user ID:", error);
        return null;
    }
}