import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { Plus, Trash, PencilSimple, Eye, EyeSlash, FloppyDisk, UploadSimple } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API}/blog-admin`, { withCredentials: true });
      setPosts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const emptyPost = { title: '', slug: '', content: '', excerpt: '', cover_image: '', tags: [], published: false };

  const handleCreate = () => { setEditing({ ...emptyPost, _new: true }); setCreating(true); };

  const handleEdit = async (slug) => {
    try {
      const { data } = await axios.get(`${API}/blog/${slug}`);
      setEditing({ ...data, tags_str: data.tags.join(', ') });
      setCreating(false);
    } catch (e) { alert('Failed to load post'); }
  };

  const handleSave = async () => {
    if (!editing) return;
    const body = {
      title: editing.title,
      slug: editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: editing.content,
      excerpt: editing.excerpt,
      cover_image: editing.cover_image || null,
      tags: (editing.tags_str || editing.tags?.join(', ') || '').split(',').map(t => t.trim()).filter(t => t),
      published: editing.published
    };
    try {
      if (creating) {
        await axios.post(`${API}/blog`, body, { withCredentials: true });
      } else {
        await axios.put(`${API}/blog/${editing.id}`, body, { withCredentials: true });
      }
      setEditing(null);
      setCreating(false);
      fetchPosts();
    } catch (e) { alert('Save failed: ' + (e.response?.data?.detail || e.message)); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await axios.delete(`${API}/blog/${id}`, { withCredentials: true });
      fetchPosts();
    } catch (e) { alert('Delete failed'); }
  };

  const uploadCoverImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        const { data } = await axios.post(`${API}/upload`, form, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
        setEditing(prev => ({ ...prev, cover_image: `${BACKEND_URL}${data.url}` }));
      } catch (err) { alert('Upload failed'); }
      finally { setUploading(false); }
    };
    input.click();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const InputField = ({ label, value, onChange, placeholder }) => (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 text-zinc-600">{label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="admin-blog-heading">Manage Blog Posts</h1>
            <button onClick={handleCreate} data-testid="new-blog-btn"
              className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors flex items-center gap-2">
              <Plus size={20} weight="bold" /> New Post
            </button>
          </div>

          {/* Editor Modal */}
          {editing && (
            <div className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center p-4 pt-8 overflow-y-auto" data-testid="blog-editor-modal">
              <div className="bg-white border border-zinc-200 w-full max-w-4xl p-8 mb-8">
                <h2 className="text-xl font-bold mb-6">{creating ? 'Create New Post' : 'Edit Post'}</h2>

                <InputField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Article title" />
                <InputField label="URL Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} placeholder="auto-generated-from-title" />
                <InputField label="Excerpt (short summary)" value={editing.excerpt} onChange={(v) => setEditing({ ...editing, excerpt: v })} placeholder="Brief description for cards" />

                {/* Cover Image */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2 text-zinc-600">Cover Image</label>
                  <div className="flex gap-3">
                    <input type="text" value={editing.cover_image || ''} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
                      placeholder="Image URL" className="flex-1 bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    <button type="button" onClick={uploadCoverImage} disabled={uploading}
                      className="px-4 py-3 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 flex items-center gap-2 text-sm font-bold disabled:opacity-50">
                      <UploadSimple size={16} weight="bold" /> {uploading ? '...' : 'Upload'}
                    </button>
                  </div>
                  {editing.cover_image && <img src={editing.cover_image} alt="Cover" className="mt-2 h-32 w-auto border border-zinc-200" />}
                </div>

                <InputField label="Tags (comma separated)" value={editing.tags_str || editing.tags?.join(', ')} onChange={(v) => setEditing({ ...editing, tags_str: v })} placeholder="JEE, Strategy, IIT" />

                <MarkdownEditor label="Content (Markdown)" value={editing.content} onChange={(v) => setEditing({ ...editing, content: v })} rows={16} />

                <div className="flex items-center gap-3 mb-6">
                  <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                    className="w-4 h-4 accent-[#002FA7]" data-testid="publish-checkbox" />
                  <span className="text-sm font-bold">{editing.published ? 'Published (visible on blog)' : 'Draft (not visible)'}</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSave} data-testid="save-blog-btn"
                    className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors flex items-center gap-2">
                    <FloppyDisk size={16} weight="bold" /> {creating ? 'Create Post' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setEditing(null); setCreating(false); }}
                    className="px-6 py-3 border border-zinc-300 font-bold hover:bg-zinc-100 transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          {loading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : posts.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200 bg-zinc-50">
              <p className="text-zinc-500 mb-4">No blog posts yet.</p>
              <button onClick={handleCreate} className="px-6 py-3 bg-[#002FA7] text-white font-bold">Create First Post</button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors" data-testid={`blog-row-${idx}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold">{p.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 ${p.published ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{formatDate(p.created_at)}</span>
                      <span>/{p.slug}</span>
                      {p.tags.length > 0 && <span>{p.tags.join(', ')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {p.published && (
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 border border-zinc-200 hover:bg-zinc-100" title="View">
                        <Eye size={14} weight="bold" />
                      </a>
                    )}
                    <button onClick={() => handleEdit(p.slug)} data-testid={`edit-blog-${idx}`}
                      className="p-2 border border-zinc-200 hover:bg-zinc-100" title="Edit">
                      <PencilSimple size={14} weight="bold" />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.title)} data-testid={`delete-blog-${idx}`}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50" title="Delete">
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
