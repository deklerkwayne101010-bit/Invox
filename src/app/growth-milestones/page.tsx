'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Zap, Calendar, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface GrowthMilestone {
  id?: string;
  userId: string;
  type: 'revenue' | 'clients' | 'invoices' | 'efficiency' | 'streak';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  achievedAt?: Date;
  isAchieved: boolean;
  category: 'monthly' | 'quarterly' | 'yearly' | 'all_time';
  createdAt: Date;
}

interface BusinessMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  totalInvoices: number;
  monthlyInvoices: number;
  currentStreak: number;
  efficiencyScore: number;
  averageInvoiceValue: number;
}

const typeIcons = {
  revenue: TrendingUp,
  clients: Users,
  invoices: FileText,
  efficiency: Zap,
  streak: Calendar
};

const categoryColors = {
  monthly: 'bg-blue-100 text-blue-800',
  quarterly: 'bg-green-100 text-green-800',
  yearly: 'bg-purple-100 text-purple-800',
  all_time: 'bg-orange-100 text-orange-800'
};

export default function GrowthMilestonesPage() {
  const [milestones, setMilestones] = useState<GrowthMilestone[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    totalInvoices: 0,
    monthlyInvoices: 0,
    currentStreak: 0,
    efficiencyScore: 0,
    averageInvoiceValue: 0
  });
  const [stats, setStats] = useState({
    achievedCount: 0,
    totalCount: 0,
    progressPercentage: 0,
    recentAchievements: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchMilestones();
  }, [selectedCategory]);

  const fetchMilestones = async () => {
    try {
      // Mock user ID for demo
      const userId = 'demo-user';
      const response = await fetch(`/api/growth-milestones?userId=${userId}&category=${selectedCategory}`);
      const data = await response.json();

      setMilestones(data.milestones || []);
      setMetrics(data.metrics || metrics);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'efficiency':
        return `${value}%`;
      case 'streak':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  const filteredMilestones = milestones.filter(milestone => {
    if (selectedCategory === 'all') return true;
    return milestone.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your growth milestones...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Growth Milestones</h1>
          <p className="text-xl text-gray-600">
            Track your business progress and celebrate your achievements as you grow!
          </p>
        </div>

        {/* Current Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">${metrics.monthlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalClients}</div>
                <div className="text-sm text-gray-600">Total Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <FileText className="text-purple-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.monthlyInvoices}</div>
                <div className="text-sm text-gray-600">Monthly Invoices</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Zap className="text-orange-600" size={24} />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.efficiencyScore}%</div>
                <div className="text-sm text-gray-600">Efficiency Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Overall Progress</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{stats.progressPercentage}%</div>
              <div className="text-sm text-gray-600">
                {stats.achievedCount} of {stats.totalCount} milestones achieved
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: 'All Milestones' },
            { key: 'monthly', label: 'Monthly Goals' },
            { key: 'quarterly', label: 'Quarterly Goals' },
            { key: 'yearly', label: 'Yearly Goals' },
            { key: 'all_time', label: 'All-Time Achievements' }
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

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMilestones.map((milestone) => {
            const Icon = typeIcons[milestone.type];
            const progress = Math.min((milestone.currentValue / milestone.targetValue) * 100, 100);

            return (
              <div
                key={milestone.id}
                className={`rounded-lg border p-6 transition-all ${
                  milestone.isAchieved
                    ? 'bg-green-50 border-green-200 shadow-md'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      milestone.isAchieved ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={milestone.isAchieved ? 'text-green-600' : 'text-gray-600'} />
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[milestone.category]}`}>
                        {milestone.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {milestone.isAchieved ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <Circle className="text-gray-400" size={24} />
                  )}
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${
                  milestone.isAchieved ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {milestone.title}
                </h3>
                <p className={`text-sm mb-4 ${
                  milestone.isAchieved ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {milestone.description}
                </p>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={milestone.isAchieved ? 'text-green-700' : 'text-gray-600'}>
                      Progress
                    </span>
                    <span className={`font-medium ${
                      milestone.isAchieved ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {formatValue(milestone.type, milestone.currentValue)} / {formatValue(milestone.type, milestone.targetValue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        milestone.isAchieved ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {milestone.isAchieved && milestone.achievedAt && (
                  <div className="text-xs text-green-600 font-medium">
                    ✅ Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Achievements */}
        {stats.recentAchievements.length > 0 && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">🎉 Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.recentAchievements.map((achievement: Record<string, unknown>, index: number) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">{achievement.icon as string}</div>
                  <h3 className="font-semibold mb-1">{achievement.title as string}</h3>
                  <p className="text-sm opacity-90 mb-2">{achievement.description as string}</p>
                  <div className="text-xs opacity-75">
                    Achieved {new Date(achievement.achievedAt as string | number | Date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivation Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💪 Keep Growing!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Next Milestone Targets</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Focus on consistent invoice creation</li>
                <li>• Build strong client relationships</li>
                <li>• Optimize your workflow efficiency</li>
                <li>• Track and celebrate small wins</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Growth Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Set daily and weekly goals</li>
                <li>• Review your progress regularly</li>
                <li>• Share your achievements with the community</li>
                <li>• Learn from other successful entrepreneurs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}