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

// client/app/types/index.ts

export interface Message {
    _id: string;
    conversationId: string;
    sender: GeneralUser;
    receiver: string;
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
    // Add any other fields you typically expect for a general user profile
}

// AppUser could be an alias for GeneralUser or a more specific type if needed
export interface AppUser extends GeneralUser {
    // Add app-specific fields here if different from GeneralUser
}

export interface CustomUser {
    uid: string; // Firebase UID
    email: string | null;
    displayName: string | null;
    _id?: string; // MongoDB _id - IMPORTANT: Make sure this is present and correct
    name?: string; // User's display name - IMPORTANT: Make sure this is present and correct
    bio?: string | null;
    avatarUrl?: string | null;
    username?: string;
    // Add any other fields from your user model
}

// --- Call related types (optional but good practice) ---
export interface CallInfoState {
  isReceivingCall: boolean;
  from: string; // Socket ID of the caller
  callerName: string; // Name of the caller (to display)
  callerAvatar: string;
  offer: any; // SDP offer
  callType: 'audio' | 'video';
}

export interface CallingInfoState {
  isOutgoingCall: boolean;
  targetUserId: string; // MongoDB _id of the target user
  targetUserName: string; // Name of the target user (to display)
  targetUserAvatar: string;
  callType: 'audio' | 'video';
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

