import { useCall } from '../../app/context/CallProvider';

const CallModal = () => {
  const { callInfo, answerCall, endCall, isReceivingCall } = useCall();

  if (!isReceivingCall) return null;

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <p>{callInfo?.caller?.name} is calling...</p>
      <div className="flex gap-2 mt-3">
        <button onClick={answerCall} className="bg-green-500 text-white px-4 py-1 rounded">Accept</button>
        <button onClick={endCall} className="bg-red-500 text-white px-4 py-1 rounded">Decline</button>
      </div>
    </div>
  );
};

export default CallModal;