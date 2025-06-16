// // // 'use client';

// // // import React, {
// // //     createContext,
// // //     useContext,
// // //     useState,
// // //     useEffect,
// // //     ReactNode,
// // //     useCallback,
// // // } from 'react';
// // // import {
// // //     onAuthStateChanged,
// // //     User as FirebaseUser,
// // //     GoogleAuthProvider,
// // //     signInWithPopup,
// // //     signOut,
// // // } from 'firebase/auth';
// // // import { auth } from '../firebase/config';
// // // import toast from 'react-hot-toast';

// // // // --- Types ---
// // // export interface MongoUser {
// // //     _id: string;
// // //     name: string;
// // //     email: string;
// // //     bio?: string;
// // //     avatarUrl?: string;
// // // }

// // // export interface CustomUser {
// // //     uid: string;
// // //     email: string | null;
// // //     displayName: string | null;
// // //     _id?: string;
// // //     name?: string;
// // //     bio?: string | null;
// // //     avatarUrl?: string | null;
// // // }

// // // interface AuthContextType {
// // //     user: CustomUser | null;
// // //     loading: boolean;
// // //     signInWithGoogle: () => Promise<void>;
// // //     logout: () => Promise<void>;
// // //     getIdToken: () => Promise<string | null>;
// // //     firebaseUser: FirebaseUser | null;
// // //     mongoUser: MongoUser | null;
// // //     isAuthenticated: boolean;
// // // }

// // // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // // const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api')
// // //     ? API_BASE_URL.slice(0, -4)
// // //     : API_BASE_URL;

// // // export const AuthProvider = ({ children }: { children: ReactNode }) => {
// // //     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
// // //     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
// // //     const [loading, setLoading] = useState(true);
// // //     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

// // //     const buildCustomUser = useCallback(
// // //         (
// // //             fUser: FirebaseUser,
// // //             backendUserData?: { _id?: string; avatarUrl?: string; bio?: string; name?: string }
// // //         ): CustomUser => {
// // //             let resolvedAvatarUrl: string;

// // //             if (
// // //                 backendUserData?.avatarUrl &&
// // //                 backendUserData.avatarUrl.trim() !== '' // Trim to handle empty strings
// // //             ) {
// // //                 if (
// // //                     backendUserData.avatarUrl.startsWith('http://') ||
// // //                     backendUserData.avatarUrl.startsWith('https://') ||
// // //                     backendUserData.avatarUrl.startsWith('data:')
// // //                 ) {
// // //                     resolvedAvatarUrl = backendUserData.avatarUrl;
// // //                 } else {
// // //                     // Ensure the path is correctly constructed for static assets
// // //                     resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/')
// // //                         ? backendUserData.avatarUrl.substring(1)
// // //                         : backendUserData.avatarUrl
// // //                         }`;
// // //                 }
// // //             } else if (fUser.photoURL) {
// // //                 resolvedAvatarUrl = fUser.photoURL;
// // //             } else {
// // //                 // Fallback to a default image if no avatar URL is provided
// // //                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`; // Ensure this path is correct on your backend
// // //             }

// // //             return {
// // //                 uid: fUser.uid,
// // //                 email: fUser.email,
// // //                 displayName: fUser.displayName,
// // //                 _id: backendUserData?._id, // This is critical for mongoUser
// // //                 name:
// // //                     backendUserData?.name ||
// // //                     fUser.displayName ||
// // //                     fUser.email?.split('@')[0] ||
// // //                     'Unknown User',
// // //                 bio: backendUserData?.bio,
// // //                 avatarUrl: resolvedAvatarUrl,
// // //             };
// // //         },
// // //         [BACKEND_STATIC_BASE_URL]
// // //     );

// // //     const ensureUserProfileInDB = useCallback(
// // //         async (fUser: FirebaseUser) => {
// // //             console.log("AuthProvider: ensureUserProfileInDB called for Firebase UID:", fUser.uid);
// // //             if (!fUser) {
// // //                 console.log("AuthProvider: No Firebase user provided to ensureUserProfileInDB.");
// // //                 setLoading(false);
// // //                 return;
// // //             }

// // //             try {
// // //                 const token = await fUser.getIdToken();
// // //                 if (!token) {
// // //                     console.error("AuthProvider: Authentication token not available for Firebase UID:", fUser.uid);
// // //                     setCustomUser(null);
// // //                     setMongoUser(null); // Ensure mongoUser is null
// // //                     setLoading(false);
// // //                     return; // Throwing error stops execution, so a return is better here.
// // //                 }
// // //                 console.log("AuthProvider: Token obtained for Firebase UID:", fUser.uid);


// // //                 // Attempt to fetch existing profile
// // //                 const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
// // //                     method: 'GET',
// // //                     headers: {
// // //                         'Content-Type': 'application/json',
// // //                         Authorization: `Bearer ${token}`,
// // //                     },
// // //                 });

// // //                 if (profileResponse.ok) {
// // //                     const backendData = await profileResponse.json();
// // //                     console.log("AuthProvider: Profile fetched successfully. Backend data:", backendData);
// // //                     if (backendData && backendData._id) {
// // //                         setCustomUser(buildCustomUser(fUser, backendData));
// // //                         setMongoUser(backendData);
// // //                         console.log("AuthProvider: mongoUser set successfully with _id:", backendData._id);
// // //                     } else {
// // //                         console.warn("AuthProvider: Profile fetched, but _id is missing or invalid in backend data:", backendData);
// // //                         // If profile fetched but no _id, treat as if profile not fully created, attempt sync
// // //                         await syncUserProfile(fUser, token);
// // //                     }
// // //                 } else if (profileResponse.status === 404) {
// // //                     console.log("AuthProvider: Profile not found (404). Attempting to sync profile...");
// // //                     // If profile not found, attempt to sync/create it
// // //                     await syncUserProfile(fUser, token);
// // //                 } else {
// // //                     // Handle other non-OK responses from profile fetch
// // //                     const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown fetch error' }));
// // //                     console.error(`AuthProvider: Failed to load profile. Status: ${profileResponse.status}. Error data:`, errorData);
// // //                     toast.error(`Failed to load profile: ${errorData.message}`);
// // //                     setCustomUser(buildCustomUser(fUser)); // Set custom user with Firebase data only
// // //                     setMongoUser(null); // Ensure mongoUser is null on non-404 profile fetch failure
// // //                 }
// // //             } catch (error) {
// // //                 console.error('AuthProvider: Error in profile handling (ensureUserProfileInDB):', error);
// // //                 toast.error(
// // //                     `Error during profile sync/fetch: ${error instanceof Error ? error.message : String(error)}`
// // //                 );
// // //                 setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// // //                 setMongoUser(null); // Ensure mongoUser is null on any caught error
// // //             } finally {
// // //                 setLoading(false);
// // //                 console.log("AuthProvider: ensureUserProfileInDB finished. Loading set to false.");
// // //             }
// // //         },
// // //         [API_BASE_URL, buildCustomUser]
// // //     );

// // //     // Helper function for syncing profile to avoid code duplication
// // //     const syncUserProfile = useCallback(async (fUser: FirebaseUser, token: string) => {
// // //         try {
// // //             const syncResponse = await fetch(
// // //                 `${API_BASE_URL}/auth/syncProfile`,
// // //                 {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Content-Type': 'application/json',
// // //                         Authorization: `Bearer ${token}`,
// // //                     },
// // //                     body: JSON.stringify({
// // //                         firebaseUid: fUser.uid,
// // //                         name:
// // //                             fUser.displayName ||
// // //                             fUser.email?.split('@')[0] ||
// // //                             'New User',
// // //                         email: fUser.email,
// // //                     }),
// // //                 }
// // //             );

// // //             if (syncResponse.ok) {
// // //                 const syncedData = await syncResponse.json();
// // //                 console.log("AuthProvider: Profile synced successfully. Synced data:", syncedData);
// // //                 if (syncedData && syncedData._id) {
// // //                     setCustomUser(buildCustomUser(fUser, syncedData));
// // //                     setMongoUser(syncedData);
// // //                     toast.success('Profile synced successfully!');
// // //                     console.log("AuthProvider: mongoUser set successfully after sync with _id:", syncedData._id);
// // //                 } else {
// // //                     console.warn("AuthProvider: Profile synced, but _id is missing or invalid in synced data:", syncedData);
// // //                     toast.error('Profile synced, but MongoDB ID is missing.');
// // //                     setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// // //                     setMongoUser(null); // Ensure mongoUser is null
// // //                 }
// // //             } else {
// // //                 const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown sync error' }));
// // //                 console.error(`AuthProvider: Failed to sync profile. Status: ${syncResponse.status}. Error data:`, errorData);
// // //                 toast.error(`Failed to sync profile: ${errorData.message}`);
// // //                 setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// // //                 setMongoUser(null); // Ensure mongoUser is null
// // //             }
// // //         } catch (syncError) {
// // //             console.error('AuthProvider: Error during syncUserProfile:', syncError);
// // //             toast.error(`Error during profile sync: ${syncError instanceof Error ? syncError.message : String(syncError)}`);
// // //             setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// // //             setMongoUser(null); // Ensure mongoUser is null
// // //         }
// // //     }, [API_BASE_URL, buildCustomUser]); // Dependencies for syncUserProfile

