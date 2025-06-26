'use client';

import { useCall } from '../../app/context/CallProvider';
import { Phone, VideoOff, MicOff, PhoneOff } from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';

const CallScreen = () => {
  const {
    stream,
    remoteStream,
    endCall,
    isCallActive,
    callInfo,     // Destructure callInfo
    callingInfo,  // Destructure callingInfo
  } = useCall();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Determine if it's a video call
  const isVideoCall =
    (stream && stream.getVideoTracks().length > 0) ||
    (remoteStream && remoteStream.getVideoTracks().length > 0);

  // Effect to set the srcObject for the remote audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && !isVideoCall) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(e => {
        console.warn("CallScreen: Failed to autoplay remote audio (likely autoplay policy):", e);
      });
    }
  }, [remoteStream, isVideoCall]);


  const toggleMic = useCallback(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMicMuted(!track.enabled);
      });
      console.log(`CallScreen: Mic toggled to ${!isMicMuted ? 'muted' : 'unmuted'}`);
    }
  }, [stream, isMicMuted]);

  const toggleCamera = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
      console.log(`CallScreen: Camera toggled to ${!isCameraOff ? 'off' : 'on'}`);
    }
  }, [stream, isCameraOff]);

  // IMPORTANT: Add these logs here to debug
  useEffect(() => {
    console.log("CallScreen Render - isCallActive:", isCallActive);
    console.log("CallScreen Render - callInfo:", callInfo);
    console.log("CallScreen Render - callingInfo:", callingInfo);
    if (callInfo) {
      console.log("CallScreen Render - callInfo.isReceivingCall:", callInfo.isReceivingCall);
      console.log("CallScreen Render - callInfo.callerName:", callInfo.callerName);
    }
    if (callingInfo) {
      console.log("CallScreen Render - callingInfo.isOutgoingCall:", callingInfo.isOutgoingCall);
      console.log("CallScreen Render - callingInfo.targetUserName:", callingInfo.targetUserName);
    }
  }, [isCallActive, callInfo, callingInfo]);


  if (!isCallActive) {
    return null;
  }

  // Determine the display name based on whether it's an incoming or outgoing call
  let displayName = '';
  if (callInfo?.isReceivingCall) {
    displayName = callInfo.callerName; // For receiver, show the caller's name
  } else if (callingInfo?.isOutgoingCall) {
    displayName = callingInfo.targetUserName; // For caller, show the target's name
  }

  // Log the final displayName
  console.log("CallScreen Render - Final displayName:", displayName);


  // Render full video screen for video calls
  if (isVideoCall) {
    return (
      <div className="fixed inset-0 bg-black z-40 flex justify-center items-center">
        {/* Remote video stream */}
        {remoteStream && (
          <video
            autoPlay
            playsInline
            ref={el => el && (el.srcObject = remoteStream)}
            className="w-full h-full object-cover"
          />
        )}
        {/* Local video stream (muted to prevent self-echo) */}
        {stream && (
          <video
            muted
            autoPlay
            playsInline
            ref={el => el && (el.srcObject = stream)}
            className="w-40 h-40 object-cover absolute bottom-4 right-4 rounded-lg border-2 border-white"
          />
        )}

        {/* Display name at the top or a suitable location */}
        {displayName && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-3xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            {displayName}
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4 p-3 bg-gray-800 rounded-full shadow-lg">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
            title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            <MicOff size={24} />
          </button>
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            <VideoOff size={24} />
          </button>
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    );
  }

  // Render compact UI for audio calls
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl z-50 flex flex-col items-center">
      <Phone size={36} className="text-green-400 mb-2" />
      {displayName ? (
        <p className="text-lg font-semibold mb-1">{displayName}</p>
      ) : (
        <p className="text-lg font-semibold mb-1">On Call</p>
      )}
      <p className="text-md text-gray-300 mb-3">Audio Call</p> {/* Added "Audio Call" below name */}

      {/* Dedicated audio element for remote stream in audio-only calls */}
      {remoteStream && (
        <audio autoPlay playsInline ref={remoteAudioRef} />
      )}

      <div className="flex space-x-3">
        <button
          onClick={toggleMic}
          className={`p-2 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
          title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          <MicOff size={20} />
        </button>
        <button
          onClick={endCall}
          className="p-2 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
          title="End Call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};

export default CallScreen;