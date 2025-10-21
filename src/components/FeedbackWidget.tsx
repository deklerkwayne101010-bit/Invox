'use client';

import { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, X, Star } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | null>(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you'd send this to your backend
      console.log('Feedback submitted:', {
        type: feedbackType,
        rating,
        message,
        email,
        timestamp: new Date().toISOString()
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFeedbackType(null);
        setRating(0);
        setMessage('');
        setEmail('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackOptions = [
    { type: 'general' as const, label: 'General Feedback', icon: MessageSquare },
    { type: 'bug' as const, label: 'Report a Bug', icon: ThumbsDown },
    { type: 'feature' as const, label: 'Feature Request', icon: ThumbsUp }
  ];

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5" />
            <span>Thank you for your feedback!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-all z-40 group"
        aria-label="Open feedback widget"
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ?
        </div>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Share Your Feedback</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close feedback widget"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {!feedbackType ? (
                // Feedback Type Selection
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">
                    How can we improve Invox for you?
                  </p>
                  <div className="grid gap-3">
                    {feedbackOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setFeedbackType(option.type)}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                      >
                        <option.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Feedback Form
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you rate your experience?
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your feedback
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        feedbackType === 'bug'
                          ? 'Describe the issue you encountered...'
                          : feedbackType === 'feature'
                          ? 'What feature would you like to see?'
                          : 'Share your thoughts...'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="feedback-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll only use this to follow up on your feedback
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setFeedbackType(null)}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!message.trim() || isSubmitting}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
