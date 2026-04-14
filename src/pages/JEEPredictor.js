import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { MagnifyingGlass, TrendUp, TrendDown, Minus, GraduationCap, Star, Lock } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
];

const EXAM_TYPES = [
  { value: 'jee_advanced', label: 'JEE Advanced' },
  { value: 'jee_main', label: 'JEE Main' },
];

const CHANCE_STYLES = {
  High: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: TrendUp },
  Medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Minus },
  Low: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: TrendDown },
};

export const JEEPredictor = () => {
  const { user, loading: authLoading } = useAuth();
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('general');
  const [examType, setExamType] = useState('jee_advanced');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!rank || parseInt(rank) <= 0) {
      setError('Please enter a valid rank');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/predict-college`, {
        rank: parseInt(rank),
        category,
        exam_type: examType,
      });
      setPredictions(data);
    } catch (err) {
      setError('Failed to predict. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const predictorJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JEE Rank Predictor",
    "description": "Enter your JEE Main or Advanced rank and get personalized college predictions across 90+ top engineering colleges.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="JEE Rank Predictor - Find Your Best College"
        description="Enter your JEE Main or Advanced rank and get personalized college predictions. 252 cutoff entries across 90+ top engineering colleges including IITs, NITs, BITS, and more."
        keywords="JEE rank predictor, JEE Main college predictor, JEE Advanced cutoff, IIT cutoff, NIT cutoff, college prediction tool"
        jsonLd={predictorJsonLd}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "JEE Rank Predictor" }
        ]}
      />
      <Header />

      {/* Auth Gate */}
      {!authLoading && !user ? (
        <div className="px-6 md:px-12 lg:px-24 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-zinc-100 mx-auto mb-6 flex items-center justify-center">
              <Lock size={40} weight="bold" className="text-[#002FA7]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3" data-testid="predictor-locked">Sign In to Access JEE Predictor</h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">The JEE Rank Predictor with 309 cutoff entries across 179 colleges is available exclusively for registered users.</p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <button className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors" data-testid="predictor-signin-btn">
                  Sign In to Continue
                </button>
              </Link>
              <Link to="/login">
                <button className="px-8 py-4 border border-zinc-300 font-bold hover:bg-zinc-100 transition-colors" data-testid="predictor-register-btn">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (

      <div className="px-6 md:px-12 lg:px-24 py-8">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap size={40} weight="bold" className="text-[#002FA7]" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" data-testid="predictor-heading">
              JEE Rank Predictor
            </h1>
          </div>
          <p className="text-base text-zinc-600 max-w-2xl">
            Enter your JEE rank and category to see which colleges and branches you can get into. Based on previous year cutoff data.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-zinc-50 border border-zinc-200 p-8 mb-10 max-w-3xl">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Your Rank</label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  data-testid="rank-input"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  data-testid="category-select"
                  className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Exam</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  data-testid="exam-select"
                  className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                >
                  {EXAM_TYPES.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm" data-testid="predictor-error">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="predict-button"
              className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none disabled:opacity-50 flex items-center gap-2"
            >
              <MagnifyingGlass size={20} weight="bold" />
              {loading ? 'Predicting...' : 'Predict Colleges'}
            </button>
          </form>
        </div>

        {/* Results */}
        {predictions && (
          <div data-testid="predictions-container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {predictions.total_matches} College{predictions.total_matches !== 1 ? 's' : ''} Found
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 inline-block"></span> High Chance</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 inline-block"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block"></span> Low</span>
              </div>
            </div>

            {predictions.total_matches === 0 ? (
              <div className="text-center py-12 border border-zinc-200 bg-zinc-50" data-testid="no-predictions">
                <h3 className="text-xl font-bold mb-2">No matches found</h3>
                <p className="text-zinc-500">Your rank may be too high for the colleges in our database. Try a lower rank or different category.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {predictions.predictions.map((pred, idx) => {
                  const style = CHANCE_STYLES[pred.chance] || CHANCE_STYLES.Low;
                  const Icon = style.icon;
                  return (
                    <div
                      key={idx}
                      data-testid={`prediction-${idx}`}
                      className={`${style.bg} border ${style.border} p-5 flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold tracking-tight">{pred.college}</h3>
                          <span className={`text-xs font-bold uppercase tracking-[0.2em] ${style.text} px-2 py-0.5 border ${style.border} flex items-center gap-1`}>
                            <Icon size={12} weight="bold" />
                            {pred.chance}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600">{pred.branch}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">Closing Rank</div>
                        <div className="text-lg font-bold">{pred.closing_rank.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 text-sm text-zinc-500">
              <strong>Disclaimer:</strong> These predictions are based on previous year cutoff data and are approximate. Actual cutoffs may vary. Please refer to official counselling portals for the most accurate information.
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
