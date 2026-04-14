import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ChartBar, Eye, MagnifyingGlass, Users, GraduationCap, Article, Star } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API}/analytics/dashboard`, { withCredentials: true });
      setData(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading || !data) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white"><Header />
          <div className="px-6 md:px-12 lg:px-24 py-12 text-center">Loading analytics...</div>
        </div>
      </ProtectedRoute>
    );
  }

  const maxDaily = Math.max(...(data.daily_views.map(d => d.views) || [1]), 1);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center gap-3 mb-8">
            <ChartBar size={32} weight="bold" className="text-[#002FA7]" />
            <h1 className="text-3xl font-bold tracking-tight" data-testid="analytics-heading">Analytics Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-zinc-200 p-6" data-testid="stat-total-views">
              <div className="flex items-center gap-2 mb-2 text-[#002FA7]"><Eye size={20} weight="bold" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Total Views</span></div>
              <div className="text-3xl font-bold">{data.views.total.toLocaleString()}</div>
            </div>
            <div className="border border-zinc-200 p-6" data-testid="stat-today-views">
              <div className="flex items-center gap-2 mb-2 text-[#002FA7]"><Eye size={20} weight="bold" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Today</span></div>
              <div className="text-3xl font-bold">{data.views.today.toLocaleString()}</div>
            </div>
            <div className="border border-zinc-200 p-6" data-testid="stat-week-views">
              <div className="flex items-center gap-2 mb-2 text-[#002FA7]"><Eye size={20} weight="bold" /><span className="text-xs font-bold uppercase tracking-[0.2em]">This Week</span></div>
              <div className="text-3xl font-bold">{data.views.this_week.toLocaleString()}</div>
            </div>
            <div className="border border-zinc-200 p-6" data-testid="stat-users">
              <div className="flex items-center gap-2 mb-2 text-[#002FA7]"><Users size={20} weight="bold" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Users</span></div>
              <div className="text-3xl font-bold">{data.platform.users.toLocaleString()}</div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-50 border border-zinc-200 p-4 text-center">
              <GraduationCap size={24} weight="bold" className="mx-auto text-[#002FA7] mb-1" />
              <div className="text-xl font-bold">{data.platform.colleges}</div>
              <div className="text-xs text-zinc-500">Colleges</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-4 text-center">
              <Users size={24} weight="bold" className="mx-auto text-[#002FA7] mb-1" />
              <div className="text-xl font-bold">{data.platform.users}</div>
              <div className="text-xs text-zinc-500">Users</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-4 text-center">
              <Article size={24} weight="bold" className="mx-auto text-[#002FA7] mb-1" />
              <div className="text-xl font-bold">{data.platform.posts}</div>
              <div className="text-xs text-zinc-500">Posts</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-4 text-center">
              <Star size={24} weight="bold" className="mx-auto text-[#002FA7] mb-1" />
              <div className="text-xl font-bold">{data.platform.reviews}</div>
              <div className="text-xs text-zinc-500">Reviews</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Views Chart */}
            <div className="border border-zinc-200 p-6" data-testid="daily-views-chart">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-zinc-600">Daily Views (Last 7 Days)</h2>
              {data.daily_views.length === 0 ? (
                <p className="text-zinc-400 text-sm py-8 text-center">No data yet. Views will appear as users browse the site.</p>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {data.daily_views.map((d, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-zinc-600">{d.views}</span>
                      <div className="w-full bg-[#002FA7] transition-all" style={{ height: `${(d.views / maxDaily) * 120}px`, minHeight: '4px' }}></div>
                      <span className="text-[10px] text-zinc-400">{d.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Pages */}
            <div className="border border-zinc-200 p-6" data-testid="top-pages">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-zinc-600">Top Pages</h2>
              {data.top_pages.length === 0 ? (
                <p className="text-zinc-400 text-sm py-4 text-center">No page view data yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_pages.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                      <span className="text-sm font-mono truncate flex-1">{p.page}</span>
                      <span className="text-sm font-bold text-[#002FA7] ml-4">{p.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Colleges */}
            <div className="border border-zinc-200 p-6" data-testid="popular-colleges">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-zinc-600">Popular Colleges</h2>
              {data.popular_colleges.length === 0 ? (
                <p className="text-zinc-400 text-sm py-4 text-center">No college view data yet. Views are tracked when users visit college detail pages.</p>
              ) : (
                <div className="space-y-2">
                  {data.popular_colleges.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                      <div>
                        <span className="text-sm font-bold">{c.name}</span>
                        <span className="text-xs text-zinc-500 ml-2">{c.city}, {c.state}</span>
                      </div>
                      <span className="text-sm font-bold text-[#002FA7]">{c.views} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Trends */}
            <div className="border border-zinc-200 p-6" data-testid="search-trends">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-zinc-600">Search Trends</h2>
              {data.search_trends.length === 0 ? (
                <p className="text-zinc-400 text-sm py-4 text-center">No search data yet. Searches are tracked when users search for colleges.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.search_trends.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-2">
                      <MagnifyingGlass size={14} weight="bold" className="text-zinc-400" />
                      <span className="text-sm">{s.query}</span>
                      <span className="text-xs font-bold text-[#002FA7] bg-blue-50 px-2 py-0.5">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
