
// // client/app/context/CallProvider.tsx
// 'use client';

// import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
// import Peer from 'simple-peer';
// import io from 'socket.io-client';
// import { useAuth } from '../../components/AuthProvider';
// import { CustomUser, CallInfoState, CallingInfoState } from '../types'; // Ensure '../types' points to your types.ts file

// const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');

// const CallContext = createContext<any>(null);
// export const useCall = () => useContext(CallContext);

// export const CallProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user }: { user: CustomUser | null } = useAuth(); // 'user' is CustomUser

//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callInfo, setCallInfo] = useState<CallInfoState | null>(null); // Incoming call details
//   const [callingInfo, setCallingInfo] = useState<CallingInfoState | null>(null); // Outgoing call details
//   const [callerId, setCallerId] = useState<string | null>(null); // This might be redundant with callInfo.from
//   const [isCallActive, setIsCallActive] = useState(false); // True when peer connection is established
//   const peerRef = useRef<Peer.Instance | null>(null);
//   const isCallingRef = useRef(false); // To prevent multiple simultaneous outgoing calls

//   const ringingAudioRef = useRef<HTMLAudioElement | null>(null); // For the caller hearing a ring
//   const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null); // For the receiver hearing a ring

//   // Initialize audio elements
//   useEffect(() => {
//     console.log("CallProvider: Initializing audio elements...");
//     ringingAudioRef.current = new Audio('/sounds/ringing.mp3');
//     if (ringingAudioRef.current) {
//       ringingAudioRef.current.loop = true;
//       ringingAudioRef.current.load();
//     }

//     ringtoneAudioRef.current = new Audio('/sounds/ringtone.mp3');
//     if (ringtoneAudioRef.current) {
//       ringtoneAudioRef.current.loop = true;
//       ringtoneAudioRef.current.load();
//     }

//     return () => {
//       if (ringingAudioRef.current) {
//         ringingAudioRef.current.pause();
//         ringingAudioRef.current.currentTime = 0;
//       }
//       if (ringtoneAudioRef.current) {
//         ringtoneAudioRef.current.pause();
//         ringtoneAudioRef.current.currentTime = 0;
//       }
//     };
//   }, []);

//   // Audio control functions
//   const playRinging = useCallback(() => {
//     if (ringingAudioRef.current) {
//       ringingAudioRef.current.play().catch(e => console.error("Error playing ringing sound:", e));
//     }
//   }, []);

//   const stopRinging = useCallback(() => {
//     if (ringingAudioRef.current) {
//       ringingAudioRef.current.pause();
//       ringingAudioRef.current.currentTime = 0;
//     }
//   }, []);

//   const playRingtone = useCallback(() => {
//     if (ringtoneAudioRef.current) {
//       ringtoneAudioRef.current.play().catch(e => console.error("Error playing ringtone sound:", e));
//     }
//   }, []);

//   const stopRingtone = useCallback(() => {
//     if (ringtoneAudioRef.current) {
//       ringtoneAudioRef.current.pause();
//       ringtoneAudioRef.current.currentTime = 0;
//     }
//   }, []);

//   // Resets all call-related states and cleans up media streams/peer connections
//   const resetCallStates = useCallback(() => {
//     console.log("CallProvider: Resetting all call states.");
//     if (peerRef.current) {
//       peerRef.current.destroy();
//       peerRef.current = null;
//     }

//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }
//     if (remoteStream) {
//       remoteStream.getTracks().forEach(track => track.stop());
//     }

//     setStream(null);
//     setRemoteStream(null);
//     setCallInfo(null); // Crucial: Clears incoming call UI
//     setCallingInfo(null); // Crucial: Clears outgoing call UI
//     setCallerId(null);
//     setIsCallActive(false);
//     isCallingRef.current = false; // Reset the flag

//     stopRinging();
//     stopRingtone();
//   }, [stream, remoteStream, stopRinging, stopRingtone]);

