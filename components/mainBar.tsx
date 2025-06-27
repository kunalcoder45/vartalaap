// client/components/mainBar.tsx
'use client'; // <-- Add this line

import React from 'react';
import MainContent from './mainContent'; // Adjust path if necessary
import ActionSection from './actionSection'; // Adjust path if necessary

// Define the props interface for MainBar
interface MainBarProps {
    className?: string; // Add this line to accept className
    heightAdjustment?: string; // Optional: if you want to pass this from parent
}

const MainBar = ({ className, heightAdjustment = '105px' }: MainBarProps) => {
    // heightAdjustment can be passed as a prop, or defaulted here.
    // If you always want it to be '105px' regardless of parent, remove heightAdjustment from props and keep it as a const.

    return (
        // Apply scrolling and height to this parent div
        <div
            className={`flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto hide-scrollbar rounded-3xl ${className || ''}`} // Apply className here
            style={{ height: `calc(100vh - ${heightAdjustment})`}}
        >
            <ActionSection />
            <MainContent />
        </div>
    );
};

export default MainBar;