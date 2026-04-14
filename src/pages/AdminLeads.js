import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Pagination } from '../components/Pagination';
import { Phone, Envelope, Trash, Check, Clock, MagnifyingGlass, Export, NotePencil, User, GraduationCap } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STATUS_MAP = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'New' },
  contacted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Contacted' },
  converted: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Converted' },
  closed: { bg: 'bg-zinc-100', text: 'text-zinc-500', border: 'border-zinc-200', label: 'Closed' },
};

export const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => { fetchLeads(); fetchStats(); }, [page, filterStatus, filterSource]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterSource !== 'all') params.source = filterSource;
      const { data } = await axios.get(`${API}/admin/leads`, { params, withCredentials: true });
      setLeads(data.leads);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/leads/stats`, { withCredentials: true });
      setStats(data);
    } catch (e) {}
  };

  const updateLead = async (id, updates) => {
    try {
      await axios.put(`${API}/admin/leads/${id}`, updates, { withCredentials: true });
      fetchLeads();
      fetchStats();
    } catch (e) { alert('Update failed'); }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`${API}/admin/leads/${id}`, { withCredentials: true });
      fetchLeads();
      fetchStats();
    } catch (e) { alert('Delete failed'); }
  };

  const saveNotes = (id) => {
    updateLead(id, { notes: noteText });
    setEditingNotes(null);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Source', 'Status', 'Date'];
    const rows = leads.map(l => [l.name, l.email, l.phone, l.course_interested, l.source, l.status, new Date(l.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="admin-leads-heading">Lead Management</h1>
            <button onClick={exportCSV} data-testid="export-leads"
              className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 flex items-center gap-2 text-sm font-bold">
              <Export size={16} weight="bold" /> Export CSV
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="border border-zinc-200 p-5" data-testid="leads-total">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Total Leads</div>
              </div>
              <div className="border border-blue-200 bg-blue-50 p-5" data-testid="leads-new">
                <div className="text-2xl font-bold text-blue-700">{stats.new}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">New (Action Needed)</div>
              </div>
              <div className="border border-green-200 bg-green-50 p-5" data-testid="leads-contacted">
                <div className="text-2xl font-bold text-green-700">{stats.contacted}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">Contacted</div>
              </div>
              <div className="border border-zinc-200 p-5">
                <div className="text-sm font-bold mb-1">Top Courses</div>
                {stats.by_course.slice(0, 3).map((c, i) => (
                  <div key={i} className="text-xs text-zinc-500">{c.course}: <strong>{c.count}</strong></div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-1">
              {['all', 'new', 'contacted', 'converted', 'closed'].map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} data-testid={`lead-filter-${s}`}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${filterStatus === s ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {['all', 'homepage', 'counseling'].map(s => (
                <button key={s} onClick={() => { setFilterSource(s); setPage(1); }} data-testid={`lead-source-${s}`}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${filterSource === s ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                  {s === 'all' ? 'All Sources' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Table */}
          {loading ? <div className="text-center py-8 text-zinc-500">Loading...</div> : leads.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200 bg-zinc-50"><p className="text-zinc-400">No leads found</p></div>
          ) : (
            <>
            <div className="space-y-3">
              {leads.map((lead, idx) => {
                const st = STATUS_MAP[lead.status] || STATUS_MAP.new;
                return (
                  <div key={idx} className="border border-zinc-200 p-5" data-testid={`lead-row-${idx}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <User size={18} weight="bold" className="text-[#002FA7]" />
                            {lead.name}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-0.5 border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                          <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 font-bold">{lead.source}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-2">
                          <span className="flex items-center gap-1"><Envelope size={14} />{lead.email}</span>
                          <span className="flex items-center gap-1"><Phone size={14} weight="bold" />{lead.phone}</span>
                          <span className="flex items-center gap-1"><GraduationCap size={14} />{lead.course_interested}</span>
                          <span className="flex items-center gap-1"><Clock size={14} />{formatDate(lead.created_at)}</span>
                        </div>
                        {lead.notes && !editingNotes?.includes(lead.id) && (
                          <div className="text-sm bg-zinc-50 border border-zinc-200 px-3 py-2 mt-2 text-zinc-600">
                            <strong>Notes:</strong> {lead.notes}
                          </div>
                        )}
                        {editingNotes === lead.id && (
                          <div className="flex gap-2 mt-2">
                            <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add notes..."
                              className="flex-1 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                            <button onClick={() => saveNotes(lead.id)} className="px-3 py-2 bg-[#002FA7] text-white text-sm font-bold">Save</button>
                            <button onClick={() => setEditingNotes(null)} className="px-3 py-2 border border-zinc-200 text-sm">Cancel</button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => { setEditingNotes(lead.id); setNoteText(lead.notes || ''); }} title="Add Notes"
                          className="p-2 border border-zinc-200 hover:bg-zinc-100"><NotePencil size={14} weight="bold" /></button>
                        <button onClick={() => deleteLead(lead.id)} title="Delete" data-testid={`delete-lead-${idx}`}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-50"><Trash size={14} weight="bold" /></button>
                      </div>
                    </div>
                    {/* Status Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-400 self-center mr-1">Status:</span>
                      {['new', 'contacted', 'converted', 'closed'].map(s => (
                        <button key={s} onClick={() => updateLead(lead.id, { status: s })}
                          className={`px-3 py-1 text-xs font-bold transition-colors ${lead.status === s ? 'bg-[#002FA7] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
