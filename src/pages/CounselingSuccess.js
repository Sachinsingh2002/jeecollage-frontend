import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { ShieldCheck, Spinner, Warning } from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CounselingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollStatus(sessionId, 0);
    } else {
      setStatus('error');
    }
  }, []);

  const pollStatus = async (sessionId, attempt) => {
    if (attempt >= 6) { setStatus('timeout'); return; }
    try {
      const { data } = await axios.get(`${API}/payments/status/${sessionId}`, { withCredentials: true });
      setPaymentData(data);
      if (data.payment_status === 'paid') {
        setStatus('paid');
      } else if (data.status === 'expired') {
        setStatus('expired');
      } else {
        setTimeout(() => pollStatus(sessionId, attempt + 1), 2000);
      }
    } catch (e) {
      if (attempt < 5) setTimeout(() => pollStatus(sessionId, attempt + 1), 2000);
      else setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-lg mx-auto text-center">
          {status === 'checking' && (
            <div data-testid="payment-checking">
              <div className="w-16 h-16 border-4 border-[#002FA7] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
              <p className="text-zinc-500">Please wait while we confirm your payment.</p>
            </div>
          )}

          {status === 'paid' && (
            <div data-testid="payment-success">
              <div className="w-20 h-20 bg-green-100 mx-auto mb-6 flex items-center justify-center">
                <ShieldCheck size={40} weight="bold" className="text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
              <p className="text-zinc-500 mb-2">Your counseling session has been booked.</p>
              <p className="text-sm text-zinc-400 mb-8">Our counselor will contact you within 24 hours.</p>
              {paymentData && (
                <div className="bg-zinc-50 border border-zinc-200 p-4 mb-8 text-sm text-left">
                  <div className="flex justify-between mb-2"><span className="text-zinc-500">Amount</span><span className="font-bold">Rs {(paymentData.amount / 100).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Status</span><span className="font-bold text-green-600">Paid</span></div>
                </div>
              )}
              <Link to="/colleges">
                <button className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors">
                  Explore Colleges
                </button>
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'timeout' || status === 'expired') && (
            <div data-testid="payment-error">
              <div className="w-20 h-20 bg-red-100 mx-auto mb-6 flex items-center justify-center">
                <Warning size={40} weight="bold" className="text-red-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{status === 'expired' ? 'Payment Expired' : 'Payment Issue'}</h1>
              <p className="text-zinc-500 mb-8">{status === 'expired' ? 'Your payment session expired.' : 'We could not verify your payment. Please try again or contact support.'}</p>
              <Link to="/counseling">
                <button className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors">Try Again</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
