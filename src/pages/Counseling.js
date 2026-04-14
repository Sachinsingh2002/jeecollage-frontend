import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import {
  GraduationCap, ChartLineUp, Scales, Target, Headset,
  Check, ArrowRight, Star, ShieldCheck, Phone, CurrencyInr,
  Users, TrendUp, Certificate, Lightning, LinkedinLogo, Buildings, Crown
} from '@phosphor-icons/react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PLANS = [
  {
    id: 'basic',
    name: 'JEE Starter',
    price: '1,000',
    priceNum: 1000,
    tag: '',
    features: [
      'Branch selection guidance based on your rank',
      'Top 10 college recommendations',
      'Cutoff analysis for your category',
      '1 phone consultation (30 min)',
      'Email support for 7 days',
    ],
    notIncluded: [
      'Detailed placement forecast',
      'College choice optimization',
      'JoSAA/CSAB round-wise strategy',
    ]
  },
  {
    id: 'premium',
    name: 'JEE Premium',
    price: '1,500',
    priceNum: 1500,
    tag: 'Most Popular',
    features: [
      'Everything in JEE Starter',
      'Detailed placement forecast with salary data',
      'College choice optimization (up to 20 choices)',
      'Branch vs College trade-off analysis',
      '2 phone consultations (45 min each)',
      'WhatsApp support for 15 days',
      'JoSAA round-wise choice filling strategy',
    ],
    notIncluded: [
      'Live counselling day support',
    ]
  },
  {
    id: 'elite',
    name: 'JEE Elite',
    price: '2,000',
    priceNum: 2000,
    tag: 'Best Value',
    features: [
      'Everything in JEE Premium',
      'Complete JoSAA/CSAB counselling support',
      'Live support during each counselling round',
      'College comparison report (PDF)',
      'Post-admission guidance (hostel, prep tips)',
      'Unlimited consultations for 30 days',
      'Priority WhatsApp support',
      'Money-back guarantee if unsatisfied',
    ],
    notIncluded: []
  }
];

const SERVICES = [
  { icon: Target, title: 'Branch Selection Guidance', desc: 'Data-driven advice on which branch to choose based on your rank, interests, and career goals. We analyze 200+ colleges to find your sweet spot.' },
  { icon: ChartLineUp, title: 'Placement Forecast', desc: 'Real placement data from previous years — average packages, top recruiters, branch-wise placement rates. Know exactly what to expect.' },
  { icon: Scales, title: 'College Choice Optimization', desc: 'Rank-optimized choice filling for JoSAA/CSAB. We help you order your choices to maximize your chance of getting the best possible college.' },
  { icon: GraduationCap, title: 'College Comparison', desc: 'Side-by-side comparison of your shortlisted colleges — placements, fees, campus life, alumni network, location. Make the right call.' },
  { icon: Headset, title: 'JEE Counselling Support', desc: 'Live support during JoSAA/CSAB counselling rounds. We guide you through seat allotment, upgrades, and spot round decisions in real-time.' },
];

const STATS = [
  { value: '2,500+', label: 'Students Guided' },
  { value: '150+', label: 'Industry Leaders' },
  { value: '200+', label: 'Colleges Covered' },
  { value: '95%', label: 'Satisfaction Rate' },
];

const CORE_TEAM = [
  {
    name: 'Tarun Kamal',
    role: 'Founder',
    title: 'CEO, Galleon Consultants',
    linkedin: 'https://www.linkedin.com/in/tarunkamal/',
    bio: 'Serial entrepreneur and education strategist based in Bengaluru. Leads the vision of making data-driven college counseling accessible to every JEE aspirant across India.',
    initials: 'TK',
    image: 'https://customer-assets.emergentagent.com/job_collegelocator-india/artifacts/s6o505ib_tarun%20kamal.jfif',
  },
  {
    name: 'Navneet Kapoor',
    role: 'Chief Mentor',
    title: 'EVP & CTIO, A.P. Moller-Maersk',
    linkedin: 'https://www.linkedin.com/in/kapoornavneet/',
    bio: 'Global technology leader passionate about mentoring the next generation. Brings decades of experience in digital transformation, leadership development, and strategic planning.',
    initials: 'NK',
    image: 'https://customer-assets.emergentagent.com/job_collegelocator-india/artifacts/kzbi17cb_navneet%20kapoor.jfif',
  },
  {
    name: 'Sonam Choudhary',
    role: 'Mentor & Strategy Head',
    title: 'IIM Ahmedabad Alumna | Ex-Tata Motors',
    linkedin: 'https://www.linkedin.com/in/choudharysonam/',
    bio: 'Edtech entrepreneur and IIM Ahmedabad alumna. Former international business manager at Tata Motors. Drives strategy and student success programs with deep expertise in education and career planning.',
    initials: 'SC',
    image: 'https://customer-assets.emergentagent.com/job_collegelocator-india/artifacts/k7ecjc7r_sonam%20choudhary.jfif',
  }
];

