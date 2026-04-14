import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { BookmarkSimple, MapPin, Star, Trash } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Bookmarks = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await axios.get(`${API}/bookmarks`, { withCredentials: true });
      setColleges(data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (collegeId) => {
    try {
      await axios.post(`${API}/bookmarks/${collegeId}`, {}, { withCredentials: true });
      setColleges(colleges.filter(c => c.id !== collegeId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <div className="flex items-center gap-3 mb-8">
            <BookmarkSimple size={32} weight="fill" className="text-[#002FA7]" />
            <h1 className="text-4xl font-bold tracking-tight" data-testid="bookmarks-heading">Saved Colleges</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-600">Loading saved colleges...</div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-16 border border-zinc-200 bg-zinc-50" data-testid="empty-bookmarks">
              <BookmarkSimple size={64} weight="thin" className="mx-auto text-zinc-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No saved colleges</h2>
              <p className="text-zinc-500 mb-6">Bookmark colleges while browsing to save them here</p>
              <Link to="/colleges">
                <button className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none" data-testid="browse-colleges-button">
                  Browse Colleges
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college, idx) => (
                <div key={idx} data-testid={`bookmark-card-${idx}`} className="brutalist-card bg-white border border-zinc-200 rounded-none p-6 h-full relative">
                  <button
                    onClick={() => removeBookmark(college.id)}
                    data-testid={`remove-bookmark-${idx}`}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                  <Link to={`/colleges/${college.id}`}>
                    {college.image && (
                      <img src={college.image} alt={college.name} className="w-full h-40 object-cover mb-4 border border-zinc-200" />
                    )}
                    <div className="flex items-start justify-between mb-3 pr-10">
                      <h3 className="text-lg font-bold tracking-tight flex-1">{college.name}</h3>
                      <div className="flex items-center gap-1 text-[#002FA7]">
                        <Star size={14} weight="fill" />
                        <span className="text-sm font-bold">{college.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 mb-3">
                      <MapPin size={14} weight="bold" />
                      <span className="text-sm">{college.city}, {college.state}</span>
                    </div>
                    {college.fees && (
                      <div className="text-sm font-bold text-[#002FA7]">{college.fees}</div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
