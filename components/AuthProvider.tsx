// client/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config'; // Make sure this path is correct for your Firebase config
import toast from 'react-hot-toast';
// Import CustomUser AND MongoUser from the central types file
import { CustomUser, MongoUser } from '../app/types'; // Corrected import to app/types

interface AuthContextType {
    user: CustomUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    yourFirebaseToken: string | null;
    getIdToken: () => Promise<string | null>;
    mongoUser: MongoUser | null; // This will hold the raw backend user data
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [customUser, setCustomUser] = useState<CustomUser | null>(null); // This is the combined frontend user
    const [loading, setLoading] = useState(true);
    const [mongoUser, setMongoUser] = useState<MongoUser | null>(null); // This is the raw backend user
    const [token, setToken] = useState<string | null>(null);
    const [yourFirebaseToken, setYourFirebaseToken] = useState<string | null>(null);

    const buildCustomUser = useCallback((
        fUser: FirebaseUser,
        backendUserData?: MongoUser // This is the data from your backend
    ): CustomUser => {
        let resolvedAvatarUrl: string;

        if (backendUserData?.avatarUrl) {
            if (
                backendUserData.avatarUrl.startsWith('http://') ||
                backendUserData.avatarUrl.startsWith('https://') ||
                backendUserData.avatarUrl.startsWith('data:')
            ) {
                resolvedAvatarUrl = backendUserData.avatarUrl;
            } else {
                resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/') ? backendUserData.avatarUrl.substring(1) : backendUserData.avatarUrl}`;
            }
        } else if (fUser.photoURL) {
            resolvedAvatarUrl = fUser.photoURL;
        } else {
            resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
        }

        return {
            _id: backendUserData?._id || fUser.uid,
            uid: fUser.uid,
            email: fUser.email,
            displayName: fUser.displayName,
            photoURL: fUser.photoURL || null, // Ensure photoURL is always present, even if null
            mongoUserId: backendUserData?._id, // mongoUserId is optional in CustomUser, correctly set from backendData._id
            name: backendUserData?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
            bio: backendUserData?.bio || null,
            avatarUrl: resolvedAvatarUrl,
            username: backendUserData?.username // Add username if it comes from backend
        };
    }, [BACKEND_STATIC_BASE_URL]);

    const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
        if (!fUser) {
            console.log("AuthProvider: No Firebase user for ensureUserProfileInDB. Exiting.");
            setMongoUser(null);
            setCustomUser(null);
            setToken(null);
            setYourFirebaseToken(null);
            return;
        }

        try {
            const token = await fUser.getIdToken();
            if (!token) {
                console.error("AuthProvider: Authentication token not available for backend sync.");
                throw new Error("Authentication token not available.");
            }
            setToken(token); // Store the backend token for later use
            setYourFirebaseToken(token); // Store Firebase token for frontend use
            console.log(`AuthProvider: Attempting to fetch user profile from backend (${API_BASE_URL}/users/profile) for Firebase UID: ${fUser.uid}`);

            const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (profileResponse.ok) {
                const backendData: MongoUser = await profileResponse.json(); // Use MongoUser type here
                console.log("AuthProvider: Existing profile loaded:", backendData);
                setCustomUser(buildCustomUser(fUser, backendData)); // Build CustomUser from Firebase and Mongo data
                setMongoUser(backendData); // Set the raw MongoUser data
            } else if (profileResponse.status === 404) {
                console.warn("AuthProvider: Profile not found in backend (404), attempting to sync via POST /auth/syncProfile...");
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
                        photoURL: fUser.photoURL,
                    })
                });

                if (syncResponse.ok) {
                    const syncedData: MongoUser = await syncResponse.json(); // Use MongoUser type here
                    setCustomUser(buildCustomUser(fUser, syncedData)); // Build CustomUser
                    setMongoUser(syncedData); // Set the raw MongoUser data
                    toast.success('Profile synced successfully!');
                    console.log('AuthProvider: Profile synced:', syncedData);
                } else {
                    const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync (non-JSON response)' }));
                    console.error('AuthProvider: Failed to sync user profile with backend:', errorData.message, syncResponse.status);
                    toast.error(`Failed to sync profile: ${errorData.message}`);
                    setCustomUser(buildCustomUser(fUser)); // Build CustomUser even without successful mongo data
                    setMongoUser(null); // MongoUser is null on sync failure
                }
            } else {
                const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile (non-JSON response)' }));
                console.error('AuthProvider: Failed to fetch user profile from backend:', errorData.message, profileResponse.status);
                toast.error(`Failed to load profile: ${errorData.message}`);
                setCustomUser(buildCustomUser(fUser)); // Build CustomUser even without successful mongo data
                setMongoUser(null); // MongoUser is null on fetch failure
            }
        } catch (error) {
            console.error('AuthProvider: Caught error during user profile processing:', error);
            toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
            setCustomUser(fUser ? buildCustomUser(fUser) : null); // Build CustomUser even on general error
            setMongoUser(null); // MongoUser is null on any general error
        } finally {
            console.log("AuthProvider: ensureUserProfileInDB finished.");
        }
    }, [API_BASE_URL, BACKEND_STATIC_BASE_URL, buildCustomUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
            console.log("AuthProvider: onAuthStateChanged - Firebase User Detected:", fUser ? fUser.uid : 'null');
            if (fUser) {
                setFirebaseUser(fUser);
                setLoading(true);
                await ensureUserProfileInDB(fUser);
                setLoading(false);
            } else {
                console.log("AuthProvider: No Firebase user. Resetting states and finishing loading.");
                setFirebaseUser(null);
                setCustomUser(null);
                setMongoUser(null);
                setLoading(false);
                setToken(null);
                setYourFirebaseToken(null);
            }
        });
        return () => unsubscribe();
    }, [ensureUserProfileInDB]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            console.log("AuthProvider: Initiating Google Sign-In popup.");
            await signInWithPopup(auth, provider);
            toast.success("Signed in successfully!");
        } catch (error: any) {
            console.error("AuthProvider: Error signing in with Google:", error);
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
            console.log("AuthProvider: Initiating logout.");
            await signOut(auth);
            toast.success("Logged out successfully!");
        } catch (error: any) {
            console.error("AuthProvider: Error logging out:", error);
            toast.error(`Failed to log out: ${error.message}`);
        }
    };

    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (firebaseUser) {
            try {
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                return tokenResult.token;
            } catch (error) {
                console.error('AuthProvider: Error getting ID token:', error);
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
        <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken, mongoUser, token, yourFirebaseToken }}>
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



