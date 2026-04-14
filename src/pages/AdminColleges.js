import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Pagination } from '../components/Pagination';
import { PencilSimple, Trash, MagnifyingGlass, MapPin, Star } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchColleges(); }, [page]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      const { data } = await axios.get(`${API}/admin/colleges`, { params, withCredentials: true });
      setColleges(data.colleges);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchColleges(); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/colleges/${id}`, { withCredentials: true });
      fetchColleges();
    } catch (e) { alert('Delete failed: ' + (e.response?.data?.detail || e.message)); }
  };

  const startEdit = (college) => {
    setEditing({ ...college, courses_str: college.courses.join(', ') });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const body = {
        name: editing.name, state: editing.state, city: editing.city,
        courses: editing.courses_str.split(',').map(c => c.trim()).filter(c => c),
        fees: editing.fees || null, admission_stats: editing.admission_stats || null,
        website: editing.website || null, description: editing.description || null,
        image: editing.image || null, rating: editing.rating || 0, reviews_count: editing.reviews_count || 0,
        gallery: editing.gallery || null
      };
      await axios.put(`${API}/colleges/${editing.id}`, body, { withCredentials: true });
      setEditing(null);
      fetchColleges();
    } catch (e) { alert('Save failed: ' + (e.response?.data?.detail || e.message)); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6" data-testid="manage-colleges-heading">Manage Colleges ({total})</h1>

          {/* Search */}
          <div className="flex gap-0 border border-zinc-200 max-w-lg mb-6">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search colleges..." className="flex-1 px-4 py-3 text-sm focus:outline-none" data-testid="admin-college-search" />
            <button onClick={handleSearch} className="px-4 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors" data-testid="admin-college-search-btn">
              <MagnifyingGlass size={16} weight="bold" />
            </button>
          </div>

          {/* Edit Modal */}
          {editing && (
            <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" data-testid="edit-modal">
              <div className="bg-white border border-zinc-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
                <h2 className="text-xl font-bold mb-4">Edit College</h2>
                <div className="space-y-4">
                  {[['Name', 'name'], ['State', 'state'], ['City', 'city'], ['Courses (comma separated)', 'courses_str'],
                    ['Fees', 'fees'], ['Admission Stats', 'admission_stats'], ['Website', 'website'], ['Image URL', 'image']
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1">{label}</label>
                      <input type="text" value={editing[key] || ''} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                        className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1">Description</label>
                    <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4}
                      className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1">Rating</label>
                      <input type="number" step="0.1" min="0" max="5" value={editing.rating || 0} onChange={(e) => setEditing({ ...editing, rating: parseFloat(e.target.value) })}
                        className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1">Reviews Count</label>
                      <input type="number" value={editing.reviews_count || 0} onChange={(e) => setEditing({ ...editing, reviews_count: parseInt(e.target.value) })}
                        className="w-full border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveEdit} data-testid="save-edit-btn" className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors">Save Changes</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-3 border border-zinc-300 font-bold hover:bg-zinc-100 transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm" data-testid="colleges-table">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">College</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Location</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Rating</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Fees</th>
                    <th className="text-right p-3 font-bold text-xs uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((c, idx) => (
                    <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`college-row-${idx}`}>
                      <td className="p-3 font-bold">{c.name}</td>
                      <td className="p-3 text-zinc-600 flex items-center gap-1"><MapPin size={14} />{c.city}, {c.state}</td>
                      <td className="p-3"><span className="flex items-center gap-1"><Star size={14} weight="fill" className="text-[#002FA7]" />{c.rating}</span></td>
                      <td className="p-3 text-zinc-600">{c.fees || '—'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(c)} data-testid={`edit-college-${idx}`}
                            className="p-2 border border-zinc-200 hover:bg-zinc-100 transition-colors" title="Edit">
                            <PencilSimple size={14} weight="bold" />
                          </button>
                          <button onClick={() => handleDelete(c.id, c.name)} data-testid={`delete-college-${idx}`}
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
