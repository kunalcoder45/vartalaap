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
















// export interface Message {
//   _id: string;
//   conversationId: string;
//   sender: GeneralUser;
//   receiver: string;
//   content: string;
//   mediaUrl?: string;
//   mediaType?: 'image' | 'video' | 'audio' | 'file';
//   isDeleted: boolean;
//   isEdited: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface GeneralUser {
//   _id: string;
//   name: string;
//   username?: string;
//   avatarUrl?: string;
//   email?: string;
//   // Add any other fields you typically expect for a general user profile
// }

// // AppUser could be an alias for GeneralUser or a more specific type if needed
// export interface AppUser extends GeneralUser {
//   // Add app-specific fields here if different from GeneralUser
// }

// export interface CustomUser {
//   uid: string;
//   email: string | null;
//   displayName: string | null;
//   _id?: string; // MongoDB _id
//   name?: string;
//   bio?: string | null;
//   avatarUrl?: string | null;
//   username?: string;
//   mongoUserId: string;
// }


// // --- Call related types (optional but good practice) ---
// export interface CallInfoState {
//   isReceivingCall: boolean;
//   from: string; // Socket ID of the caller
//   callerName: string; // Name of the caller (to display)
//   callerAvatar: string;
//   offer: any; // SDP offer
//   callType: 'audio' | 'video';
// }

// export interface CallingInfoState {
//   isOutgoingCall: boolean;
//   targetUserId: string; // MongoDB _id of the target user
//   targetUserName: string; // Name of the target user (to display)
//   targetUserAvatar: string;
//   callType: 'audio' | 'video';
// }

// clie// client/app/types.ts

































// This interface represents the user object as it comes directly from your MongoDB backend.
export interface MongoUser {
  _id: string; // MongoDB primary key (required from backend)
  name: string;
  email: string;
  username?: string; // Ensure username is here
  avatarUrl?: string;
  bio?: string;
  firebaseUid: string; // To link with Firebase user
}

// This interface represents a general user profile used in various parts,
// especially for lists of users (like followers, following, chat participants).
// This is the one that should be imported as 'GeneralUser' throughout the app.
export interface GeneralUser {
  _id: string;
  name: string;
  username?: string; // **Crucial: Added/confirmed this property**
  avatarUrl?: string | null;
  email?: string;
  firebaseUid?: string;
}

// This interface represents the user object as consolidated for the frontend,
// combining Firebase data with relevant backend (MongoDB) profile data.
export interface CustomUser {
  _id: string; // CORRECTED: This should be the MongoDB user ID.
  uid: string; // Firebase UID (required)
  email: string | null; // Firebase email
  displayName: string | null; // Firebase display name
  photoURL: string | null; // Firebase photo URL (now required, but can be null)

  // Properties that might come from your MongoDB backend profile
  mongoUserId?: string; // This seems redundant if _id is already the MongoDB ID. Consider removing if _id serves this purpose.
                        // If it's *distinct* from _id, keep it. Otherwise, rely on _id.
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  username?: string; // Ensure username is here
  firebaseUid?: string; // ADDED: To match the structure your Navbar is expecting
}

// Interface for a Post
export interface Post {
  _id: string;
  text: string;
  likes: number;
  sharesBy?: number;
  author: {
    _id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    firebaseUid: string;
  };
  isLiked?: boolean;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  commentsCount?: number;
}

// Interface for a Message in conversations
export interface Message {
  _id: string;
  conversationId: string;
  sender: GeneralUser; // Use GeneralUser here
  receiver?: GeneralUser; // Use GeneralUser here
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for Notifications
export interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    avatarUrl?: string | null;
    firebaseUid?: string;
  };
  link?: string;
  data?: {
    postId?: string;
    commentId?: string;
    requestId?: string;
  };
}

// Interface for Search Results for users
export interface UserResult {
  _id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  firebaseUid: string;
}

// --- Call related types ---
export interface CallInfoState {
  isReceivingCall: boolean;
  from: string; // Socket ID of the caller
  callerName: string;
  callerAvatar: string;
  offer: any; // SDP offer
  callType: 'audio' | 'video';
  callerMongoId: string; // MongoDB ID of the caller (NOW REQUIRED)
}

export interface CallingInfoState {
  isOutgoingCall: boolean;
  targetUserId: string; // MongoDB _id of the target user
  targetUserName: string;
  targetUserAvatar: string;
  callType: 'audio' | 'video';
}


export interface ChatParticipant {
  _id: string;             // MongoDB ID
  uid: string;             // Firebase UID (REQUIRED!)
  email: string | null;
  name: string;
  displayName?: string;
  username?: string;       // ✅ For display fallback
  avatarUrl?: string;
  photoURL?: string;
  bio?: string;

  lastMessageContent?: string;       // ✅ Used in ChatList
  lastMessageTimestamp?: string;     // ✅ Used in ChatList
}
