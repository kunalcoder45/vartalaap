import React from 'react'
import MainContent from './mainContent'
import ActionSection from './actionSection'

const MainBar = () => {
    // You can define heightAdjustment here or pass it as a prop if needed from a grand-parent
    const heightAdjustment = '105px'; // Example: adjust based on header/footer height

    return (
        // Apply scrolling and height to this parent div
        <div
            className="flex-grow p-0 pt-0 space-y-6 overflow-y-auto max-w-2xl mx-auto hide-scrollbar rounded-3xl"
            style={{ height: `calc(100vh - ${heightAdjustment})` }}
        >
            <ActionSection />
            <MainContent />
        </div>
    )
}

export default MainBar;