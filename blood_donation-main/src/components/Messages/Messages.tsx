import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/* =====================
   TYPES
===================== */
interface BloodRequest {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: {
    full_name: string;
    blood_group: string;
  }[];
  receiver?: {
    full_name: string;
    blood_group: string;
  }[];
}

/* =====================
   SKELETON
===================== */
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl mb-3 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
    <div className="flex gap-2">
      <div className="flex-1 h-9 bg-gray-200 rounded" />
      <div className="flex-1 h-9 bg-gray-200 rounded" />
    </div>
  </div>
);

/* =====================
   LOCKED OVERLAY
===================== */
const LockedOverlay = ({ onLogin }: { onLogin: () => void }) => (
  <div className="absolute inset-0 z-30 flex items-center justify-center">
    {/* Blur layer */}
    <div className="absolute inset-0 backdrop-blur-md bg-white/40" />

    {/* Card */}
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs"
    >
      <h2 className="text-lg font-semibold mb-2">
        Login required
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Please login to access messages and requests
      </p>
      <button
        onClick={onLogin}
        className="w-full bg-red-500 text-white py-2 rounded-xl"
      >
        Login
      </button>
    </motion.div>
  </div>
);

interface MessagesProps {
  onRequireAuth: () => void;
}

export function Messages({ onRequireAuth }: MessagesProps) {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] =
    useState<'requests' | 'messages'>('requests');

  const [incomingRequests, setIncomingRequests] =
    useState<BloodRequest[]>([]);
  const [sentRequests, setSentRequests] =
    useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================
     LOAD REQUESTS
  ===================== */
  useEffect(() => {
    if (profile) loadRequests();
  }, [profile]);

  const loadRequests = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data: incoming, error: incomingError } = await supabase
        .from('requests')
        .select(`
          id,
          status,
          created_at,
          sender:profiles!requests_sender_id_fkey (
            full_name,
            blood_group
          )
        `)
        .eq('receiver_id', profile.id)
        .order('created_at', { ascending: false });

      const { data: sent, error: sentError } = await supabase
        .from('requests')
        .select(`
          id,
          status,
          created_at,
          receiver:profiles!requests_receiver_id_fkey (
            full_name,
            blood_group
          )
        `)
        .eq('sender_id', profile.id)
        .order('created_at', { ascending: false });

      // Handle missing table gracefully
      if (incomingError?.code === 'PGRST116' || sentError?.code === 'PGRST116') {
        console.log('requests table not found, showing empty state');
        setIncomingRequests([]);
        setSentRequests([]);
      } else if (incomingError || sentError) {
        console.error('Error loading requests:', incomingError || sentError);
        setIncomingRequests([]);
        setSentRequests([]);
      } else {
        setIncomingRequests(incoming || []);
        setSentRequests(sent || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setIncomingRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     ACTIONS
  ===================== */
  const updateStatus = async (
    id: string,
    status: 'accepted' | 'declined'
  ) => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id);

    if (error) console.error('Error updating status:', error);
    else loadRequests();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'accepted')
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" /> Accepted
        </span>
      );
    if (status === 'pending')
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> Declined
      </span>
    );
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-[#FFF5F5] pb-24 relative overflow-hidden">

      {/* HEADER */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <button className="absolute left-0">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold">Messages</h1>
          </div>

          {/* TABS */}
          <div className="flex mt-4 bg-red-50 rounded-xl p-1">
            {['requests', 'messages'].map((t) => {
              const isActive = activeTab === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? 'bg-white text-red-600 shadow'
                      : 'text-gray-500'
                  }`}
                >
                  {t === 'requests' ? 'Requests' : 'Messages'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-lg mx-auto px-4 py-4">

        <AnimatePresence mode="wait">
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-sm font-semibold mb-3 text-gray-600">
                Incoming Requests
              </h2>

              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : incomingRequests.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                  No new requests
                </p>
              ) : (
                incomingRequests
                  .filter(r => r.status === 'pending')
                  .map((r) => (
                    <motion.div
                      key={r.id}
                      whileTap={{ scale: 0.97 }}
                      className="bg-white p-4 rounded-xl mb-3 shadow"
                    >
                      <p className="font-semibold">
                        {r.sender?.[0]?.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Blood: {r.sender?.[0]?.blood_group}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateStatus(r.id, 'accepted')}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'declined')}
                          className="flex-1 border py-2 rounded-lg"
                        >
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))
              )}

              <h2 className="text-sm font-semibold mt-6 mb-3 text-gray-600">
                Sent Requests
              </h2>

              {sentRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                  No sent requests
                </p>
              ) : (
                sentRequests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-4 rounded-xl mb-3 shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {r.receiver?.[0]?.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Blood: {r.receiver?.[0]?.blood_group}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center py-16 text-gray-500"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Chat Feature</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with donors and recipients through direct messaging
                </p>
                <div className="space-y-3">
                  <div className="text-left p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">No active conversations</p>
                    <p className="text-xs text-gray-500">Start a conversation from blood requests</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🔐 LOCK OVERLAY */}
      {!profile && (
        <LockedOverlay onLogin={onRequireAuth} />
      )}
    </div>
  );
}
