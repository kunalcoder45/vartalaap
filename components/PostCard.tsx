// // PostCard.jsx
// 'use client';

// import Image from 'next/image';
// import { Smile, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';

// const PostCard = ({ post, handleLike, handleShare }) => {
//     return (
//         <div className="bg-white rounded-lg shadow-md m-4 p-4">
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-3">
//                     <img
//                         src={post.authorAvatarUrl || '/avatars/user-default.jpg'}
//                         alt={post.author}
//                         className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                     />
//                     <div>
//                         <p className="font-semibold text-gray-800">{post.authorName}</p>
//                         <p className="text-gray-500 text-sm">{post.time}</p>
//                     </div>
//                 </div>
//                 <button className="text-gray-500 hover:text-gray-800">
//                     <span className="text-2xl font-bold leading-none">...</span>
//                 </button>
//             </div>

//             <p className="text-gray-700 mb-4">{post.text}</p>

//             <div className="mb-4 rounded-lg overflow-hidden">
//                 <Image
//                     src={post.imageUrl || '/images/default-post.jpg'}
//                     alt="Post Image"
//                     width={600}
//                     height={400}
//                     layout="responsive"
//                     className="rounded-lg object-cover"
//                     priority
//                 />
//             </div>

//             <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
//                 <div className="flex items-center space-x-4">
//                     <button
//                         onClick={() => handleLike(post._id, post.likes, post.isLiked)} // Pass post ID and current like state
//                         className={`flex items-center p-2 rounded-full transition-colors ${
//                             post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
//                         }`}
//                     >
//                         <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
//                         <span>{post.likes}</span>
//                     </button>
//                     <button className="flex items-center p-2 rounded-full hover:bg-gray-100">
//                         <MessageSquare size={16} className="mr-1" />
//                         <span>{post.commentsCount}</span>
//                     </button>
//                 </div>
//                 <button
//                     onClick={() => handleShare(post._id, post.shares)} // Pass post ID and current share count
//                     className="flex items-center p-2 rounded-full hover:bg-gray-100"
//                 >
//                     <Share2 size={16} className="mr-1" />
//                     <span>{post.shares}</span>
//                 </button>
//             </div>

//             <hr className="my-4 border-gray-200" />

//             {/* Comment Section (can be moved to its own component later) */}
//             <div className="flex items-center space-x-3 mb-4">
//                 <img
//                     src={'/avatars/user-default.jpg'}
//                     alt="User Avatar"
//                     className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div className="relative flex-grow">
//                     <input
//                         type="text"
//                         placeholder="Write your comment"
//                         className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
//                     />
//                     <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
//                 </div>
//             </div>

//             <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
//                 <img
//                     src={'/avatars/annalise-hane.jpg'}
//                     alt="Annalise Hane"
//                     className="w-8 h-8 rounded-full object-cover mt-1"
//                 />
//                 <div>
//                     <p className="font-semibold text-gray-800">Annalise Hane</p>
//                     <p className="text-gray-700 text-sm">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
//                 </div>
//             </div>
//             <div className="text-center mt-3">
//                 <button className="text-blue-600 text-sm hover:underline">View all comments</button>
//             </div>
//         </div>
//     );
// };

// export default PostCard;




// PostCard.jsx
'use client';

