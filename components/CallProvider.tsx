'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
} from 'react';
import io from 'socket.io-client';
// import type { Socket as ClientSocket } from 'socket.io-client';
import type { Socket } from 'socket.io-client/build/esm/socket';
// import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Peer from 'simple-peer';
import { useAuth } from './AuthProvider';

const WS_SERVER = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api', '');

interface CallContextType {
    callIncoming: boolean;
    callerInfo: any;
    callAccepted: boolean;
    callEnded: boolean;
    isInCall: boolean;
    callType: 'audio' | 'video';
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startCall: (targetUser: any, callType: 'audio' | 'video') => void;
    answerCall: () => void;
    declineCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => void;
    isMuted: boolean;
    isVideoOff: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, getIdToken, yourFirebaseToken } = useAuth(); // contains Firebase UID and token

    // Call states
    const [callIncoming, setCallIncoming] = useState(false);
    const [callerInfo, setCallerInfo] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    // const [socket, setSocket] = useState<Socket | null>(null);
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);


    // Refs
    const [peer, setPeer] = useState<Peer.Instance | null>(null);
    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const ringtoneAudio = useRef<HTMLAudioElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const connectSocket = async () => {
            if (!user) return;

            const token = await getIdToken();

            const socketInstance = io(WS_SERVER!, {
                auth: { token: yourFirebaseToken },
                query: { userId: user.uid },
            });

            // ✅ Incoming call
            socketInstance.on('incoming-call', ({ from, caller, offer, callType }) => {
                console.log('📞 Incoming call:', { from, caller, offer, callType });
                setCallerInfo({ from, offer, caller, callType });
                setCallType(callType);
                setCallIncoming(true);
                setCallAccepted(false);
                setCallEnded(false);
                setIsInCall(false);

                ringtoneAudio.current = new Audio('/sounds/ringtone.mp3');
                ringtoneAudio.current.loop = true;
                ringtoneAudio.current.play().catch(console.error);
            });

            socketInstance.on('call-answered', ({ answer }) => {
                console.log('✅ Call answered');
                if (peer) {
                    peer.signal(answer);
                }
            });

            socketInstance.on('call-ended', () => {
                console.log('❌ Call ended by remote');
                handleCallEnd();
            });

            socketInstance.on('call-declined', () => {
                console.log('❌ Call declined by remote');
                handleCallEnd();
            });

            socketInstance.on('user-offline', ({ targetId }) => {
                console.log('📵 User offline:', targetId);
                alert('User is offline or not available');
                handleCallEnd();
            });

            // Store socket in state/ref if needed
            setSocket(socketInstance);

            // Cleanup on unmount
            return () => {
                socketInstance.disconnect();
                cleanupCall();
            };
        };

        connectSocket(); // ✅ You forgot to call this!

        // Optional: cleanup if user logs out
        return () => {
            if (socket) {
                socket.disconnect();
                cleanupCall();
            }
        };
    }, [user]);


    // Start a new call
    const startCall = async (targetUser: any, callType: 'audio' | 'video' = 'audio') => {
        try {
            console.log('🚀 Starting call to:', targetUser.displayName, 'Type:', callType);

            setCallType(callType);
            setCallAccepted(false);
            setCallIncoming(false);
            setIsInCall(true);

            // Get user media
            const userMedia = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true,
            });

            setLocalStream(userMedia);

            // Display local video if video call
            if (callType === 'video' && localVideoRef.current) {
                localVideoRef.current.srcObject = userMedia;
            }

            // Create peer connection
            const p = new Peer({
                initiator: true,
                trickle: false,
                stream: userMedia,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            p.on('signal', (offer) => {
                console.log('📡 Sending call offer');
                socketRef.current?.emit('call-user', {
                    targetId: targetUser.firebaseUid,
                    caller: user,
                    offer,
                    callType,
                });
            });

            p.on('stream', (remoteStream) => {
                console.log('🎵 Received remote stream');
                setRemoteStream(remoteStream);
                setCallAccepted(true);

                // Play remote audio/video
                if (callType === 'video' && remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                } else {
                    const audio = new Audio();
                    audio.srcObject = remoteStream;
                    audio.play();
                }
            });

            p.on('error', (err) => {
                console.error('❌ Peer error:', err);
                handleCallEnd();
            });

            p.on('close', () => {
                console.log('🔌 Peer connection closed');
                handleCallEnd();
            });

            setPeer(p);
        } catch (error) {
            console.error('❌ Error starting call:', error);
            alert('Error starting call. Please check your camera/microphone permissions.');
            handleCallEnd();
        }
    };

    // Answer incoming call
    const answerCall = async () => {
        if (!callerInfo) return;

        try {
            console.log('📞 Answering call');

            // Stop ringtone
            ringtoneAudio.current?.pause();

            // Get user media
            const userMedia = await navigator.mediaDevices.getUserMedia({
                video: callerInfo.callType === 'video',
                audio: true,
            });

            setLocalStream(userMedia);
            setCallAccepted(true);
            setIsInCall(true);

            // Display local video if video call
            if (callerInfo.callType === 'video' && localVideoRef.current) {
                localVideoRef.current.srcObject = userMedia;
            }

            // Create peer connection
            const p = new Peer({
                initiator: false,
                trickle: false,
                stream: userMedia,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            p.on('signal', (answer) => {
                console.log('📡 Sending call answer');
                socketRef.current?.emit('answer-call', {
                    targetId: callerInfo.from,
                    answer,
                });
            });

            p.on('stream', (remoteStream) => {
                console.log('🎵 Received remote stream');
                setRemoteStream(remoteStream);

                // Play remote audio/video
                if (callerInfo.callType === 'video' && remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                } else {
                    const audio = new Audio();
                    audio.srcObject = remoteStream;
                    audio.play();
                }
            });

            p.on('error', (err) => {
                console.error('❌ Peer error:', err);
                handleCallEnd();
            });

            p.on('close', () => {
                console.log('🔌 Peer connection closed');
                handleCallEnd();
            });

            p.signal(callerInfo.offer);
            setPeer(p);
        } catch (error) {
            console.error('❌ Error answering call:', error);
            alert('Error answering call. Please check your camera/microphone permissions.');
            handleCallEnd();
        }
    };

    // Decline incoming call
    const declineCall = () => {
        console.log('❌ Declining call');
        ringtoneAudio.current?.pause();
        socketRef.current?.emit('decline-call', { targetId: callerInfo?.from });
        setCallIncoming(false);
        setCallerInfo(null);
    };

    // End call
    const endCall = () => {
        console.log('❌ Ending call');
        socketRef.current?.emit('end-call', { targetId: callerInfo?.from });
        handleCallEnd();
    };

    // Handle call end cleanup
    const handleCallEnd = () => {
        cleanupCall();
        setCallIncoming(false);
        setCallAccepted(false);
        setCallerInfo(null);
        setCallEnded(true);
        setIsInCall(false);

        // Reset after 2 seconds
        setTimeout(() => {
            setCallEnded(false);
        }, 2000);
    };

    // Cleanup call resources
    const cleanupCall = () => {
        // Stop ringtone
        ringtoneAudio.current?.pause();

        // Stop all tracks
        localStream?.getTracks().forEach((track) => track.stop());
        remoteStream?.getTracks().forEach((track) => track.stop());

        // Destroy peer connection
        peer?.destroy();

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        // Reset states
        setPeer(null);
        setLocalStream(null);
        setRemoteStream(null);
        setIsMuted(false);
        setIsVideoOff(false);
    };

    // Toggle mute
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <CallContext.Provider
            value={{
                callIncoming,
                callerInfo,
                callAccepted,
                callEnded,
                isInCall,
                callType,
                localStream,
                remoteStream,
                startCall,
                answerCall,
                declineCall,
                endCall,
                toggleMute,
                toggleVideo,
                isMuted,
                isVideoOff,
            }}
        >
            {/* Incoming Call Modal */}
            {callIncoming && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <div className="mb-4">
                            {callerInfo?.caller?.photoURL && (
                                <img
                                    src={callerInfo.caller.photoURL}
                                    alt="Caller"
                                    className="w-20 h-20 rounded-full mx-auto mb-4"
                                />
                            )}
                            <h2 className="text-xl font-semibold mb-2">
                                {callerInfo?.caller?.displayName || 'Unknown'}
                            </h2>
                            <p className="text-gray-600">
                                Incoming {callerInfo?.callType} call...
                            </p>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center space-x-2"
                                onClick={answerCall}
                            >
                                <span>📞</span>
                                <span>Accept</span>
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center space-x-2"
                                onClick={declineCall}
                            >
                                <span>📞</span>
                                <span>Decline</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Screen */}
            {(callAccepted || isInCall) && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    {/* Video Call Layout */}
                    {callType === 'video' ? (
                        <div className="flex-1 relative">
                            {/* Remote Video */}
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />

                            {/* Local Video (Picture-in-Picture) */}
                            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Audio Call Layout */
                        <div className="flex-1 flex flex-col items-center justify-center">
                            {callerInfo?.caller?.photoURL && (
                                <img
                                    src={callerInfo.caller.photoURL}
                                    alt="Caller"
                                    className="w-32 h-32 rounded-full mb-4"
                                />
                            )}
                            <h2 className="text-white text-2xl font-semibold mb-2">
                                {callerInfo?.caller?.displayName || 'Unknown'}
                            </h2>
                            <p className="text-gray-300">
                                {callAccepted ? 'Call in progress...' : 'Calling...'}
                            </p>
                        </div>
                    )}

                    {/* Call Controls */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        {/* Mute Button */}
                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'
                                } text-white hover:bg-opacity-80`}
                        >
                            {isMuted ? '🔇' : '🔊'}
                        </button>

                        {/* Video Toggle (only for video calls) */}
                        {callType === 'video' && (
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600'
                                    } text-white hover:bg-opacity-80`}
                            >
                                {isVideoOff ? '📹' : '📷'}
                            </button>
                        )}

                        {/* End Call Button */}
                        <button
                            onClick={endCall}
                            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                            📞
                        </button>
                    </div>
                </div>
            )}

            {/* Call Ended Message */}
            {callEnded && (
                <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg z-50">
                    <p>Call ended</p>
                </div>
            )}

            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};