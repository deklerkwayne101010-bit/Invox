'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, Clock, Share2, Heart, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

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

const categoryIcons = {
  revenue: TrendingUp,
  clients: Users,
  efficiency: Clock,
  growth: Star
};

const categoryColors = {
  revenue: 'bg-green-100 text-green-800',
  clients: 'bg-blue-100 text-blue-800',
  efficiency: 'bg-purple-100 text-purple-800',
  growth: 'bg-orange-100 text-orange-800'
};

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStories();
  }, [selectedCategory]);

  const fetchStories = async () => {
    try {
      const response = await fetch(`/api/success-stories?category=${selectedCategory}&limit=20`);
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (storyId: string) => {
    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };

  const handleShare = (story: SuccessStory) => {
    const shareText = `Check out this success story from ${story.businessName}: "${story.title}"\n\n${story.story.substring(0, 100)}...\n\n#BusinessSuccess #Invox`;
    const shareUrl = `${window.location.origin}/success-stories`;

    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      alert('Success story link copied to clipboard!');
    }
  };

  const formatMetric = (key: string, value: number) => {
    switch (key) {
      case 'revenueIncrease':
        return `+${value}% revenue`;
      case 'clientsGained':
        return `+${value} clients`;
      case 'timeSaved':
        return `${value}hrs/week saved`;
      case 'invoicesCreated':
        return `${value}+ invoices`;
      default:
        return `${value}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading success stories...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-gray-600 mb-6">
            Real entrepreneurs sharing their Invox success stories and business growth journeys
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter size={16} className="inline mr-2" />
              All Stories
            </button>
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Icon size={16} className="inline mr-2" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stories.map((story) => {
            const Icon = categoryIcons[story.category];
            const isLiked = likedStories.has(story.id || story.userId);

            return (
              <div key={story.id || story.userId} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{story.businessName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[story.category]}`}>
                        {story.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLike(story.id || story.userId)}
                      className={`p-2 rounded-full transition-colors ${
                        isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleShare(story)}
                      className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">{story.title}</h4>
                <p className="text-gray-600 mb-4 line-clamp-4">{story.story}</p>

                {/* Metrics */}
                {Object.entries(story.metrics).length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(story.metrics).map(([key, value]) => (
                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {formatMetric(key, value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {story.likes + (isLiked ? 1 : 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={14} />
                      {story.shares}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Share Your Success Story!</h2>
          <p className="text-lg mb-6 opacity-90">
            Have you achieved business growth with Invox? Share your story and inspire other entrepreneurs!
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Share My Story
          </Link>
        </div>

        {/* Community Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stories.length}+</div>
            <div className="text-gray-600">Success Stories</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stories.reduce((sum, story) => sum + story.likes, 0)}+
            </div>
            <div className="text-gray-600">Community Likes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stories.reduce((sum, story) => sum + story.shares, 0)}+
            </div>
            <div className="text-gray-600">Stories Shared</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stories.reduce((sum, story) => sum + (story.metrics.revenueIncrease || 0), 0)}%+
            </div>
            <div className="text-gray-600">Revenue Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
}