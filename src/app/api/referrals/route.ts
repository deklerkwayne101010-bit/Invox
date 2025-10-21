import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Generate unique referral code
function generateReferralCode(): string {
  return 'INVOX' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's referrals
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const referrals: Referral[] = [];

    querySnapshot.forEach((doc) => {
      referrals.push({ id: doc.id, ...doc.data() } as Referral);
    });

    // Calculate stats
    const stats: ReferralStats = {
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter(r => r.status === 'rewarded').length,
      pendingRewards: referrals.filter(r => r.status === 'active').length,
      totalEarned: referrals
        .filter(r => r.status === 'rewarded')
        .reduce((sum, r) => sum + r.rewardAmount, 0)
    };

    return NextResponse.json({
      referrals,
      stats,
      referralCode: generateReferralCode() // In real app, this would be stored per user
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { referrerId, referrerEmail, refereeEmail } = await request.json();

    if (!referrerId || !referrerEmail || !refereeEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if referral already exists
    const existingQuery = query(
      collection(db, 'referrals'),
      where('referrerId', '==', referrerId),
      where('refereeEmail', '==', refereeEmail)
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      return NextResponse.json({ error: 'Referral already exists' }, { status: 400 });
    }

    const newReferral: Referral = {
      referrerId,
      referrerEmail,
      refereeEmail,
      referralCode: generateReferralCode(),
      status: 'pending',
      createdAt: new Date(),
      rewardAmount: 10 // $10 credit for successful referral
    };

    const docRef = await addDoc(collection(db, 'referrals'), newReferral);

    return NextResponse.json({
      id: docRef.id,
      ...newReferral
    });

  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
}

// PUT endpoint to update referral status (when referee signs up)
export async function PUT(request: NextRequest) {
  try {
    const { referralId, status, refereeId } = await request.json();

    if (!referralId || !status) {
      return NextResponse.json({ error: 'Referral ID and status are required' }, { status: 400 });
    }

    const updateData: Partial<Referral> = {
      status,
      ...(status === 'signed_up' && { signedUpAt: new Date() }),
      ...(status === 'active' && { signedUpAt: new Date() }),
      ...(status === 'rewarded' && { rewardClaimedAt: new Date() })
    };

    await updateDoc(doc(db, 'referrals', referralId), updateData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}