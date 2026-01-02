import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { HospitalProfile, HospitalRequest, Subscription } from '../../types/multiRole';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast/Toast';
import { ButtonLoader } from '../Loading/Loading';

export function HospitalDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [analytics, setAnalytics] = useState({
    total_requests: 0,
    fulfilled_requests: 0,
    monthly_views: 0,
    monthly_calls: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (profile?.role === 'hospital') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Load subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

      // Load hospital requests
      const { data: requestsData } = await supabase
        .from('hospital_requests')
        .select('*')
        .eq('hospital_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (requestsData) {
        setRequests(requestsData);
      }

      // Load analytics (mock data for now)
      setAnalytics({
        total_requests: requestsData?.length || 0,
        fulfilled_requests: requestsData?.filter(r => r.status === 'fulfilled').length || 0,
        monthly_views: Math.floor(Math.random() * 500) + 100,
        monthly_calls: Math.floor(Math.random() * 100) + 20
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast({
        type: 'error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!profile) return;

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const subscriptionData = {
        user_id: profile.id,
        plan_type: 'hospital_basic',
        amount: 500,
        billing_cycle: 'monthly',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
        payment_method: 'mock'
      };

      const { error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (error) throw error;

      // Update profile subscription status
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_expires_at: subscriptionData.expires_at
        })
        .eq('id', profile.id);

      showToast({
        type: 'success',
        message: 'Subscription activated successfully!'
      });

      setShowSubscriptionModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Subscription failed:', error);
      showToast({
        type: 'error',
        message: 'Failed to activate subscription'
      });
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isSubscriptionActive = subscription && subscription.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Hospital Dashboard</h1>
              <p className="text-sm text-gray-600">{profile?.full_name}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSubscriptionActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isSubscriptionActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Subscription Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 ${
            isSubscriptionActive 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isSubscriptionActive ? 'Subscription Active' : 'Activate Subscription'}
                </h3>
                <p className="text-white/90 text-sm">
                  {isSubscriptionActive 
                    ? `Expires on ${new Date(subscription?.expires_at || '').toLocaleDateString()}`
                    : 'Get unlimited access to all features'
                  }
                </p>
              </div>
            </div>
          </div>

          {!isSubscriptionActive && (
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="w-full bg-white text-red-500 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Activate for ₹500/month
            </button>
          )}
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.total_requests}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.fulfilled_requests}</div>
                <div className="text-sm text-gray-600">Fulfilled</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.monthly_views}</div>
                <div className="text-sm text-gray-600">Monthly Views</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.monthly_calls}</div>
                <div className="text-sm text-gray-600">Monthly Calls</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Blood Requests</h3>
            <button className="text-red-500 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No blood requests yet</p>
                <button className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">
                  Create First Request
                </button>
              </div>
            ) : (
              requests.map(request => (
                <div key={request.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{request.patient_name}</div>
                      <div className="text-sm text-gray-600">{request.blood_group} • {request.units_needed} units</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency_level)}`}>
                        {request.urgency_level}
                      </span>
                      {getStatusIcon(request.status)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <button className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm font-medium">New Request</span>
          </button>
          
          <button className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Find Donors</span>
          </button>
        </motion.div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubscriptionModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Activate Hospital Subscription</h3>
              <p className="text-gray-600">Get unlimited access to all premium features</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Hospital Basic Plan</span>
                  <span className="text-xl font-bold">₹500/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Unlimited blood requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Priority donor matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    24/7 support
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <strong>Mock Payment:</strong> This is a demo subscription. No actual payment will be processed.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition"
            >
              Activate Subscription
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
