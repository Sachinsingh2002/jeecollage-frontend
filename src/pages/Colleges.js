import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { Pagination } from '../components/Pagination';
import { MagnifyingGlass, MapPin, Star, Scales, Check, BookmarkSimple } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { trackPageView } from '../utils/analytics';
import axios from 'axios';
import { COLLEGES_CATALOG } from '../data/collegesCatalog';
import {
  listStatesFromCatalog,
  listCitiesFromCatalog,
  listCoursesFromCatalog,
  queryCollegesCatalog,
} from '../lib/collegesLocal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '';

const initialCollegesDataSource =
  !BACKEND_URL || process.env.REACT_APP_USE_STATIC_COLLEGES === 'true' ? 'catalog' : 'api';

const RATING_OPTIONS = [
  { label: 'All Ratings', value: 0 },
  { label: '3.0+', value: 3.0 },
  { label: '3.5+', value: 3.5 },
  { label: '4.0+', value: 4.0 },
  { label: '4.5+', value: 4.5 },
];

export const Colleges = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [compareList, setCompareList] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState(null);
  const [dataSource, setDataSource] = useState(initialCollegesDataSource);

  useEffect(() => {
    fetchPageSettings();
  }, []);

  useEffect(() => {
    if (user) fetchBookmarkIds();
  }, [user]);

  useEffect(() => {
    const loadFilterMeta = async () => {
      if (dataSource === 'catalog') {
        setStates(listStatesFromCatalog());
        setCourses(listCoursesFromCatalog());
        return;
      }
      try {
        const [{ data: st }, { data: co }, { data: ci }] = await Promise.all([
          axios.get(`${API}/states`),
          axios.get(`${API}/courses`),
          axios.get(`${API}/cities`, { params: {} }),
        ]);
        setStates(st);
        setCourses(co);
        setCities(ci);
      } catch (error) {
        console.error('Error fetching filter metadata:', error);
        setDataSource('catalog');
      }
    };
    loadFilterMeta();
  }, [dataSource]);

  useEffect(() => {
    if (dataSource !== 'catalog') return;
    setCities(listCitiesFromCatalog(COLLEGES_CATALOG, selectedState || ''));
  }, [dataSource, selectedState]);

  useEffect(() => {
    fetchColleges();
  }, [selectedState, selectedCity, selectedCourse, minRating, page, searchParams, dataSource]);

  const refreshCities = async (stateFilter) => {
    if (dataSource === 'catalog') {
      setCities(listCitiesFromCatalog(COLLEGES_CATALOG, stateFilter || ''));
      return;
    }
    try {
      const params = stateFilter ? { state: stateFilter } : {};
      const { data } = await axios.get(`${API}/cities`, { params });
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setDataSource('catalog');
    }
  };

  const fetchBookmarkIds = async () => {
    try {
      const { data } = await axios.get(`${API}/bookmarks/ids`, { withCredentials: true });
      setBookmarkIds(data);
    } catch (error) {}
  };

  const fetchPageSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/site-settings`);
      setPageSettings(data?.pages?.colleges);
    } catch (e) {}
  };

  const fetchColleges = async () => {
    setLoading(true);
    const query = searchQuery || searchParams.get('search') || '';
    try {
      if (dataSource === 'catalog') {
        const result = queryCollegesCatalog(
          {
            state: selectedState,
            city: selectedCity,
            course: selectedCourse,
            min_rating: minRating,
            search: query,
          },
          page,
          12
        );
        setColleges(result.colleges);
        setTotalPages(result.total_pages);
        setTotal(result.total);
        return;
      }
      const params = { page, per_page: 12 };
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (selectedCourse) params.course = selectedCourse;
      if (minRating > 0) params.min_rating = minRating;
      if (query) params.search = query;
      const { data } = await axios.get(`${API}/colleges`, { params });
      setColleges(data.colleges);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setDataSource('catalog');
      const result = queryCollegesCatalog(
        {
          state: selectedState,
          city: selectedCity,
          course: selectedCourse,
          min_rating: minRating,
          search: query,
        },
        page,
        12
      );
      setColleges(result.colleges);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    if (searchQuery) trackPageView('/colleges', { search_query: searchQuery });
    fetchCollegesWithSearch(searchQuery);
  };

  const fetchCollegesWithSearch = async (query) => {
    setLoading(true);
    try {
      if (dataSource === 'catalog') {
        const result = queryCollegesCatalog(
          {
            state: selectedState,
            city: selectedCity,
            course: selectedCourse,
            min_rating: minRating,
            search: query || '',
          },
          1,
          12
        );
        setColleges(result.colleges);
        setTotalPages(result.total_pages);
        setTotal(result.total);
        return;
      }
      const params = { page: 1, per_page: 12 };
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (selectedCourse) params.course = selectedCourse;
      if (minRating > 0) params.min_rating = minRating;
      if (query) params.search = query;
      const { data } = await axios.get(`${API}/colleges`, { params });
      setColleges(data.colleges);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setDataSource('catalog');
      const result = queryCollegesCatalog(
        {
          state: selectedState,
          city: selectedCity,
          course: selectedCourse,
          min_rating: minRating,
          search: query || '',
        },
        1,
        12
      );
      setColleges(result.colleges);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const toggleCompare = (college) => {
    if (compareList.find(c => c.id === college.id)) {
      setCompareList(compareList.filter(c => c.id !== college.id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, college]);
    }
  };

  const toggleBookmark = async (collegeId, e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await axios.post(`${API}/bookmarks/${collegeId}`, {}, { withCredentials: true });
      if (data.bookmarked) {
        setBookmarkIds([...bookmarkIds, collegeId]);
      } else {
        setBookmarkIds(bookmarkIds.filter(id => id !== collegeId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const goToCompare = () => {
    const ids = compareList.map(c => c.id).join(',');
    navigate(`/compare?ids=${ids}`);
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedCourse('');
    setMinRating(0);
    setSearchQuery('');
    setPage(1);
    fetchCollegesCleared();
  };

  const fetchCollegesCleared = async () => {
    setLoading(true);
    try {
      if (dataSource === 'catalog') {
        const result = queryCollegesCatalog(
          { state: '', city: '', course: '', min_rating: 0, search: '' },
          1,
          12
        );
        setColleges(result.colleges);
        setTotalPages(result.total_pages);
        setTotal(result.total);
        return;
      }
      const { data } = await axios.get(`${API}/colleges`, { params: { page: 1, per_page: 12 } });
      setColleges(data.colleges);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setDataSource('catalog');
      const result = queryCollegesCatalog(
        { state: '', city: '', course: '', min_rating: 0, search: '' },
        1,
        12
      );
      setColleges(result.colleges);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = selectedState || selectedCity || selectedCourse || minRating > 0 || searchQuery;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={selectedState ? `Top Engineering Colleges in ${selectedCity || selectedState}` : "Explore 180+ Engineering Colleges Across India"}
        description={selectedState ? `Find top-ranked engineering colleges in ${selectedCity || selectedState}. Compare fees, placements, NIRF rankings, and courses.` : "Browse 180+ engineering colleges across 22 Indian states. Filter by state, city, course, rating. Compare colleges side-by-side."}
        keywords={`engineering colleges ${selectedCity || selectedState || 'India'}, BTech colleges, NIRF ranking, fees comparison, placements`}
        breadcrumbs={[
          { name: "Home", url: process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || "/" },
          { name: "Colleges", url: `${process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || ""}/colleges` },
          ...(selectedState ? [{ name: selectedState, url: `${process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || ""}/colleges?state=${selectedState}` }] : []),
          ...(selectedCity ? [{ name: selectedCity }] : [])
        ]}
      />
      <Header />
      
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold tracking-tight" data-testid="colleges-heading">{pageSettings?.heading || 'Explore Colleges'}</h1>
          {compareList.length > 0 && (
            <button
              onClick={goToCompare}
              data-testid="go-compare-button"
              className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none flex items-center gap-2"
            >
              <Scales size={20} weight="bold" />
              Compare ({compareList.length})
            </button>
          )}
        </div>
        {pageSettings?.show_intro && pageSettings?.intro_text && (
          <p className="text-base text-zinc-500 mb-6" data-testid="colleges-intro-text">{pageSettings.intro_text}</p>
        )}
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-0 border border-zinc-200 max-w-2xl">
            <div className="flex items-center px-4 bg-white border-r border-zinc-200">
              <MagnifyingGlass size={20} weight="bold" className="text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search colleges, cities, or states..."
              data-testid="colleges-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 bg-white focus:outline-none text-base"
            />
            <button
              onClick={handleSearch}
              data-testid="colleges-search-button"
              className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* State Filter */}
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Filter by State</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setSelectedState(''); setSelectedCity(''); setPage(1); refreshCities(); }}
                  data-testid="filter-all-states"
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedState === '' ? 'bg-[#002FA7] text-white font-bold' : 'hover:bg-zinc-200'
                  }`}
                >
                  All States
                </button>
                {states.map((state, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedState(state.state); setSelectedCity(''); setPage(1); refreshCities(state.state); }}
                    data-testid={`filter-state-${idx}`}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedState === state.state ? 'bg-[#002FA7] text-white font-bold' : 'hover:bg-zinc-200'
                    }`}
                  >
                    {state.state} ({state.count})
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Filter by City</h3>
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                data-testid="filter-city-select"
                className="w-full bg-white border border-zinc-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
              >
                <option value="">All Cities</option>
                {cities.map((city, idx) => (
                  <option key={idx} value={city.city}>{city.city}{!selectedState ? `, ${city.state}` : ''} ({city.count})</option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Filter by Course</h3>
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
                data-testid="filter-course-select"
                className="w-full bg-white border border-zinc-200 rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
              >
                <option value="">All Courses</option>
                {courses.map((course, idx) => (
                  <option key={idx} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Minimum Rating</h3>
              <div className="space-y-1">
                {RATING_OPTIONS.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMinRating(option.value); setPage(1); }}
                    data-testid={`filter-rating-${idx}`}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                      minRating === option.value ? 'bg-[#002FA7] text-white font-bold' : 'hover:bg-zinc-200'
                    }`}
                  >
                    {option.value > 0 && <Star size={14} weight="fill" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                data-testid="clear-filters-button"
                className="w-full px-4 py-3 bg-white text-black border border-black font-bold hover:bg-black hover:text-white transition-colors rounded-none text-sm"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-500" data-testid="results-count">{total} colleges found</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-zinc-600">Loading colleges...</div>
            ) : colleges.length === 0 ? (
              <div className="text-center py-12 text-zinc-600" data-testid="no-colleges-message">No colleges found matching your filters</div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {colleges.map((college, idx) => {
                  const isInCompare = compareList.find(c => c.id === college.id);
                  return (
                    <div key={idx} data-testid={`college-item-${idx}`} className="brutalist-card bg-white border border-zinc-200 rounded-none p-6 h-full relative">
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 z-10 flex gap-1">
                        <button
                          onClick={(e) => toggleBookmark(college.id, e)}
                          data-testid={`bookmark-toggle-${idx}`}
                          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                            bookmarkIds.includes(college.id) ? 'bg-[#002FA7] border-[#002FA7] text-white' : 'bg-white border-zinc-300 text-zinc-400 hover:border-[#002FA7]'
                          }`}
                          title={bookmarkIds.includes(college.id) ? 'Remove bookmark' : 'Save college'}
                        >
                          <BookmarkSimple size={14} weight={bookmarkIds.includes(college.id) ? 'fill' : 'regular'} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); toggleCompare(college); }}
                          data-testid={`compare-toggle-${idx}`}
                          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                            isInCompare ? 'bg-[#002FA7] border-[#002FA7] text-white' : 'bg-white border-zinc-300 text-zinc-400 hover:border-[#002FA7]'
                          }`}
                          title={isInCompare ? 'Remove from compare' : 'Add to compare'}
                        >
                          {isInCompare ? <Check size={16} weight="bold" /> : <Scales size={14} />}
                        </button>
                      </div>

                      <Link to={`/colleges/${college.id}`}>
                        {college.image && (
                          <img src={college.image} alt={college.name} className="w-full h-40 object-cover mb-4 border border-zinc-200" />
                        )}
                        <div className="flex items-start justify-between mb-3 pr-10">
                          <h3 className="text-xl font-bold tracking-tight flex-1">{college.name}</h3>
                          <div className="flex items-center gap-1 text-[#002FA7]">
                            <Star size={16} weight="fill" />
                            <span className="text-sm font-bold">{college.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 mb-3">
                          <MapPin size={16} weight="bold" />
                          <span className="text-sm">{college.city}, {college.state}</span>
                        </div>
                        <p className="text-sm text-zinc-600 mb-4">{college.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {college.courses.slice(0, 3).map((course, i) => (
                            <span key={i} className="text-xs font-bold uppercase tracking-[0.1em] bg-zinc-100 px-2 py-1">
                              {course}
                            </span>
                          ))}
                        </div>
                        {college.fees && (
                          <div className="text-sm font-bold text-[#002FA7]">{college.fees}</div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Compare Bar (floating) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-12 left-4 right-4 md:left-12 md:right-12 lg:left-24 lg:right-24 bg-[#09090B] text-white py-4 px-6 z-[9999] flex items-center justify-between border border-zinc-700 shadow-2xl" data-testid="compare-bar">
          <div className="flex items-center gap-4">
            <Scales size={20} weight="bold" className="text-[#002FA7]" />
            <span className="text-sm font-bold">{compareList.length} college{compareList.length > 1 ? 's' : ''} selected</span>
            <div className="hidden md:flex gap-2">
              {compareList.map((c, idx) => (
                <span key={idx} className="text-xs bg-zinc-800 px-3 py-1 border border-zinc-700">
                  {c.name.length > 25 ? c.name.slice(0, 25) + '...' : c.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCompareList([])}
              data-testid="clear-compare-button"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={goToCompare}
              data-testid="compare-now-button"
              className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-blue-800 transition-colors rounded-none text-sm"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};