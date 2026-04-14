import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { MagnifyingGlass, GraduationCap, ArrowRight } from '@phosphor-icons/react';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import { SITE_DEFAULTS } from '../constants/siteDefaults';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Home = () => {
  const [featuredColleges, setFeaturedColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedColleges();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/site-settings`);
      setSettings(data);
    } catch (e) { console.error(e); }
  };

  const fetchFeaturedColleges = async () => {
    try {
      const { data } = await axios.get(`${API}/colleges?per_page=6`);
      setFeaturedColleges(data.colleges || data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JEEcollege.com",
    "url": "https://jeecollege.com",
    "description": "Explore 200+ JEE colleges across India. Compare NIRF rankings, fees, placements, and predict your rank. Register for personalized counseling.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://jeecollege.com/colleges?search={search_term}"
      },
      "query-input": "required name=search_term"
    }
  };

  const h = { ...SITE_DEFAULTS.hero, ...(settings?.hero || {}) };
  const ft = { ...SITE_DEFAULTS.footer, ...(settings?.footer || {}) };
  const qa =
    settings?.quick_actions?.length > 0
      ? settings.quick_actions
      : SITE_DEFAULTS.quick_actions;
  const cats =
    settings?.community_categories?.length > 0
      ? settings.community_categories
      : SITE_DEFAULTS.community_categories;
  const seo = { ...SITE_DEFAULTS.seo, ...(settings?.seo || {}) };
  const brand = { ...SITE_DEFAULTS.branding, ...(settings?.branding || {}) };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={seo.default_title}
        description={seo.default_description}
        keywords={seo.default_keywords}
        jsonLd={homeJsonLd}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#09090B] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#002FA7] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-[#002FA7] rounded-full blur-[100px]"></div>
        </div>
        <div className="relative px-6 md:px-12 lg:px-24 py-20 md:py-28">
          <div className="max-w-4xl">
            <div className="inline-block mb-6 px-4 py-2 border border-zinc-700 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              {h.badge}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6" data-testid="hero-heading">
              {h.heading_prefix} <span className="text-[#002FA7]">{h.heading_highlight}</span> {h.heading_suffix}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-4 max-w-2xl">
              {h.subheading}
            </p>
            <p className="text-base text-zinc-500 mb-10 max-w-2xl">
              {h.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={h.cta_primary_link}>
                <button data-testid="explore-colleges-button" className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-blue-800 transition-colors rounded-none flex items-center gap-2 text-base">
                  {h.cta_primary_text}
                  <ArrowRight size={20} weight="bold" />
                </button>
              </Link>
              <Link to={h.cta_secondary_link}>
                <button data-testid="predictor-cta-button" className="px-8 py-4 bg-transparent text-white font-bold border border-zinc-600 hover:border-white hover:bg-white hover:text-black transition-colors rounded-none flex items-center gap-2 text-base">
                  <GraduationCap size={20} weight="bold" />
                  {h.cta_secondary_text}
                </button>
              </Link>
              <Link to={h.cta_tertiary_link}>
                <button data-testid="counseling-cta-button" className="px-8 py-4 bg-transparent text-[#002FA7] font-bold border border-[#002FA7] hover:bg-[#002FA7] hover:text-white transition-colors rounded-none text-base">
                  {h.cta_tertiary_text}
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-zinc-800">
            {h.stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl md:text-4xl font-black text-[#002FA7]">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-6 md:px-12 lg:px-24 py-12 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-0 border border-zinc-200">
            <div className="flex items-center px-6 bg-white border-r border-zinc-200">
              <MagnifyingGlass size={24} weight="bold" className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search colleges, cities, or states..."
              data-testid="search-colleges-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/colleges?search=${searchQuery}`)}
              className="flex-1 px-6 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-base"
            />
            <Link to={`/colleges${searchQuery ? `?search=${searchQuery}` : ''}`}>
              <button data-testid="search-button" className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none">
                Search
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qa.map((action, idx) => (
            <Link to={action.link} key={idx} className="group">
              <div className="brutalist-card border border-zinc-200 p-8 flex items-start gap-4 h-full" data-testid={`quick-action-${idx}`}>
                <GraduationCap size={32} weight="bold" className="text-[#002FA7] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1 group-hover:text-[#002FA7] transition-colors">{action.title}</h3>
                  <p className="text-sm text-zinc-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Colleges */}
      <section className="px-6 md:px-12 lg:px-24 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-8">Featured Colleges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
          {featuredColleges.map((college, idx) => (
            <Link to={`/colleges/${college.id}`} key={idx}>
              <div data-testid={`college-card-${idx}`} className="brutalist-card bg-white border border-zinc-200 rounded-none p-6">
                {college.image && (
                  <img src={college.image} alt={college.name} className="w-full h-48 object-cover mb-4 border border-zinc-200" />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold tracking-tight">{college.name}</h3>
                  <span className="text-sm font-bold text-[#002FA7]">{college.rating}</span>
                </div>
                <p className="text-sm text-zinc-500 mb-2">{college.city}, {college.state}</p>
                <p className="text-sm text-zinc-600 mb-4">{college.description}</p>
                <div className="flex flex-wrap gap-2">
                  {college.courses.slice(0, 2).map((course, i) => (
                    <span key={i} className="text-xs font-bold uppercase tracking-[0.2em] bg-zinc-100 px-3 py-1">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Overview */}
      <section className="px-6 md:px-12 lg:px-24 py-16 bg-zinc-50">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-8">Join the Community</h2>
        <div className="bento-grid">
          {cats.map((category, idx) => (
            <Link to={`/community?category=${encodeURIComponent(category.name)}`} key={idx}>
              <div data-testid={`category-card-${idx}`} className="brutalist-card bg-white border border-zinc-200 rounded-none p-8 h-full flex flex-col items-start">
                <div className="mb-4 text-[#002FA7]">
                  <GraduationCap size={40} weight="bold" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Lead Capture Form */}
      <section className="px-6 md:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
              Get <span className="text-[#002FA7]">Free</span> College Guidance
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Not sure which college or branch to pick? Our team of 150+ industry leaders — VPs, CEOs, and Directors from top companies — are here to guide you personally.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#002FA7] flex items-center justify-center text-white text-xs font-bold">1</div> <span>Share your details and course interest</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#002FA7] flex items-center justify-center text-white text-xs font-bold">2</div> <span>Get matched with an expert counselor</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 bg-[#002FA7] flex items-center justify-center text-white text-xs font-bold">3</div> <span>Receive personalized college recommendations</span></div>
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 p-8" data-testid="homepage-lead-form">
            <LeadCaptureForm source="homepage" heading="Register for Free Counseling" subheading="Fill in your details and our expert will contact you within 24 hours" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#09090B] text-white px-6 md:px-12 lg:px-24 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              {brand.logo_part1}
              <span className="text-[#002FA7]">{brand.logo_part2}</span>
              <span className="text-zinc-600">{brand.logo_part3}</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-md">{ft.description}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            {ft.links.map((link, idx) => (
              <Link key={idx} to={link.url} className="hover:text-white transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-zinc-800 text-zinc-600 text-xs">
          {ft.copyright}
        </div>
      </footer>
    </div>
  );
};