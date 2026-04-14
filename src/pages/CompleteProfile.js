import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone } from '@phosphor-icons/react';

export const CompleteProfile = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updatePhone } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.replace(/\s+/g, '').replace(/^(\+91)?/, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const result = await updatePhone(phone);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#002FA7] mx-auto mb-4 flex items-center justify-center">
            <Phone size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="complete-profile-heading">
            Complete Your Profile
          </h1>
          <p className="text-zinc-500">
            {user?.name ? `Welcome, ${user.name}!` : 'Welcome!'} Please add your phone number to continue.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6 text-sm" data-testid="phone-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Phone Number *</label>
            <div className="flex gap-0 border border-zinc-200">
              <div className="flex items-center px-4 bg-zinc-50 border-r border-zinc-200 text-sm font-bold text-zinc-600">
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="phone-input"
                required
                placeholder="9876543210"
                maxLength={15}
                className="flex-1 px-4 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-lg tracking-wider"
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2">Your phone number is required for personalized counseling</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="submit-phone-button"
            className="w-full px-6 py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors rounded-none disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to JEEcollege.com'}
          </button>
        </form>
      </div>
    </div>
  );
};
