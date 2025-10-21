'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Eye, Pin, Plus, Filter, ArrowLeft, User, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

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

const typeColors = {
  question: 'bg-blue-100 text-blue-800',
  tip: 'bg-green-100 text-green-800',
  success: 'bg-purple-100 text-purple-800',
  discussion: 'bg-orange-100 text-orange-800',
  resource: 'bg-pink-100 text-pink-800'
};

const typeIcons = {
  question: '❓',
  tip: '💡',
  success: '🎉',
  discussion: '💬',
  resource: '📚'
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, [selectedType, selectedTag]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedTag) params.append('tag', selectedTag);
      params.append('limit', '50');

      const response = await fetch(`/api/community?${params}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const action = likedPosts.has(postId) ? 'unlike' : 'like';

      const response = await fetch('/api/community', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action })
      });

      if (response.ok) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (action === 'like') {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });

        // Update local post data
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + (action === 'like' ? 1 : -1) }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading community discussions...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Forum</h1>
              <p className="text-xl text-gray-600">
                Connect with fellow entrepreneurs, share tips, and get advice from the Invox community
              </p>
            </div>
            <Link
              href="/community/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Post
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="font-medium">Filter by:</span>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="question">Questions</option>
              <option value="tip">Tips</option>
              <option value="success">Success Stories</option>
              <option value="discussion">Discussions</option>
              <option value="resource">Resources</option>
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{posts.length}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {posts.reduce((sum, post) => sum + post.likes, 0)}
            </div>
            <div className="text-gray-600">Community Likes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {posts.reduce((sum, post) => sum + post.replies, 0)}
            </div>
            <div className="text-gray-600">Replies</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {posts.reduce((sum, post) => sum + post.views, 0)}
            </div>
            <div className="text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = likedPosts.has(post.id || post.userId);

            return (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{typeIcons[post.type]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <Pin size={16} className="text-blue-600" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[post.type]}`}>
                          {post.type}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>{post.businessName}</span>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              <Tag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id || post.userId)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isLiked
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      {post.likes + (isLiked ? 1 : 0)}
                    </button>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle size={16} />
                      <span className="text-sm">{post.replies} replies</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye size={16} />
                      <span className="text-sm">{post.views} views</span>
                    </div>
                  </div>

                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Read More →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              Be the first to start a discussion in our community!
            </p>
            <Link
              href="/community/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Post
            </Link>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">✅ Do's</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share your business experiences and lessons learned</li>
                <li>• Ask thoughtful questions about invoicing and business</li>
                <li>• Help fellow entrepreneurs with advice and tips</li>
                <li>• Celebrate successes and milestones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">❌ Don'ts</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share confidential client information</li>
                <li>• Post spam or promotional content</li>
                <li>• Engage in disrespectful or harmful discussions</li>
                <li>• Share illegal or unethical business practices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}