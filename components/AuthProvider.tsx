
// // client/components/AuthProvider.tsx
// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// import { auth } from '../firebase/config';
// import toast from 'react-hot-toast';

// export interface CustomUser {
//     uid: string;
//     email: string | null;
//     displayName: string | null;
//     _id?: string;
//     name?: string;
//     bio?: string | null;
//     avatarUrl?: string | null; // This will now always be a fully resolved URL
// }

// interface MongoUser {
//     _id: string;
//     name: string; // Assuming it has a name
//     email: string; // Assuming it has an email
//     avatarUrl?: string; // Optional avatar URL
//     // Add any other properties that your mongoUser object might have
// }


// interface AuthContextType {
//     user: CustomUser | null;
//     loading: boolean;
//     signInWithGoogle: () => Promise<void>;
//     logout: () => Promise<void>;
//     getIdToken: () => Promise<string | null>;
//     mongoUser: MongoUser | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // Calculate the base URL for static assets (e.g., http://localhost:5001)
// const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

//     const buildCustomUser = useCallback((
//         fUser: FirebaseUser,
//         backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; }; message?: string; }
//     ): CustomUser => {
//         let resolvedAvatarUrl: string;

//         // Priority 1: Backend provided avatarUrl
//         if (backendUserData?.user?.avatarUrl) {
//             // Check if it's already an absolute URL (http/https/data URI)
//             if (backendUserData.user.avatarUrl.startsWith('http://') || backendUserData.user.avatarUrl.startsWith('https://') || backendUserData.user.avatarUrl.startsWith('data:')) {
//                 resolvedAvatarUrl = backendUserData.user.avatarUrl;
//             } else {
//                 // It's a relative path, prepend backend static base URL
//                 // Ensure no double slashes for concatenation
//                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.user.avatarUrl.startsWith('/') ? backendUserData.user.avatarUrl.substring(1) : backendUserData.user.avatarUrl}`;
//             }
//         } else if (fUser.photoURL) {
//             // Priority 2: Firebase user's photoURL
//             resolvedAvatarUrl = fUser.photoURL;
//         } else {
//             // Fallback: Default logo served from backend static assets
//             resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
//         }

//         return {
//             uid: fUser.uid,
//             email: fUser.email,
//             displayName: fUser.displayName,
//             _id: backendUserData?.user?._id,
//             name: backendUserData?.user?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
//             bio: backendUserData?.user?.bio,
//             avatarUrl: resolvedAvatarUrl, // This is now always a fully resolved URL
//         };
//     }, []); // No external dependencies are needed here, as BACKEND_STATIC_BASE_URL is a const

//     const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
//         if (!fUser) return;

//         try {
//             const token = await fUser.getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//             });

//             if (profileResponse.ok) {
//                 const backendData = await profileResponse.json();
//                 setCustomUser(buildCustomUser(fUser, { user: backendData }));
//                 console.log("Existing profile loaded:", backendData);
//                 setMongoUser(backendData);
//             } else if (profileResponse.status === 404) {
//                 console.log("Profile not found in backend, attempting to sync...");
//                 const syncResponse = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     },
//                     body: JSON.stringify({
//                         firebaseUid: fUser.uid,
//                         name: fUser.displayName || fUser.email?.split('@')[0] || 'New User',
//                         email: fUser.email,
//                     })
//                 });

//                 if (syncResponse.ok) {
//                     const syncedData = await syncResponse.json();
//                     setCustomUser(buildCustomUser(fUser, { user: syncedData }));
//                     toast.success('Profile synced successfully!');
//                     console.log('Profile synced:', syncedData);
//                 } else {
//                     const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
//                     console.error('Failed to sync user profile with backend:', errorData.message);
//                     toast.error(`Failed to sync profile: ${errorData.message}`);
//                     setCustomUser(buildCustomUser(fUser));
//                 }
//             } else {
//                 const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
//                 console.error('Failed to fetch user profile from backend:', errorData.message);
//                 toast.error(`Failed to load profile: ${errorData.message}`);
//                 setCustomUser(buildCustomUser(fUser));
//             }
//         } catch (error) {
//             console.error('Error during user profile processing:', error);
//             toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
//             setCustomUser(buildCustomUser(fUser));
//         } finally {
//             setLoading(false);
//         }
//     }, [API_BASE_URL, buildCustomUser]);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
//             if (fUser) {
//                 setFirebaseUser(fUser);
//                 setLoading(true);
//                 await ensureUserProfileInDB(fUser);
//             } else {
//                 setFirebaseUser(null);
//                 setCustomUser(null);
//                 setLoading(false);
//             }
//         });
//         return () => unsubscribe();
//     }, [ensureUserProfileInDB]);