// // client/components/AuthProvider.tsx
// 'use client';

// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// import { auth } from '../firebase/config'; // Make sure this path is correct for your Firebase config
// import toast from 'react-hot-toast';
// // Import CustomUser AND MongoUser from the central types file
// import { CustomUser, MongoUser } from '../app/types'; // Corrected import to app/types
// import { set } from 'date-fns';

// interface AuthContextType {
//     user: CustomUser | null;
//     loading: boolean;
//     signInWithGoogle: () => Promise<void>;
//     logout: () => Promise<void>;
//     getIdToken: () => Promise<string | null>;
//     mongoUser: MongoUser | null; // This will hold the raw backend user data
//     token: string | null;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com';
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
// const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//     const [customUser, setCustomUser] = useState<CustomUser | null>(null); // This is the combined frontend user
//     const [loading, setLoading] = useState(true);
//     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null); // This is the raw backend user
//     const [token, setToken] = useState<string | null>(null);

//     const buildCustomUser = useCallback((
//         fUser: FirebaseUser,
//         backendUserData?: MongoUser // This is the data from your backend
//     ): CustomUser => {
//         let resolvedAvatarUrl: string;

//         if (backendUserData?.avatarUrl) {
//             if (backendUserData.avatarUrl.startsWith('http://') || backendUserData.avatarUrl.startsWith('https://') || backendUserData.avatarUrl.startsWith('data:')) {
//                 resolvedAvatarUrl = backendUserData.avatarUrl;
//             } else {
//                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/') ? backendUserData.avatarUrl.substring(1) : backendUserData.avatarUrl}`;
//             }
//         } else if (fUser.photoURL) {
//             resolvedAvatarUrl = fUser.photoURL;
//         } else {
//             resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
//         }

//         return {
//             _id: backendUserData?._id || fUser.uid,
//             uid: fUser.uid,
//             email: fUser.email,
//             displayName: fUser.displayName,
//             photoURL: fUser.photoURL || null, // Ensure photoURL is always present, even if null
//             mongoUserId: backendUserData?._id, // mongoUserId is optional in CustomUser, correctly set from backendData._id
//             name: backendUserData?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
//             bio: backendUserData?.bio || null,
//             avatarUrl: resolvedAvatarUrl,
//             username: backendUserData?.username // Add username if it comes from backend
//         };
//     }, [BACKEND_STATIC_BASE_URL]);

//     const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
//         if (!fUser) {
//             console.log("AuthProvider: No Firebase user for ensureUserProfileInDB. Exiting.");
//             setMongoUser(null);
//             setCustomUser(null);
//             setToken(null);
//             return;
//         }

