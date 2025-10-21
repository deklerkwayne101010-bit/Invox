'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, DollarSign, Copy, Check, ArrowLeft, Mail, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Referral {
  id?: string;
  referrerId: string;
  referrerEmail: string;
  refereeEmail: string;
  referralCode: string;
  status: 'pending' | 'signed_up' | 'active' | 'rewarded';
  createdAt: Date;
  signedUpAt?: Date;
  rewardClaimedAt?: Date;
  rewardAmount: number;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalEarned: number;
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  signed_up: 'bg-blue-100 text-blue-800',
  active: 'bg-yellow-100 text-yellow-800',
  rewarded: 'bg-green-100 text-green-800'
};

const statusLabels = {
  pending: 'Invited',
  signed_up: 'Signed Up',
  active: 'Active User',
  rewarded: 'Reward Earned'
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    totalEarned: 0
  });
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [newReferralEmail, setNewReferralEmail] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      // Mock user ID for demo - in real app this would come from auth
      const userId = 'demo-user';
      const response = await fetch(`/api/referrals?userId=${userId}`);
      const data = await response.json();
      setReferrals(data.referrals || []);
      setStats(data.stats || stats);
      setReferralCode(data.referralCode || 'INVOXDEMO');
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const shareReferralLink = () => {
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const shareText = `Join me on Invox - the best invoice platform for small businesses! Use my referral code: ${referralCode}\n\n${referralUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join Invox with my referral!',
        text: shareText,
        url: referralUrl
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Referral link copied to clipboard!');
    }
  };

  const sendReferralInvite = async () => {
    if (!newReferralEmail.trim()) return;

    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerId: 'demo-user',
          referrerEmail: 'user@example.com',
          refereeEmail: newReferralEmail
        })
      });

      if (response.ok) {
        alert('Referral invitation sent successfully!');
        setNewReferralEmail('');
        fetchReferrals(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending referral:', error);
      alert('Failed to send referral invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your referrals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Referral Program</h1>
          <p className="text-xl text-gray-600">
            Earn rewards by referring friends and fellow entrepreneurs to Invox!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Gift className="text-green-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.successfulReferrals}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="text-yellow-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingRewards}</div>
                <div className="text-sm text-gray-600">Pending Rewards</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="text-purple-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">${stats.totalEarned}</div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Referral Code</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg">
                {referralCode}
              </div>
            </div>
            <button
              onClick={copyReferralCode}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={shareReferralLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 size={20} />
              Share Link
            </button>
          </div>
          <p className="text-gray-600">
            Share this code with friends. When they sign up and become active users, you'll both earn $10 in credits!
          </p>
        </div>

        {/* Send Invitation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Send Referral Invitation</h2>
          <div className="flex gap-4">
            <input
              type="email"
              value={newReferralEmail}
              onChange={(e) => setNewReferralEmail(e.target.value)}
              placeholder="Enter friend's email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendReferralInvite}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Mail size={20} />
              Send Invite
            </button>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-6">Your Referrals</h2>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-600 mb-4">
                Start referring friends to earn rewards and help grow the Invox community!
              </p>
              <button
                onClick={shareReferralLink}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Your Code
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{referral.refereeEmail}</div>
                      <div className="text-sm text-gray-600">
                        Invited {new Date(referral.createdAt).toLocaleDateString()}
                        {referral.signedUpAt && ` • Signed up ${new Date(referral.signedUpAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[referral.status]}`}>
                      {statusLabels[referral.status]}
                    </span>

                    {referral.status === 'rewarded' && (
                      <div className="text-green-600 font-semibold">
                        +${referral.rewardAmount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How the Referral Program Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">Share Your Code</h4>
              <p className="text-sm text-blue-800">
                Send your unique referral code to friends and business contacts
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">They Sign Up</h4>
              <p className="text-sm text-blue-800">
                When they create an account and become active users, the referral is tracked
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">Earn Rewards</h4>
              <p className="text-sm text-blue-800">
                Both you and your friend earn $10 in Invox credits to use on premium features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}