//     const signInWithGoogle = async () => {
//         const provider = new GoogleAuthProvider();
//         try {
//             await signInWithPopup(auth, provider);
//             toast.success("Signed in successfully!");
//         } catch (error: any) {
//             console.error("Error signing in with Google:", error);
//             if (error.code === 'auth/popup-closed-by-user') {
//                 toast.error('Sign-in cancelled.');
//             } else if (error.code === 'auth/cancelled-popup-request') {
//                 toast.error('Another sign-in attempt is in progress. Please try again.');
//             } else {
//                 toast.error(`Failed to sign in: ${error.message}`);
//             }
//         }
//     };

//     const logout = async () => {
//         try {
//             await signOut(auth);
//             toast.success("Logged out successfully!");
//             setFirebaseUser(null);
//             setCustomUser(null);
//         } catch (error: any) {
//             console.error("Error logging out:", error);
//             toast.error(`Failed to log out: ${error.message}`);
//         }
//     };

//     const getIdToken = useCallback(async (): Promise<string | null> => {
//         if (firebaseUser) {
//             try {
//                 const tokenResult = await firebaseUser.getIdTokenResult(true);
//                 return tokenResult.token;
//             } catch (error) {
//                 console.error('Error getting ID token:', error);
//                 return null;
//             }
//         }
//         return null;
//     }, [firebaseUser]);

//     if (loading) {
//         return (
//             <div style={{
//                 position: 'fixed',
//                 top: 0,
//                 left: 0,
//                 width: '100vw',
//                 height: '100vh',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 backgroundColor: 'rgba(255, 255, 255, 0.8)',
//                 zIndex: 9999,
//             }}>
//                 <div style={{
//                     border: '4px solid #f3f3f3',
//                     borderTop: '4px solid #3498db',
//                     borderRadius: '50%',
//                     width: '40px',
//                     height: '40px',
//                     animation: 'spin 1s linear infinite',
//                 }}></div>
//                 <style jsx global>{`
//                     @keyframes spin {
//                         0% { transform: rotate(0deg); }
//                         100% { transform: rotate(360deg); }
//                     }
//                 `}</style>
//             </div>
//         );
//     }

//     return (
//         <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken , mongoUser}}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };





// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config'; // Make sure this path is correct for your Firebase config
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

export interface MongoUser { // Exported for use in other files if needed
    _id: string;
    name: string; // Assuming it has a name
    email: string; // Assuming it has an email
    avatarUrl?: string; // Optional avatar URL
    // Add any other properties that your mongoUser object might have
}

interface AuthContextType {
    user: CustomUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
    mongoUser: MongoUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure NEXT_PUBLIC_BACKEND_URL is set in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// Calculate the base URL for static assets (e.g., http://localhost:5001)
const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [customUser, setCustomUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true); // Initial load is true
    const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

    const buildCustomUser = useCallback((
        fUser: FirebaseUser,
        backendUserData?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; email?: string }
    ): CustomUser => {
        let resolvedAvatarUrl: string;

        // Priority 1: Backend provided avatarUrl
        if (backendUserData?.avatarUrl) {
            // Check if it's already an absolute URL (http/https/data URI)
            if (backendUserData.avatarUrl.startsWith('http://') || backendUserData.avatarUrl.startsWith('https://') || backendUserData.avatarUrl.startsWith('data:')) {
                resolvedAvatarUrl = backendUserData.avatarUrl;
            } else {
                // It's a relative path, prepend backend static base URL
                resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/') ? backendUserData.avatarUrl.substring(1) : backendUserData.avatarUrl}`;
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
            _id: backendUserData?._id,
            name: backendUserData?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
            bio: backendUserData?.bio,
            avatarUrl: resolvedAvatarUrl, // This is now always a fully resolved URL
        };
    }, [BACKEND_STATIC_BASE_URL]);