// // //     useEffect(() => {
// // //         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
// // //             console.log("AuthProvider: onAuthStateChanged fired. FirebaseUser:", fUser ? fUser.uid : "null");
// // //             if (fUser) {
// // //                 setFirebaseUser(fUser);
// // //                 setLoading(true); // Start loading again as we fetch Mongo data
// // //                 await ensureUserProfileInDB(fUser);
// // //             } else {
// // //                 console.log("AuthProvider: No Firebase user detected. Resetting states.");
// // //                 setFirebaseUser(null);
// // //                 setCustomUser(null);
// // //                 setMongoUser(null);
// // //                 setLoading(false);
// // //             }
// // //         });
// // //         return () => unsubscribe();
// // //     }, [ensureUserProfileInDB]); // ensureUserProfileInDB is a dependency

// // //     const signInWithGoogle = async () => {
// // //         const provider = new GoogleAuthProvider();
// // //         try {
// // //             setLoading(true); // Start loading during sign-in
// // //             await signInWithPopup(auth, provider);
// // //             toast.success('Signed in successfully!');
// // //             // onAuthStateChanged will handle setting the user and mongoUser after sign-in
// // //         } catch (error: any) {
// // //             console.error('Sign-in error:', error);
// // //             toast.error(`Sign-in failed: ${error.message}`);
// // //         } finally {
// // //             setLoading(false); // End loading regardless of success/failure
// // //         }
// // //     };

// // //     const logout = async () => {
// // //         try {
// // //             await signOut(auth);
// // //             toast.success('Logged out!');
// // //             // onAuthStateChanged will handle resetting states after logout
// // //         } catch (error: any) {
// // //             toast.error(`Logout failed: ${error.message}`);
// // //         }
// // //     };

// // //     const getIdToken = useCallback(async (): Promise<string | null> => {
// // //         if (firebaseUser) {
// // //             try {
// // //                 const tokenResult = await firebaseUser.getIdTokenResult(true);
// // //                 return tokenResult.token;
// // //             } catch (error) {
// // //                 console.error('Error getting token:', error);
// // //                 return null;
// // //             }
// // //         }
// // //         return null;
// // //     }, [firebaseUser]);

// // //     if (loading) {
// // //         return (
// // //             <div
// // //                 style={{
// // //                     position: 'fixed',
// // //                     top: 0,
// // //                     left: 0,
// // //                     width: '100vw',
// // //                     height: '100vh',
// // //                     display: 'flex',
// // //                     flexDirection: 'column',
// // //                     justifyContent: 'center',
// // //                     alignItems: 'center',
// // //                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
// // //                     zIndex: 9999,
// // //                 }}
// // //             >
// // //                 <div
// // //                     style={{
// // //                         border: '4px solid #f3f3f3',
// // //                         borderTop: '4px solid #3498db',
// // //                         borderRadius: '50%',
// // //                         width: '40px',
// // //                         height: '40px',
// // //                         animation: 'spin 1s linear infinite',
// // //                     }}
// // //                 ></div>
// // //                 <p style={{ marginTop: '15px', fontSize: '1rem', color: '#555' }}>
// // //                     Loading user data...
// // //                 </p>
// // //                 <style jsx global>{`
// // //                     @keyframes spin {
// // //                         0% {
// // //                             transform: rotate(0deg);
// // //                         }
// // //                         100% {
// // //                             transform: rotate(360deg);
// // //                         }
// // //                     }
// // //                 `}</style>
// // //             </div>
// // //         );
// // //     }

// // //     return (
// // //         <AuthContext.Provider
// // //             value={{
// // //                 user: customUser,
// // //                 loading, // This is authProvider's internal loading
// // //                 signInWithGoogle,
// // //                 logout,
// // //                 getIdToken,
// // //                 firebaseUser,
// // //                 mongoUser, // The crucial mongoUser
// // //                 isAuthenticated: !!firebaseUser && !!mongoUser, // Fully authenticated only if both exist
// // //             }}
// // //         >
// // //             {children}
// // //         </AuthContext.Provider>
// // //     );
// // // };

// // // export const useAuth = () => {
// // //     const context = useContext(AuthContext);
// // //     if (context === undefined) {
// // //         throw new Error('useAuth must be used within an AuthProvider');
// // //     }
// // //     return context;
// // // };











// // // // client/components/AuthProvider.tsx
// // // 'use client';

// // // import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// // // import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// // // import { auth } from '../firebase/config';
// // // import toast from 'react-hot-toast';

// // // export interface CustomUser {
// // //     uid: string;
// // //     email: string | null;
// // //     displayName: string | null;
// // //     _id?: string;
// // //     name?: string;
// // //     bio?: string | null;
// // //     followers?: string[];
// // //     following?: string[];
// // //     avatarUrl?: string | null; // This will now always be a fully resolved URL
// // // }

// // // interface AuthContextType {
// // //     user: CustomUser | null;
// // //     loading: boolean;
// // //     signInWithGoogle: () => Promise<void>;
// // //     logout: () => Promise<void>;
// // //     getIdToken: () => Promise<string | null>;
// // //     firebaseUser: FirebaseUser | null;
// // //     mongoUser: MongoUser | null; // This holds the raw backend data
// // //     isAuthenticated: boolean;
// // // }

// // // export interface MongoUser {
// // //     _id: string;
// // //     name: string;
// // //     email: string;
// // //     bio?: string;
// // //     avatarUrl?: string;
// // //     followers?: string[]; // The actual data from MongoDB
// // //     following?: string[];
// // // }

// // // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // // // Calculate the base URL for static assets (e.g., http://localhost:5001)
// // // const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// // // export const AuthProvider = ({ children }: { children: ReactNode }) => {
// // //     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
// // //     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
// // //     const [loading, setLoading] = useState(true);
// // //     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

// // //     const buildCustomUser = useCallback((
// // //         fUser: FirebaseUser,
// // //         // backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; }; message?: string; followers?: string[]; following?: string[]; }
// // //         backendUserData?: MongoUser
// // //     ): CustomUser => {
// // //         let resolvedAvatarUrl: string;

// // //         // Priority 1: Backend provided avatarUrl
// // //         if (backendUserData?.user?.avatarUrl) {
// // //             // Check if it's already an absolute URL (http/https/data URI)
// // //             if (backendUserData.user.avatarUrl.startsWith('http://') || backendUserData.user.avatarUrl.startsWith('https://') || backendUserData.user.avatarUrl.startsWith('data:')) {
// // //                 resolvedAvatarUrl = backendUserData.user.avatarUrl;
// // //             } else {
// // //                 // It's a relative path, prepend backend static base URL
// // //                 // Ensure no double slashes for concatenation
// // //                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.user.avatarUrl.startsWith('/') ? backendUserData.user.avatarUrl.substring(1) : backendUserData.user.avatarUrl}`;
// // //             }
// // //         } else if (fUser.photoURL) {
// // //             // Priority 2: Firebase user's photoURL
// // //             resolvedAvatarUrl = fUser.photoURL;
// // //         } else {
// // //             // Fallback: Default logo served from backend static assets
// // //             resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
// // //         }

// // //         return {
// // //             uid: fUser.uid,
// // //             email: fUser.email,
// // //             displayName: fUser.displayName,
// // //             _id: backendUserData?.user?._id,
// // //             name: backendUserData?.user?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User',
// // //             bio: backendUserData?.user?.bio,
// // //             avatarUrl: resolvedAvatarUrl, // This is now always a fully resolved URL
// // //             followers: backendUserData?.followers,
// // //             following: backendUserData?.following,
// // //         };
// // //     }, [BACKEND_STATIC_BASE_URL]); // No external dependencies are needed here, as BACKEND_STATIC_BASE_URL is a const

// // //     const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
// // //         if (!fUser) return;

// // //         try {
// // //             const token = await fUser.getIdToken();
// // //             if (!token) throw new Error("Authentication token not available.");

// // //             const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
// // //                 method: 'GET',
// // //                 headers: {
// // //                     'Content-Type': 'application/json',
// // //                     'Authorization': `Bearer ${token}`
// // //                 },
// // //             });

