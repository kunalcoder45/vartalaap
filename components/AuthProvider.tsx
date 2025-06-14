// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

export interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    _id?: string;
    name?: string;
    bio?: string | null;
    avatarUrl?: string | null; // This will now always be a fully resolved URL
}

interface AuthContextType {
    user: CustomUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// Calculate the base URL for static assets (e.g., http://localhost:5001)
const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [customUser, setCustomUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true);

    const buildCustomUser = useCallback((
        fUser: FirebaseUser,
        backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; }; message?: string; }
    ): CustomUser => {
        let resolvedAvatarUrl: string;

        // Priority 1: Backend provided avatarUrl
        if (backendUserData?.user?.avatarUrl) {
            // Check if it's already an absolute URL (http/https/data URI)
            if (backendUserData.user.avatarUrl.startsWith('http://') || backendUserData.user.avatarUrl.startsWith('https://') || backendUserData.user.avatarUrl.startsWith('data:')) {
                resolvedAvatarUrl = backendUserData.user.avatarUrl;
            } else {
                // It's a relative path, prepend backend static base URL
                // Ensure no double slashes for concatenation
                resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.user.avatarUrl.startsWith('/') ? backendUserData.user.avatarUrl.substring(1) : backendUserData.user.avatarUrl}`;
            }
        } else if (fUser.photoURL) {
            // Priority 2: Firebase user's photoURL
            resolvedAvatarUrl = fUser.photoURL;
        } else {
            // Fallback: Default logo served from backend static assets
            resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
        }

        return {
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName,
            _id: backendUserData?.user?._id,
            name: backendUserData?.user?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
            bio: backendUserData?.user?.bio,
            avatarUrl: resolvedAvatarUrl, // This is now always a fully resolved URL
        };
    }, []); // No external dependencies are needed here, as BACKEND_STATIC_BASE_URL is a const

    const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
        if (!fUser) return;

        try {
            const token = await fUser.getIdToken();
            if (!token) throw new Error("Authentication token not available.");

            const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (profileResponse.ok) {
                const backendData = await profileResponse.json();
                setCustomUser(buildCustomUser(fUser, { user: backendData }));
                console.log("Existing profile loaded:", backendData);
            } else if (profileResponse.status === 404) {
                console.log("Profile not found in backend, attempting to sync...");
                const syncResponse = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        firebaseUid: fUser.uid,
                        name: fUser.displayName || fUser.email?.split('@')[0] || 'New User',
                        email: fUser.email,
                    })
                });

                if (syncResponse.ok) {
                    const syncedData = await syncResponse.json();
                    setCustomUser(buildCustomUser(fUser, { user: syncedData }));
                    toast.success('Profile synced successfully!');
                    console.log('Profile synced:', syncedData);
                } else {
                    const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
                    console.error('Failed to sync user profile with backend:', errorData.message);
                    toast.error(`Failed to sync profile: ${errorData.message}`);
                    setCustomUser(buildCustomUser(fUser));
                }
            } else {
                const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
                console.error('Failed to fetch user profile from backend:', errorData.message);
                toast.error(`Failed to load profile: ${errorData.message}`);
                setCustomUser(buildCustomUser(fUser));
            }
        } catch (error) {
            console.error('Error during user profile processing:', error);
            toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
            setCustomUser(buildCustomUser(fUser));
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, buildCustomUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            if (fUser) {
                setFirebaseUser(fUser);
                setLoading(true);
                await ensureUserProfileInDB(fUser);
            } else {
                setFirebaseUser(null);
                setCustomUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [ensureUserProfileInDB]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success("Signed in successfully!");
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('Sign-in cancelled.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                toast.error('Another sign-in attempt is in progress. Please try again.');
            } else {
                toast.error(`Failed to sign in: ${error.message}`);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully!");
            setFirebaseUser(null);
            setCustomUser(null);
        } catch (error: any) {
            console.error("Error logging out:", error);
            toast.error(`Failed to log out: ${error.message}`);
        }
    };

    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (firebaseUser) {
            try {
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                return tokenResult.token;
            } catch (error) {
                console.error('Error getting ID token:', error);
                return null;
            }
        }
        return null;
    }, [firebaseUser]);

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 9999,
            }}>
                <div style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite',
                }}></div>
                <style jsx global>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};