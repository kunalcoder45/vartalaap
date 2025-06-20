import React from 'react';
import { XCircle, Image as ImageIcon, Video as VideoIcon, FileText, Music as MusicIcon } from 'lucide-react';

interface MediaPreviewProps {
    file: File;
    previewUrl: string | null; // This will be a Data URL for images/videos
    onRemove: () => void;
    error: string | null;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ file, previewUrl, onRemove, error }) => {
    // Determine icon based on file type
    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return <ImageIcon size={32} />;
        if (fileType.startsWith('video/')) return <VideoIcon size={32} />;
        if (fileType.startsWith('audio/')) return <MusicIcon size={32} />;
        return <FileText size={32} />;
    };

    return (
        <div className="flex flex-col items-start p-3 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center w-full justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Selected File:</span>
                <button
                    onClick={onRemove}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
                    title="Remove selected file"
                >
                    <XCircle size={20} />
                </button>
            </div>
            <div className="flex items-center w-full">
                {previewUrl ? (
                    file.type.startsWith('image/') ? (
                        <img src={previewUrl} alt="Media preview" className="w-16 h-16 object-cover rounded mr-3" />
                    ) : (
                        <video src={previewUrl} controls className="w-16 h-16 object-cover rounded mr-3" />
                    )
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded mr-3 text-gray-500">
                        {getFileIcon(file.type)}
                    </div>
                )}
                <span className="text-gray-800 flex-1 truncate">{file.name}</span>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default MediaPreview;