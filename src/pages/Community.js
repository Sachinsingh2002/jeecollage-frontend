import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { ChatCircle, ArrowFatUp, ArrowFatDown, Plus } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  "JEE / College Decision",
  "Career & Future Skills",
  "Education System",
  "Mindset & Life Decisions",
  "Career Strategy & Money"
];

export const Community = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSettings, setPageSettings] = useState(null);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) setSelectedCategory(category);
    fetchPageSettings();
  }, [searchParams]);

  useEffect(() => { fetchPosts(); }, [selectedCategory, page]);

  const fetchPageSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/site-settings`);
      setPageSettings(data?.pages?.community);
    } catch (e) {}
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (selectedCategory) params.category = selectedCategory;
      const { data } = await axios.get(`${API}/community/posts`, { params });
      setPosts(data.posts || data);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={selectedCategory || "Student Community - Pair Up, Discuss, Decide"}
        description="Join India's student community. Discuss JEE college decisions, career strategies, education system, and life choices with fellow students."
        keywords="student community, JEE discussion, college decision, career advice, education forum India"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          ...(selectedCategory ? [{ name: selectedCategory }] : [])
        ]}
      />
      <Header />
      
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight" data-testid="community-heading">{pageSettings?.heading || 'Student Community'}</h1>
          {user && (
            <Link to="/community/new">
              <button data-testid="create-post-button" className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none flex items-center gap-2">
                <Plus size={20} weight="bold" />
                New Post
              </button>
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  data-testid="category-all"
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === '' ? 'bg-[#002FA7] text-white font-bold' : 'hover:bg-zinc-200'
                  }`}
                >
                  All Topics
                </button>
                {CATEGORIES.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCategoryChange(category)}
                    data-testid={`category-${idx}`}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedCategory === category ? 'bg-[#002FA7] text-white font-bold' : 'hover:bg-zinc-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Posts List */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-zinc-600">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-zinc-600" data-testid="no-posts-message">
                No posts yet. {user && 'Be the first to start a discussion!'}
              </div>
            ) : (
              <>
              <div className="space-y-4">
                {posts.map((post, idx) => (
                  <Link to={`/community/post/${post.id}`} key={idx}>
                    <div data-testid={`post-${idx}`} className="brutalist-card bg-white border border-zinc-200 rounded-none p-6 flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1 w-12">
                        <ArrowFatUp size={20} weight="fill" className="text-zinc-400" />
                        <span className="text-sm font-bold" data-testid={`post-${idx}-votes`}>{post.upvotes - post.downvotes}</span>
                        <ArrowFatDown size={20} weight="fill" className="text-zinc-400" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#002FA7]">{post.category}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">by {post.author_name}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">{formatDate(post.created_at)}</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2">{post.title}</h3>
                        <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{post.content}</p>
                        <div className="flex items-center gap-1 text-zinc-500">
                          <ChatCircle size={16} weight="bold" />
                          <span className="text-xs" data-testid={`post-${idx}-replies`}>{post.replies_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </main>

          {/* Trending Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">About Community</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {pageSettings?.description || 'Connect with fellow students, share experiences, ask questions, and help each other make informed decisions about education and career.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};