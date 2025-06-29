'use client';

import React from 'react';
import MainContent from './mainContent';
import ActionSection from './actionSection';

interface MainBarProps {
    className?: string;
}

const MainBar = ({ className }: MainBarProps) => {
    // We'll use a consistent height adjustment for both mobile and desktop
    // based on the Navbar's height.
    // Let's assume Navbar height is around 80px based on common designs.
    // You might need to adjust this '80px' value if your Navbar is different.
    const navbarHeight = '80px'; // Adjust this value if your Navbar has a different fixed height
    const desktopAdjustment = '105px'; // This was your previous desktop adjustment

    return (
        <div
            className={`
                flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto hide-scrollbar rounded-3xl
                h-[calc(100vh-${navbarHeight})] /* Mobile: Full viewport height minus Navbar */
                md:h-[calc(100vh-${desktopAdjustment})] /* Desktop: Your specified height */
                ${className || ''}
            `}
        >
            <ActionSection />
            <MainContent />
        </div>
    );
};

export default MainBar;