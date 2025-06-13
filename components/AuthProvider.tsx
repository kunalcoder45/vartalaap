// // client/components/AuthProvider.tsx
// 'use client';

// import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from 'react';
// import { auth } from '../firebase/config';
// import toast from 'react-hot-toast';

// // --- START: Define your custom User interface (UNCHANGED) ---
// interface CustomUser {
//     uid: string;
//     email: string | null;
//     displayName: string | null;
//     photoURL: string | null;
//     _id?: string;
//     avatarUrl?: string | null;
//     bio?: string | null;
// }
// // --- END: Define your custom User interface ---

// type AuthContextType = {
//     user: CustomUser | null;
//     loading: boolean;
//     signInWithGoogle: () => Promise<void>;
//     logout: () => Promise<void>;
//     getIdToken: () => Promise<string | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const BACKEND_URL = API_BASE_URL.replace('/api', '');

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const [user, setUser] = useState<CustomUser | null>(null);
//     const [loading, setLoading] = useState(true);

//     const buildCustomUser = (
//         firebaseUser: FirebaseUser,
//         backendUserData?: { user?: { _id: string; avatarUrl: string; bio: string; }; message?: string; }
//     ): CustomUser => {
//         return {
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             displayName: firebaseUser.displayName,
//             photoURL: firebaseUser.photoURL,
//             _id: backendUserData?.user?._id || undefined,
//             avatarUrl: backendUserData?.user?.avatarUrl || firebaseUser.photoURL || `${BACKEND_URL}/avatars/userLogo.png`,
//             bio: backendUserData?.user?.bio || undefined,
//         };
//     };

//     const ensureUserProfileInDB = useCallback(async (firebaseUser: FirebaseUser) => {
//         if (!firebaseUser) return;

//         try {
//             const token = await firebaseUser.getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const response = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     firebaseUid: firebaseUser.uid,
//                     name: firebaseUser.displayName || firebaseUser.email,
//                     email: firebaseUser.email,
//                     avatarUrl: firebaseUser.photoURL || `${BACKEND_URL}/avatars/userLogo.png`
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error during profile sync' }));
//                 console.error('Failed to sync user profile with backend:', errorData.message);
//                 toast.error(`Failed to sync profile: ${errorData.message}`);
//                 setUser(buildCustomUser(firebaseUser));
//             } else {
//                 const backendResponse = await response.json();
//                 console.log('User profile synced with backend:', backendResponse.message);
//                 setUser(buildCustomUser(firebaseUser, backendResponse));
//             }
//         } catch (error) {
//             console.error('Error syncing user profile:', error);
//             toast.error(`Error during profile sync: ${error instanceof Error ? error.message : String(error)}`);
//             setUser(buildCustomUser(firebaseUser));
//         }
//     }, [API_BASE_URL]);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//             if (firebaseUser) {
//                 await ensureUserProfileInDB(firebaseUser);
//             } else {
//                 setUser(null);
//             }
//             setLoading(false); // Auth check is complete
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
//             toast.error(`Failed to sign in: ${error.message}`);
//         }
//     };

//     const logout = async () => {
//         try {
//             await signOut(auth);
//             toast.success("Logged out successfully!");
//         } catch (error: any) {
//             console.error("Error logging out:", error);
//             toast.error(`Failed to log out: ${error.message}`);
//         }
//     };

//     const getIdToken = useCallback(async (): Promise<string | null> => {
//         if (auth.currentUser) {
//             const token = await auth.currentUser.getIdToken();
//             return token;
//         }
//         return null;
//     }, []);

//     // --- IMPORTANT: Conditional rendering for a more discreet loading state ---
//     if (loading) {
//         // Option 1: Render nothing (blank screen)
//         // This is the simplest if you want minimal UI during load.
//         // return null; 

