import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Tag, ArrowLeft, ShareNetwork, XLogo, LinkedinLogo, WhatsappLogo, Link as LinkIcon, Bell, Check } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const BlogPost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => { fetchPost(); }, [slug]);
  useEffect(() => { if (user) checkNewsletter(); }, [user]);

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`${API}/blog/${slug}`);
      setPost(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const shareLinks = post ? [
    { label: 'Twitter / X', icon: XLogo, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}`, color: '#000' },
    { label: 'LinkedIn', icon: LinkedinLogo, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, color: '#0A66C2' },
    { label: 'WhatsApp', icon: WhatsappLogo, url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + pageUrl)}`, color: '#25D366' },
  ] : [];

  const copyLink = () => {
    navigator.clipboard?.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkNewsletter = async () => {
    try {
      const { data } = await axios.get(`${API}/newsletter/status`, { withCredentials: true });
      setSubscribed(data.subscribed);
    } catch (e) {}
  };

  const toggleNewsletter = async () => {
    if (!user) return;
    setSubscribing(true);
    try {
      if (subscribed) {
        await axios.post(`${API}/newsletter/unsubscribe`, {}, { withCredentials: true });
        setSubscribed(false);
      } else {
        await axios.post(`${API}/newsletter/subscribe`, {}, { withCredentials: true });
        setSubscribed(true);
      }
    } catch (e) { console.error(e); }
    finally { setSubscribing(false); }
  };

  if (loading) return <div className="min-h-screen bg-white"><Header /><div className="px-6 md:px-12 lg:px-24 py-12 text-center">Loading...</div></div>;
  if (!post) return <div className="min-h-screen bg-white"><Header /><div className="px-6 md:px-12 lg:px-24 py-12 text-center">Article not found</div></div>;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": { "@type": "Person", "name": post.author_name },
    "datePublished": post.created_at,
    "image": post.cover_image || ""
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        jsonLd={articleJsonLd}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }, { name: post.title }]}
      />
      <Header />

      {/* Cover Image */}
      {post.cover_image && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <article className="px-6 md:px-12 lg:px-24 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link to="/blog" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-[#002FA7] transition-colors mb-8" data-testid="back-to-blog">
            <ArrowLeft size={16} weight="bold" />
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              {post.tags.map((tag, i) => (
                <Link to={`/blog?tag=${encodeURIComponent(tag)}`} key={i}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#002FA7] hover:underline">
                  {tag}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4" data-testid="blog-post-title">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>By <strong className="text-zinc-800">{post.author_name}</strong></span>
              <span>{formatDate(post.created_at)}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {post.read_time} min read</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#002FA7] prose-strong:text-zinc-900 prose-blockquote:border-l-[#002FA7] prose-blockquote:bg-zinc-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-code:bg-zinc-100 prose-code:px-1 prose-code:rounded prose-table:border-collapse prose-td:border prose-td:border-zinc-200 prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-zinc-200 prose-th:px-3 prose-th:py-2 prose-th:bg-zinc-100"
            data-testid="blog-post-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Share & Newsletter */}
          <div className="mt-12 pt-8 border-t border-zinc-200">
            {/* Social Sharing */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ShareNetwork size={18} weight="bold" className="text-zinc-500" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Share this article</span>
              </div>
              <div className="flex gap-3">
                {shareLinks.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`share-${s.label.toLowerCase().replace(/\s|\//g, '-')}`}
                      className="w-11 h-11 flex items-center justify-center border border-zinc-200 hover:border-zinc-400 transition-colors"
                      title={`Share on ${s.label}`}>
                      <Icon size={20} weight="bold" style={{ color: s.color }} />
                    </a>
                  );
                })}
                <button onClick={copyLink} data-testid="share-copy-link"
                  className={`h-11 px-4 flex items-center gap-2 border text-sm font-bold transition-colors ${copied ? 'border-green-300 bg-green-50 text-green-700' : 'border-zinc-200 hover:border-zinc-400'}`}>
                  {copied ? <><Check size={16} weight="bold" /> Copied!</> : <><LinkIcon size={16} weight="bold" /> Copy Link</>}
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} weight="bold" className="text-zinc-400" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <Link to={`/blog?tag=${encodeURIComponent(tag)}`} key={i}
                    className="text-sm bg-zinc-100 px-3 py-1 font-bold hover:bg-[#002FA7] hover:text-white transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="mt-8 bg-[#09090B] text-white p-8">
            {user ? (
              <div className="text-center">
                <Bell size={32} weight="bold" className="mx-auto text-[#002FA7] mb-3" />
                <h3 className="text-2xl font-bold mb-2">
                  {subscribed ? 'You\'re subscribed!' : 'Get insights in your inbox'}
                </h3>
                <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                  {subscribed ? 'You\'ll receive our latest articles and JEE updates via email.' : 'Subscribe to our newsletter for expert JEE preparation tips, college insights, and career advice.'}
                </p>
                <button onClick={toggleNewsletter} disabled={subscribing} data-testid="newsletter-toggle-btn"
                  className={`px-8 py-3 font-bold transition-colors ${subscribed ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-[#002FA7] text-white hover:bg-blue-800'}`}>
                  {subscribing ? '...' : subscribed ? 'Unsubscribe' : 'Subscribe to Newsletter'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Bell size={32} weight="bold" className="mx-auto text-[#002FA7] mb-3" />
                <h3 className="text-2xl font-bold mb-2">Get insights in your inbox</h3>
                <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                  Sign in to subscribe to our newsletter for expert JEE preparation tips, college insights, and career advice.
                </p>
                <Link to="/login">
                  <button className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-blue-800 transition-colors" data-testid="newsletter-signin-btn">
                    Sign In to Subscribe
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-6 bg-zinc-50 border border-zinc-200 p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to find your dream college?</h3>
            <p className="text-zinc-500 mb-6">Explore 200+ engineering colleges and predict your JEE rank.</p>
            <div className="flex justify-center gap-4">
              <Link to="/colleges"><button className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors">Explore Colleges</button></Link>
              <Link to="/predictor"><button className="px-6 py-3 border border-zinc-300 font-bold hover:bg-zinc-100 transition-colors">JEE Predictor</button></Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
