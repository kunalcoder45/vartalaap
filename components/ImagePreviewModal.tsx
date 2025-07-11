// components/ImagePreviewModal.tsx
import React from 'react';
import { XCircle } from 'lucide-react';

interface ImagePreviewModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center"
            onClick={onClose} // Close on backdrop click
        >
            <div className="relative h-[88vh] max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <img
                    src={imageUrl}
                    alt="Full size preview"
                    className="w-full h-full object-contain"
                />
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 text-black cursor-pointer rounded-full p-2"
                    aria-label="Close image preview"
                >
                    <XCircle size={24} />
                </button>
            </div>
        </div>
    );
};

export default ImagePreviewModal;