//         // Option 2: Render a simple, generic loading spinner (better UX)
//         // You'll need some basic CSS for this.
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
//                 backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white overlay
//                 zIndex: 9999, // Ensure it's on top of everything
//             }}>
//                 <div style={{
//                     border: '4px solid #f3f3f3', // Light grey
//                     borderTop: '4px solid #3498db', // Blue
//                     borderRadius: '50%',
//                     width: '40px',
//                     height: '40px',
//                     animation: 'spin 1s linear infinite',
//                 }}></div>
//                 {/* Basic CSS for the spin animation (add this to your global CSS or a style tag) */}
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
//         <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, getIdToken }}>
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





// 'use client';

// import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from 'react';
// import { auth } from '../firebase/config';
// import toast from 'react-hot-toast';

// // --- START: Define your custom User interface ---
// interface CustomUser {
//     uid: string;
//     email: string | null;
//     displayName: string | null;
//     photoURL: string | null; // Keep photoURL from FirebaseUser, but NEVER use it for display
//     _id?: string;
//     customAvatarUrl?: string | null; // This will be your backend-provided avatar URL
//     bio?: string | null;
// }
// // --- END: Define your custom User interface ---

// type AuthContextType = {
//     user: CustomUser | null;
//     loading: boolean;
//     signInWithGoogle: () => Promise<void>;
//     logout: () => Promise<void>;
//     getIdToken: () => Promise<string | null>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// const BACKEND_URL = API_BASE_URL.replace('/api', '');

// // Import the default user logo from your frontend assets
// // Make sure this path is correct relative to AuthProvider.tsx
// import defaultUserLogo from '../app/assets/userLogo.png';

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const [user, setUser] = useState<CustomUser | null>(null);
//     const [loading, setLoading] = useState(true);

//     // --- UPDATED: buildCustomUser function ---
//     // This function now uses backend avatarUrl OR the frontend default
//     const buildCustomUser = (
//         firebaseUser: FirebaseUser,
//         backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; }; message?: string; }
//     ): CustomUser => {
//         // Determine the avatar URL to use:
//         // 1. Prioritize backendUserData.user.avatarUrl (which includes your backend's default or custom uploaded)
//         // 2. Fallback to defaultUserLogo.src (if backend sends null or empty avatarUrl)
//         const resolvedAvatarUrl = backendUserData?.user?.avatarUrl
//             ? (backendUserData.user.avatarUrl.startsWith('http') ? backendUserData.user.avatarUrl : `${BACKEND_URL}${backendUserData.user.avatarUrl}`)
//             : defaultUserLogo.src; // Fallback to frontend default if backend didn't provide one

//         return {
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             displayName: firebaseUser.displayName,
//             photoURL: firebaseUser.photoURL, // Keep original Firebase photoURL, but DO NOT use it for display.
//             _id: backendUserData?.user?._id,
//             customAvatarUrl: resolvedAvatarUrl, // This is the definitive avatar URL for display!
//             bio: backendUserData?.user?.bio,
//         };
//     };

//     const ensureUserProfileInDB = useCallback(async (firebaseUser: FirebaseUser) => {
//         if (!firebaseUser) return;

//         try {
//             const token = await firebaseUser.getIdToken();
//             if (!token) throw new Error("Authentication token not available.");

//             const response = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     firebaseUid: firebaseUser.uid,
//                     name: firebaseUser.displayName || firebaseUser.email,
//                     email: firebaseUser.email,
//                     // IMPORTANT: We are NOT sending firebaseUser.photoURL here.
//                     // Your backend's User model default `avatarUrl` will be used for new users.
//                     // For existing users, their `avatarUrl` will already be in the DB.
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({ message: 'Unknown error during profile sync' }));
//                 console.error('Failed to sync user profile with backend:', errorData.message);
//                 toast.error(`Failed to sync profile: ${errorData.message}`);
//                 // If backend sync fails, build CustomUser with default avatar logic
//                 setUser(buildCustomUser(firebaseUser));
//             } else {
//                 const backendResponse = await response.json();
//                 console.log('User profile synced with backend:', backendResponse.message);
//                 // On successful sync, use backendResponse to build the CustomUser
//                 setUser(buildCustomUser(firebaseUser, backendResponse));
//             }
//         } catch (error) {
//             console.error('Error syncing user profile:', error);
//             toast.error(`Error during profile sync: ${error instanceof Error ? error.message : String(error)}`);
//             // On error, build CustomUser with default avatar logic
//             setUser(buildCustomUser(firebaseUser));
//         } finally {
//             // Always set loading to false after backend call completes
//             setLoading(false);
//         }
//     }, [API_BASE_URL]); // Dependencies for useCallback: API_BASE_URL (and implicitly defaultUserLogo.src via buildCustomUser)

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//             if (firebaseUser) {
//                 // Keep loading true until backend profile is fetched
//                 setLoading(true); 
//                 await ensureUserProfileInDB(firebaseUser); // This will fetch backend avatarUrl and then set user/loading=false
//             } else {
//                 setUser(null);
//                 setLoading(false); // No Firebase user, so auth check is complete
//             }
//         });