// // //             if (profileResponse.ok) {
// // //                 const backendData = await profileResponse.json();
// // //                 setCustomUser(buildCustomUser(fUser, { user: backendData }));
// // //                 console.log("Existing profile loaded:", backendData);
// // //             } else if (profileResponse.status === 404) {
// // //                 console.log("Profile not found in backend, attempting to sync...");
// // //                 const syncResponse = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
// // //                     method: 'POST',
// // //                     headers: {
// // //                         'Content-Type': 'application/json',
// // //                         'Authorization': `Bearer ${token}`
// // //                     },
// // //                     body: JSON.stringify({
// // //                         firebaseUid: fUser.uid,
// // //                         name: fUser.displayName || fUser.email?.split('@')[0] || 'New User',
// // //                         email: fUser.email,
// // //                     })
// // //                 });

// // //                 if (syncResponse.ok) {
// // //                     const syncedData = await syncResponse.json();
// // //                     setCustomUser(buildCustomUser(fUser, { user: syncedData }));
// // //                     toast.success('Profile synced successfully!');
// // //                     console.log('Profile synced:', syncedData);
// // //                 } else {
// // //                     const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
// // //                     console.error('Failed to sync user profile with backend:', errorData.message);
// // //                     toast.error(`Failed to sync profile: ${errorData.message}`);
// // //                     setCustomUser(buildCustomUser(fUser));
// // //                 }
// // //             } else {
// // //                 const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
// // //                 console.error('Failed to fetch user profile from backend:', errorData.message);
// // //                 toast.error(`Failed to load profile: ${errorData.message}`);
// // //                 setCustomUser(buildCustomUser(fUser));
// // //             }
// // //         } catch (error) {
// // //             console.error('Error during user profile processing:', error);
// // //             toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
// // //             setCustomUser(buildCustomUser(fUser));
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     }, [API_BASE_URL, buildCustomUser]);

// // //     useEffect(() => {
// // //         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
// // //             if (fUser) {
// // //                 setFirebaseUser(fUser);
// // //                 setLoading(true);
// // //                 await ensureUserProfileInDB(fUser);
// // //             } else {
// // //                 setFirebaseUser(null);
// // //                 setCustomUser(null);
// // //                 setLoading(false);
// // //             }
// // //         });
// // //         return () => unsubscribe();
// // //     }, [ensureUserProfileInDB]);

// // //     const signInWithGoogle = async () => {
// // //         const provider = new GoogleAuthProvider();
// // //         try {
// // //             await signInWithPopup(auth, provider);
// // //             toast.success("Signed in successfully!");
// // //         } catch (error: any) {
// // //             console.error("Error signing in with Google:", error);
// // //             if (error.code === 'auth/popup-closed-by-user') {
// // //                 toast.error('Sign-in cancelled.');
// // //             } else if (error.code === 'auth/cancelled-popup-request') {
// // //                 toast.error('Another sign-in attempt is in progress. Please try again.');
// // //             } else {
// // //                 toast.error(`Failed to sign in: ${error.message}`);
// // //             }
// // //         }
// // //     };

// // //     const logout = async () => {
// // //         try {
// // //             await signOut(auth);
// // //             toast.success("Logged out successfully!");
// // //             setFirebaseUser(null);
// // //             setCustomUser(null);
// // //         } catch (error: any) {
// // //             console.error("Error logging out:", error);
// // //             toast.error(`Failed to log out: ${error.message}`);
// // //         }
// // //     };

// // //     const getIdToken = useCallback(async (): Promise<string | null> => {
// // //         if (firebaseUser) {
// // //             try {
// // //                 const tokenResult = await firebaseUser.getIdTokenResult(true);
// // //                 return tokenResult.token;
// // //             } catch (error) {
// // //                 console.error('Error getting ID token:', error);
// // //                 return null;
// // //             }
// // //         }
// // //         return null;
// // //     }, [firebaseUser]);

// // //     if (loading) {
// // //         return (
// // //             <div style={{
// // //                 position: 'fixed',
// // //                 top: 0,
// // //                 left: 0,
// // //                 width: '100vw',
// // //                 height: '100vh',
// // //                 display: 'flex',
// // //                 justifyContent: 'center',
// // //                 alignItems: 'center',
// // //                 backgroundColor: 'rgba(255, 255, 255, 0.8)',
// // //                 zIndex: 9999,
// // //             }}>
// // //                 <div style={{
// // //                     border: '4px solid #f3f3f3',
// // //                     borderTop: '4px solid #3498db',
// // //                     borderRadius: '50%',
// // //                     width: '40px',
// // //                     height: '40px',
// // //                     animation: 'spin 1s linear infinite',
// // //                 }}></div>
// // //                 <style jsx global>{`
// // //                     @keyframes spin {
// // //                         0% { transform: rotate(0deg); }
// // //                         100% { transform: rotate(360deg); }
// // //                     }
// // //                 `}</style>
// // //             </div>
// // //         );
// // //     }

// // //     return (
// // //         <AuthContext.Provider
// // //             value={{
// // //                 user: customUser,
// // //                 loading,
// // //                 signInWithGoogle,
// // //                 logout,
// // //                 getIdToken,
// // //                 firebaseUser, // Added
// // //                 mongoUser,    // Added
// // //                 isAuthenticated: !!firebaseUser && !!mongoUser, // Added
// // //             }}>
// // //             {children}
// // //         </AuthContext.Provider>
// // //     );
// // // };

// // // export const useAuth = () => {
// // //     const context = useContext(AuthContext);
// // //     if (context === undefined) {
// // //         throw new Error('useAuth must be used within an AuthProvider');
// // //     }
// // //     return context;
// // // };





// // 'use client';

// // import React, {
// //     createContext,
// //     useContext,
// //     useState,
// //     useEffect,
// //     ReactNode,
// //     useCallback,
// // } from 'react';
// // import {
// //     onAuthStateChanged,
// //     User as FirebaseUser,
// //     GoogleAuthProvider,
// //     signInWithPopup,
// //     signOut,
// // } from 'firebase/auth';
// // import { auth } from '../firebase/config';
// // import toast from 'react-hot-toast';

// // // --- Types ---
// // export interface MongoUser {
// //     _id: string;
// //     name: string;
// //     email: string;
// //     bio?: string;
// //     avatarUrl?: string;
// //     followers?: string[];
// //     following?: string[];
// // }

// // export interface CustomUser {
// //     uid: string;
// //     email: string | null;
// //     displayName: string | null;
// //     _id?: string;
// //     name?: string;
// //     bio?: string | null;
// //     avatarUrl?: string | null; // This will now always be a fully resolved URL
// //     followers?: string[];
// //     following?: string[];
// // }

// // interface AuthContextType {
// //     user: CustomUser | null;
// //     loading: boolean;
// //     signInWithGoogle: () => Promise<void>;
// //     logout: () => Promise<void>;
// //     getIdToken: () => Promise<string | null>;
// //     firebaseUser: FirebaseUser | null;
// //     mongoUser: MongoUser | null;
// //     isAuthenticated: boolean;
// //     refreshUser: () => Promise<void>; // For refreshing user data after avatar update
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // // Calculate the base URL for static assets (e.g., http://localhost:5001)
// // const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api')
// //     ? API_BASE_URL.slice(0, -4)
// //     : API_BASE_URL;

// // export const AuthProvider = ({ children }: { children: ReactNode }) => {
// //     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
// //     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
// //     const [loading, setLoading] = useState(true);
// //     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

// //     const buildCustomUser = useCallback(
// //         (
// //             fUser: FirebaseUser,
// //             backendUserData?: MongoUser
// //         ): CustomUser => {
// //             let resolvedAvatarUrl: string;

// //             // Priority 1: Backend provided avatarUrl (user's custom uploaded avatar)
// //             if (backendUserData?.avatarUrl && backendUserData.avatarUrl.trim() !== '') {
// //                 // Check if it's already an absolute URL (http/https/data URI)
// //                 if (
// //                     backendUserData.avatarUrl.startsWith('http://') ||
// //                     backendUserData.avatarUrl.startsWith('https://') ||
// //                     backendUserData.avatarUrl.startsWith('data:')
// //                 ) {
// //                     resolvedAvatarUrl = backendUserData.avatarUrl;
// //                 } else {
// //                     // It's a relative path, prepend backend static base URL
// //                     // Ensure no double slashes for concatenation
// //                     resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/')
// //                         ? backendUserData.avatarUrl.substring(1)
// //                         : backendUserData.avatarUrl
// //                     }`;
// //                 }
// //             } else if (fUser.photoURL) {
// //                 // Priority 2: Firebase user's photoURL (Google profile picture)
// //                 resolvedAvatarUrl = fUser.photoURL;
// //             } else {
// //                 // Fallback: Default logo served from backend static assets
// //                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
// //             }