const INDUSTRY_ROLES = [
  'Vice President', 'AVP', 'CEO', 'CFO', 'CTO',
  'Finance Director', 'Engineering Director', 'CBO',
  'Product Head', 'Senior Director', 'Managing Director',
  'Principal Architect', 'VP Engineering', 'Chief Data Officer',
  'Head of Strategy',
];

const INDUSTRY_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'JP Morgan',
  'Infosys', 'TCS', 'Wipro', 'Deloitte', 'McKinsey',
  'BCG', 'Flipkart', 'Razorpay', 'PhonePe', 'HDFC Bank',
  'Maersk', 'Tata Motors', 'L&T', 'Reliance', 'Accenture',
  'IBM', 'Oracle', 'SAP', 'Adobe', 'Samsung',
  'Uber', 'Ola', 'Zomato', 'Swiggy', 'Paytm',
];

export const Counseling = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', jee_rank: '', preferred_branches: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedPlan) { setError('Please select a plan'); return; }
    setError('');
    setSubmitting(true);
    try {
      // Step 1: Create booking
      const bookingRes = await axios.post(`${API}/counseling/book`, {
        plan: selectedPlan,
        name: formData.name || user.name,
        email: formData.email || user.email,
        phone: formData.phone,
        jee_rank: formData.jee_rank ? parseInt(formData.jee_rank) : null,
        preferred_branches: formData.preferred_branches || null,
        message: formData.message || null,
      }, { withCredentials: true });

      const bookingId = bookingRes.data.booking_id;

      // Step 2: Create Stripe checkout session
      const { data } = await axios.post(`${API}/payments/create-checkout`, {
        plan: selectedPlan,
        origin_url: window.location.origin,
        booking_id: bookingId,
      }, { withCredentials: true });

      // Step 3: Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment setup failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const counselingJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "JEE College Counseling Services",
    "description": "Expert JEE counselling — branch selection, placement forecast, choice optimization. Rs 1000-2000.",
    "provider": { "@type": "Organization", "name": "JEEcollege.com" },
    "offers": [
      { "@type": "Offer", "name": "JEE Starter", "price": "1000", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "JEE Premium", "price": "1500", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "JEE Elite", "price": "2000", "priceCurrency": "INR" },
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="College Counseling Services — Expert JEE Guidance"
        description="Expert JEE counselling services: branch selection, real placement data forecast, college choice optimization, JoSAA support. Rs 1000-2000 per student."
        keywords="JEE counseling, college counseling, JEE admission guidance, JoSAA counselling, branch selection help, JEE college choice"
        jsonLd={counselingJsonLd}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Counseling Services" }]}
      />
      <Header />

      {/* Hero */}
      <section className="bg-[#09090B] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-[#002FA7] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#002FA7] rounded-full blur-[100px]"></div>
        </div>
        <div className="relative px-6 md:px-12 lg:px-24 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-zinc-700 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <Lightning size={14} weight="fill" className="text-[#002FA7]" />
              Personalized 1-on-1 Counseling
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] mb-6" data-testid="counseling-heading">
              Don't Leave Your <span className="text-[#002FA7]">Future</span> to Chance
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl">
              150+ industry leaders — VPs, CEOs, CFOs, Directors from Google, Microsoft, Goldman Sachs, Maersk & more — volunteer to guide you to the right college and branch.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#pricing">
                <button className="px-8 py-4 bg-[#002FA7] text-white font-bold hover:bg-blue-800 transition-colors flex items-center gap-2" data-testid="hero-cta">
                  View Plans <ArrowRight size={20} weight="bold" />
                </button>
              </a>
              <div className="flex items-center gap-2 text-zinc-500">
                <CurrencyInr size={20} weight="bold" />
                <span className="text-sm font-bold">Starting at just <span className="text-white">Rs 1,000</span></span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-zinc-800">
            {STATS.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-black text-[#002FA7]">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="px-6 md:px-12 lg:px-24 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">What We Offer</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Comprehensive counseling backed by real data from 200+ engineering colleges</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div key={idx} className="border border-zinc-200 p-8 brutalist-card" data-testid={`service-card-${idx}`}>
                <div className="w-12 h-12 bg-[#002FA7] flex items-center justify-center mb-4">
                  <Icon size={24} weight="bold" className="text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{svc.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{svc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Leadership Team */}
      <section className="px-6 md:px-12 lg:px-24 py-16 bg-[#09090B] text-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 border border-zinc-700 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            <Crown size={14} weight="fill" className="text-[#002FA7]" />
            Leadership
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Meet the Core Team</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Led by industry veterans who've been in your shoes — and now guide thousands of students to their dream colleges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {CORE_TEAM.map((member, idx) => (
            <div key={idx} className="border border-zinc-800 p-8 text-center relative group hover:border-[#002FA7] transition-colors" data-testid={`core-team-${idx}`}>
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-24 h-24 mx-auto mb-5 object-cover rounded-full border-2 border-zinc-700 group-hover:border-[#002FA7] transition-colors" />
              ) : (
                <div className="w-24 h-24 mx-auto mb-5 bg-[#002FA7] flex items-center justify-center text-2xl font-black text-white rounded-full">
                  {member.initials}
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#002FA7] mb-2">{member.role}</div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-zinc-400 mb-4">{member.title}</p>
              <p className="text-sm text-zinc-500 leading-relaxed mb-5">{member.bio}</p>
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-[#0A66C2] transition-colors" data-testid={`linkedin-${idx}`}>
                <LinkedinLogo size={20} weight="bold" />
                Connect on LinkedIn
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 150+ Industry Leaders */}
      <section className="px-6 md:px-12 lg:px-24 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Backed by <span className="text-[#002FA7]">150+</span> Industry Leaders
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Our mentors are Vice Presidents, AVPs, CEOs, CFOs, Finance Directors, Engineering Directors, and CBOs from India's top companies. They volunteer their time to guide students like you.
          </p>
        </div>

        {/* Role Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {INDUSTRY_ROLES.map((role, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2 brutalist-card">
              <Buildings size={16} weight="bold" className="text-[#002FA7]" />
              <span className="text-sm font-bold">{role}</span>
            </div>
          ))}
        </div>

        {/* Company Logos Grid */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Mentors from companies including</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {INDUSTRY_COMPANIES.map((company, idx) => (
            <div key={idx} className="px-5 py-3 bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-600 hover:border-[#002FA7] hover:text-[#002FA7] transition-colors" data-testid={`company-${idx}`}>
              {company}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-zinc-500 text-sm">...and leaders from 120+ more companies across India and globally</p>
        </div>
      </section>

      {/* Quick Enquiry Form */}
      <section className="px-6 md:px-12 lg:px-24 py-16 bg-[#002FA7]" id="enquiry">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-white">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Not Sure Where to Start?</h2>
            <p className="text-blue-200 leading-relaxed mb-6">
              Tell us about yourself and a counselor matched to your interests will call you back within 24 hours. No commitments.
            </p>
            <div className="space-y-3 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Check size={16} weight="bold" /> Free initial consultation
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} weight="bold" /> Matched with an industry expert
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} weight="bold" /> No payment required to register
              </div>
            </div>
          </div>
          <div className="bg-white p-8" data-testid="counseling-lead-form">
            <LeadCaptureForm source="counseling" heading="Quick Enquiry" subheading="Our counselor will reach out to you within 24 hours" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-12 lg:px-24 py-16 bg-zinc-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Choose Your Plan</h2>
          <p className="text-zinc-500">One-time payment. No hidden charges. Results guaranteed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`bg-white border-2 p-8 flex flex-col relative transition-all ${
                selectedPlan === plan.id ? 'border-[#002FA7] shadow-lg' : plan.tag === 'Most Popular' ? 'border-[#002FA7]' : 'border-zinc-200'
              }`}
              data-testid={`plan-${plan.id}`}
            >
              {plan.tag && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#002FA7] text-white text-xs font-bold uppercase tracking-[0.2em]">
                  {plan.tag}
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-xs text-zinc-500">Rs</span>
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-sm text-zinc-500">/ student</span>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={16} weight="bold" className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 opacity-40">
                    <span className="w-4 h-4 flex items-center justify-center text-zinc-400 flex-shrink-0 mt-0.5">—</span>
                    <span className="text-sm line-through">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                data-testid={`select-plan-${plan.id}`}
                className={`w-full py-3 font-bold transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-[#002FA7] text-white'
                    : 'bg-white text-[#002FA7] border-2 border-[#002FA7] hover:bg-[#002FA7] hover:text-white'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-16" data-testid="booking-success">
              <div className="w-20 h-20 bg-green-100 mx-auto mb-6 flex items-center justify-center">
                <ShieldCheck size={40} weight="bold" className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Booking Confirmed!</h2>
              <p className="text-zinc-500 mb-2">Our counselor will contact you within 24 hours.</p>
              <p className="text-sm text-zinc-400 mb-8">Plan: <strong>{PLANS.find(p => p.id === selectedPlan)?.name}</strong></p>
              <Link to="/colleges">
                <button className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors">
                  Explore Colleges While You Wait
                </button>
              </Link>
            </div>
          ) : (
            <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Book Your Session</h2>
              <p className="text-zinc-500">Fill in your details and we'll get back within 24 hours</p>
            </div>

            {!user && (
              <div className="bg-zinc-50 border border-zinc-200 p-8 text-center mb-8" data-testid="counseling-login-gate">
                <Users size={40} weight="thin" className="mx-auto text-zinc-300 mb-3" />
                <h3 className="text-xl font-bold mb-2">Sign in to book</h3>
                <p className="text-zinc-500 mb-4">Create a free account to book your counseling session</p>
                <Link to="/login">
                  <button className="px-8 py-3 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors" data-testid="counseling-signin">
                    Sign In / Create Account
                  </button>
                </Link>
              </div>
            )}

            {user && (
              <div className="border border-zinc-200 p-8" data-testid="booking-form">
                {!selectedPlan && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 mb-6 text-sm" data-testid="select-plan-warning">
                    Please <a href="#pricing" className="font-bold underline">select a plan</a> above first
                  </div>
                )}

                {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-6 text-sm" data-testid="booking-error">{error}</div>}

                <form onSubmit={handleBooking} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
                        placeholder={user.name || ''} data-testid="booking-name"
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Email *</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required
                        placeholder={user.email || ''} data-testid="booking-email"
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Phone Number *</label>
                      <div className="flex gap-0">
                        <div className="flex items-center px-3 bg-zinc-100 border border-r-0 border-zinc-200 text-sm font-bold text-zinc-600">+91</div>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required
                          placeholder="9876543210" data-testid="booking-phone"
                          className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">JEE Rank (if available)</label>
                      <input type="number" value={formData.jee_rank} onChange={(e) => setFormData({...formData, jee_rank: e.target.value})}
                        placeholder="e.g. 5000" data-testid="booking-rank"
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Preferred Branches</label>
                    <input type="text" value={formData.preferred_branches} onChange={(e) => setFormData({...formData, preferred_branches: e.target.value})}
                      placeholder="e.g. Computer Science, Electronics" data-testid="booking-branches"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-2">Anything else we should know?</label>
                    <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={3}
                      placeholder="Your specific concerns, state quota preference, etc." data-testid="booking-message"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" />
                  </div>

                  {selectedPlan && (
                    <div className="bg-zinc-50 border border-zinc-200 p-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Selected Plan</span>
                        <div className="text-lg font-bold">{PLANS.find(p => p.id === selectedPlan)?.name}</div>
                      </div>
                      <div className="text-2xl font-black text-[#002FA7]">Rs {PLANS.find(p => p.id === selectedPlan)?.price}</div>
                    </div>
                  )}

                  <button type="submit" disabled={submitting || !selectedPlan} data-testid="submit-booking"
                    className="w-full py-4 bg-[#002FA7] text-white font-bold hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                    <Phone size={20} weight="bold" />
                    {submitting ? 'Submitting...' : 'Book Counseling Session'}
                  </button>

                  <p className="text-xs text-zinc-400 text-center">
                    Payment will be collected after confirmation call. 100% refund if not satisfied.
                  </p>
                </form>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-6 md:px-12 lg:px-24 py-16 bg-[#09090B] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Why Students Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Certificate size={32} weight="bold" className="mx-auto text-[#002FA7] mb-3" />
              <h3 className="font-bold mb-1">Data-Driven</h3>
              <p className="text-sm text-zinc-400">Every recommendation backed by real placement data from 200+ colleges</p>
            </div>
            <div>
              <Users size={32} weight="bold" className="mx-auto text-[#002FA7] mb-3" />
              <h3 className="font-bold mb-1">Expert Counselors</h3>
              <p className="text-sm text-zinc-400">IIT/NIT alumni with years of counselling experience</p>
            </div>
            <div>
              <ShieldCheck size={32} weight="bold" className="mx-auto text-[#002FA7] mb-3" />
              <h3 className="font-bold mb-1">Money-Back Guarantee</h3>
              <p className="text-sm text-zinc-400">100% refund if you're not satisfied with our guidance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
