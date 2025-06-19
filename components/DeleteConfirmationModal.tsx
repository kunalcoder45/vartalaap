// client/components/DeleteConfirmationModal.tsx
'use client';

import React from 'react';

interface DeleteConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    message,
    onConfirm,
    onCancel,
    title = 'Confirm Deletion',
}) => {
    return (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm overflow-hidden transform transition-opacity duration-300 ease-out animate-scale-in">
                {/* Optional Title */}
                {title && (
                    <div className="px-6 py-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                )}

                {/* Message */}
                <div className="px-6 py-2 text-center">
                    <p className="text-gray-700 text-sm">{message}</p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-blue-600 font-medium text-center border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 text-red-600 font-medium text-center hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;