// //             return {
// //                 uid: fUser.uid,
// //                 email: fUser.email,
// //                 displayName: fUser.displayName,
// //                 _id: backendUserData?._id,
// //                 name:
// //                     backendUserData?.name ||
// //                     fUser.displayName ||
// //                     fUser.email?.split('@')[0] ||
// //                     'Unknown User',
// //                 bio: backendUserData?.bio,
// //                 avatarUrl: resolvedAvatarUrl, // This is now always a fully resolved URL
// //                 followers: backendUserData?.followers || [],
// //                 following: backendUserData?.following || [],
// //             };
// //         },
// //         [] // No external dependencies are needed here, as BACKEND_STATIC_BASE_URL is a const
// //     );

// //     const ensureUserProfileInDB = useCallback(
// //         async (fUser: FirebaseUser) => {
// //             console.log("AuthProvider: ensureUserProfileInDB called for Firebase UID:", fUser.uid);
// //             if (!fUser) {
// //                 console.log("AuthProvider: No Firebase user provided to ensureUserProfileInDB.");
// //                 setLoading(false);
// //                 return;
// //             }

// //             try {
// //                 const token = await fUser.getIdToken();
// //                 if (!token) {
// //                     console.error("AuthProvider: Authentication token not available for Firebase UID:", fUser.uid);
// //                     setCustomUser(null);
// //                     setMongoUser(null);
// //                     setLoading(false);
// //                     return;
// //                 }
// //                 console.log("AuthProvider: Token obtained for Firebase UID:", fUser.uid);

// //                 // Attempt to fetch existing profile
// //                 const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
// //                     method: 'GET',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                         Authorization: `Bearer ${token}`,
// //                     },
// //                 });

// //                 if (profileResponse.ok) {
// //                     const backendData = await profileResponse.json();
// //                     console.log("AuthProvider: Profile fetched successfully. Backend data:", backendData);
// //                     if (backendData && backendData._id) {
// //                         const customUserData = buildCustomUser(fUser, backendData);
// //                         setCustomUser(customUserData);
// //                         setMongoUser(backendData);
// //                         console.log("AuthProvider: mongoUser set successfully with _id:", backendData._id);
// //                         console.log("AuthProvider: Custom user avatar URL resolved to:", customUserData.avatarUrl);
// //                     } else {
// //                         console.warn("AuthProvider: Profile fetched, but _id is missing or invalid in backend data:", backendData);
// //                         await syncUserProfile(fUser, token);
// //                     }
// //                 } else if (profileResponse.status === 404) {
// //                     console.log("AuthProvider: Profile not found (404). Attempting to sync profile...");
// //                     await syncUserProfile(fUser, token);
// //                 } else {
// //                     const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown fetch error' }));
// //                     console.error(`AuthProvider: Failed to load profile. Status: ${profileResponse.status}. Error data:`, errorData);
// //                     toast.error(`Failed to load profile: ${errorData.message}`);
// //                     setCustomUser(buildCustomUser(fUser));
// //                     setMongoUser(null);
// //                 }
// //             } catch (error) {
// //                 console.error('AuthProvider: Error in profile handling (ensureUserProfileInDB):', error);
// //                 toast.error(
// //                     `Error during profile sync/fetch: ${error instanceof Error ? error.message : String(error)}`
// //                 );
// //                 setCustomUser(buildCustomUser(fUser));
// //                 setMongoUser(null);
// //             } finally {
// //                 setLoading(false);
// //                 console.log("AuthProvider: ensureUserProfileInDB finished. Loading set to false.");
// //             }
// //         },
// //         [API_BASE_URL, buildCustomUser]
// //     );

// //     // Helper function for syncing profile to avoid code duplication
// //     const syncUserProfile = useCallback(async (fUser: FirebaseUser, token: string) => {
// //         try {
// //             const syncResponse = await fetch(
// //                 `${API_BASE_URL}/auth/syncProfile`,
// //                 {
// //                     method: 'POST',
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                         Authorization: `Bearer ${token}`,
// //                     },
// //                     body: JSON.stringify({
// //                         firebaseUid: fUser.uid,
// //                         name:
// //                             fUser.displayName ||
// //                             fUser.email?.split('@')[0] ||
// //                             'New User',
// //                         email: fUser.email,
// //                     }),
// //                 }
// //             );

// //             if (syncResponse.ok) {
// //                 const syncedData = await syncResponse.json();
// //                 console.log("AuthProvider: Profile synced successfully. Synced data:", syncedData);
// //                 if (syncedData && syncedData._id) {
// //                     const customUserData = buildCustomUser(fUser, syncedData);
// //                     setCustomUser(customUserData);
// //                     setMongoUser(syncedData);
// //                     toast.success('Profile synced successfully!');
// //                     console.log("AuthProvider: mongoUser set successfully after sync with _id:", syncedData._id);
// //                     console.log("AuthProvider: Custom user avatar URL resolved to:", customUserData.avatarUrl);
// //                 } else {
// //                     console.warn("AuthProvider: Profile synced, but _id is missing or invalid in synced data:", syncedData);
// //                     toast.error('Profile synced, but MongoDB ID is missing.');
// //                     setCustomUser(buildCustomUser(fUser));
// //                     setMongoUser(null);
// //                 }
// //             } else {
// //                 const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown sync error' }));
// //                 console.error(`AuthProvider: Failed to sync profile. Status: ${syncResponse.status}. Error data:`, errorData);
// //                 toast.error(`Failed to sync profile: ${errorData.message}`);
// //                 setCustomUser(buildCustomUser(fUser));
// //                 setMongoUser(null);
// //             }
// //         } catch (syncError) {
// //             console.error('AuthProvider: Error during syncUserProfile:', syncError);
// //             toast.error(`Error during profile sync: ${syncError instanceof Error ? syncError.message : String(syncError)}`);
// //             setCustomUser(buildCustomUser(fUser));
// //             setMongoUser(null);
// //         }
// //     }, [API_BASE_URL, buildCustomUser]);

// //     // Function to refresh user data (useful after profile updates)
// //     const refreshUser = useCallback(async () => {
// //         if (firebaseUser) {
// //             console.log("AuthProvider: Refreshing user data...");
// //             setLoading(true);
// //             await ensureUserProfileInDB(firebaseUser);
// //         }
// //     }, [firebaseUser, ensureUserProfileInDB]);

// //     useEffect(() => {
// //         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
// //             console.log("AuthProvider: onAuthStateChanged fired. FirebaseUser:", fUser ? fUser.uid : "null");
// //             if (fUser) {
// //                 setFirebaseUser(fUser);
// //                 setLoading(true);
// //                 await ensureUserProfileInDB(fUser);
// //             } else {
// //                 console.log("AuthProvider: No Firebase user detected. Resetting states.");
// //                 setFirebaseUser(null);
// //                 setCustomUser(null);
// //                 setMongoUser(null);
// //                 setLoading(false);
// //             }
// //         });
// //         return () => unsubscribe();
// //     }, [ensureUserProfileInDB]);

// //     const signInWithGoogle = async () => {
// //         const provider = new GoogleAuthProvider();
// //         try {
// //             setLoading(true);
// //             await signInWithPopup(auth, provider);
// //             toast.success('Signed in successfully!');
// //         } catch (error: any) {
// //             console.error('Sign-in error:', error);
// //             if (error.code === 'auth/popup-closed-by-user') {
// //                 toast.error('Sign-in cancelled.');
// //             } else if (error.code === 'auth/cancelled-popup-request') {
// //                 toast.error('Another sign-in attempt is in progress. Please try again.');
// //             } else {
// //                 toast.error(`Sign-in failed: ${error.message}`);
// //             }
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await signOut(auth);
// //             toast.success('Logged out successfully!');
// //             setFirebaseUser(null);
// //             setCustomUser(null);
// //             setMongoUser(null);
// //         } catch (error: any) {
// //             console.error("Error logging out:", error);
// //             toast.error(`Logout failed: ${error.message}`);
// //         }
// //     };

// //     const getIdToken = useCallback(async (): Promise<string | null> => {
// //         if (firebaseUser) {
// //             try {
// //                 const tokenResult = await firebaseUser.getIdTokenResult(true);
// //                 return tokenResult.token;
// //             } catch (error) {
// //                 console.error('Error getting token:', error);
// //                 return null;
// //             }
// //         }
// //         return null;
// //     }, [firebaseUser]);

// //     if (loading) {
// //         return (
// //             <div
// //                 style={{
// //                     position: 'fixed',
// //                     top: 0,
// //                     left: 0,
// //                     width: '100vw',
// //                     height: '100vh',
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                     justifyContent: 'center',
// //                     alignItems: 'center',
// //                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
// //                     zIndex: 9999,
// //                 }}
// //             >
// //                 <div
// //                     style={{
// //                         border: '4px solid #f3f3f3',
// //                         borderTop: '4px solid #3498db',
// //                         borderRadius: '50%',
// //                         width: '40px',
// //                         height: '40px',
// //                         animation: 'spin 1s linear infinite',
// //                     }}
// //                 ></div>
// //                 <p style={{ marginTop: '15px', fontSize: '1rem', color: '#555' }}>
// //                     Loading user data...
// //                 </p>
// //                 <style jsx global>{`
// //                     @keyframes spin {
// //                         0% {
// //                             transform: rotate(0deg);
// //                         }
// //                         100% {
// //                             transform: rotate(360deg);
// //                         }
// //                     }
// //                 `}</style>
// //             </div>
// //         );
// //     }

