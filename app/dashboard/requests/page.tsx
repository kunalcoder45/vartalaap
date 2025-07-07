// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '@/components/AuthProvider';
// import { UserCheck, UserX, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import Image from 'next/image';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

// export default function RequestsPage() {
//     const { token } = useAuth();
//     const router = useRouter();
//     const [requests, setRequests] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [processing, setProcessing] = useState<string | null>(null);

//     useEffect(() => {
//         if (token) fetchPendingRequests();
//     }, [token]);

//     const fetchPendingRequests = async () => {
//         setLoading(true);
//         try {
//             const res = await fetch(`${API_BASE_URL}/follow/pending-requests`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (!res.ok) throw new Error('Failed to fetch requests');
//             const data = await res.json();
//             setRequests(data.requests || []);
//         } catch (err) {
//             toast.error('Error loading follow requests');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAction = async (id: string, action: 'accept' | 'reject') => {
//         if (!token) return;

//         setProcessing(id);
//         try {
//             const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';
//             const res = await fetch(`${API_BASE_URL}/follow/${endpoint}/${id}`, {
//                 method: 'PUT',
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!res.ok) throw new Error('Action failed');
//             setRequests(prev => prev.filter(r => r._id !== id));
//             toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
//         } catch (err) {
//             toast.error(`Failed to ${action}`);
//         } finally {
//             setProcessing(null);
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto px-4 py-0">
//             <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Pending Friend Requests</h1>

//             {loading ? (
//                 <div className="flex justify-center items-center py-10">
//                     <Loader2 size={24} className="animate-spin text-blue-500" />
//                 </div>
//             ) : requests.length === 0 ? (
//                 <p className="text-center text-gray-400">No pending requests</p>
//             ) : (
//                 <ul className="space-y-5">
//                     <AnimatePresence>
//                         {requests.map((req) => (
//                             <motion.li
//                                 key={req._id}
//                                 initial={{ opacity: 0, y: 10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 exit={{ opacity: 0, y: -10 }}
//                                 transition={{ duration: 0.2 }}
//                                 className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
//                             >
//                                 <div className="flex items-center justify-between">
//                                     <div
//                                         className="flex items-center gap-4 cursor-pointer"
//                                         onClick={() =>
//                                             router.push(`/users/${req.sender?.firebaseUid || req.sender?._id || 'profile'}`)
//                                         }
//                                     >
//                                         <Image
//                                             src={req.sender?.avatarUrl || '/assets/userLogo.png'}
//                                             alt={req.sender?.name || 'User'}
//                                             width={48}
//                                             height={48}
//                                             className="rounded-full object-cover border"
//                                         />
//                                         <div>
//                                             <p className="font-medium text-gray-800">{req.sender?.name || 'Unknown User'}</p>
//                                             <p className="text-sm text-gray-500">sent you a follow request</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => handleAction(req._id, 'accept')}
//                                             disabled={processing === req._id}
//                                             className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
//                                         >
//                                             <UserCheck size={16} /> Accept
//                                         </button>
//                                         <button
//                                             onClick={() => handleAction(req._id, 'reject')}
//                                             disabled={processing === req._id}
//                                             className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 disabled:opacity-50"
//                                         >
//                                             <UserX size={16} /> Reject
//                                         </button>
//                                     </div>
//                                 </div>
//                             </motion.li>
//                         ))}
//                     </AnimatePresence>
//                 </ul>
//             )}
//         </div>
//     );
// }

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { UserCheck, UserX, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vartalaap-r36o.onrender.com/api';

export default function RequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchPendingRequests();
  }, [token]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/follow/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      toast.error('Error loading follow requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    if (!token) return;

    setProcessing(id);
    const toastId = toast.loading(`${action === 'accept' ? 'Accepting' : 'Rejecting'} request...`);

    try {
      const endpoint = action === 'accept' ? 'accept-follow-request' : 'reject-follow-request';
      const res = await fetch(`${API_BASE_URL}/follow/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Action failed');
      setRequests((prev) => prev.filter((r) => r._id !== id));

      toast.dismiss(toastId);
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      {/* Toaster must be included once in your app (usually _app.tsx), added here for completeness */}
      <Toaster reverseOrder={false} />

      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Pending Friend Requests</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">No pending requests</p>
        ) : (
          <ul className="space-y-4">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.li
                  key={req._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-between items-center p-4 bg-white rounded shadow"
                >
                  <div className="flex items-center gap-4 cursor-pointer"
                    onClick={() => window.open(`/users/${req.sender?.firebaseUid || req.sender?._id || 'profile'}`, '_blank')}
                  >
                    <Image
                      src={req.sender?.avatarUrl || '/assets/userLogo.png'}
                      alt={req.sender?.name || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{req.sender?.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">sent you a follow request</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req._id, 'accept')}
                      disabled={processing === req._id}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full disabled:opacity-50
                        bg-green-500 text-green-100 hover:bg-green-600 cursor-pointer
                      `}
                    >
                      {processing === req._id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'reject')}
                      disabled={processing === req._id}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full disabled:opacity-50
                        bg-red-500 text-white hover:bg-red-600 cursor-pointer
                      `}
                    >
                      {processing === req._id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                      Reject
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );
}
