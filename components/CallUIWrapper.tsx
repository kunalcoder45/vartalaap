'use client';

import React from 'react';
import { useCall } from '../app/context/CallProvider';
import IncomingCallPopup from './IncomingCallPopup';
import OutgoingCallPopup from './OutgoingCallPopup'; // New import
import CallScreen from '../components/chat/CallScreen';

const CallUIWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    isReceivingCall, callInfo,
    isOutgoingCall, callingInfo,
    isCallActive,
    answerCall, declineCall, endCall
  } = useCall();

  return (
    <>
      {children}

      {isReceivingCall && callInfo && (
        <IncomingCallPopup
          callerName={callInfo.callerName}
          onAccept={answerCall}
          onDecline={declineCall}
        />
      )}

      {isOutgoingCall && callingInfo && (
        <OutgoingCallPopup
          targetName={callingInfo.targetUserName}
          targetAvatar={callingInfo.targetUserAvatar}
          onEndCall={declineCall} // Decline/End outgoing call
        />
      )}

      {isCallActive && (
        <CallScreen />
      )}
    </>
  );
};

export default CallUIWrapper;