import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Star, MapPin, Money, GraduationCap, X, Plus, Scales, TrendUp, TrendDown, Minus } from '@phosphor-icons/react';
import axios from 'axios';
import { COLLEGES_CATALOG, getCollegeByIdFromCatalog } from '../data/collegesCatalog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Compare = () => {
  const [searchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      fetchCompareColleges(ids.split(','));
    } else {
      setLoading(false);
    }
    fetchAllColleges();
  }, [searchParams]);

  const fetchCompareColleges = async (ids) => {
    setLoading(true);
    try {
      if (!BACKEND_URL) {
        setColleges(ids.map((id) => getCollegeByIdFromCatalog(id)).filter(Boolean));
        return;
      }
      const { data } = await axios.post(`${API}/colleges/compare`, { ids });
      setColleges(data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
      setColleges(ids.map((id) => getCollegeByIdFromCatalog(id)).filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllColleges = async () => {
    try {
      if (!BACKEND_URL) {
        setAllColleges(COLLEGES_CATALOG);
        return;
      }
      const { data } = await axios.get(`${API}/colleges?per_page=200`);
      setAllColleges(data.colleges || data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setAllColleges(COLLEGES_CATALOG);
    }
  };

  const addCollege = (college) => {
    if (colleges.length >= 4 || colleges.find(c => c.id === college.id)) return;
    const updated = [...colleges, college];
    setColleges(updated);
    setShowPicker(false);
    setPickerSearch('');
    // Update URL
    const ids = updated.map(c => c.id).join(',');
    window.history.replaceState(null, '', `/compare?ids=${ids}`);
  };

  const removeCollege = (id) => {
    const updated = colleges.filter(c => c.id !== id);
    setColleges(updated);
    if (updated.length > 0) {
      const ids = updated.map(c => c.id).join(',');
      window.history.replaceState(null, '', `/compare?ids=${ids}`);
    } else {
      window.history.replaceState(null, '', '/compare');
    }
  };

  const filteredColleges = allColleges.filter(c => {
    if (colleges.find(cc => cc.id === c.id)) return false;
    if (pickerSearch === '') return true;
    const q = pickerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.state && c.state.toLowerCase().includes(q))
    );
  });

  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <Star size={16} weight="fill" className="text-[#002FA7]" />
        <span className="font-bold">{rating}</span>
      </div>
    );
  };

  const comparisonRows = [
    { label: 'Location', render: (c) => `${c.city}, ${c.state}` },
    { label: 'Rating', render: (c) => renderRatingStars(c.rating) },
    { label: 'Fees', render: (c) => c.fees || 'N/A' },
    { label: 'Admission', render: (c) => c.admission_stats || 'N/A' },
    { label: 'Reviews', render: (c) => `${c.reviews_count} reviews` },
    { label: 'Courses', render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.courses.map((course, i) => (
          <span key={i} className="text-xs bg-zinc-100 px-2 py-0.5 font-bold">{course}</span>
        ))}
      </div>
    )},
    { label: 'Website', render: (c) => c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-[#002FA7] font-bold hover:underline text-sm">Visit</a> : 'N/A' },
  ];

  // Collect all unique branches across all selected colleges' cutoffs
  const allBranches = [...new Set(
    colleges.flatMap(c => (c.cutoffs || []).map(co => co.branch))
  )].sort();

  const getCutoff = (college, branch, category) => {
    const cutoff = (college.cutoffs || []).find(co => co.branch === branch);
    if (!cutoff) return null;
    return cutoff[`${category}_closing`];
  };

  const renderCutoffCell = (college, branch, category) => {
    const rank = getCutoff(college, branch, category);
    if (rank === null || rank === undefined) return <span className="text-zinc-300">—</span>;

    // Find the best (lowest) rank among compared colleges for this branch+category
    const allRanks = colleges.map(c => getCutoff(c, branch, category)).filter(r => r != null);
    const best = Math.min(...allRanks);
    const worst = Math.max(...allRanks);

    let colorClass = 'text-zinc-800';
    let Icon = null;
    if (allRanks.length > 1) {
      if (rank === best) { colorClass = 'text-green-700'; Icon = TrendUp; }
      else if (rank === worst) { colorClass = 'text-red-600'; Icon = TrendDown; }
      else { colorClass = 'text-amber-600'; Icon = Minus; }
    }

    return (
      <div className={`flex items-center gap-1 font-bold ${colorClass}`}>
        {Icon && <Icon size={12} weight="bold" />}
        {rank.toLocaleString()}
      </div>
    );
  };

  const [cutoffCategory, setCutoffCategory] = useState('general');

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" data-testid="compare-heading">Compare Colleges</h1>
            <p className="text-zinc-500 mt-2">Select up to 4 colleges to compare side-by-side</p>
          </div>
          {colleges.length < 4 && (
            <button
              onClick={() => setShowPicker(true)}
              data-testid="add-college-compare-button"
              className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none flex items-center gap-2"
            >
              <Plus size={20} weight="bold" />
              Add College
            </button>
          )}
        </div>

        {/* College Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" data-testid="college-picker-modal">
            <div className="bg-white border border-zinc-200 w-full max-w-lg max-h-[70vh] flex flex-col">
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-lg font-bold">Select College</h3>
                <button onClick={() => { setShowPicker(false); setPickerSearch(''); }} data-testid="close-picker-button">
                  <X size={20} weight="bold" className="text-zinc-500 hover:text-black" />
                </button>
              </div>
              <div className="p-4 border-b border-zinc-200">
                <input
                  type="text"
                  placeholder="Search colleges..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  data-testid="picker-search-input"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filteredColleges.slice(0, 40).map((college, idx) => (
                  <button
                    key={idx}
                    onClick={() => addCollege(college)}
                    data-testid={`picker-college-${idx}`}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm">{college.name}</div>
                      <div className="text-xs text-zinc-500">{college.city}, {college.state}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[#002FA7]">
                      <Star size={14} weight="fill" />
                      <span className="text-xs font-bold">{college.rating}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-600">Loading comparison...</div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 border border-zinc-200 bg-zinc-50" data-testid="empty-compare">
            <Scales size={64} weight="thin" className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No colleges selected</h2>
            <p className="text-zinc-500 mb-6">Add colleges to start comparing them side by side</p>
            <button
              onClick={() => setShowPicker(true)}
              data-testid="empty-add-button"
              className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none"
            >
              Add First College
            </button>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto" data-testid="comparison-table">
            <table className="w-full border-collapse">
              {/* College Headers */}
              <thead>
                <tr>
                  <th className="w-40 p-4 text-left text-xs font-bold uppercase tracking-[0.2em] bg-zinc-50 border border-zinc-200">
                    Criteria
                  </th>
                  {colleges.map((college, idx) => (
                    <th key={idx} className="p-4 border border-zinc-200 bg-zinc-50 min-w-[220px]" data-testid={`compare-col-${idx}`}>
                      <div className="flex items-start justify-between mb-2">
                        <Link to={`/colleges/${college.id}`} className="text-left">
                          <span className="text-base font-bold hover:text-[#002FA7] transition-colors">{college.name}</span>
                        </Link>
                        <button
                          onClick={() => removeCollege(college.id)}
                          data-testid={`remove-compare-${idx}`}
                          className="p-1 hover:bg-zinc-200 transition-colors flex-shrink-0"
                        >
                          <X size={14} weight="bold" className="text-zinc-400" />
                        </button>
                      </div>
                      {college.image && (
                        <img src={college.image} alt={college.name} className="w-full h-24 object-cover border border-zinc-200" />
                      )}
                    </th>
                  ))}
                  {colleges.length < 4 && (
                    <th className="p-4 border border-zinc-200 bg-zinc-50 min-w-[220px]">
                      <button
                        onClick={() => setShowPicker(true)}
                        data-testid="table-add-button"
                        className="w-full h-24 border-2 border-dashed border-zinc-300 flex items-center justify-center hover:border-[#002FA7] transition-colors"
                      >
                        <Plus size={24} className="text-zinc-400" />
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              {/* Comparison Rows */}
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 border border-zinc-200 bg-zinc-50">
                      {row.label}
                    </td>
                    {colleges.map((college, cIdx) => (
                      <td key={cIdx} className="p-4 text-sm border border-zinc-200" data-testid={`compare-${row.label.toLowerCase()}-${cIdx}`}>
                        {row.render(college)}
                      </td>
                    ))}
                    {colleges.length < 4 && <td className="border border-zinc-200"></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cutoff Ranking Section */}
          {allBranches.length > 0 && (
            <div className="mt-10" data-testid="cutoff-section">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">JEE Cutoff Rankings</h2>
                <div className="flex gap-0 border border-zinc-200">
                  {[
                    { value: 'general', label: 'General' },
                    { value: 'obc', label: 'OBC' },
                    { value: 'sc', label: 'SC' },
                    { value: 'st', label: 'ST' },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCutoffCategory(cat.value)}
                      data-testid={`cutoff-cat-${cat.value}`}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                        cutoffCategory === cat.value
                          ? 'bg-[#002FA7] text-white'
                          : 'bg-white text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-zinc-500 mb-4">
                Closing ranks (lower is better). <span className="text-green-700 font-bold">Green</span> = best among compared, <span className="text-red-600 font-bold">Red</span> = highest cutoff.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse" data-testid="cutoff-table">
                  <thead>
                    <tr>
                      <th className="w-48 p-4 text-left text-xs font-bold uppercase tracking-[0.2em] bg-[#09090B] text-white border border-zinc-700">
                        Branch
                      </th>
                      {colleges.map((college, idx) => (
                        <th key={idx} className="p-4 text-center text-xs font-bold uppercase tracking-[0.2em] bg-[#09090B] text-white border border-zinc-700 min-w-[180px]" data-testid={`cutoff-header-${idx}`}>
                          {college.name.length > 30 ? college.name.slice(0, 28) + '...' : college.name}
                        </th>
                      ))}
                      {colleges.length < 4 && <th className="bg-[#09090B] border border-zinc-700"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {allBranches.map((branch, bIdx) => (
                      <tr key={bIdx} className={bIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                        <td className="p-4 text-sm font-bold border border-zinc-200" data-testid={`cutoff-branch-${bIdx}`}>
                          {branch}
                        </td>
                        {colleges.map((college, cIdx) => (
                          <td key={cIdx} className="p-4 text-sm text-center border border-zinc-200" data-testid={`cutoff-${bIdx}-${cIdx}`}>
                            {renderCutoffCell(college, branch, cutoffCategory)}
                          </td>
                        ))}
                        {colleges.length < 4 && <td className="border border-zinc-200"></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-500">
                Based on previous year closing ranks. Actual cutoffs may vary. "—" means data not available for that college-branch combination.
              </div>
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
};
