'use client';
import { Video, ImageIcon, Smile, SendHorizontal } from 'lucide-react';
import { useAuth } from '../AuthProvider';

const page = () => {
    const { user } = useAuth();
    return (
        <div className="flex-grow p-4 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto">
            <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center space-x-3">
                    <img
                        src={user.photoURL}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                    />
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        className="flex-grow p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-around text-gray-600">
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Video size={20} className="text-red-500 mr-2" />
                        <span>Go Live</span>
                    </button>
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <ImageIcon size={20} className="text-green-500 mr-2" />
                        <span>Photo</span>
                    </button>
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Video size={20} className="text-purple-500 mr-2" />
                        <span>Video</span>
                    </button>
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Smile size={20} className="text-yellow-500 mr-2" />
                        <span>Feeling</span>
                    </button>
                    <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors ">
                        <SendHorizontal size={20} className="text-blue-500 mr-2" />
                        <span>Post</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default page