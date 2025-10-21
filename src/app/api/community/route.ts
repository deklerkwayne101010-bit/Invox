import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, increment, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommunityPost {
  id?: string;
  userId: string;
  authorName: string;
  businessName: string;
  title: string;
  content: string;
  type: 'question' | 'tip' | 'success' | 'discussion' | 'resource';
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityReply {
  id?: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  likes: number;
  createdAt: Date;
}

// Pre-seeded community content
const PRESEEDED_POSTS: Omit<CommunityPost, 'id'>[] = [
  {
    userId: 'demo1',
    authorName: 'Sarah Johnson',
    businessName: 'Creative Designs Co.',
    title: 'How do you handle late-paying clients?',
    content: 'I\'m struggling with clients who pay 30-60 days late. What strategies have worked for you? I\'ve tried reminders but they don\'t seem effective.',
    type: 'question',
    tags: ['payment', 'clients', 'cashflow'],
    likes: 12,
    replies: 8,
    views: 45,
    isPinned: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    userId: 'demo2',
    authorName: 'Mike Chen',
    businessName: 'Tech Solutions Pro',
    title: 'Just hit $10K MRR! Here\'s what worked for me',
    content: 'After 2 years of grinding, I finally reached $10K monthly recurring revenue. Key lessons: focus on high-value clients, automate everything possible, and never stop networking. The recurring invoice feature in Invox has been a game-changer for my cash flow predictability.',
    type: 'success',
    tags: ['success', 'growth', 'recurring-revenue'],
    likes: 28,
    replies: 15,
    views: 89,
    isPinned: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    userId: 'demo3',
    authorName: 'Jennifer Martinez',
    businessName: 'Consulting Plus',
    title: 'Best tools for expense tracking in 2024',
    content: 'I\'ve been using Invox for invoicing but I\'m still using spreadsheets for expenses. What tools do you recommend for automatic expense categorization and receipt scanning? Looking for something that integrates well with QuickBooks.',
    type: 'question',
    tags: ['tools', 'expenses', 'automation'],
    likes: 6,
    replies: 12,
    views: 34,
    isPinned: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    userId: 'demo4',
    authorName: 'David Wilson',
    businessName: 'Local Services Hub',
    title: 'Pro tip: Use invoice templates for different client types',
    content: 'I create different invoice templates for different types of clients. For enterprise clients, I use more formal language and detailed terms. For small businesses, I keep it simple and friendly. For individual clients, I add a personal touch. This has improved my response rates significantly.',
    type: 'tip',
    tags: ['templates', 'clients', 'communication'],
    likes: 19,
    replies: 5,
    views: 67,
    isPinned: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const limitParam = searchParams.get('limit');

    let q = query(collection(db, 'communityPosts'), orderBy('isPinned', 'desc'), orderBy('updatedAt', 'desc'));

    if (type && type !== 'all') {
      q = query(q, where('type', '==', type));
    }

    if (tag) {
      q = query(q, where('tags', 'array-contains', tag));
    }

    if (limitParam) {
      q = query(q, limit(parseInt(limitParam)));
    }

    const querySnapshot = await getDocs(q);
    const posts: CommunityPost[] = [];

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as CommunityPost);
    });

    // If no posts in database, return pre-seeded posts
    if (posts.length === 0) {
      return NextResponse.json(PRESEEDED_POSTS);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    // Fallback to pre-seeded posts
    return NextResponse.json(PRESEEDED_POSTS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<CommunityPost, 'id' | 'likes' | 'replies' | 'views' | 'isPinned' | 'createdAt' | 'updatedAt'> = await request.json();

    const newPost: CommunityPost = {
      ...body,
      likes: 0,
      replies: 0,
      views: 0,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'communityPosts'), newPost);

    return NextResponse.json({
      id: docRef.id,
      ...newPost
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT endpoint to like/unlike a post
export async function PUT(request: NextRequest) {
  try {
    const { postId, action } = await request.json();

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action are required' }, { status: 400 });
    }

    const incrementValue = action === 'like' ? 1 : -1;

    await updateDoc(doc(db, 'communityPosts', postId), {
      likes: increment(incrementValue),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating post likes:', error);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}