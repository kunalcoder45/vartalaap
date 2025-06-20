// // app/types.ts

// export interface GeneralUser {
//     _id: string;
//     username: string; // Keep this if it's used for login/unique identifier
//     name: string;     // <--- ADD THIS: Required for display in ChatHeader, as per error
//     email?: string;
//     avatarUrl?: string;
//     // ... any other user-related fields
// }

// export interface Message {
//     _id: string;
//     conversationId: string;
//     sender: GeneralUser;
//     receiver: string;
//     content: string;
//     mediaUrl?: string;
//     mediaType?: 'image' | 'video' | 'audio' | 'file';
//     createdAt: string;
//     updatedAt?: string;
//     isDeleted?: boolean;
//     isEdited?: boolean;
// }



// app/types.ts
export interface Message {
    _id: string;
    conversationId: string;
    sender: GeneralUser; // Assuming sender is populated with GeneralUser fields
    receiver: string; // Or GeneralUser if you populate it
    content: string;
    mediaUrl?: string; // Optional for media messages
    mediaType?: 'image' | 'video' | 'audio' | 'file'; // Optional for media messages
    isDeleted: boolean;
    isEdited: boolean; // Add this field
    createdAt: string;
    updatedAt: string;
}

export interface GeneralUser {
    _id: string;
    name: string; // Assuming 'name' is always available
    username?: string; // Optional, depending on your user schema
    avatarUrl?: string;
    email?: string;
}