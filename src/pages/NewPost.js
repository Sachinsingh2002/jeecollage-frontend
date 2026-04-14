import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import axios from 'axios';
import { formatApiErrorDetail } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  "JEE / College Decision",
  "Career & Future Skills",
  "Education System",
  "Mindset & Life Decisions",
  "Career Strategy & Money"
];

export const NewPost = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${API}/community/posts`,
        { category, title, content },
        { withCredentials: true }
      );
      navigate('/community');
    } catch (error) {
      setError(formatApiErrorDetail(error.response?.data?.detail) || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <h1 className="text-4xl font-bold tracking-tight mb-8" data-testid="new-post-heading">Create New Post</h1>
          
          <div className="max-w-3xl">
            {error && (
              <div data-testid="new-post-error" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  data-testid="post-category-select"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="post-title-input"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                  placeholder="What's your question or topic?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid="post-content-textarea"
                  required
                  rows={12}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                  placeholder="Share your thoughts, questions, or experiences..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-post-button"
                  className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none disabled:opacity-50"
                >
                  {loading ? 'Posting...' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/community')}
                  data-testid="cancel-post-button"
                  className="px-8 py-4 bg-white text-black border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};