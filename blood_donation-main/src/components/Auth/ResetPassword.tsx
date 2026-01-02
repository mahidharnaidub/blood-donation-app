import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);

  /* =========================
     WAIT FOR RECOVERY SESSION
  ========================= */
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError('Reset link is invalid or expired. Please request again.');
        return;
      }

      // Recovery session is valid
      setReady(true);
    };

    init();
  }, []);

  /* =========================
     UPDATE PASSWORD
  ========================= */
  const handleReset = async () => {
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully. You can now login.');
    }
  };

  /* =========================
     UI STATES
  ========================= */
  if (!ready && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Validating reset link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-3 text-center">{message}</p>
        )}

        {!message && ready && (
          <>
            <input
              type="password"
              placeholder="New password"
              className="w-full border p-2 rounded mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border p-2 rounded mb-4"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              onClick={handleReset}
              className="w-full bg-red-500 text-white py-2 rounded"
            >
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