    const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
        if (!fUser) {
            console.log("AuthProvider: No Firebase user for ensureUserProfileInDB. Setting loading to false.");
            setLoading(false);
            setMongoUser(null);
            setCustomUser(null);
            return;
        }

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
                const backendData: MongoUser = await profileResponse.json();
                setCustomUser(buildCustomUser(fUser, backendData));
                setMongoUser(backendData);
                console.log("AuthProvider: Existing profile loaded:", backendData);
            } else if (profileResponse.status === 404) {
                console.log("AuthProvider: Profile not found in backend, attempting to sync...");
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
                        avatarUrl: fUser.photoURL, // Pass Firebase photoURL during sync
                    })
                });

                if (syncResponse.ok) {
                    const syncedData: MongoUser = await syncResponse.json();
                    setCustomUser(buildCustomUser(fUser, syncedData));
                    setMongoUser(syncedData); // <-- CRITICAL: Set mongoUser after successful sync!
                    toast.success('Profile synced successfully!');
                    console.log('AuthProvider: Profile synced:', syncedData);
                } else {
                    const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
                    console.error('AuthProvider: Failed to sync user profile with backend:', errorData.message);
                    toast.error(`Failed to sync profile: ${errorData.message}`);
                    setCustomUser(buildCustomUser(fUser)); // Build custom user even without mongo data
                    setMongoUser(null); // Set mongoUser to null on sync failure
                }
            } else {
                const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
                console.error('AuthProvider: Failed to fetch user profile from backend:', errorData.message);
                toast.error(`Failed to load profile: ${errorData.message}`);
                setCustomUser(buildCustomUser(fUser)); // Build custom user even without mongo data
                setMongoUser(null); // Set mongoUser to null on fetch failure
            }
        } catch (error) {
            console.error('AuthProvider: Error during user profile processing:', error);
            toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
            setCustomUser(buildCustomUser(fUser)); // Build custom user even without mongo data
            setMongoUser(null); // Set mongoUser to null on any other error
        } finally {
            console.log("AuthProvider: ensureUserProfileInDB finished. Setting loading to false.");
            setLoading(false); // Ensure loading is false after all profile processing attempts
        }
    }, [API_BASE_URL, buildCustomUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            console.log("AuthProvider: onAuthStateChanged - Firebase User Detected:", fUser ? fUser.uid : 'null');
            if (fUser) {
                setFirebaseUser(fUser);
                setLoading(true); // Start loading when a Firebase user is detected (implies fetching mongo data)
                await ensureUserProfileInDB(fUser);
            } else {
                // No Firebase user, so reset all user states and finish loading
                console.log("AuthProvider: No Firebase user. Resetting states and finishing loading.");
                setFirebaseUser(null);
                setCustomUser(null);
                setMongoUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [ensureUserProfileInDB]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // setLoading(true); // auth state observer handles this
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
            // If sign-in fails, ensure loading is set to false if it's not handled by the observer
            // The onAuthStateChanged observer should eventually set loading to false if no user is found
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully!");
            // States will be reset by onAuthStateChanged observer
        } catch (error: any) {
            console.error("Error logging out:", error);
            toast.error(`Failed to log out: ${error.message}`);
        }
    };

    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (firebaseUser) {
            try {
                // Passing true to force token refresh ensures it's always fresh
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                return tokenResult.token;
            } catch (error) {
                console.error('Error getting ID token:', error);
                return null;
            }
        }
        return null;
    }, [firebaseUser]);

    // This full-screen loader appears only if `loading` is true.
    // AppClientWrapper now ensures public paths bypass this.
    if (loading) {
        console.log("AuthProvider: Displaying full-screen loading spinner.");
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
        <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken , mongoUser}}>
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