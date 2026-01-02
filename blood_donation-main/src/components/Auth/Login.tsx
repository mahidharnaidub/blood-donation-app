import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginProps {
  onShowSignup: () => void;
}

type LoginMethod = 'email' | 'phone';

export function Login({ onShowSignup }: LoginProps) {
  const [method, setMethod] = useState<LoginMethod>('email');

  // Email login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ======================
     EMAIL LOGIN
  ====================== */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  /* ======================
     PHONE OTP
  ====================== */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({ phone });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-red-500 p-3 rounded-full">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* METHOD TOGGLE */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMethod('email');
              setOtpSent(false);
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              method === 'email'
                ? 'bg-white text-red-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => {
              setMethod('phone');
              setOtpSent(false);
              setPassword('');
              setError('');
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              method === 'phone'
                ? 'bg-white text-red-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Phone
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* EMAIL LOGIN */}
        {method === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            {/* FORGOT PASSWORD */}
            <button
              type="button"
              disabled={loading}
              onClick={() => window.location.hash = 'reset-password'}
              className="w-full text-sm text-gray-600 hover:text-gray-800 mt-2 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* PHONE OTP */}
        {method === 'phone' && (
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="space-y-4"
          >
            <input
              type="tel"
              placeholder="Phone number (+91...)"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={otpSent}
              className="w-full border p-3 rounded"
            />

            {otpSent && (
              <input
                type="text"
                placeholder="Enter OTP"
                required
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                maxLength={6}
                className="w-full border p-3 rounded"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded disabled:opacity-50"
            >
              {loading
                ? otpSent
                  ? 'Verifying…'
                  : 'Sending OTP…'
                : otpSent
                ? 'Verify OTP'
                : 'Send OTP'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onShowSignup}
            className="text-red-500 font-medium"
          >
            Don’t have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
