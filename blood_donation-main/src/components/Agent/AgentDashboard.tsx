import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Copy, 
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { AgentProfile, Commission } from '../../types/multiRole';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast/Toast';

export function AgentDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [hospitalsReferred, setHospitalsReferred] = useState<any[]>([]);
  const [earnings, setEarnings] = useState({
    total_earned: 0,
    pending_commissions: 0,
    paid_commissions: 0,
    hospitals_referred: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'agent') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Load commissions
      const { data: commissionsData } = await supabase
        .from('commissions')
        .select(`
          *,
          hospital:profiles!commissions_hospital_id_fkey(
            id,
            full_name,
            hospital_services,
            subscription_status
          )
        `)
        .eq('agent_id', profile.id)
        .order('created_at', { ascending: false });

      if (commissionsData) {
        setCommissions(commissionsData);
        
        // Calculate earnings
        const total = commissionsData.reduce((sum, c) => sum + c.amount, 0);
        const pending = commissionsData.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
        const paid = commissionsData.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
        
        setEarnings({
          total_earned: total,
          pending_commissions: pending,
          paid_commissions: paid,
          hospitals_referred: new Set(commissionsData.map(c => c.hospital_id)).size
        });
      }

      // Load referred hospitals
      const { data: hospitalsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', profile.id)
        .eq('role', 'hospital');

      if (hospitalsData) {
        setHospitalsReferred(hospitalsData);
      }
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

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      showToast({
        type: 'success',
        message: 'Referral code copied to clipboard!'
      });
    }
  };

  const getCommissionStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">Agent Dashboard</h1>
            <p className="text-sm text-gray-600">{profile?.full_name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Your Referral Code</h3>
              <p className="text-white/90 text-sm">Share with hospitals to earn commissions</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-xl px-4 py-3 font-mono text-lg font-bold text-center">
              {profile?.referral_code || 'N/A'}
            </div>
            <button
              onClick={copyReferralCode}
              className="bg-white text-green-500 p-3 rounded-xl hover:bg-gray-50 transition"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">₹{earnings.total_earned.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Earned</div>
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
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">₹{earnings.pending_commissions.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Pending</div>
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{earnings.hospitals_referred}</div>
                <div className="text-sm text-gray-600">Hospitals</div>
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profile?.commission_rate || 10}%</div>
                <div className="text-sm text-gray-600">Commission</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Commissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Commissions</h3>
            <button className="text-green-500 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-3">
            {commissions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No commissions yet</p>
                <p className="text-sm text-gray-400 mt-1">Start referring hospitals to earn</p>
              </div>
            ) : (
              commissions.slice(0, 5).map(commission => (
                <div key={commission.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">
                        {commission.hospital?.full_name || 'Unknown Hospital'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {commission.commission_type === 'signup' && 'Signup Commission'}
                        {commission.commission_type === 'subscription' && 'Subscription Commission'}
                        {commission.commission_type === 'renewal' && 'Renewal Commission'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">₹{commission.amount.toLocaleString()}</span>
                      {getStatusIcon(commission.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCommissionStatusColor(commission.status)}`}>
                      {commission.status}
                    </span>
                    <div className="text-xs text-gray-500">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Referred Hospitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Referred Hospitals</h3>
            <span className="text-sm text-gray-500">{hospitalsReferred.length} total</span>
          </div>

          <div className="space-y-3">
            {hospitalsReferred.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hospitals referred yet</p>
                <p className="text-sm text-gray-400 mt-1">Share your referral code to get started</p>
              </div>
            ) : (
              hospitalsReferred.slice(0, 3).map(hospital => (
                <div key={hospital.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{hospital.full_name}</div>
                    <div className="text-sm text-gray-600">
                      {hospital.hospital_services?.slice(0, 2).join(', ') || 'General Hospital'}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hospital.subscription_status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {hospital.subscription_status === 'active' ? 'Active' : 'Inactive'}
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
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-3"
        >
          <button className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm font-medium">Referrals</span>
          </button>
          
          <button className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </motion.div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-blue-700">
                Focus on hospitals with multiple services. They're more likely to maintain subscriptions and generate recurring commissions for you.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
