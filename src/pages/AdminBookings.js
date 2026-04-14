import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Phone, Envelope, CurrencyInr, Check, Clock, X as XIcon, ArrowsClockwise } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
  contacted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Phone, label: 'Contacted' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: Check, label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XIcon, label: 'Cancelled' },
};

const PAYMENT_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  initiated: { bg: 'bg-amber-50', text: 'text-amber-700' },
  paid: { bg: 'bg-green-50', text: 'text-green-700' },
  failed: { bg: 'bg-red-50', text: 'text-red-700' },
};

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/counseling/bookings`, { withCredentials: true });
      setBookings(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/counseling/bookings/${id}/status`, { status: newStatus }, { withCredentials: true });
      fetchBookings();
    } catch (e) { alert('Update failed'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter || b.payment_status === filter);

  const stats = {
    total: bookings.length,
    paid: bookings.filter(b => b.payment_status === 'paid').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0),
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="admin-bookings-heading">Counseling Bookings</h1>
            <button onClick={fetchBookings} className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 flex items-center gap-2 text-sm font-bold" data-testid="refresh-bookings">
              <ArrowsClockwise size={16} weight="bold" /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-zinc-200 p-5" data-testid="bookings-total">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Total Bookings</div>
            </div>
            <div className="border border-green-200 bg-green-50 p-5" data-testid="bookings-paid">
              <div className="text-2xl font-bold text-green-700">{stats.paid}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Paid</div>
            </div>
            <div className="border border-amber-200 bg-amber-50 p-5" data-testid="bookings-pending">
              <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Pending Action</div>
            </div>
            <div className="border border-[#002FA7] p-5" data-testid="bookings-revenue">
              <div className="text-2xl font-bold text-[#002FA7] flex items-center gap-1"><CurrencyInr size={20} />{stats.revenue.toLocaleString()}</div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Revenue</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending', 'contacted', 'completed', 'paid'].map(f => (
              <button key={f} onClick={() => setFilter(f)} data-testid={`filter-${f}`}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${filter === f ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${stats.total})` : ''}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200 bg-zinc-50"><p className="text-zinc-400">No bookings found</p></div>
          ) : (
            <div className="space-y-4">
              {filtered.map((b, idx) => {
                const st = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                const Icon = st.icon;
                const ps = PAYMENT_STYLES[b.payment_status] || PAYMENT_STYLES.pending;
                return (
                  <div key={idx} className="border border-zinc-200 p-6" data-testid={`booking-${idx}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold">{b.name}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 border ${st.bg} ${st.text} ${st.border} flex items-center gap-1`}>
                            <Icon size={12} weight="bold" /> {st.label}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 ${ps.bg} ${ps.text}`}>
                            Payment: {b.payment_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1"><Envelope size={14} />{b.email}</span>
                          <span className="flex items-center gap-1"><Phone size={14} />{b.phone}</span>
                          <span>{formatDate(b.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{b.plan_name || b.plan}</div>
                        <div className="text-xl font-bold text-[#002FA7]">Rs {(b.amount || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                      {b.jee_rank && <div><span className="text-zinc-500">JEE Rank:</span> <strong>{b.jee_rank}</strong></div>}
                      {b.preferred_branches && <div><span className="text-zinc-500">Branches:</span> <strong>{b.preferred_branches}</strong></div>}
                      {b.message && <div><span className="text-zinc-500">Message:</span> {b.message}</div>}
                    </div>

                    {/* Status Actions */}
                    <div className="flex gap-2 pt-3 border-t border-zinc-100">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mr-2 self-center">Update:</span>
                      {['pending', 'contacted', 'completed', 'cancelled'].map(s => (
                        <button key={s} onClick={() => updateStatus(b.id, s)} data-testid={`status-${s}-${idx}`}
                          className={`px-3 py-1 text-xs font-bold transition-colors ${b.status === s ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
