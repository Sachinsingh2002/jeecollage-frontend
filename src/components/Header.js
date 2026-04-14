import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignOut, Scales, User, List, X, BookmarkSimple, GraduationCap, Bell, PencilSimple } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications/unread-count`, { withCredentials: true });
      setUnreadCount(data.count);
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`, { withCredentials: true });
      setNotifications(data);
    } catch (e) {}
  };

  const toggleNotifs = async () => {
    if (!showNotifs) {
      await fetchNotifications();
      await axios.post(`${API}/notifications/mark-read`, {}, { withCredentials: true });
      setUnreadCount(0);
    }
    setShowNotifs(!showNotifs);
  };

  const formatDate = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const NavLinks = ({ mobile }) => (
    <>
      <Link to="/colleges" data-testid="nav-colleges" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
        Colleges
      </Link>
      <Link to="/compare" data-testid="nav-compare" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors flex items-center gap-1 ${mobile ? 'py-3 border-b border-zinc-100' : ''}`}>
        <Scales size={16} weight="bold" />
        Compare
      </Link>
      <Link to="/community" data-testid="nav-community" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
        Community
      </Link>
      <Link to="/blog" data-testid="nav-blog" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
        Blog
      </Link>
      <Link to="/counseling" data-testid="nav-counseling" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
        Counseling
      </Link>
      <Link to="/predictor" data-testid="nav-predictor" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors flex items-center gap-1 ${mobile ? 'py-3 border-b border-zinc-100' : ''}`}>
        <GraduationCap size={16} weight="bold" />
        Predictor
      </Link>

      {user ? (
        <>
          <Link to="/bookmarks" data-testid="nav-bookmarks" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors flex items-center gap-1 ${mobile ? 'py-3 border-b border-zinc-100' : ''}`}>
            <BookmarkSimple size={16} weight="bold" />
            Saved
          </Link>
          {!mobile && (
            <div className="relative">
              <button onClick={toggleNotifs} data-testid="notification-bell" className="relative p-2 hover:bg-zinc-100 transition-colors">
                <Bell size={20} weight={unreadCount > 0 ? "fill" : "regular"} className={unreadCount > 0 ? "text-[#002FA7]" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center" data-testid="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-zinc-200 shadow-lg z-[9999] max-h-80 overflow-y-auto" data-testid="notification-dropdown">
                  <div className="p-3 border-b border-zinc-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">Notifications</span>
                    <button onClick={() => setShowNotifs(false)} className="text-zinc-400 hover:text-black"><X size={14} /></button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map((n, i) => (
                      <Link to={n.link || '#'} key={i} onClick={() => setShowNotifs(false)} className={`block px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`} data-testid={`notification-${i}`}>
                        <p className="text-sm text-zinc-800">{n.message}</p>
                        <span className="text-xs text-zinc-400">{formatDate(n.created_at)}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {user.role === 'admin' && (
            <>
            <Link to="/admin/colleges" data-testid="nav-manage-colleges" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Colleges
            </Link>
            <Link to="/admin/blog" data-testid="nav-manage-blog" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Blog
            </Link>
            <Link to="/admin/users" data-testid="nav-manage-users" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Users
            </Link>
            <Link to="/admin/bookings" data-testid="nav-manage-bookings" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Bookings
            </Link>
            <Link to="/admin/leads" data-testid="nav-manage-leads" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Leads
            </Link>
            <Link to="/admin/cms" data-testid="nav-cms" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors flex items-center gap-1 ${mobile ? 'py-3 border-b border-zinc-100' : ''}`}>
              <PencilSimple size={16} weight="bold" />
              Editor
            </Link>
            <Link to="/admin/analytics" data-testid="nav-analytics" onClick={closeMobile} className={`text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'block py-3 border-b border-zinc-100' : ''}`}>
              Stats
            </Link>
            </>
          )}
          <Link to="/profile" data-testid="nav-profile" onClick={closeMobile} className={`flex items-center gap-1 text-sm font-bold uppercase tracking-[0.2em] hover:text-[#002FA7] transition-colors ${mobile ? 'py-3 border-b border-zinc-100' : ''}`}>
            <User size={16} weight="bold" />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className={`flex items-center gap-2 px-4 py-2 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none ${mobile ? 'w-full justify-center mt-2' : ''}`}
          >
            <SignOut size={16} weight="bold" />
            Logout
          </button>
        </>
      ) : (
        <Link to="/login" data-testid="nav-login" onClick={closeMobile}>
          <button className={`px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none ${mobile ? 'w-full' : ''}`}>
            Sign In
          </button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 header-glass border-b border-zinc-200">
      <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
        <Link to="/" data-testid="header-logo" className="text-2xl font-black tracking-tighter">
          JEE<span className="text-[#002FA7]">college</span><span className="text-zinc-400 text-lg">.com</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <NavLinks mobile={false} />
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-button"
          className="lg:hidden w-10 h-10 flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 transition-colors"
        >
          {mobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-6 py-4 space-y-1" data-testid="mobile-menu">
          <NavLinks mobile={true} />
        </div>
      )}
    </header>
  );
};