// //     return (
// //         <AuthContext.Provider
// //             value={{
// //                 user: customUser,
// //                 loading,
// //                 signInWithGoogle,
// //                 logout,
// //                 getIdToken,
// //                 firebaseUser,
// //                 mongoUser,
// //                 isAuthenticated: !!firebaseUser && !!mongoUser,
// //                 refreshUser, // Add this for refreshing user data after updates
// //             }}
// //         >
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // };

// // export const useAuth = () => {
// //     const context = useContext(AuthContext);
// //     if (context === undefined) {
// //         throw new Error('useAuth must be used within an AuthProvider');
// //     }
// //     return context;
// // };






// // // client/components/AuthProvider.tsx
// // 'use client';

// // import React, {
// //     createContext,
// //     useContext,
// //     useState,
// //     useEffect,
// //     ReactNode,
// //     useCallback,
// // } from 'react';
// // import {
// //     onAuthStateChanged,
// //     User as FirebaseUser,
// //     GoogleAuthProvider,
// //     signInWithPopup,
// //     signOut,
// // } from 'firebase/auth';
// // import { auth } from '../firebase/config';
// // import toast from 'react-hot-toast';
// // import { useUserManagement } from '../hooks/useUserManagement'; // Import the new hook

// // // --- Types ---
// // export interface MongoUser {
// //     _id: string;
// //     name: string;
// //     email: string;
// //     bio?: string;
// //     avatarUrl?: string; // This is the avatar URL stored in MongoDB
// //     followers?: string[];
// //     following?: string[];
// //     // Add any other fields your MongoUser might have (e.g., createdAt, updatedAt)
// // }

// // export interface CustomUser {
// //     uid: string;
// //     email: string | null;
// //     displayName: string | null;
// //     _id?: string; // MongoDB _id
// //     name?: string; // Name from MongoDB or Firebase
// //     bio?: string | null; // Bio from MongoDB
// //     avatarUrl?: string | null; // Resolved avatar URL (backend, Firebase, or default)
// //     // Add other fields you want available on the client-side CustomUser
// // }

// // interface AuthContextType {
// //     user: CustomUser | null;
// //     loading: boolean;
// //     signInWithGoogle: () => Promise<void>;
// //     logout: () => Promise<void>;
// //     getIdToken: () => Promise<string | null>;
// //     firebaseUser: FirebaseUser | null;
// //     mongoUser: MongoUser | null;
// //     isAuthenticated: boolean;
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api')
// //     ? API_BASE_URL.slice(0, -4)
// //     : API_BASE_URL;

// // export const AuthProvider = ({ children }: { children: ReactNode }) => {
// //     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
// //     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
// //     const [loading, setLoading] = useState(true);
// //     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

// //     // Use the new useUserManagement hook
// //     const { fetchUserProfile, syncUserProfile } = useUserManagement();

// //     const buildCustomUser = useCallback(
// //         (
// //             fUser: FirebaseUser,
// //             backendUserData?: MongoUser // backendUserData is now directly MongoUser
// //         ): CustomUser => {
// //             let resolvedAvatarUrl: string;

// //             // Priority 1: Backend avatarUrl if it's a valid, non-empty string
// //             if (
// //                 backendUserData?.avatarUrl &&
// //                 backendUserData.avatarUrl.trim() !== ''
// //             ) {
// //                 if (
// //                     backendUserData.avatarUrl.startsWith('http://') ||
// //                     backendUserData.avatarUrl.startsWith('https://') ||
// //                     backendUserData.avatarUrl.startsWith('data:')
// //                 ) {
// //                     resolvedAvatarUrl = backendUserData.avatarUrl; // Use as-is if it's a full URL or data URI
// //                 } else {
// //                     // Prepend backend static URL for relative paths
// //                     resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/')
// //                         ? backendUserData.avatarUrl.substring(1)
// //                         : backendUserData.avatarUrl
// //                         }`;
// //                 }
// //             }
// //             // Priority 2: Firebase photoURL if available
// //             else if (fUser.photoURL) {
// //                 resolvedAvatarUrl = fUser.photoURL;
// //             }
// //             // Priority 3: Fallback to a default image
// //             else {
// //                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`; // Ensure this path is correct on your backend
// //             }

// //             return {
// //                 uid: fUser.uid,
// //                 email: fUser.email,
// //                 displayName: fUser.displayName,
// //                 _id: backendUserData?._id, // This is critical for mongoUser
// //                 name:
// //                     backendUserData?.name ||
// //                     fUser.displayName ||
// //                     fUser.email?.split('@')[0] ||
// //                     'Unknown User',
// //                 bio: backendUserData?.bio,
// //                 avatarUrl: resolvedAvatarUrl,
// //             };
// //         },
// //         [BACKEND_STATIC_BASE_URL]
// //     );

// //     const ensureUserProfileInDB = useCallback(
// //         async (fUser: FirebaseUser) => {
// //             console.log("AuthProvider: ensureUserProfileInDB called for Firebase UID:", fUser.uid);
// //             if (!fUser) {
// //                 console.log("AuthProvider: No Firebase user provided to ensureUserProfileInDB.");
// //                 setLoading(false);
// //                 return;
// //             }

// //             try {
// //                 const token = await fUser.getIdToken();
// //                 if (!token) {
// //                     console.error("AuthProvider: Authentication token not available for Firebase UID:", fUser.uid);
// //                     setCustomUser(null);
// //                     setMongoUser(null);
// //                     setLoading(false);
// //                     return;
// //                 }
// //                 console.log("AuthProvider: Token obtained for Firebase UID:", fUser.uid);

// //                 // Attempt to fetch existing profile using the hook
// //                 let backendData = await fetchUserProfile(token);

// //                 if (backendData && backendData._id) {
// //                     console.log("AuthProvider: Profile found via fetchUserProfile, setting user.");
// //                     setCustomUser(buildCustomUser(fUser, backendData));
// //                     setMongoUser(backendData);
// //                     console.log("AuthProvider: mongoUser set successfully with _id:", backendData._id);
// //                 } else {
// //                     console.log("AuthProvider: Profile not found or incomplete via fetchUserProfile. Attempting to sync profile...");
// //                     // If profile not found or incomplete, attempt to sync/create it using the hook
// //                     const syncedData = await syncUserProfile(fUser, token);

// //                     if (syncedData && syncedData._id) {
// //                         console.log("AuthProvider: Profile successfully synced, setting user.");
// //                         setCustomUser(buildCustomUser(fUser, syncedData));
// //                         setMongoUser(syncedData);
// //                         console.log("AuthProvider: mongoUser set successfully after sync with _id:", syncedData._id);
// //                     } else {
// //                         console.error('AuthProvider: Failed to sync profile: No valid user data returned after sync. Check backend response.');
// //                         toast.error('Failed to sync profile: Please try again.');
// //                         setCustomUser(buildCustomUser(fUser)); // Set custom user with Firebase data only as a fallback
// //                         setMongoUser(null); // Ensure mongoUser is null
// //                     }
// //                 }
// //             } catch (error) {
// //                 console.error('AuthProvider: Error in profile handling (ensureUserProfileInDB):', error);
// //                 toast.error(
// //                     `Error during profile sync/fetch: ${error instanceof Error ? error.message : String(error)}`
// //                 );
// //                 setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// //                 setMongoUser(null); // Ensure mongoUser is null on any caught error
// //             } finally {
// //                 setLoading(false);
// //                 console.log("AuthProvider: ensureUserProfileInDB finished. Loading set to false.");
// //             }
// //         },
// //         [buildCustomUser, fetchUserProfile, syncUserProfile] // Dependencies for ensureUserProfileInDB
// //     );

// //     useEffect(() => {
// //         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
// //             console.log("AuthProvider: onAuthStateChanged fired. FirebaseUser:", fUser ? fUser.uid : "null");
// //             if (fUser) {
// //                 setFirebaseUser(fUser);
// //                 setLoading(true); // Start loading again as we fetch Mongo data
// //                 await ensureUserProfileInDB(fUser);
// //             } else {
// //                 console.log("AuthProvider: No Firebase user detected. Resetting states.");
// //                 setFirebaseUser(null);
// //                 setCustomUser(null);
// //                 setMongoUser(null);
// //                 setLoading(false);
// //             }
// //         });
// //         return () => unsubscribe();
// //     }, [ensureUserProfileInDB]); // ensureUserProfileInDB is a dependency

