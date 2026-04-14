import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { ArrowFatUp, ArrowFatDown, ChatCircle } from '@phosphor-icons/react';
import axios from 'axios';
import { formatApiErrorDetail } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const [votedPosts, setVotedPosts] = useState({});
  const [votedReplies, setVotedReplies] = useState({});

  useEffect(() => {
    fetchPost();
    fetchReplies();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await axios.get(`${API}/community/posts/${id}`);
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data } = await axios.get(`${API}/community/posts/${id}/replies`);
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleVotePost = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post(
        `${API}/community/posts/${id}/vote`,
        { vote_type: voteType },
        { withCredentials: true }
      );
      setPost({ ...post, upvotes: data.upvotes, downvotes: data.downvotes });
      setVotedPosts({ ...votedPosts, [id]: voteType });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleVoteReply = async (replyId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post(
        `${API}/community/replies/${replyId}/vote`,
        { vote_type: 'upvote' },
        { withCredentials: true }
      );
      setReplies(replies.map(r => r.id === replyId ? { ...r, upvotes: data.upvotes } : r));
      setVotedReplies({ ...votedReplies, [replyId]: true });
    } catch (error) {
      console.error('Error voting reply:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');

    try {
      await axios.post(
        `${API}/community/posts/${id}/replies`,
        { content: replyContent },
        { withCredentials: true }
      );
      setReplyContent('');
      fetchReplies();
    } catch (error) {
      setError(formatApiErrorDetail(error.response?.data?.detail) || error.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post */}
          <div className="bg-white border border-zinc-200 p-8 mb-8" data-testid="post-detail">
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleVotePost('upvote')}
                  data-testid="post-upvote-button"
                  className={`p-2 hover:bg-zinc-100 transition-colors ${
                    votedPosts[id] === 'upvote' ? 'text-[#002FA7]' : 'text-zinc-400'
                  }`}
                >
                  <ArrowFatUp size={24} weight="fill" />
                </button>
                <span className="text-lg font-bold" data-testid="post-vote-count">{post.upvotes - post.downvotes}</span>
                <button
                  onClick={() => handleVotePost('downvote')}
                  data-testid="post-downvote-button"
                  className={`p-2 hover:bg-zinc-100 transition-colors ${
                    votedPosts[id] === 'downvote' ? 'text-[#002FA7]' : 'text-zinc-400'
                  }`}
                >
                  <ArrowFatDown size={24} weight="fill" />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#002FA7]" data-testid="post-category">
                    {post.category}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-4" data-testid="post-title">{post.title}</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                  <span>by {post.author_name}</span>
                  <span>•</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <p className="text-base leading-relaxed text-zinc-700 whitespace-pre-wrap" data-testid="post-content">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          {user ? (
            <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Add a Reply</h3>
              {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-4 text-sm" data-testid="reply-error">{error}</div>}
              <form onSubmit={handleSubmitReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  data-testid="reply-textarea"
                  required
                  rows={4}
                  className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] mb-4"
                  placeholder="Share your thoughts..."
                />
                <button type="submit" data-testid="submit-reply-button" className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none">
                  Post Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8 text-center">
              <p>Please <button onClick={() => navigate('/login')} className="text-[#002FA7] font-bold hover:underline">login</button> to reply</p>
            </div>
          )}

          {/* Replies */}
          <div>
            <h3 className="text-2xl font-bold mb-6">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h3>
            {replies.length === 0 ? (
              <p className="text-zinc-600" data-testid="no-replies-message">No replies yet. Be the first to respond!</p>
            ) : (
              <div className="space-y-4">
                {replies.map((reply, idx) => (
                  <div key={idx} className="bg-white border border-zinc-200 p-6 flex gap-4" data-testid={`reply-${idx}`}>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleVoteReply(reply.id)}
                        data-testid={`reply-${idx}-upvote-button`}
                        className={`p-1 hover:bg-zinc-100 transition-colors ${
                          votedReplies[reply.id] ? 'text-[#002FA7]' : 'text-zinc-400'
                        }`}
                      >
                        <ArrowFatUp size={20} weight="fill" />
                      </button>
                      <span className="text-sm font-bold" data-testid={`reply-${idx}-upvotes`}>{reply.upvotes}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                        <span className="font-bold text-zinc-900">{reply.author_name}</span>
                        <span>•</span>
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-base leading-relaxed text-zinc-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};