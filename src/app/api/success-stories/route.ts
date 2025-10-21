import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SuccessStory {
  id?: string;
  userId: string;
  businessName: string;
  title: string;
  story: string;
  metrics: {
    revenueIncrease?: number;
    clientsGained?: number;
    timeSaved?: number;
    invoicesCreated?: number;
  };
  category: 'revenue' | 'clients' | 'efficiency' | 'growth';
  isPublic: boolean;
  createdAt: Date;
  likes: number;
  shares: number;
}

// Pre-seeded success stories for demonstration
const PRESEEDED_STORIES: Omit<SuccessStory, 'id'>[] = [
  {
    userId: 'demo1',
    businessName: 'GreenLeaf Landscaping',
    title: 'From Manual Chaos to Professional Invoicing',
    story: 'As a small landscaping business, I was struggling with handwritten invoices and lost paperwork. Invox transformed my business - I now send professional invoices instantly and track payments effortlessly. My revenue increased by 40% in just 3 months!',
    metrics: {
      revenueIncrease: 40,
      timeSaved: 10,
      invoicesCreated: 150
    },
    category: 'revenue',
    isPublic: true,
    createdAt: new Date('2024-01-15'),
    likes: 24,
    shares: 8
  },
  {
    userId: 'demo2',
    businessName: 'TechStart Solutions',
    title: 'Scaling from Freelancer to Agency',
    story: 'Starting as a solo developer, Invox helped me scale to a 5-person agency. The recurring invoices feature automated my monthly retainers, and the client management system kept everything organized. We grew our client base by 300%!',
    metrics: {
      clientsGained: 12,
      revenueIncrease: 250,
      invoicesCreated: 500
    },
    category: 'growth',
    isPublic: true,
    createdAt: new Date('2024-02-20'),
    likes: 31,
    shares: 15
  },
  {
    userId: 'demo3',
    businessName: 'Bella\'s Bakery',
    title: 'Sweet Success with Streamlined Operations',
    story: 'Running a bakery while managing invoices was overwhelming. Invox\'s mobile app lets me create invoices on the go, and the payment tracking ensures I get paid on time. I\'ve reduced late payments by 80%!',
    metrics: {
      timeSaved: 15,
      revenueIncrease: 25
    },
    category: 'efficiency',
    isPublic: true,
    createdAt: new Date('2024-03-10'),
    likes: 18,
    shares: 6
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');

    let q = query(collection(db, 'successStories'), orderBy('createdAt', 'desc'));

    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    if (limitParam) {
      q = query(q, limit(parseInt(limitParam)));
    }

    const querySnapshot = await getDocs(q);
    const stories: SuccessStory[] = [];

    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() } as SuccessStory);
    });

    // If no stories in database, return pre-seeded stories
    if (stories.length === 0) {
      return NextResponse.json(PRESEEDED_STORIES);
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    // Fallback to pre-seeded stories
    return NextResponse.json(PRESEEDED_STORIES);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<SuccessStory, 'id' | 'createdAt' | 'likes' | 'shares'> = await request.json();

    const newStory: SuccessStory = {
      ...body,
      createdAt: new Date(),
      likes: 0,
      shares: 0
    };

    const docRef = await addDoc(collection(db, 'successStories'), newStory);

    return NextResponse.json({
      id: docRef.id,
      ...newStory
    });
  } catch (error) {
    console.error('Error creating success story:', error);
    return NextResponse.json({ error: 'Failed to create success story' }, { status: 500 });
  }
}