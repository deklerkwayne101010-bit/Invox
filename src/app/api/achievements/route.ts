import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

interface AchievementTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  target: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: UserStats) => boolean;
}

interface UserStats {
  totalInvoices: number;
  totalRevenue: number;
  totalClients: number;
  currentStreak: number;
  efficiencyScore: number;
  socialShares: number;
}

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // Invoice Milestones
  {
    type: 'invoice_milestone',
    title: 'First Steps',
    description: 'Created your first invoice',
    icon: '📄',
    points: 10,
    target: 1,
    rarity: 'common',
    condition: (stats) => stats.totalInvoices >= 1
  },
  {
    type: 'invoice_milestone',
    title: 'Getting Started',
    description: 'Created 5 invoices',
    icon: '📊',
    points: 25,
    target: 5,
    rarity: 'common',
    condition: (stats) => stats.totalInvoices >= 5
  },
  {
    type: 'invoice_milestone',
    title: 'Growing Business',
    description: 'Created 25 invoices',
    icon: '📈',
    points: 50,
    target: 25,
    rarity: 'rare',
    condition: (stats) => stats.totalInvoices >= 25
  },
  {
    type: 'invoice_milestone',
    title: 'Invoice Master',
    description: 'Created 100 invoices',
    icon: '👑',
    points: 100,
    target: 100,
    rarity: 'epic',
    condition: (stats) => stats.totalInvoices >= 100
  },

  // Revenue Milestones
  {
    type: 'revenue_milestone',
    title: 'First Sale',
    description: 'Generated $1,000 in revenue',
    icon: '💰',
    points: 20,
    target: 1000,
    rarity: 'common',
    condition: (stats) => stats.totalRevenue >= 1000
  },
  {
    type: 'revenue_milestone',
    title: 'Revenue Builder',
    description: 'Generated $10,000 in revenue',
    icon: '💵',
    points: 75,
    target: 10000,
    rarity: 'rare',
    condition: (stats) => stats.totalRevenue >= 10000
  },
  {
    type: 'revenue_milestone',
    title: 'Revenue Champion',
    description: 'Generated $50,000 in revenue',
    icon: '🏆',
    points: 150,
    target: 50000,
    rarity: 'epic',
    condition: (stats) => stats.totalRevenue >= 50000
  },

  // Client Milestones
  {
    type: 'client_milestone',
    title: 'Client Builder',
    description: 'Added 10 clients',
    icon: '🤝',
    points: 30,
    target: 10,
    rarity: 'common',
    condition: (stats) => stats.totalClients >= 10
  },
  {
    type: 'client_milestone',
    title: 'Network Master',
    description: 'Added 50 clients',
    icon: '🌐',
    points: 80,
    target: 50,
    rarity: 'rare',
    condition: (stats) => stats.totalClients >= 50
  },

  // Streak Achievements
  {
    type: 'streak',
    title: 'Consistent Creator',
    description: '7-day invoice creation streak',
    icon: '🔥',
    points: 40,
    target: 7,
    rarity: 'rare',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    type: 'streak',
    title: 'Streak Master',
    description: '30-day invoice creation streak',
    icon: '⚡',
    points: 100,
    target: 30,
    rarity: 'epic',
    condition: (stats) => stats.currentStreak >= 30
  },

  // Efficiency Achievements
  {
    type: 'efficiency',
    title: 'Time Saver',
    description: 'Achieved 80% efficiency score',
    icon: '⏱️',
    points: 35,
    target: 80,
    rarity: 'common',
    condition: (stats) => stats.efficiencyScore >= 80
  },
  {
    type: 'efficiency',
    title: 'Efficiency Expert',
    description: 'Achieved 95% efficiency score',
    icon: '🚀',
    points: 60,
    target: 95,
    rarity: 'rare',
    condition: (stats) => stats.efficiencyScore >= 95
  },

  // Social Achievements
  {
    type: 'social',
    title: 'Social Sharer',
    description: 'Shared 5 business milestones',
    icon: '📣',
    points: 25,
    target: 5,
    rarity: 'common',
    condition: (stats) => stats.socialShares >= 5
  },
  {
    type: 'social',
    title: 'Community Builder',
    description: 'Shared 25 business milestones',
    icon: '🌟',
    points: 70,
    target: 25,
    rarity: 'rare',
    condition: (stats) => stats.socialShares >= 25
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's achievements
    const q = query(
      collection(db, 'achievements'),
      where('userId', '==', userId),
      orderBy('unlockedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const userAchievements: Achievement[] = [];

    querySnapshot.forEach((doc) => {
      userAchievements.push({ id: doc.id, ...doc.data() } as Achievement);
    });

    // Mock user stats - in real app, calculate from actual data
    const mockStats: UserStats = {
      totalInvoices: 15,
      totalRevenue: 2500,
      totalClients: 8,
      currentStreak: 5,
      efficiencyScore: 85,
      socialShares: 3
    };

    // Check for new achievements
    const newAchievements: Achievement[] = [];
    ACHIEVEMENT_TEMPLATES.forEach(template => {
      const alreadyUnlocked = userAchievements.some(a => a.type === template.type && a.target === template.target);
      if (!alreadyUnlocked && template.condition(mockStats)) {
        newAchievements.push({
          userId,
          type: template.type as any,
          title: template.title,
          description: template.description,
          icon: template.icon,
          points: template.points,
          unlockedAt: new Date(),
          target: template.target,
          rarity: template.rarity
        });
      }
    });

    // Save new achievements
    for (const achievement of newAchievements) {
      await addDoc(collection(db, 'achievements'), achievement);
      userAchievements.unshift(achievement);
    }

    // Calculate progress for locked achievements
    const lockedAchievements = ACHIEVEMENT_TEMPLATES
      .filter(template => !userAchievements.some(a => a.type === template.type && a.target === template.target))
      .map(template => ({
        ...template,
        progress: Math.min(
          template.type === 'invoice_milestone' ? mockStats.totalInvoices :
          template.type === 'revenue_milestone' ? mockStats.totalRevenue :
          template.type === 'client_milestone' ? mockStats.totalClients :
          template.type === 'streak' ? mockStats.currentStreak :
          template.type === 'efficiency' ? mockStats.efficiencyScore :
          template.type === 'social' ? mockStats.socialShares : 0,
          template.target
        )
      }));

    const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      achievements: userAchievements,
      lockedAchievements,
      stats: mockStats,
      totalPoints,
      newAchievements: newAchievements.length
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}