//         return () => unsubscribe();
//     }, [ensureUserProfileInDB]); // ensureUserProfileInDB is a dependency, so it needs to be stable (hence useCallback)

//     const signInWithGoogle = async () => {
//         const provider = new GoogleAuthProvider();
//         try {
//             await signInWithPopup(auth, provider);
//             toast.success("Signed in successfully!");
//             // The onAuthStateChanged listener will catch this and call ensureUserProfileInDB
//         } catch (error: any) {
//             console.error("Error signing in with Google:", error);
//             toast.error(`Failed to sign in: ${error.message}`);
//         }
//     };

//     const logout = async () => {
//         try {
//             await signOut(auth);
//             toast.success("Logged out successfully!");
//             setUser(null); // Explicitly clear user state on logout
//         } catch (error: any) {
//             console.error("Error logging out:", error);
//             toast.error(`Failed to log out: ${error.message}`);
//         }
//     };

//     const getIdToken = useCallback(async (): Promise<string | null> => {
//         if (auth.currentUser) {
//             const token = await auth.currentUser.getIdToken();
//             return token;
//         }
//         return null;
//     }, []);

//     // Show loading spinner while authentication and backend profile sync is in progress
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
//         <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, getIdToken }}>
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


// client/components/// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config'; // Correctly importing 'auth' instance
import toast from 'react-hot-toast';

// IMPORTANT: Define CustomUser carefully. It should contain properties you want to expose.
// The underlying 'user' state in AuthProvider will be a FirebaseUser, but components
// will primarily interact with the CustomUser object derived from it.
export interface CustomUser {
    uid: string;
    email: string | null;
    displayName: string | null; // From Firebase
    _id?: string; // MongoDB _id
    name?: string; // User's full name from backend profile
    bio?: string | null; // User's bio from backend profile
    avatarUrl?: string | null; // The definitive URL for display (from backend or default)
}