// //     const signInWithGoogle = async () => {
// //         const provider = new GoogleAuthProvider();
// //         try {
// //             setLoading(true); // Start loading during sign-in
// //             await signInWithPopup(auth, provider);
// //             toast.success('Signed in successfully!');
// //             // onAuthStateChanged will handle setting the user and mongoUser after sign-in
// //         } catch (error: any) {
// //             console.error('Sign-in error:', error);
// //             toast.error(`Sign-in failed: ${error.message}`);
// //         } finally {
// //             // setLoading(false); // Let onAuthStateChanged handle the final loading state
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await signOut(auth);
// //             toast.success('Logged out!');
// //             // onAuthStateChanged will handle resetting states after logout
// //         } catch (error: any) {
// //             toast.error(`Logout failed: ${error.message}`);
// //         }
// //     };

// //     const getIdToken = useCallback(async (): Promise<string | null> => {
// //         if (firebaseUser) {
// //             try {
// //                 const tokenResult = await firebaseUser.getIdTokenResult(true);
// //                 return tokenResult.token;
// //             } catch (error) {
// //                 console.error('Error getting token:', error);
// //                 return null;
// //             }
// //         }
// //         return null;
// //     }, [firebaseUser]);

// //     if (loading) {
// //         return (
// //             <div
// //                 style={{
// //                     position: 'fixed',
// //                     top: 0,
// //                     left: 0,
// //                     width: '100vw',
// //                     height: '100vh',
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                     justifyContent: 'center',
// //                     alignItems: 'center',
// //                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
// //                     zIndex: 9999,
// //                 }}
// //             >
// //                 <div
// //                     style={{
// //                         border: '4px solid #f3f3f3',
// //                         borderTop: '4px solid #3498db',
// //                         borderRadius: '50%',
// //                         width: '40px',
// //                         height: '40px',
// //                         animation: 'spin 1s linear infinite',
// //                     }}
// //                 ></div>
// //                 <p style={{ marginTop: '15px', fontSize: '1rem', color: '#555' }}>
// //                     Loading user data...
// //                 </p>
// //                 <style jsx global>{`
// //                     @keyframes spin {
// //                         0% {
// //                             transform: rotate(0deg);
// //                         }
// //                         100% {
// //                             transform: rotate(360deg);
// //                         }
// //                     }
// //                 `}</style>
// //             </div>
// //         );
// //     }

// //     return (
// //         <AuthContext.Provider
// //             value={{
// //                 user: customUser,
// //                 loading, // This is authProvider's internal loading
// //                 signInWithGoogle,
// //                 logout,
// //                 getIdToken,
// //                 firebaseUser,
// //                 mongoUser, // The crucial mongoUser
// //                 isAuthenticated: !!firebaseUser && !!mongoUser, // Fully authenticated only if both exist
// //             }}
// //         >
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // };

// // export const useAuth = () => {
// //     const context = useContext(AuthContext);
// //     if (context === undefined) {
// //         throw new Error('useAuth must be used within an AuthProvider');
// //     }
// //     return context;
// // };








// // // client/components/AuthProvider.tsx
// // 'use client';

// // import React, {
// //     createContext,
// //     useContext,
// //     useState,
// //     useEffect,
// //     ReactNode,
// //     useCallback,
// // } from 'react';
// // import {
// //     onAuthStateChanged,
// //     User as FirebaseUser,
// //     GoogleAuthProvider,
// //     signInWithPopup,
// //     signOut,
// // } from 'firebase/auth';
// // import { auth } from '../firebase/config';
// // import toast from 'react-hot-toast';
// // import { useUserManagement } from '../hooks/useUserManagement'; // Import the new hook

// // // --- Types ---
// // export interface MongoUser {
// //     _id: string;
// //     name: string;
// //     email: string;
// //     bio?: string;
// //     avatarUrl?: string; // This is the avatar URL stored in MongoDB
// //     followers?: string[];
// //     following?: string[];
// //     // Add any other fields your MongoUser might have (e.g., createdAt, updatedAt)
// // }

// // export interface CustomUser {
// //     uid: string;
// //     email: string | null;
// //     displayName: string | null;
// //     _id?: string; // MongoDB _id
// //     name?: string; // Name from MongoDB or Firebase
// //     bio?: string | null; // Bio from MongoDB
// //     avatarUrl?: string | null; // Resolved avatar URL (backend, Firebase, or default)
// //     // Add other fields you want available on the client-side CustomUser
// // }

// // interface AuthContextType {
// //     user: CustomUser | null;
// //     loading: boolean;
// //     signInWithGoogle: () => Promise<void>;
// //     logout: () => Promise<void>;
// //     getIdToken: () => Promise<string | null>;
// //     firebaseUser: FirebaseUser | null;
// //     mongoUser: MongoUser | null;
// //     isAuthenticated: boolean;
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// // const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api')
// //     ? API_BASE_URL.slice(0, -4)
// //     : API_BASE_URL;

// // export const AuthProvider = ({ children }: { children: ReactNode }) => {
// //     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
// //     const [customUser, setCustomUser] = useState<CustomUser | null>(null);
// //     const [loading, setLoading] = useState(true);
// //     const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

// //     // Use the new useUserManagement hook
// //     const { fetchUserProfile, syncUserProfile } = useUserManagement();

// //     const buildCustomUser = useCallback(
// //         (
// //             fUser: FirebaseUser,
// //             backendUserData?: MongoUser // backendUserData is now directly MongoUser
// //         ): CustomUser => {
// //             let resolvedAvatarUrl: string;

// //             // Priority 1: Backend avatarUrl if it's a valid, non-empty string
// //             if (
// //                 backendUserData?.avatarUrl &&
// //                 backendUserData.avatarUrl.trim() !== ''
// //             ) {
// //                 // Ensure it's a full URL or data URI, otherwise prepend backend base URL
// //                 if (
// //                     backendUserData.avatarUrl.startsWith('http://') ||
// //                     backendUserData.avatarUrl.startsWith('https://') ||
// //                     backendUserData.avatarUrl.startsWith('data:')
// //                 ) {
// //                     resolvedAvatarUrl = backendUserData.avatarUrl;
// //                 } else {
// //                     resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.avatarUrl.startsWith('/')
// //                         ? backendUserData.avatarUrl.substring(1)
// //                         : backendUserData.avatarUrl
// //                         }`;
// //                 }
// //             }
// //             // Priority 2: Firebase photoURL if available AND backendData did not provide a valid avatarUrl
// //             // This is the key part: if backendUserData.avatarUrl was null/empty, we fall back to fUser.photoURL
// //             else if (fUser.photoURL) {
// //                 resolvedAvatarUrl = fUser.photoURL; // <--- This should capture the Google pic
// //             }
// //             // Priority 3: Fallback to a default image
// //             else {
// //                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
// //             }

// //             console.log("DEBUG [AuthProvider]: Resolved avatar URL:", resolvedAvatarUrl);

// //             return {
// //                 uid: fUser.uid,
// //                 email: fUser.email,
// //                 displayName: fUser.displayName,
// //                 _id: backendUserData?._id, // This is critical for mongoUser
// //                 name:
// //                     backendUserData?.name ||
// //                     fUser.displayName ||
// //                     fUser.email?.split('@')[0] ||
// //                     'Unknown User',
// //                 bio: backendUserData?.bio,
// //                 avatarUrl: resolvedAvatarUrl, // This is the URL that gets displayed
// //             };
// //         },
// //         [BACKEND_STATIC_BASE_URL]
// //     );

// //     const ensureUserProfileInDB = useCallback(
// //         async (fUser: FirebaseUser) => {
// //             console.log("AuthProvider: ensureUserProfileInDB called for Firebase UID:", fUser.uid);
// //             if (!fUser) {
// //                 console.log("AuthProvider: No Firebase user provided to ensureUserProfileInDB.");
// //                 setLoading(false);
// //                 return;
// //             }

// //             try {
// //                 const token = await fUser.getIdToken();
// //                 if (!token) {
// //                     console.error("AuthProvider: Authentication token not available for Firebase UID:", fUser.uid);
// //                     setCustomUser(null);
// //                     setMongoUser(null);
// //                     setLoading(false);
// //                     return;
// //                 }
// //                 console.log("AuthProvider: Token obtained for Firebase UID:", fUser.uid);

// //                 // Attempt to fetch existing profile using the hook
// //                 let backendData = await fetchUserProfile(token);

// //                 if (backendData && backendData._id) {
// //                     console.log("AuthProvider: Profile found via fetchUserProfile, setting user.");
// //                     setCustomUser(buildCustomUser(fUser, backendData));
// //                     setMongoUser(backendData);
// //                     console.log("AuthProvider: mongoUser set successfully with _id:", backendData._id);
// //                 } else {
// //                     console.log("AuthProvider: Profile not found or incomplete via fetchUserProfile. Attempting to sync profile...");
// //                     // If profile not found or incomplete, attempt to sync/create it using the hook
// //                     const syncedData = await syncUserProfile(fUser, token);

