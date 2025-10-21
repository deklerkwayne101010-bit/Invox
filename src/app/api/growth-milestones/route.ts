import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Pre-defined milestone templates
const MILESTONE_TEMPLATES: Omit<GrowthMilestone, 'id' | 'userId' | 'currentValue' | 'isAchieved' | 'createdAt'>[] = [
  // Revenue Milestones
  {
    type: 'revenue',
    title: 'First $1K Month',
    description: 'Generate $1,000 in monthly revenue',
    targetValue: 1000,
    category: 'monthly'
  },
  {
    type: 'revenue',
    title: 'Revenue Builder',
    description: 'Reach $5,000 in monthly revenue',
    targetValue: 5000,
    category: 'monthly'
  },
  {
    type: 'revenue',
    title: 'Growing Business',
    description: 'Achieve $10,000 monthly revenue',
    targetValue: 10000,
    category: 'monthly'
  },
  {
    type: 'revenue',
    title: 'Revenue Champion',
    description: 'Hit $25,000 in monthly revenue',
    targetValue: 25000,
    category: 'monthly'
  },
  {
    type: 'revenue',
    title: 'Six-Figure Business',
    description: 'Reach $100,000 in total revenue',
    targetValue: 100000,
    category: 'all_time'
  },

  // Client Milestones
  {
    type: 'clients',
    title: 'Client Builder',
    description: 'Onboard 10 active clients',
    targetValue: 10,
    category: 'all_time'
  },
  {
    type: 'clients',
    title: 'Growing Network',
    description: 'Build a network of 25 clients',
    targetValue: 25,
    category: 'all_time'
  },
  {
    type: 'clients',
    title: 'Client Magnet',
    description: 'Attract 50 loyal clients',
    targetValue: 50,
    category: 'all_time'
  },

  // Invoice Milestones
  {
    type: 'invoices',
    title: 'Invoice Machine',
    description: 'Create 50 invoices in a month',
    targetValue: 50,
    category: 'monthly'
  },
  {
    type: 'invoices',
    title: 'High Volume Creator',
    description: 'Generate 100 invoices monthly',
    targetValue: 100,
    category: 'monthly'
  },

  // Efficiency Milestones
  {
    type: 'efficiency',
    title: 'Efficiency Expert',
    description: 'Achieve 90% efficiency score',
    targetValue: 90,
    category: 'all_time'
  },
  {
    type: 'efficiency',
    title: 'Optimization Master',
    description: 'Reach 95% efficiency score',
    targetValue: 95,
    category: 'all_time'
  },

  // Streak Milestones
  {
    type: 'streak',
    title: 'Consistency King',
    description: 'Maintain a 30-day invoice streak',
    targetValue: 30,
    category: 'all_time'
  },
  {
    type: 'streak',
    title: 'Streak Champion',
    description: 'Achieve a 100-day invoice streak',
    targetValue: 100,
    category: 'all_time'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's milestones
    let q = query(
      collection(db, 'growthMilestones'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    const querySnapshot = await getDocs(q);
    const milestones: GrowthMilestone[] = [];

    querySnapshot.forEach((doc) => {
      milestones.push({ id: doc.id, ...doc.data() } as GrowthMilestone);
    });

    // Mock business metrics - in real app, calculate from actual data
    const mockMetrics: BusinessMetrics = {
      totalRevenue: 12500,
      monthlyRevenue: 3200,
      totalClients: 18,
      totalInvoices: 75,
      monthlyInvoices: 23,
      currentStreak: 12,
      efficiencyScore: 87,
      averageInvoiceValue: 167
    };

    // If no milestones exist, create initial set
    if (milestones.length === 0) {
      const initialMilestones = MILESTONE_TEMPLATES.map(template => ({
        ...template,
        userId,
        currentValue: getCurrentValue(template.type, mockMetrics),
        isAchieved: false,
        createdAt: new Date()
      }));

      // Save initial milestones
      for (const milestone of initialMilestones) {
        await addDoc(collection(db, 'growthMilestones'), milestone);
        milestones.push(milestone);
      }
    } else {
      // Update progress for existing milestones
      for (const milestone of milestones) {
        if (!milestone.isAchieved) {
          const newValue = getCurrentValue(milestone.type, mockMetrics);
          if (newValue !== milestone.currentValue) {
            milestone.currentValue = newValue;
            if (newValue >= milestone.targetValue && !milestone.isAchieved) {
              milestone.isAchieved = true;
              milestone.achievedAt = new Date();
            }
            await updateDoc(doc(db, 'growthMilestones', milestone.id!), {
              currentValue: milestone.currentValue,
              isAchieved: milestone.isAchieved,
              achievedAt: milestone.achievedAt
            });
          }
        }
      }
    }

    // Calculate progress stats
    const achievedCount = milestones.filter(m => m.isAchieved).length;
    const totalCount = milestones.length;
    const recentAchievements = milestones
      .filter(m => m.isAchieved && m.achievedAt)
      .sort((a, b) => new Date(b.achievedAt!).getTime() - new Date(a.achievedAt!).getTime())
      .slice(0, 3);

    return NextResponse.json({
      milestones,
      metrics: mockMetrics,
      stats: {
        achievedCount,
        totalCount,
        progressPercentage: Math.round((achievedCount / totalCount) * 100),
        recentAchievements
      }
    });

  } catch (error) {
    console.error('Error fetching growth milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch growth milestones' }, { status: 500 });
  }
}

function getCurrentValue(type: string, metrics: BusinessMetrics): number {
  switch (type) {
    case 'revenue':
      return metrics.monthlyRevenue;
    case 'clients':
      return metrics.totalClients;
    case 'invoices':
      return metrics.monthlyInvoices;
    case 'efficiency':
      return metrics.efficiencyScore;
    case 'streak':
      return metrics.currentStreak;
    default:
      return 0;
  }
}