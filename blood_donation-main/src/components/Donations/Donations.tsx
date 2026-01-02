import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Calendar, CreditCard, Users, Target, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import { DonationCause, Donation, RecurringDonation, DonationForm } from '../../types/multiRole';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast/Toast';
import { ButtonLoader } from '../Loading/Loading';

export function Donations() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'causes' | 'donate' | 'history' | 'recurring'>('causes');
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [selectedCause, setSelectedCause] = useState<DonationCause | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    amount: 500,
    donation_type: 'one_time',
    is_anonymous: false
  });

  const donationAmounts = [100, 500, 1000, 2000, 5000];
  
  const categories = [
    { key: 'child_support', label: 'Child Support', icon: '👶', color: 'bg-pink-100 text-pink-600' },
    { key: 'medical_support', label: 'Medical Support', icon: '🏥', color: 'bg-blue-100 text-blue-600' },
    { key: 'emergency_blood', label: 'Emergency Blood', icon: '🩸', color: 'bg-red-100 text-red-600' },
    { key: 'patient_assistance', label: 'Patient Assistance', icon: '🤝', color: 'bg-green-100 text-green-600' },
    { key: 'app_operations', label: 'App Operations', icon: '📱', color: 'bg-purple-100 text-purple-600' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load donation causes
      const { data: causesData } = await supabase
        .from('donation_causes')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (causesData) setCauses(causesData);

      // Load user's donation history
      if (profile) {
        const { data: donationsData } = await supabase
          .from('donations')
          .select(`
            *,
            cause:donation_causes(*)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (donationsData) setDonationHistory(donationsData);

        // Load recurring donations
        const { data: recurringData } = await supabase
          .from('recurring_donations')
          .select(`
            *,
            cause:donation_causes(*)
          `)
          .eq('user_id', profile.id)
          .eq('is_active', true);

        if (recurringData) setRecurringDonations(recurringData);
      }
    } catch (error) {
      console.error('Error loading donation data:', error);
      showToast({
        type: 'error',
        message: 'Failed to load donation data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!profile || !selectedCause) return;

    setProcessingPayment(true);
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create donation record
      const donationData = {
        user_id: profile.id,
        cause_id: selectedCause.id,
        amount: donationForm.amount,
        donation_type: donationForm.donation_type,
        payment_status: 'completed',
        payment_method: 'mock',
        transaction_id: `MOCK_${Date.now()}`,
        message: donationForm.message,
        is_anonymous: donationForm.is_anonymous
      };

      const { error: donationError } = await supabase
        .from('donations')
        .insert(donationData);

      if (donationError) throw donationError;

      // If recurring donation, create recurring record
      if (donationForm.donation_type === 'monthly') {
        const recurringData = {
          user_id: profile.id,
          cause_id: selectedCause.id,
          amount: donationForm.amount,
          frequency: 'monthly' as const,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
          payment_method: 'mock'
        };

        const { error: recurringError } = await supabase
          .from('recurring_donations')
          .insert(recurringData);

        if (recurringError) throw recurringError;
      }

      // Update cause raised amount
      await supabase
        .from('donation_causes')
        .update({
          raised_amount: selectedCause.raised_amount + donationForm.amount
        })
        .eq('id', selectedCause.id);

      showToast({
        type: 'success',
        message: `Thank you for your ₹${donationForm.amount} donation!`
      });

      setShowDonateModal(false);
      setSelectedCause(null);
      setDonationForm({
        amount: 500,
        donation_type: 'one_time',
        is_anonymous: false
      });

      loadData();
    } catch (error) {
      console.error('Donation failed:', error);
      showToast({
        type: 'error',
        message: 'Donation failed. Please try again.'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const cancelRecurringDonation = async (id: string) => {
    try {
      await supabase
        .from('recurring_donations')
        .update({ is_active: false })
        .eq('id', id);

      showToast({
        type: 'success',
        message: 'Auto-pay donation cancelled'
      });

      loadData();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to cancel auto-pay'
      });
    }
  };

  const renderCauses = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Support a Cause</h2>
        <p className="text-gray-600">Your donation can save lives and make a difference</p>
      </div>

      {/* Featured Cause */}
      {causes.filter(c => c.is_featured).map(cause => (
        <motion.div
          key={cause.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                  Featured
                </span>
                <span className="text-sm opacity-90">
                  {categories.find(c => c.key === cause.category)?.label}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{cause.title}</h3>
              <p className="text-white/90 text-sm">{cause.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{cause.raised_amount.toLocaleString()}</div>
              <div className="text-sm opacity-90">of ₹{cause.target_amount?.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="h-2 bg-white/20 rounded-full">
              <div
                className="h-2 bg-white rounded-full"
                style={{
                  width: `${cause.target_amount ? (cause.raised_amount / cause.target_amount) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCause(cause);
              setShowDonateModal(true);
            }}
            className="w-full bg-white text-red-500 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Donate Now
          </button>
        </motion.div>
      ))}

      {/* Other Causes */}
      <div className="grid gap-4">
        {causes.filter(c => !c.is_featured).map(cause => (
          <motion.div
            key={cause.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                categories.find(c => c.key === cause.category)?.color
              }`}>
                {categories.find(c => c.key === cause.category)?.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{cause.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{cause.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold">₹{cause.raised_amount.toLocaleString()}</span>
                    {cause.target_amount && (
                      <span className="text-gray-500 text-sm">
                        {' '}of ₹{cause.target_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCause(cause);
                      setShowDonateModal(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    Donate
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Donation History</h2>
        <p className="text-gray-600">Track your contribution history</p>
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">
              ₹{donationHistory.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Donated</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {donationHistory.length}
            </div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
        </div>

        <div className="space-y-3">
          {donationHistory.map(donation => (
            <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium">
                    {donation.cause?.title || 'General Donation'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{donation.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{donation.donation_type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecurring = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Auto-Pay Donations</h2>
        <p className="text-gray-600">Manage your monthly recurring donations</p>
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              ₹{recurringDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Total</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {recurringDonations.length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>

        <div className="space-y-3">
          {recurringDonations.map(recurring => (
            <div key={recurring.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">
                    {recurring.cause?.title || 'General Donation'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Next billing: {new Date(recurring.next_billing_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{recurring.amount.toLocaleString()}/mo</div>
                <button
                  onClick={() => cancelRecurringDonation(recurring.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Donations</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-12 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex gap-6">
            {[
              { key: 'causes', label: 'Causes', icon: Target },
              { key: 'history', label: 'History', icon: Heart },
              { key: 'recurring', label: 'Auto-Pay', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading donation data...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'causes' && renderCauses()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'recurring' && renderRecurring()}
          </AnimatePresence>
        )}
      </div>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && selectedCause && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowDonateModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <button
                onClick={() => setShowDonateModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Support {selectedCause.title}</h3>
                <p className="text-gray-600 text-sm">{selectedCause.description}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Amount</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {donationAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDonationForm(prev => ({ ...prev, amount }))}
                        className={`py-2 rounded-lg font-medium transition ${
                          donationForm.amount === amount
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Custom amount"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Donation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDonationForm(prev => ({ ...prev, donation_type: 'one_time' }))}
                      className={`py-2 rounded-lg font-medium transition ${
                        donationForm.donation_type === 'one_time'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      onClick={() => setDonationForm(prev => ({ ...prev, donation_type: 'monthly' }))}
                      className={`py-2 rounded-lg font-medium transition ${
                        donationForm.donation_type === 'monthly'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                  <textarea
                    value={donationForm.message || ''}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add a message of support..."
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={donationForm.is_anonymous}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Donate anonymously</span>
                </label>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Mock Payment:</strong> This is a demo payment. No actual transaction will be processed.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDonate}
                  disabled={processingPayment}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment ? <ButtonLoader text="Processing..." /> : `Donate ₹${donationForm.amount}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
