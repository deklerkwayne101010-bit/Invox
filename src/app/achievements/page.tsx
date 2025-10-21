'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Lock, ArrowLeft, Target, Award, Zap } from 'lucide-react';
import Link from 'next/link';

interface Achievement {
  id?: string;
  userId: string;
  type: 'invoice_milestone' | 'revenue_milestone' | 'client_milestone' | 'streak' | 'efficiency' | 'social';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

interface UserStats {
  totalInvoices: number;
  totalRevenue: number;
  totalClients: number;
  currentStreak: number;
  efficiencyScore: number;
  socialShares: number;
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

const rarityIcons = {
  common: Star,
  rare: Award,
  epic: Trophy,
  legendary: Zap
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    totalClients: 0,
    currentStreak: 0,
    efficiencyScore: 0,
    socialShares: 0
  });
  const [totalPoints, setTotalPoints] = useState(0);
  const [newAchievements, setNewAchievements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Mock user ID for demo
      const userId = 'demo-user';
      const response = await fetch(`/api/achievements?userId=${userId}`);
      const data = await response.json();

      setAchievements(data.achievements || []);
      setLockedAchievements(data.lockedAchievements || []);
      setStats(data.stats || stats);
      setTotalPoints(data.totalPoints || 0);
      setNewAchievements(data.newAchievements || 0);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.type === selectedCategory;
  });

  const filteredLockedAchievements = lockedAchievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.type === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Achievements</h1>
          <p className="text-xl text-gray-600">
            Track your business growth and unlock rewards as you build your entrepreneurial journey!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Target className="text-blue-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{achievements.length}</div>
                <div className="text-sm text-gray-600">Unlocked</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Lock className="text-gray-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{lockedAchievements.length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Star className="text-purple-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{newAchievements}</div>
                <div className="text-sm text-gray-600">New This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: 'All Achievements' },
            { key: 'invoice_milestone', label: 'Invoice Milestones' },
            { key: 'revenue_milestone', label: 'Revenue Goals' },
            { key: 'client_milestone', label: 'Client Building' },
            { key: 'streak', label: 'Streaks' },
            { key: 'efficiency', label: 'Efficiency' },
            { key: 'social', label: 'Social Sharing' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Unlocked Achievements */}
        {filteredAchievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Unlocked Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const rarity = achievement.rarity as RarityType;
                const RarityIcon = rarityIcons[rarity];

                return (
                  <div key={achievement.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${rarityColors[rarity]}`}>
                        <RarityIcon size={12} className="inline mr-1" />
                        {achievement.rarity}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 mb-4">{achievement.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                      <div className="text-blue-600 font-semibold">+{achievement.points} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {filteredLockedAchievements.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLockedAchievements.map((achievement, index) => {
                const rarity = achievement.rarity as RarityType;
                const RarityIcon = rarityIcons[rarity];
                const progress = achievement.progress || 0;
                const percentage = Math.min((progress / achievement.target) * 100, 100);

                return (
                  <div key={index} className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 opacity-75">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl text-gray-400">{achievement.icon}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${rarityColors[rarity]}`}>
                        <RarityIcon size={12} className="inline mr-1" />
                        {achievement.rarity}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{achievement.title}</h3>
                    <p className="text-gray-500 mb-4">{achievement.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress}/{achievement.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <Lock size={14} className="inline mr-1" />
                        Locked
                      </div>
                      <div className="text-gray-500 font-semibold">{achievement.points} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievement Categories Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Achievement Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📄</div>
              <div>
                <h4 className="font-semibold text-blue-900">Invoice Milestones</h4>
                <p className="text-sm text-blue-800">Create more invoices to unlock these achievements</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h4 className="font-semibold text-blue-900">Revenue Goals</h4>
                <p className="text-sm text-blue-800">Grow your business revenue to earn these badges</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">🤝</div>
              <div>
                <h4 className="font-semibold text-blue-900">Client Building</h4>
                <p className="text-sm text-blue-800">Expand your client network</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <h4 className="font-semibold text-blue-900">Streaks & Efficiency</h4>
                <p className="text-sm text-blue-800">Maintain consistency and optimize your workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}