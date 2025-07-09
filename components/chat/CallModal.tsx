// // import { useCall } from '../../app/context/CallProvider';

// // const CallModal = () => {
// //   const { callInfo, answerCall, endCall, isReceivingCall } = useCall();

// //   if (!isReceivingCall) return null;

// //   return (
// //     <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
// //       <p>{callInfo?.caller?.name} is calling...</p>
// //       <div className="flex gap-2 mt-3">
// //         <button onClick={answerCall} className="bg-green-500 text-white px-4 py-1 rounded">Accept</button>
// //         <button onClick={endCall} className="bg-red-500 text-white px-4 py-1 rounded">Decline</button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CallModal;


// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
// } from 'react';
// import io from 'socket.io-client';
// import type { Socket } from 'socket.io-client/build/esm/socket';
// import Peer from 'simple-peer';
// import { useAuth } from '../AuthProvider'; // Firebase Auth context

// const WS_SERVER = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '');

// const CallContext = createContext<any>(null);

// export const CallProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user, yourFirebaseToken } = useAuth(); // contains Firebase UID and token
//   const [callIncoming, setCallIncoming] = useState(false);
//   const [callerInfo, setCallerInfo] = useState<any>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [callEnded, setCallEnded] = useState(false);
//   const [peer, setPeer] = useState<Peer.Instance | null>(null);
//   const socketRef = useRef<ReturnType<typeof io> | null>(null);
//   const ringtoneAudio = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const socket = io(WS_SERVER!, {
//       auth: { token: yourFirebaseToken},
//       query: { userId: user.uid },
//     });

//     socket.on('incoming-call', async ({ from, caller, offer, callType }) => {
//       console.log('📞 Incoming call:', caller);

//       setCallerInfo({ from, offer, caller, callType });
//       setCallIncoming(true);
//       setCallAccepted(false);
//       setCallEnded(false);

//       ringtoneAudio.current = new Audio('/sounds/ringtone.mp3');
//       ringtoneAudio.current.loop = true;
//       ringtoneAudio.current.play().catch(console.error);
//     });

//     socket.on('call-answered', ({ answer }) => {
//       peer?.signal(answer);
//     });

//     socket.on('call-ended', () => {
//       endCall();
//     });

//     socket.on('call-declined', () => {
//       endCall();
//     });

//     socketRef.current = socket;

//     return () => {
//       socket.disconnect();
//     };
//   }, [user]);

//   const startCall = async (targetUser: any, callType = 'audio') => {
//     const userMedia = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: true,
//     });

//     setStream(userMedia);

//     const p = new Peer({ initiator: true, trickle: false, stream: userMedia });

//     p.on('signal', (offer) => {
//       socketRef.current?.emit('call-user', {
//         targetId: targetUser.firebaseUid,
//         caller: user,
//         offer,
//         callType,
//       });
//     });

//     p.on('stream', (remoteStream) => {
//       const audio = new Audio();
//       audio.srcObject = remoteStream;
//       audio.play();
//     });

//     setPeer(p);
//   };

//   const answerCall = async () => {
//     if (!callerInfo) return;

//     ringtoneAudio.current?.pause();

//     const userMedia = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: true,
//     });

//     setStream(userMedia);
//     setCallAccepted(true);

//     const p = new Peer({ initiator: false, trickle: false, stream: userMedia });

//     p.on('signal', (answer) => {
//       socketRef.current?.emit('answer-call', {
//         targetId: callerInfo.from,
//         answer,
//       });
//     });

//     p.on('stream', (remoteStream) => {
//       const audio = new Audio();
//       audio.srcObject = remoteStream;
//       audio.play();
//     });

//     p.signal(callerInfo.offer);
//     setPeer(p);
//   };

//   const declineCall = () => {
//     ringtoneAudio.current?.pause();
//     socketRef.current?.emit('decline-call', { targetId: callerInfo?.from });
//     setCallIncoming(false);
//     setCallerInfo(null);
//   };

//   const endCall = () => {
//     socketRef.current?.emit('end-call', { targetId: callerInfo?.from });
//     stream?.getTracks().forEach(track => track.stop());
//     peer?.destroy();
//     setPeer(null);
//     setStream(null);
//     setCallIncoming(false);
//     setCallAccepted(false);
//     setCallerInfo(null);
//     setCallEnded(true);
//   };

//   return (
//     <CallContext.Provider
//       value={{
//         callIncoming,
//         callerInfo,
//         callAccepted,
//         startCall,
//         answerCall,
//         declineCall,
//         endCall,
//       }}
//     >
//       {children}
//     </CallContext.Provider>
//   );
// };

// export const useCall = () => useContext(CallContext);







import React, { useEffect, useRef } from 'react';

interface CallModalProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const CallModal: React.FC<CallModalProps> = ({ localStream, remoteStream }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex justify-center items-center space-x-4">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 200, borderRadius: 10 }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: 200, borderRadius: 10 }}
      />
    </div>
  );
};

export default CallModal;
