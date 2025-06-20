// // // client/components/MessageBubble.tsx
// // import React, { useState } from 'react';
// // import { format } from 'date-fns';
// // import { ZoomIn, FileText } from 'lucide-react'; // Added FileText
// // import Image from 'next/image';

// // interface MessageBubbleProps {
// //     message: {
// //         _id: string;
// //         sender: { _id: string; username: string; avatarUrl?: string };
// //         content?: string;
// //         mediaUrl?: string;
// //         mediaType?: 'image' | 'video' | 'audio' | 'file';
// //         createdAt: string;
// //         isDeleted?: boolean;
// //         isEdited?: boolean;
// //     };
// //     isCurrentUser: boolean;
// //     onSelect: (messageId: string) => void;
// //     isSelected: boolean;
// //     getFullMediaUrl: (relativePath: string) => string;
// //     onViewImage: (imageUrl: string) => void; // For image preview
// // }

// // const MessageBubble: React.FC<MessageBubbleProps> = ({
// //     message,
// //     isCurrentUser,
// //     onSelect,
// //     isSelected,
// //     getFullMediaUrl,
// //     onViewImage,
// // }) => {
// //     const messageDate = new Date(message.createdAt);
// //     const formattedTime = format(messageDate, 'hh:mm a');
// //     const formattedDate = format(messageDate, 'MMM dd, yyyy');

// //     const bubbleClasses = `
// //         relative p-2 rounded-lg max-w-[75%] break-words shadow-sm
// //         ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
// //         ${message.isDeleted ? 'opacity-60 italic' : ''}
// //     `;

// //     const handleMediaClick = () => {
// //         if (message.mediaUrl && message.mediaType === 'image') {
// //             onViewImage(getFullMediaUrl(message.mediaUrl));
// //         }
// //         // Potentially handle video/audio/file clicks here (e.g., open in new tab)
// //         if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
// //             window.open(getFullMediaUrl(message.mediaUrl), '_blank');
// //         }
// //     };

// //     return (
// //         <div
// //             className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
// //             onClick={() => onSelect(message._id)}
// //         >
// //             <div
// //                 className={`${bubbleClasses} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
// //             >
// //                 {message.mediaUrl && (
// //                     <div
// //                         className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
// //                         onClick={handleMediaClick}
// //                     >
// //                         {message.mediaType === 'image' && (
// //                             <>
// //                                 <Image
// //                                     src={getFullMediaUrl(message.mediaUrl)}
// //                                     alt="Sent media"
// //                                     width={200}
// //                                     height={200}
// //                                     layout="responsive"
// //                                     objectFit="cover"
// //                                     className="rounded-lg max-h-[300px] w-auto h-auto"
// //                                 />
// //                                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
// //                                     <ZoomIn className="text-white text-3xl" />
// //                                 </div>
// //                             </>
// //                         )}
// //                         {message.mediaType === 'video' && (
// //                             <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
// //                                 <video
// //                                     src={getFullMediaUrl(message.mediaUrl)}
// //                                     controls
// //                                     className="max-h-full max-w-full rounded-lg"
// //                                 >
// //                                     Your browser does not support the video tag.
// //                                 </video>
// //                             </div>
// //                         )}
// //                         {message.mediaType === 'audio' && (
// //                             <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
// //                                 <audio controls className="w-full">
// //                                     <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
// //                                     Your browser does not support the audio element.
// //                                 </audio>
// //                             </div>
// //                         )}
// //                         {message.mediaType === 'file' && (
// //                             <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
// //                                 <FileText size={24} />
// //                                 <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
// //                             </div>
// //                         )}
// //                     </div>
// //                 )}

// //                 {message.content && (
// //                     <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
// //                         {message.content}
// //                     </p>
// //                 )}

// //                 <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} flex items-center justify-end w-full`}>
// //                     {message.isEdited && <span className="mr-1">(edited)</span>}
// //                     {formattedTime}
// //                 </div>
// //             </div>
// //             {isSelected && (
// //                 <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
// //                     {formattedDate}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default MessageBubble;


