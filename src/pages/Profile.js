import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { User, Article, Star, ChatCircle, ArrowFatUp, CalendarBlank } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/user/profile`, { withCredentials: true });
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const tabs = [
    { key: 'posts', label: 'Posts', icon: Article },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'replies', label: 'Replies', icon: ChatCircle },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="px-6 md:px-12 lg:px-24 py-12 text-center">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="px-6 md:px-12 lg:px-24 py-12 text-center">Failed to load profile</div>
        </div>
      </ProtectedRoute>
    );
  }

  const { user, posts, reviews, replies, stats } = profile;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />

        <div className="px-6 md:px-12 lg:px-24 py-8">
          {/* Profile Header */}
          <div className="border border-zinc-200 p-8 mb-8 flex items-start gap-8" data-testid="profile-header">
            <div className="w-20 h-20 bg-[#002FA7] flex items-center justify-center flex-shrink-0">
              <User size={40} weight="bold" className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-1" data-testid="profile-name">{user.name}</h1>
              <p className="text-zinc-500 mb-4" data-testid="profile-email">{user.email}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CalendarBlank size={16} weight="bold" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] bg-zinc-100 px-3 py-1" data-testid="profile-role">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-zinc-200 p-6 text-center" data-testid="stat-posts">
              <div className="text-3xl font-bold text-[#002FA7]">{stats.posts_count}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">Posts</div>
            </div>
            <div className="border border-zinc-200 p-6 text-center" data-testid="stat-reviews">
              <div className="text-3xl font-bold text-[#002FA7]">{stats.reviews_count}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">Reviews</div>
            </div>
            <div className="border border-zinc-200 p-6 text-center" data-testid="stat-replies">
              <div className="text-3xl font-bold text-[#002FA7]">{stats.replies_count}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">Replies</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-zinc-200 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  data-testid={`tab-${tab.key}`}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-[#002FA7] text-[#002FA7]'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Icon size={18} weight="bold" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="space-y-4" data-testid="posts-list">
              {posts.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">No posts yet. <Link to="/community/new" className="text-[#002FA7] font-bold hover:underline">Create one</Link></p>
              ) : (
                posts.map((post, idx) => (
                  <Link to={`/community/post/${post.id}`} key={idx}>
                    <div className="brutalist-card border border-zinc-200 p-5 flex items-center justify-between" data-testid={`profile-post-${idx}`}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#002FA7]">{post.category}</span>
                        <h3 className="text-lg font-bold tracking-tight mt-1">{post.title}</h3>
                        <span className="text-xs text-zinc-500">{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-600">
                        <ArrowFatUp size={16} weight="fill" />
                        <span className="text-sm font-bold">{post.upvotes - post.downvotes}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4" data-testid="reviews-list">
              {reviews.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">No reviews yet. <Link to="/colleges" className="text-[#002FA7] font-bold hover:underline">Explore colleges</Link></p>
              ) : (
                reviews.map((review, idx) => (
                  <div key={idx} className="border border-zinc-200 p-5" data-testid={`profile-review-${idx}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} weight="fill" className="text-[#002FA7]" />
                      <span className="text-sm font-bold">{review.rating}/5</span>
                      <span className="text-xs text-zinc-500">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-zinc-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'replies' && (
            <div className="space-y-4" data-testid="replies-list">
              {replies.length === 0 ? (
                <p className="text-zinc-500 py-8 text-center">No replies yet.</p>
              ) : (
                replies.map((reply, idx) => (
                  <Link to={`/community/post/${reply.post_id}`} key={idx}>
                    <div className="brutalist-card border border-zinc-200 p-5" data-testid={`profile-reply-${idx}`}>
                      <p className="text-zinc-700">{reply.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-zinc-500">{formatDate(reply.created_at)}</span>
                        <div className="flex items-center gap-1 text-zinc-600">
                          <ArrowFatUp size={14} weight="fill" />
                          <span className="text-xs font-bold">{reply.upvotes}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
