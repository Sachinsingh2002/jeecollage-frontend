import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Star, GlobeHemisphereWest, Money, GraduationCap, Images, CaretLeft, CaretRight } from '@phosphor-icons/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { formatApiErrorDetail } from '../contexts/AuthContext';
import { trackPageView } from '../utils/analytics';
import { getCollegeByIdFromCatalog } from '../data/collegesCatalog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ImageGallery = ({ galleryImages, collegeName }) => {
  const allImages = (galleryImages && galleryImages.length > 0) ? galleryImages : [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (allImages.length === 0) return null;

  const next = () => setCurrentIdx((p) => (p + 1) % allImages.length);
  const prev = () => setCurrentIdx((p) => (p - 1 + allImages.length) % allImages.length);

  return (
    <>
      <div className="mb-6" data-testid="college-gallery">
        {/* Main Image */}
        <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
          <img src={allImages[currentIdx]} alt={collegeName} className="w-full h-80 object-cover border border-zinc-200" />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
            <Images size={14} weight="bold" />
            {currentIdx + 1}/{allImages.length}
          </div>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid="gallery-prev">
            <CaretLeft size={20} weight="bold" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid="gallery-next">
            <CaretRight size={20} weight="bold" />
          </button>
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button key={idx} onClick={() => setCurrentIdx(idx)} data-testid={`gallery-thumb-${idx}`}
              className={`flex-shrink-0 w-20 h-14 border-2 transition-colors ${idx === currentIdx ? 'border-[#002FA7]' : 'border-zinc-200'}`}>
              <img src={img} alt={`${collegeName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={() => setShowModal(false)} data-testid="gallery-modal">
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors">
            <CaretLeft size={24} weight="bold" />
          </button>
          <img src={allImages[currentIdx]} alt={collegeName} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors">
            <CaretRight size={24} weight="bold" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-bold">
            {currentIdx + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export const CollegeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [college, setCollege] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [jsonLd, setJsonLd] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [collegeLoading, setCollegeLoading] = useState(true);

  useEffect(() => {
    setCollege(null);
    setCollegeLoading(true);
    fetchCollege();
    fetchReviews();
    fetchJsonLd();
  }, [id]);

  const fetchCollege = async () => {
    try {
      if (!BACKEND_URL) {
        const local = getCollegeByIdFromCatalog(id);
        if (local) {
          setCollege(local);
          trackPageView(`/colleges/${id}`, { college_id: id, source: 'catalog' });
        }
        return;
      }
      try {
        const { data } = await axios.get(`${API}/colleges/${id}`);
        setCollege(data);
        trackPageView(`/colleges/${id}`, { college_id: id });
      } catch (error) {
        console.error('Error fetching college:', error);
        const local = getCollegeByIdFromCatalog(id);
        if (local) {
          setCollege(local);
          trackPageView(`/colleges/${id}`, { college_id: id, source: 'catalog' });
        }
      }
    } finally {
      setCollegeLoading(false);
    }
  };

  const fetchJsonLd = async () => {
    try {
      const { data } = await axios.get(`${API}/colleges/${id}/jsonld`);
      setJsonLd(data);
    } catch (error) {
      // Non-critical, ignore
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/colleges/${id}/reviews`);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit a review');
      return;
    }
    
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API}/colleges/${id}/reviews`,
        { college_id: id, rating, comment },
        { withCredentials: true }
      );
      setSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews();
      fetchCollege();
    } catch (error) {
      setError(formatApiErrorDetail(error.response?.data?.detail) || error.message);
    }
  };

  if (collegeLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-12 text-center text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-12 text-center">
          <p className="text-zinc-600 mb-4">We couldn’t load this college.</p>
          <Link to="/colleges" className="text-[#002FA7] font-bold hover:underline">Back to colleges</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${college.name} - ${college.city}, ${college.state}`}
        description={`${college.name} in ${college.city}, ${college.state}. ${college.description || ''} Fees: ${college.fees || 'N/A'}. Rating: ${college.rating}/5. Admission: ${college.admission_stats || 'N/A'}.`}
        keywords={`${college.name}, ${college.city} engineering college, ${college.state} BTech, ${(college.courses || []).join(', ')}`}
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Colleges", url: "/colleges" },
          { name: college.state, url: `/colleges?state=${college.state}` },
          { name: college.name }
        ]}
      />
      <Header />
      
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="mb-8">
          <ImageGallery galleryImages={college.gallery} collegeName={college.name} />
          
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold tracking-tight" data-testid="college-name">{college.name}</h1>
            <div className="flex items-center gap-2 text-[#002FA7]">
              <Star size={24} weight="fill" />
              <span className="text-2xl font-bold" data-testid="college-rating">{college.rating}</span>
              <span className="text-sm text-zinc-500">({college.reviews_count} reviews)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 mb-6">
            <MapPin size={20} weight="bold" />
            <span data-testid="college-location">{college.city}, {college.state}</span>
          </div>

          <div className="text-base text-zinc-700 mb-6 prose prose-sm max-w-none" data-testid="college-description">
            <ReactMarkdown>{college.description || ''}</ReactMarkdown>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {college.fees && (
              <div className="bg-zinc-50 border border-zinc-200 p-6">
                <div className="flex items-center gap-2 mb-2 text-[#002FA7]">
                  <Money size={24} weight="bold" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Fees</span>
                </div>
                <p className="text-lg font-bold" data-testid="college-fees">{college.fees}</p>
              </div>
            )}
            
            {college.admission_stats && (
              <div className="bg-zinc-50 border border-zinc-200 p-6">
                <div className="flex items-center gap-2 mb-2 text-[#002FA7]">
                  <GraduationCap size={24} weight="bold" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Admission</span>
                </div>
                <p className="text-lg font-bold" data-testid="college-admission">{college.admission_stats}</p>
              </div>
            )}
            
            {college.website && (
              <div className="bg-zinc-50 border border-zinc-200 p-6">
                <div className="flex items-center gap-2 mb-2 text-[#002FA7]">
                  <GlobeHemisphereWest size={24} weight="bold" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Website</span>
                </div>
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-[#002FA7] transition-colors" data-testid="college-website">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Courses */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Courses Offered</h3>
            <div className="flex flex-wrap gap-3">
              {college.courses.map((course, idx) => (
                <span key={idx} className="bg-[#002FA7] text-white px-4 py-2 text-sm font-bold" data-testid={`course-${idx}`}>
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-zinc-200 pt-8">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Reviews</h2>

          {/* Submit Review Form */}
          {user ? (
            <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              
              {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-4 text-sm" data-testid="review-error">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mb-4 text-sm" data-testid="review-success">{success}</div>}

              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    data-testid="review-rating-select"
                    className="bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    data-testid="review-comment-textarea"
                    required
                    rows={4}
                    className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                  />
                </div>
                <button type="submit" data-testid="submit-review-button" className="px-6 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none">
                  Submit Review
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8 text-center">
              <p className="mb-4">Please <Link to="/login" className="text-[#002FA7] font-bold hover:underline">login</Link> to write a review</p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-zinc-600" data-testid="no-reviews-message">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 p-6" data-testid={`review-${idx}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold">{review.author_name}</span>
                    <div className="flex items-center gap-1 text-[#002FA7]">
                      <Star size={16} weight="fill" />
                      <span className="text-sm font-bold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-zinc-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};