//   // Handles ending a call (local user action)
//   const endCall = useCallback(() => {
//     console.log("CallProvider: Ending call (initiated by local user or explicit action)...");
//     let targetToNotify;
//     // Determine the ID of the other peer to notify
//     if (callInfo?.callerMongoId) { // If it was an incoming call that's now active
//       targetToNotify = callInfo.callerMongoId; // Use callerMongoId
//     } else if (callingInfo?.targetUserId) { // If it was an outgoing call that's now active
//       targetToNotify = callingInfo.targetUserId;
//     }

//     if (targetToNotify && user?.mongoUserId) { // Ensure current user's mongoUserId is available
//       console.log(`CallProvider: Emitting 'end-call' to ${targetToNotify}`);
//       socket.emit('end-call', { targetId: targetToNotify, endedBy: user.mongoUserId }); // Add endedBy
//     } else {
//       console.warn("CallProvider: No valid target or current user to notify for end-call. Call might not have been established or state is inconsistent.");
//     }

//     resetCallStates();
//   }, [callInfo, callingInfo, resetCallStates, user]);

//   // Register user with socket on login
//   useEffect(() => {
//     // FIXED: Use user?.mongoUserId instead of user?._id
//     if (user?.mongoUserId) {
//       socket.emit('register-user', user.mongoUserId);
//       console.log('CallProvider: Socket registered with user.mongoUserId:', user.mongoUserId);
//     }
//   }, [user?.mongoUserId]); // Dependency on user.mongoUserId

//   // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL API CALL TO GET USER NAME AND AVATAR BY ID
//   const fetchUserNameAndAvatarById = useCallback(async (userId: string): Promise<{ name: string; avatarUrl: string }> => {
//       console.log(`CallProvider: Attempting to fetch name and avatar for user ID: ${userId}`);
//       try {
//           // This should be your actual backend endpoint for fetching user details
//           const response = await fetch(`https://vartalaap-r36o.onrender.com/api/users/${userId}`);
//           if (!response.ok) {
//               throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           const data = await response.json();
//           console.log(`CallProvider: Fetched user data for ${userId}:`, data);
//           return {
//               name: data.name || data.username || `Unknown User (${userId.substring(0, 4)}...)`,
//               avatarUrl: data.avatarUrl || '' // Ensure avatarUrl is always returned, even if empty
//           };
//       } catch (error) {
//           console.error(`CallProvider: Error fetching user name/avatar for ID ${userId}:`, error);
//           return {
//               name: `Unknown User (${userId.substring(0, 4)}...)`,
//               avatarUrl: ''
//           };
//       }
//   }, []);

//   // Socket.IO event listeners
//   useEffect(() => {
//     console.log("CallProvider: Setting up Socket.IO event listeners.");

//     // FIXED: Add callerMongoId to the data destructuring
//     socket.on('incoming-call', async ({ offer, caller, from, callType, callerMongoId }) => {
//       console.log('CallProvider: 📞 Incoming call received from', caller?.name || caller?.username || from, 'Call Type:', callType, 'Mongo ID:', callerMongoId);
//       // Prevent multiple incoming call modals if one is already active or user is busy
//       if (!isCallActive && !callInfo?.isReceivingCall && !isCallingRef.current) {
//         // Use provided caller info, or fetch if necessary (though backend should provide it for registered users)
//         const resolvedCallerName = caller?.name || caller?.username || (callerMongoId ? (await fetchUserNameAndAvatarById(callerMongoId)).name : 'Unknown Caller');
//         const resolvedCallerAvatar = caller?.avatarUrl || (callerMongoId ? (await fetchUserNameAndAvatarById(callerMongoId)).avatarUrl : '');

//         setCallInfo({
//           isReceivingCall: true,
//           from, // This 'from' is likely the socket ID
//           callerName: resolvedCallerName,
//           callerAvatar: resolvedCallerAvatar,
//           offer,
//           callType,
//           callerMongoId: callerMongoId, // FIXED: Ensure callerMongoId is set here
//         });
//         setCallerId(from); // Keep this for now, though callInfo.from is similar
//         playRingtone();
//       } else {
//         console.log("CallProvider: User is busy (already in a call or receiving another), declining new incoming call.");
//         socket.emit('decline-call', { targetId: from }); // 'from' is the socket ID of the busy user
//       }
//     });