// // client/components/MessageBubble.tsx
// import React, { useState } from 'react';
// import { format } from 'date-fns';
// import { ZoomIn, FileText } from 'lucide-react';
// import Image from 'next/image';

// // Assuming User interface is imported or defined consistently
// // If you have a global types file, it's better to import from there
// // For now, let's assume it's defined here or will be consistent
// interface BubbleUser { // Renamed to BubbleUser to avoid conflict if `User` is globally defined
//     _id: string;
//     username: string; // Required for display
//     avatarUrl?: string;
// }

// interface MessageBubbleProps {
//     message: {
//         _id: string;
//         sender: BubbleUser; // Ensure this matches what comes from MessageList
//         content?: string;
//         mediaUrl?: string;
//         mediaType?: 'image' | 'video' | 'audio' | 'file';
//         createdAt: string;
//         isDeleted?: boolean;
//         isEdited?: boolean;
//     };
//     isCurrentUser: boolean;
//     onSelect: (messageId: string) => void;
//     isSelected: boolean;
//     getFullMediaUrl: (relativePath?: string) => string; // Made optional argument
//     onViewImage: (imageUrl: string) => void; // Changed from onOpenImagePreview to onViewImage
// }

// const MessageBubble: React.FC<MessageBubbleProps> = ({
//     message,
//     isCurrentUser,
//     onSelect,
//     isSelected,
//     getFullMediaUrl,
//     onViewImage, // Changed prop name
// }) => {
//     const messageDate = new Date(message.createdAt);
//     const formattedTime = format(messageDate, 'hh:mm a');
//     const formattedDate = format(messageDate, 'MMM dd, yyyy'); // Fixed typo in year format

//     const bubbleClasses = `
//         relative p-2 rounded-lg max-w-[75%] break-words shadow-sm
//         ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
//         ${message.isDeleted ? 'opacity-60 italic' : ''}
//     `;

//     const handleMediaClick = () => {
//         if (message.mediaUrl && message.mediaType === 'image') {
//             onViewImage(getFullMediaUrl(message.mediaUrl)); // Call onViewImage
//         }
//         if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
//             window.open(getFullMediaUrl(message.mediaUrl), '_blank');
//         }
//     };

//     return (
//         <div
//             className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
//             // Added onClick for selection
//             onClick={() => onSelect(message._id)}
//         >
//             <div
//                 className={`${bubbleClasses} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
//             >
//                 {message.mediaUrl && (
//                     <div
//                         className="relative mb-2 cursor-pointer rounded-lg overflow-hidden"
//                         onClick={handleMediaClick}
//                     >
//                         {message.mediaType === 'image' && (
//                             <>
//                                 <Image
//                                     src={getFullMediaUrl(message.mediaUrl)}
//                                     alt="Sent media"
//                                     width={200}
//                                     height={200}
//                                     layout="responsive"
//                                     objectFit="cover"
//                                     className="rounded-lg max-h-[300px] w-auto h-auto"
//                                 />
//                                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
//                                     <ZoomIn className="text-white text-3xl" />
//                                 </div>
//                             </>
//                         )}
//                         {message.mediaType === 'video' && (
//                             <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
//                                 <video
//                                     src={getFullMediaUrl(message.mediaUrl)}
//                                     controls
//                                     className="max-h-full max-w-full rounded-lg"
//                                 >
//                                     Your browser does not support the video tag.
//                                 </video>
//                             </div>
//                         )}
//                         {message.mediaType === 'audio' && (
//                             <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
//                                 <audio controls className="w-full">
//                                     <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
//                                     Your browser does not support the audio element.
//                                 </audio>
//                             </div>
//                         )}
//                         {message.mediaType === 'file' && (
//                             <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
//                                 <FileText size={24} />
//                                 <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {message.content && (
//                     <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
//                         {message.content}
//                     </p>
//                 )}

//                 <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} flex items-center justify-end w-full`}>
//                     {message.isEdited && <span className="mr-1">(edited)</span>}
//                     {formattedTime}
//                 </div>
//             </div>
//             {isSelected && (
//                 <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
//                     {formattedDate}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MessageBubble;