// //                     if (syncedData && syncedData._id) {
// //                         console.log("AuthProvider: Profile successfully synced, setting user.");
// //                         setCustomUser(buildCustomUser(fUser, syncedData));
// //                         setMongoUser(syncedData);
// //                         console.log("AuthProvider: mongoUser set successfully after sync with _id:", syncedData._id);
// //                     } else {
// //                         console.error('AuthProvider: Failed to sync profile: No valid user data returned after sync. Check backend response.');
// //                         toast.error('Failed to sync profile: Please try again.');
// //                         setCustomUser(buildCustomUser(fUser)); // Set custom user with Firebase data only as a fallback
// //                         setMongoUser(null); // Ensure mongoUser is null
// //                     }
// //                 }
// //             } catch (error) {
// //                 console.error('AuthProvider: Error in profile handling (ensureUserProfileInDB):', error);
// //                 toast.error(
// //                     `Error during profile sync/fetch: ${error instanceof Error ? error.message : String(error)}`
// //                 );
// //                 setCustomUser(buildCustomUser(fUser)); // Fallback to Firebase data
// //                 setMongoUser(null); // Ensure mongoUser is null on any caught error
// //             } finally {
// //                 setLoading(false);
// //                 console.log("AuthProvider: ensureUserProfileInDB finished. Loading set to false.");
// //             }
// //         },
// //         [buildCustomUser, fetchUserProfile, syncUserProfile] // Dependencies for ensureUserProfileInDB
// //     );

// //     useEffect(() => {
// //         const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
// //             console.log("AuthProvider: onAuthStateChanged fired. FirebaseUser:", fUser ? fUser.uid : "null");
// //             if (fUser) {
// //                 setFirebaseUser(fUser);
// //                 setLoading(true); // Start loading again as we fetch Mongo data
// //                 await ensureUserProfileInDB(fUser);
// //             } else {
// //                 console.log("AuthProvider: No Firebase user detected. Resetting states.");
// //                 setFirebaseUser(null);
// //                 setCustomUser(null);
// //                 setMongoUser(null);
// //                 setLoading(false);
// //             }
// //         });
// //         return () => unsubscribe();
// //     }, [ensureUserProfileInDB]); // ensureUserProfileInDB is a dependency

// //     const signInWithGoogle = async () => {
// //         const provider = new GoogleAuthProvider();
// //         try {
// //             setLoading(true); // Start loading during sign-in
// //             await signInWithPopup(auth, provider);
// //             toast.success('Signed in successfully!');
// //             // onAuthStateChanged will handle setting the user and mongoUser after sign-in
// //         } catch (error: any) {
// //             console.error('Sign-in error:', error);
// //             toast.error(`Sign-in failed: ${error.message}`);
// //         } finally {
// //             // setLoading(false); // Let onAuthStateChanged handle the final loading state
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await signOut(auth);
// //             toast.success('Logged out!');
// //             // onAuthStateChanged will handle resetting states after logout
// //         } catch (error: any) {
// //             toast.error(`Logout failed: ${error.message}`);
// //         }
// //     };

// //     const getIdToken = useCallback(async (): Promise<string | null> => {
// //         if (firebaseUser) {
// //             try {
// //                 const tokenResult = await firebaseUser.getIdTokenResult(true);
// //                 return tokenResult.token;
// //             } catch (error) {
// //                 console.error('Error getting token:', error);
// //                 return null;
// //             }
// //         }
// //         return null;
// //     }, [firebaseUser]);

// //     if (loading) {
// //         return (
// //             <div
// //                 style={{
// //                     position: 'fixed',
// //                     top: 0,
// //                     left: 0,
// //                     width: '100vw',
// //                     height: '100vh',
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                     justifyContent: 'center',
// //                     alignItems: 'center',
// //                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
// //                     zIndex: 9999,
// //                 }}
// //             >
// //                 <div
// //                     style={{
// //                         border: '4px solid #f3f3f3',
// //                         borderTop: '4px solid #3498db',
// //                         borderRadius: '50%',
// //                         width: '40px',
// //                         height: '40px',
// //                         animation: 'spin 1s linear infinite',
// //                     }}
// //                 ></div>
// //                 <p style={{ marginTop: '15px', fontSize: '1rem', color: '#555' }}>
// //                     Loading user data...
// //                 </p>
// //                 <style jsx global>{`
// //                     @keyframes spin {
// //                         0% {
// //                             transform: rotate(0deg);
// //                         }
// //                         100% {
// //                             transform: rotate(360deg);
// //                         }
// //                     }
// //                 `}</style>
// //             </div>
// //         );
// //     }

// //     return (
// //         <AuthContext.Provider
// //             value={{
// //                 user: customUser,
// //                 loading, // This is authProvider's internal loading
// //                 signInWithGoogle,
// //                 logout,
// //                 getIdToken,
// //                 firebaseUser,
// //                 mongoUser, // The crucial mongoUser
// //                 isAuthenticated: !!firebaseUser && !!mongoUser, // Fully authenticated only if both exist
// //             }}
// //         >
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // };

// // export const useAuth = () => {
// //     const context = useContext(AuthContext);
// //     if (context === undefined) {
// //         throw new Error('useAuth must be used within an AuthProvider');
// //     }
// //     return context;
// // };









// // client/components/AuthProvider.tsx
// 'use client'; // This directive indicates that this component should be rendered on the client side.

// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// import { auth } from '../firebase/config'; // Imports your Firebase authentication instance.
// import toast from 'react-hot-toast'; // Imports a library for displaying notifications.

// // --- Type Definitions ---

// export interface CustomUser {
//     uid: string; // Firebase User ID
//     email: string | null; // User's email from Firebase
//     displayName: string | null; // User's display name from Firebase
//     _id?: string; // Optional: MongoDB document ID for this user (comes from your backend)
//     name?: string; // Optional: User's name, potentially overridden by backend
//     bio?: string | null; // Optional: User's biography (comes from your backend)
//     avatarUrl?: string | null; // Optional: User's profile picture URL (resolved from backend, Firebase, or default)
// }

// interface AuthContextType {
//     user: CustomUser | null; // The merged user object available to consumers of the context.
//     loading: boolean; // Indicates if authentication state/user data is currently being loaded.
//     signInWithGoogle: () => Promise<void>; // Function to sign in with Google.
//     logout: () => Promise<void>; // Function to log out the user.
//     getIdToken: () => Promise<string | null>; // Function to get the Firebase authentication token.
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined); // Creates the React Context for authentication.

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api'; // Defines the base URL for your backend API. It gets this from environment variables or defaults to a local URL.
// // Calculate the base URL for static assets (e.g., http://localhost:5001)
// const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL; // Determines the root URL for static files served by your backend (e.g., for default avatars).

// export const AuthProvider = ({ children }: { children: ReactNode }) => { // This is the main AuthProvider component.
//     // --- State Variables ---
//     const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // Stores the raw Firebase user object.
//     const [customUser, setCustomUser] = useState<CustomUser | null>(null); // Stores your custom, enriched user object.
//     const [loading, setLoading] = useState(true); // Manages the loading state, initially true as we check auth.

//     // --- Helper Function: buildCustomUser ---
//     // This function combines data from Firebase and your backend to create the CustomUser object.
//     const buildCustomUser = useCallback((
//         fUser: FirebaseUser, // The Firebase user object
//         backendUserData?: { user?: { _id?: string; avatarUrl?: string; bio?: string; name?: string; }; message?: string; } // Optional data from your backend
//     ): CustomUser => {
//         let resolvedAvatarUrl: string; // Variable to hold the final avatar URL.

//         // Priority 1: Check if backend data has an avatar URL
//         if (backendUserData?.user?.avatarUrl) {
//             // Check if it's already an absolute URL (http/https/data URI)
//             if (backendUserData.user.avatarUrl.startsWith('http://') || backendUserData.user.avatarUrl.startsWith('https://') || backendUserData.user.avatarUrl.startsWith('data:')) {
//                 resolvedAvatarUrl = backendUserData.user.avatarUrl; // Use the URL as is if it's absolute.
//             } else {
//                 // It's a relative path, so prepend the backend static base URL to make it absolute.
//                 // Ensures no double slashes if the path already starts with one.
//                 resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/${backendUserData.user.avatarUrl.startsWith('/') ? backendUserData.user.avatarUrl.substring(1) : backendUserData.user.avatarUrl}`;
//             }
//         } else if (fUser.photoURL) {
//             // Priority 2: If no backend avatar, use Firebase user's photoURL (e.g., Google profile picture).
//             resolvedAvatarUrl = fUser.photoURL;
//         } else {
//             // Fallback: If neither exists, use a default user logo from your backend's static assets.
//             resolvedAvatarUrl = `${BACKEND_STATIC_BASE_URL}/avatars/userLogo.png`;
//         }

