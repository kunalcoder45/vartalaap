// client/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute'; // Assumed component for auth redirection
import { useAuth } from '../../components/AuthProvider'; // Custom auth hook
import Navbar from '../../components/navbar'; // Top navigation bar
import Slidebar from '../../components/slidebar'; // Left sidebar
import RightSidebar from '../../components/activitybar'; // Right sidebar
import MainBar from '../../components/mainBar';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';

/**
 * Dashboard component: The main social media feed page.
 * Handles group fetching, post creation, and overall layout.
 */
export default function Dashboard() {
    const { user, getIdToken } = useAuth(); // Get user and token getter from auth context
    const pathname = usePathname(); // Get current Next.js pathname

    // State for user's joined groups
    const [userJoinedGroups, setUserJoinedGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groupsError, setGroupsError] = useState(null);
    const imageInputRef = useRef<HTMLInputElement>(null); // Ref for image file input
    const videoInputRef = useRef<HTMLInputElement>(null); // Ref for video file input

    /**
     * Memoized callback to fetch groups the current user has joined.
     */
    const fetchUserGroups = useCallback(async () => {
        if (!user) { // If no user, no groups to fetch
            setUserJoinedGroups([]);
            setLoadingGroups(false);
            return;
        }

        setLoadingGroups(true);
        setGroupsError(null);

        try {
            const token = await getIdToken();
            if (!token) throw new Error("Authentication token not available.");

            const response = await fetch(`${API_BASE_URL}/groups/joined`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = 'Failed to fetch joined groups';
                try {
                    // Clone response to read body twice (once for json, once for text fallback)
                    const clonedResponse = response.clone();
                    const errorData = await clonedResponse.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    try {
                        const text = await response.text(); // Read as text if JSON parsing fails
                        console.error('Non-JSON error response from /groups/joined:', text);
                        errorMessage = text || errorMessage;
                    } catch (textError) {
                        console.error('Error reading response text from /groups/joined:', textError);
                    }
                }
                throw new Error(`${errorMessage} (Status: ${response.status})`);
            }

            const data = await response.json();
            setUserJoinedGroups(data);
        } catch (error: any) {
            console.error("Error fetching joined groups:", error.message);
            setGroupsError(error.message);
            setUserJoinedGroups([]);
            toast.error(`Error loading groups: ${error.message}`); // Show toast for group fetch errors
        } finally {
            setLoadingGroups(false);
        }
    }, [user, getIdToken]); // Dependencies for useCallback

    // Effect hook to trigger fetching user groups when user or getIdToken changes
    useEffect(() => {
        fetchUserGroups();
    }, [fetchUserGroups]);

    // Render the dashboard layout
    return (
        <ProtectedRoute> {/* Protects the route, redirects if not authenticated */}
            <Navbar /> {/* Top navigation */}
            <div className="h-auto p-4 bg-gray-50">
                <div className="flex">
                    <div className="flex-shrink-0">
                        {/* Left sidebar, passes joined groups */}
                        <Slidebar
                            joinedGroups={userJoinedGroups}
                            currentPath={pathname}
                            className="" // Empty className prop for consistency
                        />
                    </div>
                    <MainBar />
                    {/* <ActionSection /> */}
                    {/* <MainContent/> */}
                    <div className="flex-shrink-0">
                        <RightSidebar /> {/* Right sidebar for activity/suggestions */}
                    </div>
                </div>
                <Toaster />
            </div>
        </ProtectedRoute>
    );
}