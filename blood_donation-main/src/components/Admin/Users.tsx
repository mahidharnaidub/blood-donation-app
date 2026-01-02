import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  full_name: string;
  blood_group: string;
  phone_number: string;
  is_available: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, blood_group, phone_number, is_available')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading users…</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded p-4 shadow">
      <h2 className="text-lg font-bold mb-4">Registered Users</h2>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Blood</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.full_name}</td>
              <td className="p-2">{u.blood_group}</td>
              <td className="p-2">{u.phone_number}</td>
              <td className="p-2">
                {u.is_available ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-gray-500">Not Available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