//         // Return the constructed CustomUser object.
//         return {
//             uid: fUser.uid, // Firebase User ID
//             email: fUser.email, // Firebase User Email
//             displayName: fUser.displayName, // Firebase User Display Name
//             _id: backendUserData?.user?._id, // MongoDB _id from backend
//             name: backendUserData?.user?.name || fUser.displayName || fUser.email?.split('@')[0] || 'Unknown User', // Prioritizes backend name, then Firebase display name, then email part, then default.
//             bio: backendUserData?.user?.bio, // Biography from backend
//             avatarUrl: resolvedAvatarUrl, // The finally resolved avatar URL.
//         };
//     }, [BACKEND_STATIC_BASE_URL]); // `useCallback` dependency: ensures `buildCustomUser` is memoized and only re-created if BACKEND_STATIC_BASE_URL changes.

//     // --- Core Logic: ensureUserProfileInDB ---
//     // This asynchronous function is responsible for:
//     // 1. Getting the Firebase auth token.
//     // 2. Attempting to fetch the user's profile from your backend.
//     // 3. If not found, attempting to sync (create) the user's profile on the backend.
//     // 4. Updating the `customUser` state based on the fetched/synced data.
//     const ensureUserProfileInDB = useCallback(async (fUser: FirebaseUser) => {
//         if (!fUser) return; // If no Firebase user, exit.

//         try {
//             const token = await fUser.getIdToken(); // Gets the Firebase ID token for authorization with your backend.
//             if (!token) throw new Error("Authentication token not available."); // Throws error if token is missing.

//             // First API Call: Attempt to fetch existing user profile from your backend.
//             const profileResponse = await fetch(`${API_BASE_URL}/users/profile`, {
//                 method: 'GET', // HTTP GET request.
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}` // Sends the Firebase token for authentication.
//                 },
//             });

//             if (profileResponse.ok) { // Checks if the API call was successful (status 200-299).
//                 const backendData = await profileResponse.json(); // Parses the JSON response from your backend.
//                 setCustomUser(buildCustomUser(fUser, { user: backendData })); // Uses the fetched backend data to build the `customUser` and set state.
//                 console.log("Existing profile loaded:", backendData); // Logs the loaded profile.
//             } else if (profileResponse.status === 404) { // If profile not found (HTTP 404).
//                 console.log("Profile not found in backend, attempting to sync...");
//                 // Second API Call (if 404): Attempt to sync (create or update) the user profile on your backend.
//                 const syncResponse = await fetch(`${API_BASE_URL}/auth/syncProfile`, {
//                     method: 'POST', // HTTP POST request.
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}` // Sends the Firebase token again.
//                     },
//                     body: JSON.stringify({ // Sends user data to the backend to create/update their profile.
//                         firebaseUid: fUser.uid,
//                         name: fUser.displayName || fUser.email?.split('@')[0] || 'New User',
//                         email: fUser.email,
//                         // IMPORTANT: The `avatarUrl` (fUser.photoURL) is *not* explicitly sent here.
//                         // This is a potential point of error if your backend expects it for initial syncs.
//                         // In the previous version, `avatarUrl: fUser.photoURL` was sent here.
//                         // Without it, your backend would need to pull it from Firebase itself or set a default.
//                     })
//                 });

//                 if (syncResponse.ok) { // Checks if the sync API call was successful.
//                     const syncedData = await syncResponse.json(); // Parses the JSON response (the newly created/updated user profile).
//                     setCustomUser(buildCustomUser(fUser, { user: syncedData })); // Builds and sets `customUser` with the synced data.
//                     toast.success('Profile synced successfully!'); // Shows a success notification.
//                     console.log('Profile synced:', syncedData); // Logs the synced profile.
//                 } else {
//                     const errorData = await syncResponse.json().catch(() => ({ message: 'Unknown error during profile sync' }));
//                     console.error('Failed to sync user profile with backend:', errorData.message);
//                     toast.error(`Failed to sync profile: ${errorData.message}`);
//                     setCustomUser(buildCustomUser(fUser)); // Falls back to building custom user with only Firebase data.
//                 }
//             } else { // Handles other non-OK HTTP responses from profile fetch.
//                 const errorData = await profileResponse.json().catch(() => ({ message: 'Unknown error fetching profile' }));
//                 console.error('Failed to fetch user profile from backend:', errorData.message);
//                 toast.error(`Failed to load profile: ${errorData.message}`);
//                 setCustomUser(buildCustomUser(fUser)); // Falls back to building custom user with only Firebase data.
//             }
//         } catch (error) { // Catches any network or unexpected errors.
//             console.error('Error during user profile processing:', error);
//             toast.error(`Error processing profile: ${error instanceof Error ? error.message : String(error)}`);
//             setCustomUser(buildCustomUser(fUser)); // Falls back to building custom user with only Firebase data.
//         } finally {
//             setLoading(false); // Sets loading to false once the process is complete (success or failure).
//         }
//     }, [API_BASE_URL, buildCustomUser]); // `useCallback` dependency: ensures `ensureUserProfileInDB` is re-created if API_BASE_URL or buildCustomUser changes.

//     // --- useEffect for Firebase Auth State Changes ---
//     // This hook runs once on component mount and sets up a listener for Firebase authentication state changes.
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (fUser) => { // Listens for changes in Firebase authentication state (login, logout).
//             if (fUser) { // If a Firebase user is logged in.
//                 setFirebaseUser(fUser); // Store the Firebase user object.
//                 setLoading(true); // Set loading to true as we will now fetch/sync backend data.
//                 await ensureUserProfileInDB(fUser); // Call the function to ensure backend profile exists.
//             } else { // If no Firebase user is logged in (logged out or not authenticated).
//                 setFirebaseUser(null); // Clear Firebase user state.
//                 setCustomUser(null); // Clear custom user state.
//                 setLoading(false); // Set loading to false.
//             }
//         });
//         return () => unsubscribe(); // Cleanup function: unsubscribes the listener when the component unmounts.
//     }, [ensureUserProfileInDB]); // `useEffect` dependency: ensures this effect re-runs if `ensureUserProfileInDB` changes.

//     // --- Authentication Functions ---

//     const signInWithGoogle = async () => { // Function to handle Google Sign-In.
//         const provider = new GoogleAuthProvider(); // Creates a Google Auth provider instance.
//         try {
//             await signInWithPopup(auth, provider); // Opens a popup for Google sign-in.
//             toast.success("Signed in successfully!"); // Shows a success notification.
//         } catch (error: any) { // Catches errors during sign-in.
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

//     const logout = async () => { // Function to handle user logout.
//         try {
//             await signOut(auth); // Signs out the user from Firebase.
//             toast.success("Logged out successfully!"); // Shows a success notification.
//             setFirebaseUser(null); // Explicitly clear Firebase user (though `onAuthStateChanged` will also do this).
//             setCustomUser(null); // Explicitly clear custom user.
//         } catch (error: any) {
//             console.error("Error logging out:", error);
//             toast.error(`Failed to log out: ${error.message}`);
//         }
//     };

//     const getIdToken = useCallback(async (): Promise<string | null> => { // Function to get the current user's Firebase ID token.
//         if (firebaseUser) {
//             try {
//                 const tokenResult = await firebaseUser.getIdTokenResult(true); // Forces a refresh of the token.
//                 return tokenResult.token; // Returns the ID token.
//             } catch (error) {
//                 console.error('Error getting ID token:', error);
//                 return null;
//             }
//         }
//         return null; // Returns null if no Firebase user.
//     }, [firebaseUser]); // `useCallback` dependency: re-creates if `firebaseUser` changes.

//     // --- Loading State UI ---
//     if (loading) { // If `loading` is true, display a loading spinner.
//         return (
//             <div style={{
//                 position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
//                 display: 'flex', justifyContent: 'center', alignItems: 'center',
//                 backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999,
//             }}>
//                 <div style={{
//                     border: '4px solid #f3f3f3', borderTop: '4px solid #3498db',
//                     borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite',
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

//     // --- Render AuthContext.Provider ---
//     return (
//         // Provides the authentication context values to all child components wrapped by AuthProvider.
//         <AuthContext.Provider value={{ user: customUser, loading, signInWithGoogle, logout, getIdToken }}>
//             {children} {/* Renders the child components of AuthProvider */}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => { // Custom hook to easily consume the AuthContext in other components.
//     const context = useContext(AuthContext); // Gets the current context value.
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider'); // Ensures the hook is used inside AuthProvider.
//     }
//     return context; // Returns the authentication context values.
// };


















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

interface MongoUser {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
// Calculate the base URL for static assets (e.g., http://localhost:5001)
const BACKEND_STATIC_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [customUser, setCustomUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);

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
                setMongoUser(backendData);
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