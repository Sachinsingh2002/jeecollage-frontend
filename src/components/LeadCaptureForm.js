import React, { useState } from 'react';
import { UserPlus, Check } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COURSES = [
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "AI & Machine Learning",
  "Data Science",
  "Information Technology",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Other / Not Sure",
];

export const LeadCaptureForm = ({ source = "website", heading, subheading, compact = false }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', course_interested: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const phone = formData.phone.replace(/\s+/g, '');
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!formData.course_interested) {
      setError('Please select a course');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/leads`, { ...formData, phone, source });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className={`text-center ${compact ? 'py-8' : 'py-12'}`} data-testid="lead-form-success">
        <div className="w-14 h-14 bg-green-100 mx-auto mb-4 flex items-center justify-center">
          <Check size={28} weight="bold" className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p className="text-zinc-500 text-sm">Our team will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div data-testid="lead-capture-form">
      {heading && <h3 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold tracking-tight mb-1`}>{heading}</h3>}
      {subheading && <p className="text-sm text-zinc-500 mb-5">{subheading}</p>}

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 mb-4 text-sm" data-testid="lead-form-error">{error}</div>}

      <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
        <div className={compact ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1.5">Full Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
              placeholder="Your full name" data-testid="lead-name"
              className="w-full bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
          </div>
          <div className={compact ? '' : 'mt-0'}>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1.5">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
              placeholder="your@email.com" data-testid="lead-email"
              className="w-full bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
          </div>
        </div>

        <div className={compact ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1.5">Phone Number *</label>
            <div className="flex gap-0">
              <div className="flex items-center px-3 bg-zinc-100 border border-r-0 border-zinc-200 text-sm font-bold text-zinc-600">+91</div>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required
                placeholder="9876543210" maxLength={15} data-testid="lead-phone"
                className="flex-1 bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
            </div>
          </div>
          <div className={compact ? '' : 'mt-0'}>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-1.5">Course Interested In *</label>
            <select value={formData.course_interested} onChange={(e) => setFormData({...formData, course_interested: e.target.value})} required
              data-testid="lead-course"
              className="w-full bg-white border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]">
              <option value="">Select a course</option>
              {COURSES.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting} data-testid="lead-submit"
          className="w-full py-3.5 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <UserPlus size={18} weight="bold" />
          {submitting ? 'Submitting...' : 'Get Free Counseling'}
        </button>

        <p className="text-xs text-zinc-400 text-center">No spam. Your data is secure and will only be used for counseling purposes.</p>
      </form>
    </div>
  );
};
