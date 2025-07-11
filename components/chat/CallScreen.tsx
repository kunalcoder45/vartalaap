// // client/components/chat/CallScreen.tsx
// 'use client';

// import { useCall } from '../../app/context/CallProvider';
// import { VideoOff, MicOff, PhoneOff, Phone } from 'lucide-react'; // Added Phone icon for audio call UI
// import { useCallback, useState, useEffect, useRef } from 'react';

// interface CallScreenProps {
//   targetName: string;
//   targetAvatar: string | null;
// }

// const CallScreen = ({ targetName, targetAvatar }: CallScreenProps) => {
//   const {
//     stream: localStream, // Renamed to avoid confusion with remoteStream
//     remoteStream, // Now correctly provided by context
//     endCall,
//     isCallActive, // Now correctly provided by context
//     myVideoRef, // Get the local video ref from context
//     peerVideoRef, // Get the peer video ref from context
//   } = useCall();

//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isCameraOff, setIsCameraOff] = useState(false);
//   const [callDuration, setCallDuration] = useState(0); // State for call duration in seconds

//   const remoteAudioRef = useRef<HTMLAudioElement>(null);

//   const isVideoCall =
//     (localStream && localStream.getVideoTracks().length > 0) ||
//     (remoteStream && remoteStream.getVideoTracks().length > 0);

//   // Effect to handle remote audio stream for audio-only calls
//   useEffect(() => {
//     if (remoteAudioRef.current && remoteStream && !isVideoCall) {
//       remoteAudioRef.current.srcObject = remoteStream;
//       remoteAudioRef.current.play().catch(e => {
//         console.warn("CallScreen: Failed to autoplay remote audio (likely autoplay policy):", e);
//       });
//     }
//   }, [remoteStream, isVideoCall]);

//   // Effect for the call duration timer
//   useEffect(() => {
//     let timerInterval: NodeJS.Timeout | undefined;

//     if (isCallActive) {
//       // Start the timer when the call becomes active
//       setCallDuration(0); // Reset timer to 0 at the start of an active call
//       timerInterval = setInterval(() => {
//         setCallDuration(prevDuration => prevDuration + 1);
//       }, 1000);
//     } else {
//       // Clear the timer when the call ends
//       clearInterval(timerInterval);
//       setCallDuration(0); // Reset duration if call is not active
//     }

//     // Cleanup function: Clear interval when component unmounts or isCallActive changes to false
//     return () => {
//       if (timerInterval) {
//         clearInterval(timerInterval);
//       }
//     };
//   }, [isCallActive]); // Dependency on isCallActive ensures timer starts/stops correctly

//   const formatTime = (totalSeconds: number): string => {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };
//   const toggleMic = useCallback(() => {
//     // Use localStream from context for toggling tracks
//     if (localStream) {
//       localStream.getAudioTracks().forEach(track => {
//         track.enabled = !track.enabled;
//         setIsMicMuted(!track.enabled);
//       });
//       console.log(`CallScreen: Mic toggled to ${!isMicMuted ? 'muted' : 'unmuted'}`);
//     }
//   }, [localStream, isMicMuted]); // Change stream to localStream

//   const toggleCamera = useCallback(() => {
//     // Use localStream from context for toggling tracks
//     if (localStream) {
//       localStream.getVideoTracks().forEach(track => {
//         track.enabled = !track.enabled;
//         setIsCameraOff(!track.enabled);
//       });
//       console.log(`CallScreen: Camera toggled to ${!isCameraOff ? 'off' : 'on'}`);
//     }
//   }, [localStream, isCameraOff]); // Change stream to localStream

//   // Enhanced debugging (keep these for now if helpful)
//   useEffect(() => {
//     console.log("CallScreen Render - Props received:");
//     console.log("   isCallActive:", isCallActive);
//     console.log("   targetName (prop):", targetName);
//     console.log("   targetName length:", targetName?.length || 0);
//     console.log("   targetName truthy:", !!targetName);
//     console.log("   targetAvatar (prop):", targetAvatar);
//     console.log("   isVideoCall:", isVideoCall);
//   }, [isCallActive, targetName, targetAvatar, isVideoCall]);

//   if (!isCallActive) {
//     console.log("CallScreen: Not rendering - isCallActive is false");
//     return null;
//   }

//   // Enhanced fallback logic
//   const displayName = targetName && targetName.trim() ? targetName : 'Unknown User';
//   const displayAvatar = targetAvatar && targetAvatar.trim() ? targetAvatar : null;

//   console.log("CallScreen: Final display values:");
//   console.log("   displayName:", displayName);
//   console.log("   displayAvatar:", displayAvatar);

