import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-red-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="font-bold text-lg">
          Blood Donation Platform – Admin Panel
        </h1>

        <button
          onClick={async () => {
            await signOut();
            // Session cleared, app will automatically redirect to Home via App.tsx useEffect
          }}
          className="text-sm underline hover:text-gray-200"
        >
          Logout
        </button>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
