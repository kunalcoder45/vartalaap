// export interface Message {
//     _id: string;
//     conversationId: string;
//     sender: GeneralUser;  // Sender is a full user object
//     receiver: string;     // Receiver is just an ID (or could be a user)
//     content: string;
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video' | 'audio' | 'file';
//     isDeleted: boolean;
//     isEdited: boolean;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface GeneralUser {
//     _id: string;
//     name: string;
//     username?: string;
//     avatarUrl?: string;
//     email?: string;
// }

// export interface AppUser {
//     _id: string;
//     name: string;
//     username?: string;
//     avatarUrl?: string;
//     email?: string;
// }

// export interface CustomUser {
//     uid: string;
//     email: string | null;
//     displayName: string | null;
//     _id?: string;
//     name?: string;
//     bio?: string | null;
//     avatarUrl?: string | null; // This will now always be a fully resolved URL
//     username?: string;
// }

// app/types/index.ts (or wherever your types are defined)

export interface Message {
    _id: string;
    conversationId: string;
    sender: GeneralUser;    // Sender is a full user object
    receiver: string;      // Receiver is just an ID (or could be a user)
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'file';
    isDeleted: boolean;
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GeneralUser {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    email?: string;
}

export interface AppUser {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
    email?: string;
}

export interface CustomUser {
    uid: string; // Firebase UID
    email: string | null;
    displayName: string | null;
    _id?: string; // Add this for MongoDB _id. Make it optional if it might not always be present immediately.
    name?: string;
    bio?: string | null;
    avatarUrl?: string | null; // This will now always be a fully resolved URL
    username?: string; // Added to resolve the previous TypeScript error
}

// // app/types.ts
// export interface Message {
//     _id: string;
//     conversationId: string;
//     sender: GeneralUser; // Assuming sender is populated with GeneralUser fields
//     receiver: string; // Or GeneralUser if you populate it
//     content: string;
//     mediaUrl?: string; // Optional for media messages
//     mediaType?: 'image' | 'video' | 'audio' | 'file'; // Optional for media messages
//     isDeleted: boolean;
//     isEdited: boolean; // Add this field
//     createdAt: string;
//     updatedAt: string;
// }

// export interface GeneralUser {
//     _id: string;
//     name: string; // Assuming 'name' is always available
//     username?: string; // Optional, depending on your user schema
//     avatarUrl?: string;
//     email?: string;
// }

// export interface AppUser {
//     _id: string;
//     name: string; // Assuming 'name' is always available
//     username?: string; // Optional, depending on your user schema
//     avatarUrl?: string;
//     email?: string;
// }