//   // Render full video screen for video calls
//   if (isVideoCall) {
//     return (
//       <div className="fixed inset-0 bg-black z-40 flex justify-center items-center">
// // For Video Call UI
//         {remoteStream && (
//           <video
//             autoPlay
//             playsInline
//             ref={peerVideoRef} // Assign the ref from context
//             className="w-full h-full object-cover"
//           />
//         )}
//         {localStream && ( // Use localStream here
//           <video
//             muted
//             autoPlay
//             playsInline
//             ref={myVideoRef} // Assign the ref from context
//             className="w-40 h-40 object-cover absolute bottom-4 right-4 rounded-lg border-2 border-white"
//           />
//         )}
//         {remoteStream && (
//           <audio autoPlay playsInline ref={peerVideoRef} />
//         )}

//         <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg flex items-center space-x-3">
//           {displayAvatar && (
//             <img
//               src={displayAvatar}
//               alt={displayName}
//               className="w-12 h-12 rounded-full object-cover"
//               onError={(e) => {
//                 console.log("CallScreen: Avatar failed to load:", displayAvatar);
//                 const target = e.target as HTMLImageElement;
//                 target.style.display = 'none'; // Hide image on error
//               }}
//             />
//           )}
//           <div className="flex flex-col items-start">
//             <p className="text-xl font-bold">
//               {displayName}
//             </p>
//             {/* Call Duration Timer for Video Call */}
//             <p className="text-sm text-gray-300">
//               {formatTime(callDuration)}
//             </p>
//           </div>
//         </div>

//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4 p-3 bg-gray-800 rounded-full shadow-lg">
//           <button
//             onClick={toggleMic}
//             className={`p-3 rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
//             title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
//           >
//             <MicOff size={24} />
//           </button>
//           <button
//             onClick={toggleCamera}
//             className={`p-3 rounded-full ${isCameraOff ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
//             title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
//           >
//             <VideoOff size={24} />
//           </button>
//           <button
//             onClick={endCall}
//             className="p-3 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
//             title="End Call"
//           >
//             <PhoneOff size={24} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Render compact UI for audio calls
//   return (
//     <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 flex flex-col items-center min-w-[250px]">
//       <div className="flex flex-col items-center">
//         {displayAvatar && (
//           <img
//             src={displayAvatar}
//             alt={displayName}
//             className="w-16 h-16 rounded-full object-cover mb-2"
//             onError={(e) => {
//               console.log("CallScreen: Avatar failed to load:", displayAvatar);
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none'; // Hide image on error
//             }}
//           />
//         )}
//         <p className="text-lg font-semibold mb-1 text-center">
//           {displayName}
//         </p>
//         <p className="text-md text-gray-300">Audio Call</p>
//         {/* Call Duration Timer for Audio Call */}
//         <p className="text-lg text-green-400 font-bold">
//           {formatTime(callDuration)}
//         </p>
//       </div>

//       {remoteStream && (
//         <audio autoPlay playsInline ref={remoteAudioRef} />
//       )}

//       <div className="flex justify-around w-full mt-4"> {/* Added mt-4 for spacing */}
//         <button
//           onClick={toggleMic}
//           className={`p-4 cursor-pointer rounded-full ${isMicMuted ? 'bg-red-600' : 'bg-gray-700'} text-white flex items-center justify-center transition-colors duration-200`}
//           title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
//         >
//           <MicOff size={20} />
//         </button>
//         <button
//           onClick={endCall}
//           className="p-4 cursor-pointer rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
//           title="End Call"
//         >
//           <PhoneOff size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CallScreen;


// components/chat/CallScreen.tsx
'use client'; // If it's a client component

import React from 'react';
// import any other necessary components or hooks here

interface CallScreenProps {
  targetName: string;
  targetAvatar: string | null;
  // Add other props relevant to your CallScreen component (e.g., onEndCall, mediaStream, etc.)
}

const CallScreen: React.FC<CallScreenProps> = ({ targetName, targetAvatar }) => {
  // Your CallScreen logic and UI here
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-50">
      <div className="text-center">
        {targetAvatar && (
          <img src={targetAvatar} alt={targetName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
        )}
        <h2 className="text-3xl font-bold mb-2">{targetName}</h2>
        <p className="text-xl">Call in progress...</p>
        {/* Add video/audio elements, call controls, etc. */}
      </div>
      {/* Example: A button to end the call (you'll likely pass an onEndCall prop) */}
      {/* <button onClick={onEndCall} className="mt-8 px-6 py-3 bg-red-600 rounded-full text-lg">End Call</button> */}
    </div>
  );
};

export default CallScreen; // <--- THIS IS THE CRUCIAL LINE YOU'RE LIKELY MISSING OR MISCONFIGURED