//         try {
//             const token = await fUser.getIdToken();
//             if (!token) {
//                 console.error("AuthProvider: Authentication token not available for backend sync.");
//                 throw new Error("Authentication token not available.");
//             }
//             setToken(token); // Store the token for later use
//             console.log(`AuthProvider: Attempting to fetch user profile from backend (${API_BASE_URL}/users/profile) for Firebase UID: ${fUser.uid}`);

//             const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//             });

//             if (profileResponse.ok) {
//                 const backendData: MongoUser = await profileResponse.json(); // Use MongoUser type here
//                 console.log("AuthProvider: Existing profile loaded:", backendData);
//                 setCustomUser(buildCustomUser(fUser, backendData)); // Build CustomUser from Firebase and Mongo data
//                 setMongoUser(backendData); // Set the raw MongoUser data
//             } else if (profileResponse.status === 404) {
//                 console.warn("AuthProvider: Profile not found in backend (404), attempting to sync via POST /auth/syncProfile...");
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
//                         photoURL: fUser.photoURL,
//                     })
//                 });

//                 if (syncResponse.ok) {
//                     const syncedData: MongoUser = await syncResponse.json(); // Use MongoUser type here
//                     setCustomUser(buildCustomUser(fUser, syncedData)); // Build CustomUser
//                     setMongoUser(syncedData); // Set the raw MongoUser data
//                     toast.success('Profile synced successfully!');
//                     console.log('AuthProvider: Profile synced:', syncedData);
//                 } else {
//                     const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync (non-JSON response)' }));
//                     console.error('AuthProvider: Failed to sync user profile with backend:', errorData.message, syncResponse.status);
//                     toast.error(`Failed to sync profile: ${errorData.message}`);
//                     setCustomUser(buildCustomUser(fUser)); // Build CustomUser even without successful mongo data
//                     setMongoUser(null); // MongoUser is null on sync failure
//                 }
//             } else {
//                 const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile (non-JSON response)' }));
//                 console.error('AuthProvider: Failed to fetch user profile from backend:', errorData.message, profileResponse.status);
//                 toast.error(`Failed to load profile: ${errorData.message}`);
//                 setCustomUser(buildCustomUser(fUser)); // Build CustomUser even without successful mongo data
//                 setMongoUser(null); // MongoUser is null on fetch failure
//             }
//         } catch (error) {
//             console.error('AuthProvider: Caught error during user profile processing:', error);
//             toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
//             setCustomUser(fUser ? buildCustomUser(fUser) : null); // Build CustomUser even on general error
//             setMongoUser(null); // MongoUser is null on any general error
//         } finally {
//             console.log("AuthProvider: ensureUserProfileInDB finished.");
//         }
//     }, [API_BASE_URL, BACKEND_STATIC_BASE_URL, buildCustomUser]);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
//             console.log("AuthProvider: onAuthStateChanged - Firebase User Detected:", fUser ? fUser.uid : 'null');
//             if (fUser) {
//                 setFirebaseUser(fUser);
//                 setLoading(true);
//                 await ensureUserProfileInDB(fUser);
//                 setLoading(false);
//             } else {
//                 console.log("AuthProvider: No Firebase user. Resetting states and finishing loading.");
//                 setFirebaseUser(null);
//                 setCustomUser(null);
//                 setMongoUser(null);
//                 setLoading(false);
//                 setToken(null);
//             }
//         });
//         return () => unsubscribe();
//     }, [ensureUserProfileInDB]);

//     const signInWithGoogle = async () => {
//         const provider = new GoogleAuthProvider();
//         try {
//             console.log("AuthProvider: Initiating Google Sign-In popup.");
//             await signInWithPopup(auth, provider);
//             toast.success("Signed in successfully!");
//         } catch (error: any) {
//             console.error("AuthProvider: Error signing in with Google:", error);
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
//             console.log("AuthProvider: Initiating logout.");
//             await signOut(auth);
//             toast.success("Logged out successfully!");
//         } catch (error: any) {
//             console.error("AuthProvider: Error logging out:", error);
//             toast.error(`Failed to log out: ${error.message}`);
//         }
//     };

//     const getIdToken = useCallback(async (): Promise<string | null> => {
//         if (firebaseUser) {
//             try {
//                 const tokenResult = await firebaseUser.getIdTokenResult(true);
//                 return tokenResult.token;
//             } catch (error) {
//                 console.error('AuthProvider: Error getting ID token:', error);
//                 return null;
//             }
//         }
//         return null;
//     }, [firebaseUser]);

//     if (loading) {
//         // console.log("AuthProvider: Displaying full-screen loading spinner. CustomUser:", customUser ? customUser.uid : 'null', "MongoUser:", mongoUser ? mongoUser._id : 'null');
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
//         <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken, mongoUser, token }}>
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