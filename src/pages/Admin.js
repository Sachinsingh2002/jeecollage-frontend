import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Plus, UploadSimple } from '@phosphor-icons/react';
import { MarkdownEditor } from '../components/MarkdownEditor';
import axios from 'axios';
import { formatApiErrorDetail } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export const Admin = () => {
  const [name, setName] = useState('');
  const [state, setState] = useState(INDIAN_STATES[0]);
  const [city, setCity] = useState('');
  const [courses, setCourses] = useState('');
  const [fees, setFees] = useState('');
  const [admissionStats, setAdmissionStats] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (onSuccess) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        const { data } = await axios.post(`${API}/upload`, form, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onSuccess(`${BACKEND_URL}${data.url}`);
      } catch (err) {
        alert('Upload failed: ' + (err.response?.data?.detail || err.message));
      } finally { setUploading(false); }
    };
    input.click();
  };

  const addGalleryImage = () => {
    uploadImage((url) => setGalleryImages(prev => [...prev, url]));
  };

  const removeGalleryImage = (idx) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const coursesList = courses.split(',').map(c => c.trim()).filter(c => c);
      const mainImg = image || (galleryImages.length > 0 ? galleryImages[0] : 'https://images.unsplash.com/photo-1562774053-701939374585?w=800');
      const gallery = galleryImages.length > 0 ? galleryImages : [mainImg];

      await axios.post(`${API}/colleges`, {
        name, state, city, courses: coursesList,
        fees: fees || null, admission_stats: admissionStats || null,
        website: website || null, description: description || null,
        image: mainImg, gallery, rating: 0, reviews_count: 0
      }, { withCredentials: true });

      setSuccess('College added successfully!');
      setName(''); setCity(''); setCourses(''); setFees('');
      setAdmissionStats(''); setWebsite(''); setDescription('');
      setImage(''); setGalleryImages([]);
    } catch (error) {
      setError(formatApiErrorDetail(error.response?.data?.detail) || error.message);
    } finally { setLoading(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <div className="px-6 md:px-12 lg:px-24 py-8">
          <h1 className="text-4xl font-bold tracking-tight mb-8" data-testid="admin-heading">Add New College</h1>
          <div className="max-w-3xl">
            <div className="bg-zinc-50 border border-zinc-200 p-8">
              {error && <div data-testid="admin-error" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6 text-sm">{error}</div>}
              {success && <div data-testid="admin-success" className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mb-6 text-sm">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">College Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} data-testid="college-name-input" required
                      className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">State *</label>
                    <select value={state} onChange={(e) => setState(e.target.value)} data-testid="college-state-select"
                      className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]">
                      {INDIAN_STATES.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} data-testid="college-city-input" required
                      className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Fees</label>
                    <input type="text" value={fees} onChange={(e) => setFees(e.target.value)} data-testid="college-fees-input" placeholder="e.g. ₹2.5L/year"
                      className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Courses (comma separated) *</label>
                  <input type="text" value={courses} onChange={(e) => setCourses(e.target.value)} data-testid="college-courses-input" required placeholder="Computer Science, Engineering"
                    className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Admission Stats</label>
                  <input type="text" value={admissionStats} onChange={(e) => setAdmissionStats(e.target.value)} data-testid="college-admission-input" placeholder="e.g. JEE Advanced Required"
                    className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Website</label>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} data-testid="college-website-input" placeholder="https://example.com"
                    className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                </div>
                <div>
                  <MarkdownEditor label="Description" value={description} onChange={setDescription} rows={6} />
                </div>

                {/* Main Image with Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Main Image</label>
                  <div className="flex gap-3">
                    <input type="text" value={image} onChange={(e) => setImage(e.target.value)} data-testid="college-image-input" placeholder="Image URL or upload"
                      className="flex-1 bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    <button type="button" onClick={() => uploadImage(setImage)} disabled={uploading}
                      className="px-4 py-3 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 flex items-center gap-2 text-sm font-bold disabled:opacity-50" data-testid="upload-main-image">
                      <UploadSimple size={16} weight="bold" /> {uploading ? '...' : 'Upload'}
                    </button>
                  </div>
                  {image && <img src={image} alt="Preview" className="mt-2 h-24 w-auto border border-zinc-200" />}
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Gallery Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-24 h-16 object-cover border border-zinc-200" />
                        <button type="button" onClick={() => removeGalleryImage(idx)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`remove-gallery-${idx}`}>
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addGalleryImage} disabled={uploading || galleryImages.length >= 6}
                    className="px-4 py-2 border border-zinc-300 text-sm font-bold hover:bg-zinc-100 flex items-center gap-2 disabled:opacity-50" data-testid="add-gallery-image">
                    <Plus size={14} weight="bold" /> Add Gallery Image ({galleryImages.length}/6)
                  </button>
                </div>

                <button type="submit" disabled={loading} data-testid="submit-college-button"
                  className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none disabled:opacity-50 flex items-center gap-2">
                  <Plus size={20} weight="bold" />
                  {loading ? 'Adding College...' : 'Add College'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
