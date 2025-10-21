'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Copy, Check, ArrowLeft, Filter, TrendingUp, Laugh, Lightbulb, Quote, Target } from 'lucide-react';
import Link from 'next/link';

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

const typeIcons = {
  meme: Laugh,
  infographic: TrendingUp,
  quote: Quote,
  challenge: Target,
  tip: Lightbulb
};

const typeColors = {
  meme: 'bg-purple-100 text-purple-800',
  infographic: 'bg-blue-100 text-blue-800',
  quote: 'bg-green-100 text-green-800',
  challenge: 'bg-orange-100 text-orange-800',
  tip: 'bg-pink-100 text-pink-800'
};

export default function ViralContentPage() {
  const [content, setContent] = useState<ViralContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [likedContent, setLikedContent] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  const fetchContent = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      params.append('limit', '20');

      const response = await fetch(`/api/viral-content?${params}`);
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching viral content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (contentId: string) => {
    try {
      const response = await fetch('/api/viral-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action: 'like' })
      });

      if (response.ok) {
        setLikedContent(prev => {
          const newSet = new Set(prev);
          newSet.add(contentId);
          return newSet;
        });

        // Update local content
        setContent(prev => prev.map(item =>
          item.id === contentId
            ? { ...item, likes: item.likes + 1 }
            : item
        ));
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleShare = async (item: ViralContent) => {
    try {
      const response = await fetch('/api/viral-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: item.id, action: 'share' })
      });

      if (response.ok) {
        // Update local content
        setContent(prev => prev.map(contentItem =>
          contentItem.id === item.id
            ? { ...contentItem, shares: contentItem.shares + 1 }
            : contentItem
        ));

        // Share to clipboard
        await navigator.clipboard.writeText(item.shareText);
        setCopied(item.id);
        setTimeout(() => setCopied(null), 2000);
      }
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const shareToSocial = (item: ViralContent, platform: string) => {
    const text = encodeURIComponent(item.shareText);
    const url = encodeURIComponent(window.location.origin);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading viral content...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Viral Content Hub</h1>
          <p className="text-xl text-gray-600">
            Shareable content designed to go viral and attract more entrepreneurs to Invox!
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium">Filter by type:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Content' },
                { key: 'meme', label: 'Memes' },
                { key: 'infographic', label: 'Infographics' },
                { key: 'quote', label: 'Quotes' },
                { key: 'challenge', label: 'Challenges' },
                { key: 'tip', label: 'Tips' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-6 mb-12">
          {content.map((item) => {
            const Icon = typeIcons[item.type];
            const isLiked = likedContent.has(item.id);

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-line text-lg leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.hashtags.map((hashtag, index) => (
                      <span key={index} className="text-blue-600 font-medium">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isLiked
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      {item.likes + (isLiked ? 1 : 0)}
                    </button>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Share2 size={16} />
                      <span className="text-sm">{item.shares} shares</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare(item)}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      {copied === item.id ? <Check size={16} /> : <Copy size={16} />}
                      {copied === item.id ? 'Copied!' : 'Copy Text'}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => {/* Toggle dropdown */}}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                      {/* Social share dropdown would go here */}
                    </div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => shareToSocial(item, 'twitter')}
                    className="flex items-center gap-2 bg-blue-400 text-white px-3 py-1 rounded text-sm hover:bg-blue-500 transition-colors"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => shareToSocial(item, 'facebook')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareToSocial(item, 'linkedin')}
                    className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-800 transition-colors"
                  >
                    LinkedIn
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Want Your Business Featured?</h2>
          <p className="text-lg mb-6 opacity-90">
            Share your success story and we might turn it into viral content that helps other entrepreneurs!
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/success-stories"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Share Success Story
            </Link>
            <Link
              href="/profile"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Update Profile
            </Link>
          </div>
        </div>

        {/* Content Strategy Tips */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Viral Content Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">What Makes Content Go Viral?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Relatable pain points that entrepreneurs face</li>
                <li>• Practical tips and actionable advice</li>
                <li>• Success stories and real results</li>
                <li>• Humor and memes that resonate</li>
                <li>• Visual elements that are easy to share</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Sharing Best Practices</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use relevant hashtags for discoverability</li>
                <li>• Tag friends and business communities</li>
                <li>• Share during peak business hours</li>
                <li>• Engage with comments and responses</li>
                <li>• Follow up with related content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}