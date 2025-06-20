// client/components/CallManager.tsx
'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import Peer from 'simple-peer'; // Make sure you've run 'npm install simple-peer @types/simple-peer'
import { useSocket } from './SocketProvider'; // Import useSocket
import { useAuth } from './AuthProvider'; // To get mongoUser details

interface User {
    _id: string;
    name: string;
    avatarUrl?: string;
    // Add any other relevant user properties
}

interface CallContextType {
    callUser: (receiver: User) => void; // Modified: only takes receiver
    answerCall: () => void;
    endCall: () => void;
    incomingCall: { from: User; signal: any; callId: string } | null;
    callAccepted: boolean;
    stream: MediaStream | null;
    peerVideoRef: React.RefObject<HTMLVideoElement>; // Renamed from userVideo
    myVideoRef: React.RefObject<HTMLVideoElement>;    // Renamed from myVideo
    isCalling: boolean; // True if an outgoing call is initiated or an incoming call is active
    outgoingCallTarget: User | null; // The user you are currently calling
    currentCallId: string | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
    children: ReactNode;
    currentUserId: string; // The ID of the currently logged-in user (from MongoUser._id)
    currentUserName: string; // The name of the currently logged-in user (from MongoUser.name)
}

export const CallProvider: React.FC<CallProviderProps> = ({ children, currentUserId, currentUserName }) => {
    const { socket } = useSocket();
    // No need for mongoUser from useAuth here directly, as currentUserId and currentUserName are passed as props

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [incomingCall, setIncomingCall] = useState<{ from: User; signal: any; callId: string } | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [isCalling, setIsCalling] = useState(false); // Manages overall calling state
    const [outgoingCallTarget, setOutgoingCallTarget] = useState<User | null>(null);
    const [currentCallId, setCurrentCallId] = useState<string | null>(null);

    const myVideoRef = useRef<HTMLVideoElement>(null); // Local user's video/audio
    const peerVideoRef = useRef<HTMLVideoElement>(null); // Remote peer's video/audio
    const connectionRef = useRef<Peer.Instance | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null); // To keep track of the local stream for cleanup

    // --- Utility to clean up call state ---
    const resetCallState = useCallback(() => {
        console.log("Resetting call state...");
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (myVideoRef.current) myVideoRef.current.srcObject = null;
        if (peerVideoRef.current) peerVideoRef.current.srcObject = null;
        if (connectionRef.current) {
            connectionRef.current.destroy(); // Properly destroy peer connection
            connectionRef.current = null;
        }
        setStream(null);
        setIncomingCall(null);
        setCallAccepted(false);
        setIsCalling(false);
        setOutgoingCallTarget(null);
        setCurrentCallId(null);
        console.log("Call state reset complete.");
    }, []);

    // --- Get User Media Stream ---
    const getMedia = useCallback(async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }); // Only audio for now
            setStream(currentStream);
            localStreamRef.current = currentStream; // Store ref for cleanup
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = currentStream;
            }
            console.log("Local media stream obtained.");
            return currentStream;
        } catch (err) {
            console.error("Error getting user media:", err);
            alert("Please allow microphone access for calls. Error: " + err.message);
            resetCallState(); // Reset if media access fails
            return null;
        }
    }, [resetCallState]);

    // --- Create Peer Connection Instance ---
    const createPeer = useCallback((initiator: boolean, stream: MediaStream | null) => {
        return new Peer({
            initiator,
            trickle: false, // Set to false to send all ICE candidates at once with SDP
            stream: stream || undefined, // Pass stream only if available
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    // Consider adding more STUN/TURN servers for robustness in production
                    // { urls: 'stun:stun1.l.google.com:19302' },
                    // { urls: 'stun:stun2.l.google.com:19302' },
                ],
            },
        });
    }, []);

    // --- Call User Function (Initiator) ---
    const callUser = useCallback(async (receiver: User) => { // Only takes receiver now
        if (!socket || !currentUserId || !currentUserName) {
            console.error("Socket not connected or caller info missing for callUser.");
            alert("Cannot initiate call: Please ensure you are logged in and connected.");
            return;
        }
        if (isCalling) { // Prevent initiating new call if one is active
            console.warn("Already in a call or initiating another call.");
            alert("You are already in a call or attempting another call.");
            return;
        }

        setIsCalling(true);
        setOutgoingCallTarget(receiver);
        const newCallId = `${currentUserId}-${receiver._id}-${Date.now()}`; // Unique call ID
        setCurrentCallId(newCallId);

        console.log(`Attempting to get media for outgoing call to ${receiver.name}.`);
        const localStream = await getMedia();
        if (!localStream) {
            resetCallState(); // Reset state if media access fails
            return;
        }

        console.log(`Creating peer for outgoing call to ${receiver.name}.`);
        const peer = createPeer(true, localStream); // Initiator: true
        connectionRef.current = peer;

        peer.on('signal', (data) => {
            console.log("Caller: Emitting 'call-user' signal to signaling server.");
            socket.emit('call-user', {
                userToCall: receiver._id,
                signalData: data,
                from: currentUserId,
                fromName: currentUserName,
                callId: newCallId
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log("Caller: Received remote stream from peer.");
            if (peerVideoRef.current) {
                peerVideoRef.current.srcObject = remoteStream;
            }
        });

        peer.on('connect', () => {
            console.log('Peer connection established (outgoing call).');
            setCallAccepted(true); // Call is connected
            // No need to setIsCalling(true) again, already true
        });

        peer.on('close', () => {
            console.log('Peer connection closed (outgoing call).');
            resetCallState();
        });

        peer.on('error', (err) => {
            console.error("Peer error (outgoing call):", err);
            resetCallState();
            alert("Call failed during connection: " + err.message);
        });

    }, [socket, getMedia, createPeer, isCalling, currentUserId, currentUserName, resetCallState]);

    // --- Answer Call Function (Receiver) ---
    const answerCall = useCallback(async () => {
        if (!socket || !incomingCall || !currentUserId || !currentUserName) {
            console.error("Cannot answer call: Socket not connected, no incoming call, or user info missing.");
            return;
        }
        if (callAccepted) {
            console.warn("Call already accepted.");
            return;
        }

        setIsCalling(true);
        setCallAccepted(true);
        setCurrentCallId(incomingCall.callId); // Set currentCallId to the incoming call's ID

        console.log("Attempting to get media for answering call.");
        const localStream = await getMedia();
        if (!localStream) {
            resetCallState();
            return;
        }

        console.log("Creating peer for answering call.");
        const peer = createPeer(false, localStream); // Not initiator
        connectionRef.current = peer;

        peer.on('signal', (data) => {
            console.log("Receiver: Emitting 'answer-call' signal to signaling server.");
            socket.emit('answer-call', {
                signal: data,
                to: incomingCall.from._id, // Send answer back to the caller's userId
                callId: incomingCall.callId
            });
        });

        peer.on('stream', (remoteStream) => {
            console.log("Receiver: Received remote stream from peer.");
            if (peerVideoRef.current) {
                peerVideoRef.current.srcObject = remoteStream;
            }
        });

        peer.on('connect', () => {
            console.log('Peer connection established (incoming call).');
        });

        peer.on('close', () => {
            console.log('Peer connection closed (incoming call).');
            resetCallState();
        });

        peer.on('error', (err) => {
            console.error("Peer error (incoming call):", err);
            resetCallState();
            alert("Call failed during connection: " + err.message);
        });

        // Process the incoming offer signal from the caller
        console.log("Receiver: Processing incoming offer signal.");
        try {
            peer.signal(incomingCall.signal);
        } catch (e) {
            console.error("Error signaling peer:", e);
            resetCallState();
            alert("Failed to process incoming call signal.");
        }

    }, [socket, incomingCall, getMedia, createPeer, resetCallState, callAccepted, currentUserId, currentUserName]);

    // --- End Call Function ---
    const endCall = useCallback(() => {
        console.log("Attempting to end call.");
        if (socket && currentCallId) {
            const otherPartyId = outgoingCallTarget?._id || incomingCall?.from._id;
            console.log(`Emitting 'end-call' for call ID ${currentCallId} to other party ${otherPartyId}.`);
            socket.emit('end-call', { callId: currentCallId, to: otherPartyId }); // Inform the other party
        } else {
            console.log("No active call or socket to emit end-call.");
        }
        resetCallState(); // Always reset local state
    }, [socket, currentCallId, outgoingCallTarget, incomingCall, resetCallState]);


    // --- Socket.IO Call Event Listeners ---
    useEffect(() => {
        if (!socket || !currentUserId) return; // Ensure socket and current user ID are available

        // Listener for incoming calls from signaling server
        socket.on('call-made', (data: { signalData: any; from: string; fromName: string; callId: string }) => {
            console.log('Incoming call-made event received:', data);
            
            // Prevent multiple incoming call popups or conflicts with outgoing calls
            if (isCalling) { 
                console.warn("Busy (isCalling true), rejecting new incoming call.");
                socket.emit('call-rejected', { to: data.from, callId: data.callId, reason: 'busy' });
                return;
            }

            const fromUser: User = { _id: data.from, name: data.fromName };
            setIncomingCall({ from: fromUser, signal: data.signalData, callId: data.callId });
            setIsCalling(true); // Mark as busy with an incoming call
            setCurrentCallId(data.callId); // Set the current call ID for tracking
            console.log(`Incoming call from ${data.fromName}.`);
        });

        // Listener for when the caller receives the answer
        socket.on('call-accepted', (data: { signal: any; callId: string }) => {
            console.log('Call accepted signal received:', data);
            if (connectionRef.current && data.callId === currentCallId) {
                console.log("Processing accepted signal for current call.");
                connectionRef.current.signal(data.signal);
                setCallAccepted(true); // Call is now officially accepted and connected
            } else {
                console.warn("Call accepted signal received for unknown or mismatched callId. Ignoring.");
            }
        });

        // Listener for when the other party ends the call
        socket.on('call-ended', (data: { callId: string; reason?: string }) => {
            console.log(`Call ended by other party: ${data.callId}. Reason: ${data.reason || 'manual end'}`);
            if (data.callId === currentCallId) {
                alert(`Call with ${outgoingCallTarget?.name || incomingCall?.from.name || 'someone'} has ended.`);
                resetCallState();
            } else {
                console.warn("Received 'call-ended' for a non-current call. Ignoring.");
            }
        });

        // Listener for when the call is rejected or user is offline
        socket.on('call-rejected', (data: { from: string; callId: string; reason?: string }) => {
            console.log(`Call rejected event received: ${data.callId}. From: ${data.from}. Reason: ${data.reason}`);
            if (data.callId === currentCallId) {
                const rejectionReason = data.reason === 'offline' ? 'is offline' :
                                        data.reason === 'busy' ? 'is busy' :
                                        'declined the call';
                alert(`${outgoingCallTarget?.name || 'The user you called'} ${rejectionReason}.`);
                resetCallState();
            } else {
                console.warn("Received 'call-rejected' for a non-current call. Ignoring.");
            }
        });


        return () => {
            // Clean up event listeners when component unmounts or dependencies change
            socket.off('call-made');
            socket.off('call-accepted');
            socket.off('call-ended');
            socket.off('call-rejected');
            console.log("Call socket listeners cleaned up.");
        };
    }, [socket, isCalling, resetCallState, currentCallId, outgoingCallTarget, incomingCall, currentUserId]);


    const value = {
        callUser,
        answerCall,
        endCall,
        incomingCall,
        callAccepted,
        stream,
        peerVideoRef, // Updated ref names
        myVideoRef,   // Updated ref names
        isCalling,
        outgoingCallTarget,
        currentCallId,
    };

    return (
        <CallContext.Provider value={value}>
            {children}
            {/* Audio/Video elements for local and remote streams */}
            {/* The `muted` attribute is important for the local video to prevent echo */}
            <audio ref={myVideoRef} autoPlay muted style={{ display: 'none' }} /> 
            <audio ref={peerVideoRef} autoPlay style={{ display: 'none' }} />

            {/* In-Call UI Modals (can be moved to a separate component if preferred) */}
            {incomingCall && !callAccepted && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl text-center max-w-sm w-full">
                        <img 
                            src={incomingCall.from.avatarUrl || '/default-avatar.png'} // Use default avatar if none
                            alt={incomingCall.from.name} 
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
                        />
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">{incomingCall.from.name} is calling...</h3>
                        <p className="text-gray-600 mb-6">Audio Call</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={answerCall}
                                className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-all duration-200 shadow-lg text-lg"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => {
                                    if (incomingCall) {
                                        socket?.emit('call-rejected', { to: incomingCall.from._id, callId: incomingCall.callId, reason: 'declined' });
                                    }
                                    resetCallState();
                                }}
                                className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg text-lg"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCalling && !callAccepted && outgoingCallTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl text-center max-w-sm w-full">
                        <img 
                            src={outgoingCallTarget.avatarUrl || '/default-avatar.png'} // Use default avatar if none
                            alt={outgoingCallTarget.name} 
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
                        />
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">Calling {outgoingCallTarget.name}...</h3>
                        <p className="text-gray-600 mb-6">Waiting for answer...</p>
                        <button
                            onClick={endCall}
                            className="bg-red-500 text-white px-6 py-3 rounded-full text-lg hover:bg-red-600 transition-all duration-200 shadow-lg"
                        >
                            Cancel Call
                        </button>
                    </div>
                </div>
            )}

            {isCalling && callAccepted && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-700 to-indigo-800 flex flex-col items-center justify-center z-50 text-white">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-extrabold mb-2">
                            On Call with {incomingCall ? incomingCall.from.name : outgoingCallTarget?.name}
                        </h3>
                        <p className="text-xl opacity-90">Connected</p>
                    </div>
                    {/* Optionally display small local/remote video streams if needed for debugging, or just for future video calls */}
                    {/* <div className="flex space-x-4 mb-8">
                        <video ref={myVideoRef} autoPlay muted playsInline className="w-32 h-32 rounded-full object-cover border-2 border-white shadow-lg" />
                        <video ref={peerVideoRef} autoPlay playsInline className="w-32 h-32 rounded-full object-cover border-2 border-white shadow-lg" />
                    </div> */}
                    <button
                        onClick={endCall}
                        className="bg-red-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg transform hover:scale-105"
                    >
                        End Call
                    </button>
                </div>
            )}

        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};