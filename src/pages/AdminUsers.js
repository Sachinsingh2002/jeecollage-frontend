import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Pagination } from '../components/Pagination';
import { MagnifyingGlass, Trash, Phone, Envelope, User, CalendarBlank, GoogleLogo } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      const { data } = await axios.get(`${API}/admin/users`, { params, withCredentials: true });
      setUsers(data.users);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchUsers(); };

  const handleDelete = async (id, name, role) => {
    if (role === 'admin') { alert('Cannot delete admin users from here'); return; }
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (e) { alert('Delete failed: ' + (e.response?.data?.detail || e.message)); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6" data-testid="admin-users-heading">Manage Users ({total})</h1>

          {/* Search */}
          <div className="flex gap-0 border border-zinc-200 max-w-lg mb-6">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, email, or phone..." className="flex-1 px-4 py-3 text-sm focus:outline-none" data-testid="admin-users-search" />
            <button onClick={handleSearch} className="px-4 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors" data-testid="admin-users-search-btn">
              <MagnifyingGlass size={16} weight="bold" />
            </button>
          </div>

          {/* Table */}
          {loading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm" data-testid="users-table">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">User</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Phone</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Role</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Auth</th>
                    <th className="text-left p-3 font-bold text-xs uppercase tracking-[0.2em]">Joined</th>
                    <th className="text-right p-3 font-bold text-xs uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`user-row-${idx}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-200 flex items-center justify-center"><User size={16} weight="bold" className="text-zinc-500" /></div>
                          )}
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-xs text-zinc-500 flex items-center gap-1"><Envelope size={12} />{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {u.phone ? (
                          <span className="flex items-center gap-1 text-zinc-700"><Phone size={14} weight="bold" className="text-green-600" />{u.phone}</span>
                        ) : (
                          <span className="text-zinc-300">No phone</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-bold px-2 py-1 ${u.role === 'admin' ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-bold px-2 py-1 flex items-center gap-1 w-fit ${u.auth_provider === 'google' ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>
                          {u.auth_provider === 'google' ? <><GoogleLogo size={12} weight="bold" /> Google</> : 'Email'}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500 text-xs flex items-center gap-1"><CalendarBlank size={12} />{formatDate(u.created_at)}</td>
                      <td className="p-3 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u.id, u.name, u.role)} data-testid={`delete-user-${idx}`}
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors" title="Delete User">
                            <Trash size={14} weight="bold" />
                          </button>
                        )}
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
