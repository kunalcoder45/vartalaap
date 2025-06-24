export interface Message {
    _id: string;
    conversationId: string;
    sender: GeneralUser;  // Sender is a full user object
    receiver: string;     // Receiver is just an ID (or could be a user)
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

