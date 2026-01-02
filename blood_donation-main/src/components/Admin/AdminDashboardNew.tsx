import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  UserCheck, 
  Heart, 
  TrendingUp, 
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Award,
  Shield
} from 'lucide-react';
import { AdminDashboard as AdminDashboardType, DonationCause } from '../../types/multiRole';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast/Toast';

export function AdminDashboardNew() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [platformStats, setPlatformStats] = useState({
    total_users: 0,
    total_hospitals: 0,
    total_agents: 0,
    total_donations: 0,
    monthly_revenue: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState({
    hospitals: 0,
    commissions: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [donationCauses, setDonationCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load platform statistics
      const [
        { count: totalUsers },
        { count: totalHospitals },
        { count: totalAgents },
        { count: totalDonations }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'hospital'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
        supabase.from('donations').select('*', { count: 'exact', head: true })
      ]);

      // Load pending approvals
      const [
        { count: pendingHospitals },
        { count: pendingCommissions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'hospital').eq('is_verified', false),
        supabase.from('commissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Load recent activities
      const { data: activities } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load donation causes
      const { data: causes } = await supabase
        .from('donation_causes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setPlatformStats({
        total_users: totalUsers || 0,
        total_hospitals: totalHospitals || 0,
        total_agents: totalAgents || 0,
        total_donations: totalDonations || 0,
        monthly_revenue: Math.floor(Math.random() * 100000) + 50000 // Mock data
      });

      setPendingApprovals({
        hospitals: pendingHospitals || 0,
        commissions: pendingCommissions || 0
      });

      setRecentActivities(activities || []);
      setDonationCauses(causes || []);
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

  const quickActions = [
    {
      title: 'Manage Users',
      icon: Users,
      color: 'bg-blue-500',
      path: '/admin/users',
      description: 'View and manage all users'
    },
    {
      title: 'Hospitals',
      icon: Building,
      color: 'bg-green-500',
      path: '/admin/hospitals',
      description: 'Approve and manage hospitals'
    },
    {
      title: 'Agents',
      icon: UserCheck,
      color: 'bg-purple-500',
      path: '/admin/agents',
      description: 'Manage agent accounts'
    },
    {
      title: 'Donations',
      icon: Heart,
      color: 'bg-red-500',
      path: '/admin/donations',
      description: 'View donation history'
    },
    {
      title: 'Commissions',
      icon: DollarSign,
      color: 'bg-yellow-500',
      path: '/admin/commissions',
      description: 'Approve agent commissions'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      color: 'bg-indigo-500',
      path: '/admin/analytics',
      description: 'Platform analytics'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Platform Management</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Platform Overview</h3>
              <p className="text-white/90 text-sm">Real-time platform statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">{platformStats.total_users.toLocaleString()}</div>
              <div className="text-sm text-white/90">Total Users</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">{platformStats.total_hospitals}</div>
              <div className="text-sm text-white/90">Hospitals</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">{platformStats.total_agents}</div>
              <div className="text-sm text-white/90">Agents</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-2xl font-bold">₹{platformStats.monthly_revenue.toLocaleString()}</div>
              <div className="text-sm text-white/90">Monthly Revenue</div>
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Pending Approvals</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              {pendingApprovals.hospitals + pendingApprovals.commissions} items
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Hospitals</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{pendingApprovals.hospitals}</div>
              <div className="text-sm text-gray-500">Awaiting verification</div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-medium">Commissions</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{pendingApprovals.commissions}</div>
              <div className="text-sm text-gray-500">Pending payment</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border rounded-xl hover:shadow-md transition text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500 mt-1">{action.description}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Donation Causes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Donation Causes</h3>
            <button className="text-red-500 text-sm font-medium">Manage</button>
          </div>

          <div className="space-y-3">
            {donationCauses.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No donation causes yet</p>
              </div>
            ) : (
              donationCauses.map(cause => (
                <div key={cause.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{cause.title}</div>
                    <div className="text-sm text-gray-600">{cause.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{cause.raised_amount.toLocaleString()}</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cause.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cause.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Admin Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">Admin Tip</h4>
              <p className="text-sm text-purple-700">
                Regularly review pending hospital verifications and commission approvals to maintain platform trust and agent satisfaction.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
