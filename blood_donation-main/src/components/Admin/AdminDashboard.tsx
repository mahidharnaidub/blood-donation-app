import { useState } from 'react';
import Users from './Users';
import Requests from './Requests';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'users' | 'requests'>('users');

  return (
    <>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded ${
            tab === 'users' ? 'bg-red-500 text-white' : 'bg-white'
          }`}
        >
          Users
        </button>

        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded ${
            tab === 'requests' ? 'bg-red-500 text-white' : 'bg-white'
          }`}
        >
          Requests
        </button>
      </div>

      {tab === 'users' && <Users />}
      {tab === 'requests' && <Requests />}
    </>
  );
}