//     socket.on('call-answered', ({ answer, acceptorName, acceptorAvatar }) => {
//       console.log("CallProvider: Call answered by remote party. Signaling peer with received answer.");
//       stopRinging(); // Stop ringing sound on caller's side
//       peerRef.current?.signal(answer);

//       setCallingInfo(prev => {
//         if (!prev) return null;

//         return {
//           ...prev,
//           isOutgoingCall: false, // Call is no longer outgoing, it's active
//           targetUserName: acceptorName || prev.targetUserName || 'Unknown User',
//           targetUserAvatar: acceptorAvatar || prev.targetUserAvatar || '',
//         };
//       });

//       setIsCallActive(true);
//       isCallingRef.current = false; // Reset the calling flag
//     });

//     socket.on('ice-candidate', ({ candidate }) => {
//       console.log("CallProvider: Received ICE candidate from remote peer.");
//       try {
//         peerRef.current?.signal(candidate);
//       } catch (error) {
//         console.error("Error signaling ICE candidate:", error);
//       }
//     });

//     socket.on('call-ended', () => {
//       console.log('CallProvider: Call ended by remote party.');
//       resetCallStates();
//     });

//     socket.on('call-declined', () => {
//       console.log('CallProvider: Call declined by remote party.');
//       resetCallStates();
//     });

//     socket.on('user-offline', ({ targetId }) => {
//         console.log(`CallProvider: User ${targetId} is offline or unavailable. Call cannot be completed.`);
//         alert(`User is offline or unavailable.`);
//         resetCallStates();
//     });

//     return () => {
//       console.log("CallProvider: Cleaning up Socket.IO event listeners.");
//       socket.off('incoming-call');
//       socket.off('call-answered');
//       socket.off('ice-candidate');
//       socket.off('call-ended');
//       socket.off('call-declined');
//       socket.off('user-offline');
//     };
//   }, [isCallActive, callInfo, isCallingRef, resetCallStates, playRingtone, stopRinging, fetchUserNameAndAvatarById]);

//   // Declines an incoming call or cancels an outgoing call
//   const declineCall = useCallback(() => {
//     console.log("CallProvider: Initiating declineCall...");
//     if (callInfo && callInfo.isReceivingCall) {
//       console.log(`CallProvider: Declining incoming call from socket ${callInfo.from}`);
//       socket.emit('decline-call', { targetId: callInfo.from, rejectedBy: user?.mongoUserId }); // Add rejectedBy
//     } else if (callingInfo && isCallingRef.current) { // Only if it's an active outgoing call attempt
//         console.log(`CallProvider: Cancelling outgoing call to user ${callingInfo.targetUserId}`);
//         socket.emit('end-call', { targetId: callingInfo.targetUserId, endedBy: user?.mongoUserId }); // Add endedBy
//     } else {
//         console.warn("CallProvider: No active incoming or outgoing call attempt to decline/cancel.");
//     }
//     resetCallStates(); // Always reset states when declining/cancelling
//   }, [callInfo, callingInfo, resetCallStates, isCallingRef, user?.mongoUserId]);

//   // Answers an incoming call
//   const answerCall = useCallback(() => {
//     console.log("CallProvider: Attempting to answer call...");
//     if (!callInfo || isCallActive) {
//       console.warn("CallProvider: No incoming call to answer, or a call is already active.");
//       return;
//     }
//     stopRingtone(); // Stop receiver's ringtone

//     const constraints = callInfo.callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
//     console.log("CallProvider: getUserMedia constraints for answering call:", constraints);

//     navigator.mediaDevices.getUserMedia(constraints)
//       .then(mediaStream => {
//         console.log("CallProvider: Successfully got local user media for answering call.");
//         setStream(mediaStream);

//         const peer = new Peer({ initiator: false, trickle: false, stream: mediaStream });

//         peer.on('signal', (data) => {
//           console.log("CallProvider: Peer signal (answer SDP generated):", data);
//           socket.emit('answer-call', {
//             targetId: callInfo.from, // This is the socket ID of the caller
//             answer: data,
//             acceptorName: user?.name || user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
//             acceptorAvatar: user?.avatarUrl || '',
//             acceptorMongoId: user?.mongoUserId, // FIXED: Send acceptorMongoId to the caller
//           });
//         });

