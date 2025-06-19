
import React from 'react';
import { X } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelected: (file: File) => void;
    selectedFile: File | null;
    visibility: 'public' | 'followers';
    setVisibility: (v: 'public' | 'followers') => void;
    onUpload: () => void;
    uploading: boolean;
    error: string | null;
}

const UploadModal = ({
    isOpen,
    onClose,
    onFileSelected,
    selectedFile,
    visibility,
    setVisibility,
    onUpload,
    uploading,
    error,
}: UploadModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Add to Your Story</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onFileSelected(file);
                            }}
                            className="hidden"
                            id="status-upload"
                        />
                        <label
                            htmlFor="status-upload"
                            className="cursor-pointer block"
                        >
                            {selectedFile ? (
                                <div className="space-y-2">
                                    {selectedFile.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="max-h-48 mx-auto object-contain"
                                        />
                                    ) : (
                                        <video
                                            src={URL.createObjectURL(selectedFile)}
                                            className="max-h-48 mx-auto"
                                            controls
                                        />
                                    )}
                                    <p className="text-sm text-gray-500">
                                        {selectedFile.name}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <p className="text-gray-500">
                                        Click to upload image or video
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Who can see your story?
                        </label>
                        <select
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value as 'public' | 'followers')}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option
                                value="public"
                                className="bg-white text-gray-800 hover:bg-blue-100 cursor-pointer"
                            >
                                🌐 Public - Visible to everyone
                            </option>
                            <option
                                value="followers"
                                className="bg-white text-gray-800 hover:bg-blue-100 cursor-pointer"
                            >
                                👥 Followers - Only your followers can view
                            </option>
                        </select>

                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        onClick={onUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Share to Story'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;