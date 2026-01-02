import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface BloodRequest {
  id: string;
  blood_group_needed: string;
  status: string;
  created_at: string;
}

export default function Requests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('blood_requests') // ✅ FIXED TABLE NAME
      .select('id, blood_group_needed, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading requests…</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded p-4 shadow">
      <h2 className="text-lg font-bold mb-4">Blood Requests</h2>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-500">No requests found</p>
      ) : (
        requests.map((r) => (
          <div
            key={r.id}
            className="border rounded p-3 mb-2 text-sm"
          >
            <p>
              <b>Blood Group:</b> {r.blood_group_needed}
            </p>
            <p>
              <b>Status:</b>{' '}
              <span className="capitalize">{r.status}</span>
            </p>
            <p className="text-xs text-gray-400">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