//         peer.on('stream', remote => {
//           console.log("CallProvider: Remote stream received after answering. Setting remoteStream state.");
//           setRemoteStream(remote);

//           setCallInfo(prev => {
//             if (!prev) return null;

//             return {
//               ...prev,
//               isReceivingCall: false, // No longer "receiving", it's active
//             };
//           });

//           setIsCallActive(true);
//         });

//         peer.on('connect', () => {
//             console.log("CallProvider: Peer connection established (connected event).");
//         });

//         peer.on('close', () => {
//           console.log("CallProvider: Peer connection closed after answering.");
//           resetCallStates();
//         });

//         peer.on('error', (err) => {
//           console.error("CallProvider: Peer error after answering:", err);
//           resetCallStates();
//         });

//         peer.signal(callInfo.offer);
//         peerRef.current = peer;
//       })
//       .catch(error => {
//         console.error("CallProvider: Failed to get user media for answering call:", error.name, error.message, error);
//         alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
//         declineCall(); // Automatically decline if media access fails
//       });
//   }, [callInfo, isCallActive, declineCall, resetCallStates, stopRingtone, user]);

//   // Starts an outgoing call
//   const startCall = useCallback((targetUser: CustomUser, callType: 'audio' | 'video') => {
//     // FIXED: Use targetUser.mongoUserId instead of targetUser._id
//     console.log(`CallProvider: Initiating ${callType} call to ${targetUser.name || targetUser.username || targetUser.email?.split('@')[0] || 'Unknown User'} (ID: ${targetUser.mongoUserId})...`);

//     // Prevent starting a new call if already in one or attempting to call
//     if (isCallingRef.current || isCallActive || callInfo) {
//       console.warn("CallProvider: Already in a call or attempting to initiate a call. Cannot start new call.");
//       return;
//     }

//     // FIXED: Ensure user.mongoUserId is available before starting call
//     if (!user?.mongoUserId) {
//       console.error("CallProvider: Current user's MongoDB ID is not available.");
//       alert("Cannot start call: Your user ID is not available. Please try logging in again.");
//       return;
//     }

//     isCallingRef.current = true; // Set calling flag immediately
//     playRinging(); // Play ringing sound for the caller

//     setCallingInfo({
//       isOutgoingCall: true,
//       targetUserId: targetUser.mongoUserId as string, // FIXED: Use mongoUserId
//       targetUserName: targetUser.name || targetUser.displayName || targetUser.email?.split('@')[0] || 'Unknown User',
//       targetUserAvatar: targetUser.avatarUrl || '',
//       callType,
//     });

//     const constraints = callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
//     console.log("CallProvider: getUserMedia constraints for initiating call:", constraints);

//     navigator.mediaDevices.getUserMedia(constraints)
//       .then(mediaStream => {
//         console.log("CallProvider: Successfully got local user media for initiating call.");
//         setStream(mediaStream);

//         const peer = new Peer({ initiator: true, trickle: false, stream: mediaStream });

//         peer.on('signal', (data) => {
//           console.log("CallProvider: Peer signal (offer SDP generated):", data);
//           socket.emit('call-user', {
//             targetId: targetUser.mongoUserId, // FIXED: Use mongoUserId for target
//             offer: data,
//             caller: {
//               uid: user?.uid || '',
//               name: user?.name || user?.displayName || '',
//               username: user?.email?.split('@')[0] || '',
//               avatarUrl: user?.avatarUrl || '',
//               mongoUserId: user?.mongoUserId, // FIXED: Send caller's mongoUserId
//             },
//             callType,
//           });
//         });

//         peer.on('stream', remote => {
//           console.log("CallProvider: Remote stream received after initiating. Setting remoteStream state.");
//           stopRinging(); // Stop ringing for the caller
//           setRemoteStream(remote);
//           setIsCallActive(true);
//         });

//         peer.on('connect', () => {
//             console.log("CallProvider: Peer connection established (connected event).");
//         });

//         peer.on('close', () => {
//           console.log("CallProvider: Peer connection closed.");
//           resetCallStates();
//         });

