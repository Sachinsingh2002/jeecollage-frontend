import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { Clock, Tag, ArrowRight, BookOpen } from '@phosphor-icons/react';
import { Pagination } from '../components/Pagination';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Blog = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const selectedTag = searchParams.get('tag') || '';

  useEffect(() => { fetchPosts(); }, [page, selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 9 };
      if (selectedTag) params.tag = selectedTag;
      const { data } = await axios.get(`${API}/blog`, { params });
      setPosts(data.posts);
      setTotalPages(data.total_pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Blog & Insights — JEE Preparation, College Guide, Career Advice"
        description="Expert insights on JEE preparation, college selection, placement trends, and career strategy. Data-driven articles to help you make smarter education decisions."
        keywords="JEE blog, engineering college insights, IIT preparation tips, placement analysis, career advice students"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Blog & Insights" }]}
      />
      <Header />

      {/* Hero */}
      <section className="bg-[#09090B] text-white px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={28} weight="bold" className="text-[#002FA7]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Blog & Insights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-4" data-testid="blog-heading">
            Expert Insights for <span className="text-[#002FA7]">Smarter</span> Decisions
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Data-driven articles on JEE preparation, college selection, placement trends, and career strategy.
          </p>
        </div>
      </section>

      {/* Tag filter */}
      {selectedTag && (
        <div className="px-6 md:px-12 lg:px-24 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center gap-3">
          <Tag size={16} weight="bold" className="text-[#002FA7]" />
          <span className="text-sm">Filtered by: <strong>{selectedTag}</strong></span>
          <Link to="/blog" className="text-xs text-[#002FA7] font-bold hover:underline">Clear</Link>
        </div>
      )}

      {/* Posts Grid */}
      <section className="px-6 md:px-12 lg:px-24 py-12">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading articles...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border border-zinc-200 bg-zinc-50" data-testid="no-posts">
            <BookOpen size={48} weight="thin" className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">No articles yet</h2>
            <p className="text-zinc-500">Check back soon for expert insights.</p>
          </div>
        ) : (
          <>
          {/* Featured Post (first) */}
          {page === 1 && posts.length > 0 && (
            <Link to={`/blog/${posts[0].slug}`} className="group block mb-10" data-testid="featured-post">
              <div className="grid md:grid-cols-2 gap-8 border border-zinc-200 p-0 overflow-hidden brutalist-card">
                {posts[0].cover_image && (
                  <img src={posts[0].cover_image} alt={posts[0].title} className="w-full h-72 md:h-full object-cover" />
                )}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#002FA7]">Featured</span>
                    <span className="text-xs text-zinc-400">{formatDate(posts[0].created_at)}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-[#002FA7] transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock size={14} weight="bold" />
                      {posts[0].read_time} min read
                    </div>
                    <div className="flex gap-2">
                      {posts[0].tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-zinc-100 px-2 py-0.5 font-bold">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Rest of posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(page === 1 ? 1 : 0).map((post, idx) => (
              <Link to={`/blog/${post.slug}`} key={idx} className="group" data-testid={`blog-card-${idx}`}>
                <div className="brutalist-card border border-zinc-200 h-full flex flex-col">
                  {post.cover_image && (
                    <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-zinc-500">{formatDate(post.created_at)}</span>
                      <span className="text-xs text-zinc-300">|</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock size={12} /> {post.read_time} min
                      </span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-[#002FA7] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-600 mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <Link to={`/blog?tag=${encodeURIComponent(tag)}`} key={i} onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-zinc-100 px-2 py-0.5 font-bold hover:bg-[#002FA7] hover:text-white transition-colors">
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
};
