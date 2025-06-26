'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useAuth } from '../../components/AuthProvider';
import { CustomUser } from '../types';

// Ensure this URL is correct and accessible from your client.
// For development, it's often 'http://localhost:5001'
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001');

const CallContext = createContext<any>(null);
export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user }: { user: CustomUser | null } = useAuth();
  const [stream, setStream] = useState<MediaStream | null>(null); // Local media stream
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null); // Remote media stream
  const [callInfo, setCallInfo] = useState<any>(null); // Stores details about an incoming call (for receiver)
  const [callingInfo, setCallingInfo] = useState<any>(null); // Stores details about an outgoing call (for caller)
  const [callerId, setCallerId] = useState<string | null>(null); // The socket ID of the person who initiated the call to us
  const [isCallActive, setIsCallActive] = useState(false); // True if a call is ongoing (answered)
  const peerRef = useRef<Peer.Instance | null>(null);
  const isCallingRef = useRef(false); // To prevent multiple simultaneous call attempts

  // Audio elements for ringing and ringtone - DECLARED ONCE
  const ringingAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements once inside useEffect
  useEffect(() => {
    console.log("CallProvider: Initializing audio elements...");
    ringingAudioRef.current = new Audio('/sounds/ringing.mp3');
    if (ringingAudioRef.current) {
      ringingAudioRef.current.loop = true;
      ringingAudioRef.current.load(); // Pre-load audio
      console.log("CallProvider: Ringing audio loaded:", ringingAudioRef.current);
    } else {
      console.error("CallProvider: Failed to create ringing audio element.");
    }

    ringtoneAudioRef.current = new Audio('/sounds/ringtone.mp3');
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.loop = true;
      ringtoneAudioRef.current.load(); // Pre-load audio
      console.log("CallProvider: Ringtone audio loaded:", ringtoneAudioRef.current);
    } else {
      console.error("CallProvider: Failed to create ringtone audio element.");
    }

    // Cleanup function for audio elements
    return () => {
      console.log("CallProvider: Cleaning up audio elements on unmount.");
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
      if (ringtoneAudioRef.current) {
        ringtoneAudioRef.current.pause();
        ringtoneAudioRef.current.currentTime = 0;
      }
    };
  }, []); // Empty dependency array means this runs once on mount


  // Helper functions for audio playback control
  const playRinging = useCallback(() => {
    if (ringingAudioRef.current) {
      console.log("CallProvider: Attempting to play ringing sound...");
      ringingAudioRef.current.play()
        .then(() => console.log("CallProvider: Ringing sound started successfully."))
        .catch(e => console.error("CallProvider: Error playing ringing sound (autoplay/source issue):", e.name, e.message, e));
    } else {
      console.warn("CallProvider: Ringing audio ref is not ready for playback.");
    }
  }, []);

  const stopRinging = useCallback(() => {
    if (ringingAudioRef.current) {
      console.log("CallProvider: Stopping ringing sound.");
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0; // Reset playback position
    }
  }, []);

  const playRingtone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      console.log("CallProvider: Attempting to play ringtone sound...");
      ringtoneAudioRef.current.play()
        .then(() => console.log("CallProvider: Ringtone sound started successfully."))
        .catch(e => console.error("CallProvider: Error playing ringtone sound (autoplay/source issue):", e.name, e.message, e));
    } else {
      console.warn("CallProvider: Ringtone audio ref is not ready for playback.");
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      console.log("CallProvider: Stopping ringtone sound.");
      ringtoneAudioRef.current.pause();
      ringtoneAudioRef.current.currentTime = 0; // Reset playback position
    }
  }, []);


  // Function to reset all call-related states and clean up media tracks
  const resetCallStates = useCallback(() => {
    console.log("CallProvider: Resetting all call states.");
    // Destroy the peer connection if it exists
    if (peerRef.current) {
      console.log("CallProvider: Destroying peer connection instance.");
      peerRef.current.destroy();
      peerRef.current = null; // Important: clear the ref to prevent stale instances
    }

    // Stop local media stream tracks to release camera/mic
    if (stream) {
      console.log("CallProvider: Stopping local media stream tracks.");
      stream.getTracks().forEach(track => track.stop());
    }
    // Stop remote media stream tracks
    if (remoteStream) {
      console.log("CallProvider: Stopping remote media stream tracks.");
      remoteStream.getTracks().forEach(track => track.stop());
    }

    // Reset all state variables to their initial values
    setStream(null);
    setRemoteStream(null);
    setCallInfo(null);
    setCallingInfo(null);
    setCallerId(null);
    setIsCallActive(false);
    isCallingRef.current = false; // Reset the flag for call initiation

    // Stop any active audio alerts
    stopRinging();
    stopRingtone();
  }, [stream, remoteStream, stopRinging, stopRingtone]);


  // Handler for ending a call
  const endCall = useCallback(() => {
    console.log("CallProvider: Ending call (initiated by local user or explicit action)...");
    let targetToNotify; // Determine whom to notify on the backend
    if (callInfo?.from) { // If we are the receiver and ending, notify the caller's socket ID
      targetToNotify = callInfo.from;
    } else if (callingInfo?.targetUserId) { // If we are the caller and ending, notify the target user's _id
      targetToNotify = callingInfo.targetUserId;
    }

    if (targetToNotify) {
      console.log(`CallProvider: Emitting 'end-call' to ${targetToNotify}`);
      socket.emit('end-call', { targetId: targetToNotify });
    } else {
        console.warn("CallProvider: No valid target to notify for end-call. Call might not have been established or state is inconsistent.");
    }

    resetCallStates(); // Clean up all local call states
  }, [callInfo, callingInfo, resetCallStates]);


  // Effect to register the user's MongoDB _id with the Socket.IO server
  useEffect(() => {
    if (user?._id) { // Use user._id instead of user.uid for consistency with backend lookup
      socket.emit('register-user', user._id);
      console.log('CallProvider: ✅ Socket registered with user._id:', user._id);
    } else {
        console.warn("CallProvider: User object or user._id not available for socket registration. Cannot register socket.");
    }
  }, [user]); // Re-run if `user` object changes

  // Effect to set up all Socket.IO event listeners
  useEffect(() => {
    console.log("CallProvider: Setting up Socket.IO event listeners.");

    socket.on('incoming-call', ({ offer, caller, from, callType }) => {
      console.log('CallProvider: 📞 Incoming call received from', caller?.name || caller?.username || from, 'Call Type:', callType);
      // Only accept if no call is active and not already initiating/receiving a call
      if (!isCallActive && !callInfo?.isReceivingCall && !callingInfo) {
        setCallInfo({
          isReceivingCall: true,
          from, // This is the socket.id of the caller (used for sending answer/decline back)
          callerName: caller?.name || caller?.username || 'Unknown Caller',
          callerAvatar: caller?.avatarUrl || '',
          offer,
          callType,
        });
        setCallerId(from); // Store the caller's socket ID for direct communication
        playRingtone(); // Play ringtone for incoming call
      } else {
        // If the user is busy, decline the incoming call immediately
        console.log("CallProvider: User is busy (already in a call or receiving another), declining new incoming call.");
        socket.emit('decline-call', { targetId: from });
      }
    });

    socket.on('call-answered', ({ answer }) => {
      console.log("CallProvider: Call answered by remote party. Signaling peer with received answer.");
      stopRinging(); // Stop ringing for the caller (as the call is now answered)
      // Signal the peer connection with the remote answer SDP
      peerRef.current?.signal(answer);
      setIsCallActive(true); // Mark call as active
      isCallingRef.current = false; // Reset calling flag
      setCallInfo(null); // Clear incoming call info (if any was pending)
      setCallingInfo(null); // Clear outgoing call info (call is now active)
    });

    socket.on('ice-candidate', ({ candidate }) => {
      console.log("CallProvider: Received ICE candidate from remote peer.");
      peerRef.current?.signal(candidate); // Add the candidate to our peer connection
    });

    socket.on('call-ended', () => {
      console.log('CallProvider: Call ended by remote party.');
      resetCallStates(); // Full cleanup when remote party ends call
    });

    socket.on('call-declined', () => {
      console.log('CallProvider: Call declined by remote party.');
      resetCallStates(); // Full cleanup when remote party declines call
    });

    socket.on('user-offline', ({ targetId }) => {
        console.log(`CallProvider: User ${targetId} is offline or unavailable. Call cannot be completed.`);
        alert(`User is offline or unavailable.`); // Notify the caller
        resetCallStates(); // Reset call states for the caller if target is offline
    });

    // Cleanup function for socket listeners
    return () => {
      console.log("CallProvider: Cleaning up Socket.IO event listeners.");
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-declined');
      socket.off('user-offline');
    };
  }, [isCallActive, callInfo, callingInfo, resetCallStates, playRingtone, stopRinging]); // Dependencies for useEffect


  // Decline incoming call or cancel outgoing call
  const declineCall = useCallback(() => {
    console.log("CallProvider: Initiating declineCall...");
    if (callInfo && callInfo.isReceivingCall) { // If it's an incoming call we are declining
      console.log(`CallProvider: Declining incoming call from socket ${callInfo.from}`);
      socket.emit('decline-call', { targetId: callInfo.from }); // Notify the caller's socket ID
      resetCallStates(); // Clear states
    } else if (callingInfo) { // If it's an outgoing call we are canceling before it's answered
        console.log(`CallProvider: Cancelling outgoing call to user ${callingInfo.targetUserId}`);
        // For outgoing calls, 'end-call' serves as a cancel before answer.
        socket.emit('end-call', { targetId: callingInfo.targetUserId });
        resetCallStates();
    } else {
        console.warn("CallProvider: No active incoming or outgoing call to decline/cancel.");
        // Ensure cleanup even if states are inconsistent or no call was active
        resetCallStates();
    }
  }, [callInfo, callingInfo, resetCallStates]);


  // Answer an incoming call
  const answerCall = useCallback(() => {
    console.log("CallProvider: Attempting to answer call...");
    // Pre-checks: ensure there's an incoming call and no call is already active
    if (!callInfo || isCallActive) {
      console.warn("CallProvider: No incoming call to answer, or a call is already active.");
      return;
    }
    stopRingtone(); // Stop ringtone when answering

    // Determine media constraints based on call type (video or audio)
    const constraints = callInfo.callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
    console.log("CallProvider: getUserMedia constraints for answering call:", constraints);

    // Request user media (microphone/camera)
    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        console.log("CallProvider: Successfully got local user media for answering call.");
        // Log local audio and video track info for debugging
        mediaStream.getAudioTracks().forEach(track => {
            console.log(`Local Audio track (answer): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
        });
        mediaStream.getVideoTracks().forEach(track => {
            console.log(`Local Video track (answer): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
        });

        setStream(mediaStream); // Set local stream state

        // Create a new simple-peer instance (receiver side)
        const peer = new Peer({ initiator: false, trickle: false, stream: mediaStream });

        // Peer signaling: send our answer SDP back to the caller
        peer.on('signal', (data) => {
          console.log("CallProvider: Peer signal (answer SDP generated):", data);
          socket.emit('answer-call', { targetId: callInfo.from, answer: data }); // callInfo.from is the caller's socket.id
        });

        // When remote stream is received
        peer.on('stream', remote => {
          console.log("CallProvider: Remote stream received after answering. Setting remoteStream state.");
          // Log remote audio and video track info for debugging
          remote.getAudioTracks().forEach(track => {
              console.log(`Remote Audio track (received after answer): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
          });
          remote.getVideoTracks().forEach(track => {
              console.log(`Remote Video track (received after answer): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
          });
          setRemoteStream(remote); // Set remote stream state for display
        });

        // Peer connection established event (for logging)
        peer.on('connect', () => {
            console.log("CallProvider: Peer connection established (connected event).");
        });

        // Peer connection closed event
        peer.on('close', () => {
          console.log("CallProvider: Peer connection closed after answering.");
          resetCallStates(); // Clean up if peer connection closes
        });

        // Peer error event
        peer.on('error', (err) => {
          console.error("CallProvider: Peer error after answering:", err);
          resetCallStates(); // Clean up on error
        });

        // Signal the peer with the incoming offer SDP
        peer.signal(callInfo.offer);
        peerRef.current = peer; // Store peer instance in ref
        setIsCallActive(true); // Mark call as active
        setCallInfo(null); // Clear incoming call info as it's now active
      })
      .catch(error => {
        console.error("CallProvider: Failed to get user media for answering call:", error.name, error.message, error);
        alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
        declineCall(); // Decline call if media access fails
      });
  }, [callInfo, isCallActive, declineCall, resetCallStates, stopRingtone]);


  // Initiate an outgoing call
  const startCall = useCallback((targetUser: CustomUser, callType: 'audio' | 'video') => {
    console.log(`CallProvider: Initiating ${callType} call to ${targetUser.name || targetUser.username || targetUser.email || 'Unknown User'} (ID: ${targetUser._id})...`);
    // Pre-checks: ensure no call is active, receiving, or already initiating
    if (isCallingRef.current || isCallActive || callInfo) {
      console.warn("CallProvider: Already in a call or attempting to initiate a call. Cannot start new call.");
      return;
    }

    isCallingRef.current = true; // Set flag to indicate a call is being initiated
    playRinging(); // Start ringing sound for the caller

    // Set calling info to display the outgoing call popup
    setCallingInfo({
      isOutgoingCall: true,
      targetUserId: targetUser._id,
      targetUserName: targetUser.name || targetUser.displayName || targetUser.email?.split('@')[0] || 'Unknown User',
      targetUserAvatar: targetUser.avatarUrl || '',
      callType,
    });

    // Determine media constraints
    const constraints = callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
    console.log("CallProvider: getUserMedia constraints for initiating call:", constraints);

    // Request user media
    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        console.log("CallProvider: Successfully got local user media for initiating call.");
        // Log local audio and video track info for debugging
        mediaStream.getAudioTracks().forEach(track => {
            console.log(`Local Audio track (initiate): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
        });
        mediaStream.getVideoTracks().forEach(track => {
            console.log(`Local Video track (initiate): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
        });

        setStream(mediaStream); // Set local stream state

        // Create a new simple-peer instance (initiator side)
        const peer = new Peer({ initiator: true, trickle: false, stream: mediaStream });

        // Peer signaling: send our offer SDP to the target user via socket
        peer.on('signal', (data) => {
          console.log("CallProvider: Peer signal (offer SDP generated):", data);
          socket.emit('call-user', {
            targetId: targetUser._id, // Target's MongoDB _id
            offer: data,
            caller: { // Information about the caller to send to the receiver
              uid: user?.uid || '',
              name: user?.name || user?.displayName || '',
              username: user?.email?.split('@')[0] || '',
              avatarUrl: user?.avatarUrl || '',
            },
            callType,
          });
        });

        // When remote stream is received
        peer.on('stream', remote => {
          console.log("CallProvider: Remote stream received after initiating. Setting remoteStream state.");
          // Log remote audio and video track info for debugging
          remote.getAudioTracks().forEach(track => {
              console.log(`Remote Audio track (received after initiate): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
          });
          remote.getVideoTracks().forEach(track => {
              console.log(`Remote Video track (received after initiate): label='${track.label}', enabled=${track.enabled}, readyState='${track.readyState}'`);
          });
          stopRinging(); // Stop ringing once remote stream starts (call connected)
          setRemoteStream(remote); // Set remote stream state for display
          setIsCallActive(true); // Mark call as active
          setCallInfo(null); // Clear incoming call info (should not be set if initiating)
          setCallingInfo(null); // Clear outgoing call info, as call is now active
        });

        // Peer connection established event (for logging)
        peer.on('connect', () => {
            console.log("CallProvider: Peer connection established (connected event).");
        });

        // Peer connection closed event
        peer.on('close', () => {
          console.log("CallProvider: Peer connection closed.");
          resetCallStates(); // Clean up if peer connection closes
        });

        // Peer error event
        peer.on('error', (err) => {
          console.error("CallProvider: Peer error:", err);
          resetCallStates(); // Clean up on error
        });

        peerRef.current = peer; // Store peer instance in ref
      })
      .catch(error => {
        console.error("CallProvider: Failed to get user media (for outgoing call):", error.name, error.message, error);
        resetCallStates(); // Reset flags and states on error
        alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
      });
  }, [user, isCallActive, callInfo, resetCallStates, playRinging, stopRinging]); // Dependencies for useCallback


  return (
    <CallContext.Provider value={{
      stream, // Local stream
      remoteStream, // Remote stream
      callInfo, // Info for incoming call
      callingInfo, // Info for outgoing call
      startCall,
      answerCall,
      declineCall,
      endCall,
      isReceivingCall: !!callInfo?.isReceivingCall, // Boolean for UI (true if there's an incoming call pending)
      isOutgoingCall: !!callingInfo?.isOutgoingCall, // Boolean for UI (true if user is initiating an outgoing call)
      isCallActive, // Boolean for UI (true if a call is actively connected)
    }}>
      {children}
    </CallContext.Provider>
  );
};