//         peer.on('error', (err) => {
//           console.error("CallProvider: Peer error:", err);
//           resetCallStates();
//         });

//         peerRef.current = peer;
//       })
//       .catch(error => {
//         console.error("CallProvider: Failed to get user media (for outgoing call):", error.name, error.message, error);
//         resetCallStates(); // Reset if media access fails
//         alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
//       });
//   }, [user, isCallActive, callInfo, resetCallStates, playRinging, stopRinging]);

//   return (
//     <CallContext.Provider value={{
//       stream,
//       remoteStream,
//       callInfo, // Exposes incoming call details (for modal)
//       callingInfo, // Exposes outgoing call details (for modal and CallScreen)
//       startCall,
//       answerCall,
//       declineCall,
//       endCall,
//       isReceivingCall: !!callInfo?.isReceivingCall,
//       isOutgoingCall: !!callingInfo?.isOutgoingCall, // This will be true only during the dialing phase
//       isCallActive,
//     }}>
//       {children}
//     </CallContext.Provider>
//   );
// };




// client/app/context/CallProvider.tsx
'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useAuth } from '../../components/AuthProvider';
import { CustomUser, CallInfoState, CallingInfoState } from '../types';


const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');
const CallContext = createContext<any>(null);
export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user }: { user: CustomUser | null } = useAuth(); // 'user' is CustomUser

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callInfo, setCallInfo] = useState<CallInfoState | null>(null); // Incoming call details
  const [callingInfo, setCallingInfo] = useState<CallingInfoState | null>(null); // Outgoing call details
  const [callerId, setCallerId] = useState<string | null>(null); // This might be redundant with callInfo.from
  const [isCallActive, setIsCallActive] = useState(false); // True when peer connection is established
  const peerRef = useRef<Peer.Instance | null>(null);
  const isCallingRef = useRef(false); // To prevent multiple simultaneous outgoing calls

  const ringingAudioRef = useRef<HTMLAudioElement | null>(null); // For the caller hearing a ring
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null); // For the receiver hearing a ring

  // Initialize audio elements
  useEffect(() => {
    console.log("CallProvider: Initializing audio elements...");
    ringingAudioRef.current = new Audio('/sounds/ringing.mp3');
    if (ringingAudioRef.current) {
      ringingAudioRef.current.loop = true;
      ringingAudioRef.current.load();
    }

    ringtoneAudioRef.current = new Audio('/sounds/ringtone.mp3');
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.loop = true;
      ringtoneAudioRef.current.load();
    }

    return () => {
      if (ringingAudioRef.current) {
        ringingAudioRef.current.pause();
        ringingAudioRef.current.currentTime = 0;
      }
      if (ringtoneAudioRef.current) {
        ringtoneAudioRef.current.pause();
        ringtoneAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Audio control functions
  const playRinging = useCallback(() => {
    if (ringingAudioRef.current) {
      ringingAudioRef.current.play().catch(e => console.error("Error playing ringing sound:", e));
    }
  }, []);

  const stopRinging = useCallback(() => {
    if (ringingAudioRef.current) {
      ringingAudioRef.current.pause();
      ringingAudioRef.current.currentTime = 0;
    }
  }, []);

  const playRingtone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.play().catch(e => console.error("Error playing ringtone sound:", e));
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.pause();
      ringtoneAudioRef.current.currentTime = 0;
    }
  }, []);

  // Resets all call-related states and cleans up media streams/peer connections
  const resetCallStates = useCallback(() => {
    console.log("CallProvider: Resetting all call states.");
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    setStream(null);
    setRemoteStream(null);
    setCallInfo(null); // Crucial: Clears incoming call UI
    setCallingInfo(null); // Crucial: Clears outgoing call UI
    setCallerId(null);
    setIsCallActive(false);
    isCallingRef.current = false; // Reset the flag

    stopRinging();
    stopRingtone();
  }, [stream, remoteStream, stopRinging, stopRingtone]);

  // Handles ending a call (local user action)
  const endCall = useCallback(() => {
    console.log("CallProvider: Ending call (initiated by local user or explicit action)...");
    let targetToNotify;
    // Determine the ID of the other peer to notify
    // Use _id for current user and target user
    if (callInfo?.callerMongoId) { // If it was an incoming call that's now active
      targetToNotify = callInfo.callerMongoId; // Use callerMongoId from callInfo
    } else if (callingInfo?.targetUserId) { // If it was an outgoing call that's now active
      targetToNotify = callingInfo.targetUserId;
    }

    if (targetToNotify && user?._id) { // Ensure current user's _id is available
      console.log(`CallProvider: Emitting 'end-call' to ${targetToNotify}`);
      socket.emit('end-call', { targetId: targetToNotify, endedBy: user._id }); // Use user._id for endedBy
    } else {
      console.warn("CallProvider: No valid target or current user to notify for end-call. Call might not have been established or state is inconsistent.");
    }

    resetCallStates();
  }, [callInfo, callingInfo, resetCallStates, user]);

  // Register user with socket on login
  useEffect(() => {
    if (user?._id) { // Use user?._id for registration
      socket.emit('register-user', user._id);
      console.log('CallProvider: Socket registered with user._id:', user._id);
    }
  }, [user?._id]); // Dependency on user._id

  // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL API CALL TO GET USER NAME AND AVATAR BY ID
  const fetchUserNameAndAvatarById = useCallback(async (userId: string): Promise<{ name: string; avatarUrl: string }> => {
    console.log(`CallProvider: Attempting to fetch name and avatar for user ID: ${userId}`);
    try {
      // This should be your actual backend endpoint for fetching user details
      const response = await fetch(`https://vartalaap-r36o.onrender.com/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`CallProvider: Fetched user data for ${userId}:`, data);
      return {
        name: data.name || data.username || `Unknown User (${userId.substring(0, 4)}...)`,
        avatarUrl: data.avatarUrl || '' // Ensure avatarUrl is always returned, even if empty
      };
    } catch (error) {
      console.error(`CallProvider: Error fetching user name/avatar for ID ${userId}:`, error);
      return {
        name: `Unknown User (${userId.substring(0, 4)}...)`,
        avatarUrl: ''
      };
    }
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    console.log("CallProvider: Setting up Socket.IO event listeners.");

    socket.on('incoming-call', async ({ offer, caller, from, callType, callerMongoId }) => {
      console.log('CallProvider: 📞 Incoming call received from', caller?.name || caller?.username || from, 'Call Type:', callType, 'Mongo ID:', callerMongoId);
      // Prevent multiple incoming call modals if one is already active or user is busy
      if (!isCallActive && !callInfo?.isReceivingCall && !isCallingRef.current) {
        // Use provided caller info, or fetch if necessary (though backend should provide it for registered users)
        const resolvedCallerName = caller?.name || caller?.username || (callerMongoId ? (await fetchUserNameAndAvatarById(callerMongoId)).name : 'Unknown Caller');
        const resolvedCallerAvatar = caller?.avatarUrl || (callerMongoId ? (await fetchUserNameAndAvatarById(callerMongoId)).avatarUrl : '');

        setCallInfo({
          isReceivingCall: true,
          from, // This 'from' is likely the socket ID
          callerName: resolvedCallerName,
          callerAvatar: resolvedCallerAvatar,
          offer,
          callType,
          callerMongoId: callerMongoId, // Ensure callerMongoId is set here
        });
        setCallerId(from); // Keep this for now, though callInfo.from is similar
        playRingtone();
      } else {
        console.log("CallProvider: User is busy (already in a call or receiving another), declining new incoming call.");
        socket.emit('decline-call', { targetId: from }); // 'from' is the socket ID of the busy user
      }
    });

    socket.on('call-answered', ({ answer, acceptorName, acceptorAvatar }) => {
      console.log("CallProvider: Call answered by remote party. Signaling peer with received answer.");
      stopRinging(); // Stop ringing sound on caller's side
      peerRef.current?.signal(answer);

      setCallingInfo(prev => {
        if (!prev) return null;

        return {
          ...prev,
          isOutgoingCall: false, // Call is no longer outgoing, it's active
          targetUserName: acceptorName || prev.targetUserName || 'Unknown User',
          targetUserAvatar: acceptorAvatar || prev.targetUserAvatar || '',
        };
      });

      setIsCallActive(true);
      isCallingRef.current = false; // Reset the calling flag
    });

    socket.on('ice-candidate', ({ candidate }) => {
      console.log("CallProvider: Received ICE candidate from remote peer.");
      try {
        peerRef.current?.signal(candidate);
      } catch (error) {
        console.error("Error signaling ICE candidate:", error);
      }
    });

    socket.on('call-ended', () => {
      console.log('CallProvider: Call ended by remote party.');
      resetCallStates();
    });

    socket.on('call-declined', () => {
      console.log('CallProvider: Call declined by remote party.');
      resetCallStates();
    });

    socket.on('user-offline', ({ targetId }) => {
      console.log(`CallProvider: User ${targetId} is offline or unavailable. Call cannot be completed.`);
      alert(`User is offline or unavailable.`);
      resetCallStates();
    });

    return () => {
      console.log("CallProvider: Cleaning up Socket.IO event listeners.");
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      socket.off('call-declined');
      socket.off('user-offline');
    };
  }, [isCallActive, callInfo, isCallingRef, resetCallStates, playRingtone, stopRinging, fetchUserNameAndAvatarById]);

  // Declines an incoming call or cancels an outgoing call
  const declineCall = useCallback(() => {
    console.log("CallProvider: Initiating declineCall...");
    if (callInfo && callInfo.isReceivingCall) {
      console.log(`CallProvider: Declining incoming call from socket ${callInfo.from}`);
      socket.emit('decline-call', { targetId: callInfo.from, rejectedBy: user?._id }); // Use user?._id
    } else if (callingInfo && isCallingRef.current) { // Only if it's an active outgoing call attempt
      console.log(`CallProvider: Cancelling outgoing call to user ${callingInfo.targetUserId}`);
      socket.emit('end-call', { targetId: callingInfo.targetUserId, endedBy: user?._id }); // Use user?._id
    } else {
      console.warn("CallProvider: No active incoming or outgoing call attempt to decline/cancel.");
    }
    resetCallStates(); // Always reset states when declining/cancelling
  }, [callInfo, callingInfo, resetCallStates, isCallingRef, user?._id]);

  // Answers an incoming call
  const answerCall = useCallback(() => {
    console.log("CallProvider: Attempting to answer call...");
    if (!callInfo || isCallActive) {
      console.warn("CallProvider: No incoming call to answer, or a call is already active.");
      return;
    }
    stopRingtone(); // Stop receiver's ringtone

    const constraints = callInfo.callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
    console.log("CallProvider: getUserMedia constraints for answering call:", constraints);

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        console.log("CallProvider: Successfully got local user media for answering call.");
        setStream(mediaStream);

        const peer = new Peer({ initiator: false, trickle: false, stream: mediaStream });

        peer.on('signal', (data) => {
          console.log("CallProvider: Peer signal (answer SDP generated):", data);
          socket.emit('answer-call', {
            targetId: callInfo.from, // This is the socket ID of the caller
            answer: data,
            acceptorName: user?.name || user?.displayName || user?.email?.split('@')[0] || 'Unknown User',
            acceptorAvatar: user?.avatarUrl || '',
            acceptorMongoId: user?._id, // Send acceptor's MongoDB _id
          });
        });

        peer.on('stream', remote => {
          console.log("CallProvider: Remote stream received after answering. Setting remoteStream state.");
          setRemoteStream(remote);

          setCallInfo(prev => {
            if (!prev) return null;

            return {
              ...prev,
              isReceivingCall: false, // No longer "receiving", it's active
            };
          });

          setIsCallActive(true);
        });

        peer.on('connect', () => {
          console.log("CallProvider: Peer connection established (connected event).");
        });

        peer.on('close', () => {
          console.log("CallProvider: Peer connection closed after answering.");
          resetCallStates();
        });

        peer.on('error', (err) => {
          console.error("CallProvider: Peer error after answering:", err);
          resetCallStates();
        });

        peer.signal(callInfo.offer);
        peerRef.current = peer;
      })
      .catch(error => {
        console.error("CallProvider: Failed to get user media for answering call:", error.name, error.message, error);
        alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
        declineCall(); // Automatically decline if media access fails
      });
  }, [callInfo, isCallActive, declineCall, resetCallStates, stopRingtone, user]);

  // Starts an outgoing call
  const startCall = useCallback((targetUser: CustomUser, callType: 'audio' | 'video') => {
    // Log the target user's ID for debugging
    console.log(`CallProvider: Initiating ${callType} call to ${targetUser.name || targetUser.username || targetUser.email?.split('@')[0] || 'Unknown User'} (ID: ${targetUser._id})...`);

    // Prevent starting a new call if already in one or attempting to call
    if (isCallingRef.current || isCallActive || callInfo) {
      console.warn("CallProvider: Already in a call or attempting to initiate a call. Cannot start new call.");
      return;
    }

    // Ensure current user's MongoDB ID is available
    if (!user?._id) {
      console.error("CallProvider: Current user's MongoDB ID is not available. Cannot start call.");
      alert("Cannot start call: Your user ID is not available. Please try logging in again.");
      return;
    }

    // Ensure target user's MongoDB ID is available
    if (!targetUser._id) {
      console.error("CallProvider: Target user's MongoDB ID is not available. Cannot start call.");
      alert("Cannot start call: Recipient's ID is not available. Please try again.");
      return;
    }

    isCallingRef.current = true; // Set calling flag immediately
    playRinging(); // Play ringing sound for the caller

    setCallingInfo({
      isOutgoingCall: true,
      targetUserId: targetUser._id, // Use targetUser._id here
      targetUserName: targetUser.name || targetUser.displayName || targetUser.email?.split('@')[0] || 'Unknown User',
      targetUserAvatar: targetUser.avatarUrl || '',
      callType,
    });

    const constraints = callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
    console.log("CallProvider: getUserMedia constraints for initiating call:", constraints);

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        console.log("CallProvider: Successfully got local user media for initiating call.");
        setStream(mediaStream);

        const peer = new Peer({ initiator: true, trickle: false, stream: mediaStream });

        peer.on('signal', (data) => {
          console.log("CallProvider: Peer signal (offer SDP generated):", data);
          socket.emit('call-user', {
            targetId: targetUser._id, // Use targetUser._id for the target
            offer: data,
            caller: {
              uid: user?.uid || '',
              name: user?.name || user?.displayName || '',
              username: user?.email?.split('@')[0] || '',
              avatarUrl: user?.avatarUrl || '',
              mongoUserId: user?._id, // Send caller's MongoDB _id
            },
            callType,
          });
        });

        peer.on('stream', remote => {
          console.log("CallProvider: Remote stream received after initiating. Setting remoteStream state.");
          stopRinging(); // Stop ringing for the caller
          setRemoteStream(remote);
          setIsCallActive(true);
        });

        peer.on('connect', () => {
          console.log("CallProvider: Peer connection established (connected event).");
        });

        peer.on('close', () => {
          console.log("CallProvider: Peer connection closed.");
          resetCallStates();
        });

        peer.on('error', (err) => {
          console.error("CallProvider: Peer error:", err);
          resetCallStates();
        });

        peerRef.current = peer;
      })
      .catch(error => {
        console.error("CallProvider: Failed to get user media (for outgoing call):", error.name, error.message, error);
        resetCallStates(); // Reset if media access fails
        alert("Could not access your microphone/camera. Please ensure permissions are granted and then try again.");
      });
  }, [user, isCallActive, callInfo, resetCallStates, playRinging, stopRinging]);

  return (
    <CallContext.Provider value={{
      stream,
      remoteStream,
      callInfo, // Exposes incoming call details (for modal)
      callingInfo, // Exposes outgoing call details (for modal and CallScreen)
      startCall,
      answerCall,
      declineCall,
      endCall,
      isReceivingCall: !!callInfo?.isReceivingCall,
      isOutgoingCall: !!callingInfo?.isOutgoingCall, // This will be true only during the dialing phase
      isCallActive,
    }}>
      {children}
    </CallContext.Provider>
  );
};