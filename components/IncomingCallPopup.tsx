'use client';

import React from 'react';

interface IncomingCallPopupProps {
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallPopup: React.FC<IncomingCallPopupProps> = ({ callerName, onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex flex-col justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{callerName} is calling...</h2>
        <div className="flex justify-around">
          <button onClick={onAccept} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Accept
          </button>
          <button onClick={onDecline} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;