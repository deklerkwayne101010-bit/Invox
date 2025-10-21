import { NextRequest, NextResponse } from 'next/server';

interface ViralContent {
  id: string;
  title: string;
  content: string;
  type: 'meme' | 'infographic' | 'quote' | 'challenge' | 'tip';
  hashtags: string[];
  shareText: string;
  imageUrl?: string;
  likes: number;
  shares: number;
  createdAt: string;
}

// Pre-seeded viral content for engagement
const VIRAL_CONTENT: ViralContent[] = [
  {
    id: '1',
    title: 'The Invoice Struggle is Real',
    content: 'When you spend 2 hours creating the perfect invoice, only for the client to ask "Can you make it look more professional?" 🤦‍♂️',
    type: 'meme',
    hashtags: ['#InvoiceStruggles', '#SmallBusinessLife', '#EntrepreneurProblems', '#Invox'],
    shareText: 'POV: You spent 2 hours on the perfect invoice, client says "make it more professional" 🤦‍♂️ #InvoiceStruggles #Invox',
    likes: 245,
    shares: 89,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'From Chaos to Cash Flow',
    content: '📊 Small Business Invoice Statistics:\n\n• 68% of small businesses struggle with late payments\n• Professional invoices increase payment speed by 40%\n• Automated reminders reduce late payments by 60%\n\nDon\'t let cash flow problems slow you down! 💰',
    type: 'infographic',
    hashtags: ['#SmallBusiness', '#CashFlow', '#InvoiceTips', '#BusinessGrowth', '#Invox'],
    shareText: '📊 68% of small businesses struggle with late payments. Professional invoices can increase payment speed by 40%! #SmallBusiness #CashFlow #Invox',
    likes: 189,
    shares: 67,
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'Entrepreneur Wisdom',
    content: '"Your invoice is your first impression. Make it count." - Every successful business owner ever 📄✨',
    type: 'quote',
    hashtags: ['#EntrepreneurWisdom', '#BusinessQuotes', '#InvoiceTips', '#Professionalism', '#Invox'],
    shareText: '"Your invoice is your first impression. Make it count." - Every successful business owner 📄✨ #EntrepreneurWisdom #Invox',
    likes: 156,
    shares: 43,
    createdAt: '2024-01-25T09:15:00Z'
  },
  {
    id: '4',
    title: 'The 24-Hour Invoice Challenge',
    content: 'Challenge: Create and send a professional invoice in under 2 minutes! ⏱️\n\nSteps:\n1. Use a pre-made template\n2. Auto-fill client details\n3. Add line items quickly\n4. Send with one click\n\nWho\'s up for the challenge? Tag a friend! 👇',
    type: 'challenge',
    hashtags: ['#InvoiceChallenge', '#ProductivityHack', '#SmallBusiness', '#TimeSaver', '#Invox'],
    shareText: '⏱️ The 24-Hour Invoice Challenge: Create and send a professional invoice in under 2 minutes! Who\'s in? #InvoiceChallenge #Invox',
    likes: 298,
    shares: 124,
    createdAt: '2024-02-01T16:45:00Z'
  },
  {
    id: '5',
    title: 'Hidden Invoice Superpower',
    content: '💡 Pro Tip: Add a small "Thank you for your business!" note at the bottom of your invoices. It builds relationships and increases the chance of repeat business by 25%! 🙏✨',
    type: 'tip',
    hashtags: ['#BusinessTips', '#CustomerService', '#InvoiceHacks', '#RelationshipBuilding', '#Invox'],
    shareText: '💡 Pro Tip: Add "Thank you for your business!" to your invoices. Increases repeat business by 25%! 🙏✨ #BusinessTips #Invox',
    likes: 203,
    shares: 78,
    createdAt: '2024-02-05T11:20:00Z'
  },
  {
    id: '6',
    title: 'The Late Payment Nightmare',
    content: 'POV: It\'s the 30th of the month, you\'re checking your bank account every 5 minutes, refreshing your email hoping for that payment notification... but nothing. The invoice was sent 2 weeks ago. 😰💸',
    type: 'meme',
    hashtags: ['#LatePayments', '#CashFlowProblems', '#SmallBusinessStruggles', '#InvoiceNightmares', '#Invox'],
    shareText: 'POV: Checking bank account every 5 minutes on the 30th, invoice sent 2 weeks ago... 😰💸 #LatePayments #Invox',
    likes: 312,
    shares: 156,
    createdAt: '2024-02-10T13:10:00Z'
  },
  {
    id: '7',
    title: 'Invoice Template Power',
    content: '🎨 The Psychology of Invoice Design:\n\n• Clean layouts = Trust & Credibility\n• Brand colors = Professional Recognition\n• Clear payment terms = Faster Payments\n• Mobile-friendly = Modern Business\n\nYour invoice design speaks volumes about your business! 📈',
    type: 'infographic',
    hashtags: ['#InvoiceDesign', '#BusinessPsychology', '#ProfessionalBranding', '#PaymentTerms', '#Invox'],
    shareText: '🎨 Clean layouts = Trust. Brand colors = Recognition. Clear terms = Faster payments. Your invoice design matters! 📈 #InvoiceDesign #Invox',
    likes: 178,
    shares: 52,
    createdAt: '2024-02-15T15:30:00Z'
  },
  {
    id: '8',
    title: 'Success Story Quote',
    content: '"Since switching to Invox, my average payment time dropped from 45 days to 15 days. It\'s transformed my cash flow completely!" - Sarah M., Freelance Designer 🚀💰',
    type: 'quote',
    hashtags: ['#SuccessStory', '#CashFlowTransformation', '#PaymentSpeed', '#BusinessGrowth', '#Invox'],
    shareText: '"Since switching to Invox, my payment time dropped from 45 to 15 days!" - Sarah M. 🚀💰 #SuccessStory #Invox',
    likes: 267,
    shares: 98,
    createdAt: '2024-02-20T10:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredContent = VIRAL_CONTENT;

    if (type && type !== 'all') {
      filteredContent = VIRAL_CONTENT.filter(content => content.type === type);
    }

    // Sort by engagement (likes + shares) and limit
    const sortedContent = filteredContent
      .sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares))
      .slice(0, limit);

    return NextResponse.json(sortedContent);
  } catch (error) {
    console.error('Error fetching viral content:', error);
    return NextResponse.json({ error: 'Failed to fetch viral content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, action } = await request.json();

    if (!contentId || !action) {
      return NextResponse.json({ error: 'Content ID and action are required' }, { status: 400 });
    }

    // Find and update the content (in a real app, this would update a database)
    const contentIndex = VIRAL_CONTENT.findIndex(c => c.id === contentId);
    if (contentIndex === -1) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (action === 'like') {
      VIRAL_CONTENT[contentIndex].likes += 1;
    } else if (action === 'share') {
      VIRAL_CONTENT[contentIndex].shares += 1;
    }

    return NextResponse.json({
      success: true,
      updatedContent: VIRAL_CONTENT[contentIndex]
    });
  } catch (error) {
    console.error('Error updating viral content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}