// app/MessageBubble.tsx (Example structure if you still have it)
import React from 'react';
import Image from 'next/image'; // Or <img> if not Next.js Image
import { format } from 'date-fns';
import { FileText, ZoomIn } from 'lucide-react';

interface Message {
    _id: string;
    conversationId: string;
    sender: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    content?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'file';
    createdAt: string;
    isDeleted?: boolean;
    isEdited?: boolean;
}

interface MessageBubbleProps {
    message: Message;
    isCurrentUser: boolean;
    currentUserId: string; // Needed if MessageBubble handles context menu or edit/delete logic
    getFullMediaUrl: (relativePath?: string) => string;
    onOpenImagePreview: (imageUrl: string) => void;
    isSelected: boolean;
    onSelect: (messageId: string) => void; // <--- This is the key prop it must accept
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isCurrentUser,
    currentUserId,
    getFullMediaUrl,
    onOpenImagePreview,
    isSelected,
    onSelect, // Destructure it here
}) => {
    const messageDate = new Date(message.createdAt);
    const formattedTime = format(messageDate, 'hh:mm a');
    const formattedDate = format(messageDate, 'MMM dd, yyyy');

    const bubbleClasses = `
        relative p-2 rounded-lg max-w-[75%] break-words shadow-sm
        ${isCurrentUser ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}
        ${message.isDeleted ? 'opacity-60 italic' : ''}
    `;

    const handleMediaClick = () => {
        if (message.mediaUrl && message.mediaType === 'image') {
            onOpenImagePreview(getFullMediaUrl(message.mediaUrl));
        }
        if (message.mediaUrl && (message.mediaType === 'video' || message.mediaType === 'audio' || message.mediaType === 'file')) {
            window.open(getFullMediaUrl(message.mediaUrl), '_blank');
        }
    };

    return (
        <div
            className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
            onClick={() => onSelect(message._id)} // <--- Call the onSelect prop here
        >
            <div
                className={`${bubbleClasses} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
            >
                {message.mediaUrl && (
                    <div
                        className="relative mb-2 cursor-pointer rounded-full overflow-hidden"
                        onClick={handleMediaClick}
                    >
                        {message.mediaType === 'image' && (
                            <>
                                <Image
                                    src={getFullMediaUrl(message.mediaUrl)}
                                    alt={message.content || "Sent image"}
                                    width={200} // Add width/height if using next/image
                                    height={200}
                                    layout="responsive"
                                    objectFit="cover"
                                    className="rounded-lg max-h-[300px] w-auto h-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                    <ZoomIn className="text-white text-3xl" />
                                </div>
                            </>
                        )}
                        {message.mediaType === 'video' && (
                            <div className="relative w-full h-[200px] bg-black flex items-center justify-center rounded-lg">
                                <video
                                    src={getFullMediaUrl(message.mediaUrl)}
                                    controls
                                    className="max-h-full max-w-full rounded-lg"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                        {message.mediaType === 'audio' && (
                            <div className="relative w-full px-4 py-3 bg-gray-700 rounded-lg">
                                <audio controls className="w-full">
                                    <source src={getFullMediaUrl(message.mediaUrl)} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                        {message.mediaType === 'file' && (
                            <div className="relative px-4 py-3 bg-gray-700 text-white rounded-lg flex items-center space-x-2">
                                <FileText size={24} />
                                <span className="truncate max-w-[150px]">{message.mediaUrl.split('/').pop()}</span>
                            </div>
                        )}
                    </div>
                )}

                {message.content && (
                    <p className={`text-sm ${message.isDeleted ? 'text-gray-600' : ''}`}>
                        {message.content}
                    </p>
                )}

                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} flex items-center justify-end w-full`}>
                    {message.isEdited && <span className="mr-1">(edited)</span>}
                    {formattedTime}
                </div>
            </div>
            {isSelected && (
                <div className={`text-xs mt-1 px-2 py-1 rounded-md ${isCurrentUser ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'}`}>
                    {formattedDate}
                </div>
            )}
        </div>
    );
};

export default MessageBubble;