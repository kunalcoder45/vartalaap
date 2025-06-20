// components/MessageSelectionMenu.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';

interface MessageSelectionMenuProps {
    menuRef: React.RefObject<HTMLDivElement>;
    onDeleteSelected: () => void;
    onDeleteAll: () => void;
}

const MessageSelectionMenu: React.FC<MessageSelectionMenuProps> = ({ menuRef, onDeleteSelected, onDeleteAll }) => {
    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1"
        >
            <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={onDeleteSelected}
            >
                <Trash2 size={16} className="mr-2" /> Delete Selected
            </button>
            <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={onDeleteAll}
            >
                <Trash2 size={16} className="mr-2" /> Delete All
            </button>
        </div>
    );
};

export default MessageSelectionMenu;    