// Define the shape of the authentication context
interface AuthContextType {
    user: CustomUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>; // Restore signIn method
    logout: () => Promise<void>; // Restore logout method
    getIdToken: () => Promise<string | null>; // Function to get a fresh ID token
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

// Import the default user logo from your frontend assets
// Make sure this path is correct relative to AuthProvider.tsx
import defaultUserLogo from '../app/assets/userLogo.png'; // Assuming userLogo.png is in client/app/assets

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // We store the raw FirebaseUser here to ensure getIdTokenResult is available
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    // This is the CustomUser object exposed to consumers of the context
    const [customUser, setCustomUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Helper function to build CustomUser from FirebaseUser and backend data ---
    const buildCustomUser = useCallback((
        fUser: FirebaseUser,
        backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; }; message?: string; }
    ): CustomUser => {
        // Determine the avatar URL to use:
        // 1. Prioritize backendUserData.user.avatarUrl (which includes your backend's default or custom uploaded)
        // 2. Fallback to defaultUserLogo.src (if backend didn't provide one)
        const resolvedAvatarUrl = backendUserData?.user?.avatarUrl
            ? (backendUserData.user.avatarUrl.startsWith('http') ? backendUserData.user.avatarUrl : `${BACKEND_URL}${backendUserData.user.avatarUrl}`)
            : defaultUserLogo.src;

        return {
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName, // Firebase display name
            _id: backendUserData?.user?._id, // MongoDB _id
            name: backendUserData?.user?.name || fUser.displayName || null, // Backend name, fallback to Firebase, then null
            bio: backendUserData?.user?.bio, // Backend bio
            avatarUrl: resolvedAvatarUrl, // The definitive avatar URL for display!
        };
    }, [BACKEND_URL, defaultUserLogo.src]); // Dependencies for useCallback

    // --- Function to ensure user profile exists in your backend DB ---
    const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
        if (!fUser) return;

        try {
            const token = await fUser.getIdToken(); // Get token from the raw FirebaseUser
            if (!token) throw new Error("Authentication token not available.");

            // First, try to fetch the existing profile
            const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (profileResponse.ok) {
                const backendData = await profileResponse.json();
                setCustomUser(buildCustomUser(fUser, { user: backendData })); // Build custom user from fetched data
                console.log("Existing profile loaded:", backendData);
            } else if (profileResponse.status === 404) {
                // If profile not found, sync it (e.g., first-time login)
                console.log("Profile not found in backend, attempting to sync...");
                const syncResponse = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        firebaseUid: fUser.uid,
                        name: fUser.displayName || fUser.email?.split('@')[0] || 'New User', // Provide a default name
                        email: fUser.email,
                    })
                });

                if (syncResponse.ok) {
                    const syncedData = await syncResponse.json();
                    setCustomUser(buildCustomUser(fUser, { user: syncedData })); // Build custom user from synced data
                    toast.success('Profile synced successfully!');
                    console.log('Profile synced:', syncedData);
                } else {
                    const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
                    console.error('Failed to sync user profile with backend:', errorData.message);
                    toast.error(`Failed to sync profile: ${errorData.message}`);
                    // Fallback to building CustomUser without backend data if sync fails
                    setCustomUser(buildCustomUser(fUser));
                }
            } else {
                // Handle other non-OK responses from profile fetch
                const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
                console.error('Failed to fetch user profile from backend:', errorData.message);
                toast.error(`Failed to load profile: ${errorData.message}`);
                // Fallback to building CustomUser without backend data on other errors
                setCustomUser(buildCustomUser(fUser));
            }
        } catch (error) {
            console.error('Error during user profile processing:', error);
            toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
            // Critical error, fallback to building CustomUser with only Firebase data
            setCustomUser(buildCustomUser(fUser));
        } finally {
            setLoading(false); // Set loading to false after all async operations complete
        }
    }, [API_BASE_URL, buildCustomUser]);

    // --- useEffect for Firebase Auth State Changes ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            if (fUser) {
                setFirebaseUser(fUser); // Store the raw FirebaseUser
                setLoading(true); // Keep loading true until backend profile is fetched
                await ensureUserProfileInDB(fUser);
            } else {
                setFirebaseUser(null);
                setCustomUser(null);
                setLoading(false); // No Firebase user, so auth check is complete
            }
        });

        return () => unsubscribe();
    }, [ensureUserProfileInDB]); // ensureUserProfileInDB is a dependency, so it needs to be stable (hence useCallback)

    // --- Authentication Actions ---
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success("Signed in successfully!");
            // The onAuthStateChanged listener will catch this and call ensureUserProfileInDB
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            // Handle specific errors for user feedback
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
            setFirebaseUser(null); // Explicitly clear raw Firebase user
            setCustomUser(null); // Explicitly clear custom user state on logout
        } catch (error: any) {
            console.error("Error logging out:", error);
            toast.error(`Failed to log out: ${error.message}`);
        }
    };

    // --- Function to get a fresh ID token ---
    const getIdToken = useCallback(async (): Promise<string | null> => {
        // Use the stored firebaseUser to get the token
        if (firebaseUser) {
            try {
                // Pass true to force a refresh of the token
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                return tokenResult.token;
            } catch (error) {
                console.error('Error getting ID token:', error);
                return null;
            }
        }
        return null;
    }, [firebaseUser]); // Dependency: firebaseUser (the raw Firebase User object)

    // Show loading spinner while authentication and backend profile sync is in progress
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