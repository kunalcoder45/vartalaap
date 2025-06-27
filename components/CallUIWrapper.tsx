'use client';

import React from 'react';
import { useCall } from '../app/context/CallProvider';
import IncomingCallPopup from './IncomingCallPopup';
import OutgoingCallPopup from './OutgoingCallPopup';
import CallScreen from '../components/chat/CallScreen';

const CallUIWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    isReceivingCall, callInfo,
    isOutgoingCall, callingInfo,
    isCallActive,
    answerCall, declineCall, endCall
  } = useCall();

  // IMPORTANT: Keep these logs enabled
  console.log('CallUIWrapper Render (from useCall):');
  console.log('  isReceivingCall:', isReceivingCall);
  console.log('  callInfo:', callInfo);
  console.log('  isOutgoingCall:', isOutgoingCall);
  console.log('  callingInfo:', callingInfo);
  console.log('  isCallActive:', isCallActive);

  // FIXED: Better logic to determine active call information
  let activeCallName = '';
  let activeCallAvatar = null;

  if (isCallActive) {
    // For outgoing calls (caller side)
    if (callingInfo && callingInfo.targetUserName) {
      activeCallName = callingInfo.targetUserName;
      activeCallAvatar = callingInfo.targetUserAvatar || null;
      console.log('CallUIWrapper: Using callingInfo for active call (outgoing)');
    }
    // For incoming calls (receiver side) 
    else if (callInfo && callInfo.callerName) {
      activeCallName = callInfo.callerName;
      activeCallAvatar = callInfo.callerAvatar || null;
      console.log('CallUIWrapper: Using callInfo for active call (incoming)');
    }
    // Fallback - try both again with different priority
    else if (callInfo?.callerName) {
      activeCallName = callInfo.callerName;
      activeCallAvatar = callInfo.callerAvatar || null;
      console.log('CallUIWrapper: Using callInfo as fallback for active call');
    }
    else if (callingInfo?.targetUserName) {
      activeCallName = callingInfo.targetUserName;
      activeCallAvatar = callingInfo.targetUserAvatar || null;
      console.log('CallUIWrapper: Using callingInfo as fallback for active call');
    }
  }

  // IMPORTANT: Keep these logs enabled to see what's being passed to CallScreen
  console.log('CallUIWrapper: Values calculated for CallScreen:');
  console.log('  activeCallName:', activeCallName);
  console.log('  activeCallAvatar:', activeCallAvatar);
  console.log('  activeCallName length:', activeCallName.length);
  console.log('  activeCallName truthy:', !!activeCallName);

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
          onEndCall={declineCall}
        />
      )}

      {isCallActive && (
        <CallScreen
          targetName={activeCallName}
          targetAvatar={activeCallAvatar}
        />
      )}
    </>
  );
};

export default CallUIWrapper;