import Image from 'next/image';
import { Smile, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import Skeleton from 'react-loading-skeleton'; // <-- Skeleton इम्पोर्ट करें
import 'react-loading-skeleton/dist/skeleton.css'; // <-- Skeleton CSS इम्पोर्ट करें

const PostCard = ({ post, handleLike, handleShare, loading }) => { // <-- loading prop प्राप्त करें
    if (loading) {
        // यह स्केलेटन लोडिंग स्टेट है
        return (
            <div className="bg-white rounded-lg shadow-md m-4 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Skeleton circle width={48} height={48} /> {/* अवतार के लिए सर्कल */}
                        <div>
                            <Skeleton width={120} height={20} /> {/* लेखक के नाम के लिए */}
                            <Skeleton width={80} height={14} style={{ marginTop: '4px' }} /> {/* समय के लिए */}
                        </div>
                    </div>
                    <Skeleton width={20} height={20} /> {/* '...' बटन के लिए */}
                </div>

                <Skeleton count={2} height={16} style={{ marginBottom: '16px' }} /> {/* टेक्स्ट के लिए */}

                <Skeleton height={200} style={{ marginBottom: '16px', borderRadius: '8px' }} /> {/* इमेज के लिए */}

                <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton width={80} height={32} borderRadius={999} /> {/* लाइक बटन के लिए */}
                        <Skeleton width={80} height={32} borderRadius={999} /> {/* कमेंट बटन के लिए */}
                    </div>
                    <Skeleton width={80} height={32} borderRadius={999} /> {/* शेयर बटन के लिए */}
                </div>

                <hr className="my-4 border-gray-200" />

                {/* कमेंट सेक्शन के लिए स्केलेटन */}
                <div className="flex items-center space-x-3 mb-4">
                    <Skeleton circle width={40} height={40} />
                    <Skeleton height={40} className="flex-grow" borderRadius={999} />
                </div>

                <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                    <Skeleton circle width={32} height={32} />
                    <div>
                        <Skeleton width={100} height={18} />
                        <Skeleton count={1} height={14} width={250} style={{ marginTop: '4px' }} />
                    </div>
                </div>
                <div className="text-center mt-3">
                    <Skeleton width={150} height={20} />
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg shadow-md m-4 p-4 mt-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={post.authorAvatarUrl || '/avatars/user-default.jpg'}
                        alt={post.authorName} // post.author के बजाय post.authorName इस्तेमाल करें
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <p className="font-semibold text-gray-800">{post.authorName}</p>
                        <p className="text-gray-500 text-sm">{post.time}</p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-gray-800">
                    <span className="text-2xl font-bold leading-none">...</span>
                </button>
            </div>

            <p className="text-gray-700 mb-4">{post.text}</p>

            <div className="mb-4 rounded-lg overflow-hidden">
                <Image
                    src={post.imageUrl || '/images/default-post.jpg'}
                    alt="Post Image"
                    width={600}
                    height={400}
                    layout="responsive"
                    className="rounded-lg object-cover"
                    priority
                />
            </div>

            <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleLike(post._id, post.likes, post.isLiked)}
                        className={`flex items-center p-2 rounded-full transition-colors ${
                            post.isLiked ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                    >
                        <ThumbsUp size={16} className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} />
                        <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center p-2 rounded-full hover:bg-gray-100">
                        <MessageSquare size={16} className="mr-1" />
                        <span>{post.commentsCount}</span>
                    </button>
                </div>
                <button
                    onClick={() => handleShare(post._id, post.shares)}
                    className="flex items-center p-2 rounded-full hover:bg-gray-100"
                >
                    <Share2 size={16} className="mr-1" />
                    <span>{post.shares}</span>
                </button>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Comment Section (आप इसे भी डायनामिक कर सकते हैं) */}
            <div className="flex items-center space-x-3 mb-4">
                <img
                    src={'/avatars/user-default.jpg'}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Write your comment"
                        className="w-full p-2 pl-4 pr-10 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <Smile size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" />
                </div>
            </div>

            <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                <img
                    src={'/avatars/annalise-hane.jpg'}
                    alt="Annalise Hane"
                    className="w-8 h-8 rounded-full object-cover mt-1"
                />
                <div>
                    <p className="font-semibold text-gray-800">Annalise Hane</p>
                    <p className="text-gray-700 text-sm">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
                </div>
            </div>
            <div className="text-center mt-3">
                <button className="text-blue-600 text-sm hover:underline">View all comments</button>
            </div>
        </div>
    );
};

export default PostCard;