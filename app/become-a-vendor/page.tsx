'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  Package,
  BarChart3,
  Headphones,
  ShoppingBag,
  Shield,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { authApi } from '@/lib/api';
import { vendorApi } from '@/lib/api-vendor';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import TypingText from '@/components/TypingText';
import FadeInSection from '@/components/FadeInSection';

import 'react-phone-number-input/style.css';

const benefits = [
  {
    icon: ShoppingBag,
    title: 'Reach Active Shoppers',
    desc: 'Connect with thousands of buyers across Nigeria browsing fashion, crafts, beauty, food, electronics, and more.',
    accent: 'bg-brand-50 text-brand-600 border-brand-100',
  },
  {
    icon: Clock,
    title: 'Get Paid Rapidly',
    desc: 'Withdraw store earnings straight to your Nigerian bank account with secure, reliable weekly payout cycles.',
    accent: 'bg-brand-50 text-brand-600 border-brand-100',
  },
  {
    icon: Package,
    title: 'Zero Startup Fee',
    desc: 'Create your profile and list products completely free. We only charge a small commission per completed sale.',
    accent: 'bg-brand-50 text-brand-600 border-brand-100',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Transactions',
    desc: 'Every checkout uses premium fraud-protection filters. Your store data and customers are fully protected.',
    accent: 'bg-brand-50 text-brand-600 border-brand-100',
  },
];

const steps = [
  { step: '01', title: 'Create Your Store Profile', desc: 'Set your store name, contact info, and choose your vendor type.' },
  { step: '02', title: 'Verify Your Identity', desc: 'Submit personal details and upload required government-issued documents.' },
  { step: '03', title: 'Link Your Bank Account', desc: 'Connect your Nigerian bank account securely for weekly payouts.' },
  { step: '04', title: 'Start Selling', desc: 'List your products and reach thousands of active Faflora buyers.' },
];

export default function BecomeAVendorPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showAuthSection, setShowAuthSection] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleStartSellingClick = async () => {
    if (!isAuthenticated) {
      setShowAuthSection(true);
      setTimeout(() => {
        const section = document.getElementById('auth-anchor');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    setCheckingStatus(true);
    try {
      const res = await vendorApi.getApplicationStatus();
      if (res.success && res.data) {
        const app = res.data;
        if (app.status === 'draft' || !app.vendorType) {
          router.push('/vendor/apply');
        } else {
          router.push('/vendor/application/status');
        }
      } else {
        router.push('/vendor/apply');
      }
    } catch {
      router.push('/vendor/apply');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error('Please enter all fields'); return; }
    setLoginLoading(true);
    try {
      const response = await authApi.login({ email: loginEmail, password: loginPassword });
      dispatch(setCredentials({
        user: response?.data.user,
        accessToken: response?.data.accessToken,
        refreshToken: response?.data.refreshToken,
      }));
      toast.success('Welcome back! Redirecting to application...');
      const statusRes = await vendorApi.getApplicationStatus();
      if (statusRes.success && statusRes.data && statusRes.data.vendorType) {
        router.push('/vendor/application/status');
      } else {
        router.push('/vendor/apply');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regPhone) {
      toast.error('All fields are required'); return;
    }
    if (regPassword !== regConfirmPassword) { toast.error('Passwords do not match'); return; }
    if (regPhone && !isValidPhoneNumber(regPhone)) { toast.error('Please enter a valid phone number'); return; }

    setRegLoading(true);
    try {
      await authApi.register({ firstName: regFirstName, lastName: regLastName, email: regEmail, password: regPassword, phoneNumber: regPhone });
      toast.success('Account created! Signing you in...');
      const loginResponse = await authApi.login({ email: regEmail, password: regPassword });
      dispatch(setCredentials({
        user: loginResponse?.data.user,
        accessToken: loginResponse?.data.accessToken,
        refreshToken: loginResponse?.data.refreshToken,
      }));
      router.push('/vendor/apply');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">

      {/* ── HERO ── */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-brand-950 via-brand-800 to-brand-950 text-white overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center relative z-10">
          <div className="md:col-span-7 space-y-7">

            <FadeInSection type="fadeDown" delay={0.05}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700/50 border border-brand-500/20 rounded-full text-xs font-bold text-brand-200 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent-amber" aria-hidden="true" />
                Faflora Vendor Program — Nigeria's #1 Multi-Vendor Marketplace
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.15}>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                <span className="block">Grow Your Business.</span>
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-accent-teal">
                  <TypingText
                    texts={['Sell on Faflora.', 'Reach New Buyers.', 'Scale Across Nigeria.']}
                    typingSpeed={65}
                    deleteSpeed={40}
                    delayBetween={2200}
                    colorClass=""
                    keepCursorFlashing
                    disableCursorOnMobile={false}
                  />
                </span>
              </h1>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.25}>
              <p className="text-base md:text-lg text-brand-100/90 max-w-xl font-medium leading-relaxed">
                Join Nigeria's fastest-growing multi-vendor marketplace with over 30+ categories including fresh flowers, custom gift boxes, cakes, perfumes, fashion, and tech accessories. Connect with thousands of shoppers searching for quality products.
              </p>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.35}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleStartSellingClick}
                  disabled={checkingStatus}
                  className="inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-brand-950/30 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {checkingStatus ? 'Checking Application...' : 'Start Selling Now'}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <a
                  href="#learn-more"
                  className="inline-flex items-center justify-center border border-brand-400/30 hover:border-brand-300/60 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all backdrop-blur-sm"
                >
                  Learn More
                </a>
              </div>
            </FadeInSection>

            <FadeInSection type="fadeUp" delay={0.45}>
              <div className="flex flex-wrap gap-6 pt-2">
                {['Free to register', 'Weekly payouts', 'No hidden fees', '24/7 Support'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-brand-200">
                    <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>

          {/* Right panel */}
          <div className="md:col-span-5 relative hidden md:block">
            <FadeInSection type="slideRight" delay={0.3}>
              <div className="absolute -inset-3 bg-gradient-to-r from-brand-500/20 to-accent-teal/20 rounded-3xl blur-xl" aria-hidden="true" />
              <div className="relative bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                  <div>
                    <h2 className="font-extrabold text-lg text-white">Vendor Portal</h2>
                    <p className="text-xs text-brand-300">Application Preview</p>
                  </div>
                  <Store className="w-8 h-8 text-accent-teal" aria-hidden="true" />
                </div>

                <div className="space-y-5">
                  {[
                    { label: '1. Store Profile Setup', status: '100% Ready', color: 'text-green-400', width: '100%' },
                    { label: '2. Identity Verification', status: 'Fully Secure', color: 'text-accent-teal', width: '100%' },
                    { label: '3. Document Upload', status: 'Awaiting', color: 'text-brand-300', width: '65%' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-brand-200">{item.label}</span>
                        <span className={`${item.color} font-bold text-xs`}>{item.status}</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-accent-teal to-brand-400 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: item.width }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.2, ease: 'easeOut' }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status section info container removed as requested */}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="learn-more" className="py-24 max-w-7xl mx-auto px-6" aria-labelledby="benefits-heading">
        <FadeInSection type="fadeUp" delay={0.05}>
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-bold text-brand-600 uppercase tracking-widest">
              Why Choose Faflora
            </div>
            <h2 id="benefits-heading" className="text-3xl md:text-4xl font-extrabold text-brand-800 tracking-tight">
              Why Sell on Faflora?
            </h2>
            <p className="text-brand-700 font-medium leading-relaxed">
              We provide the technology, logistics tools, and customer base so you can focus entirely on delivering great products.
            </p>
          </div>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <FadeInSection key={i} type="fadeUp" delay={0.05 + i * 0.1}>
                <div className="bg-white border border-brand-100 rounded-2xl p-6 hover:shadow-xl hover:border-brand-200 transition-all duration-300 group h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${b.accent} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-extrabold text-base text-brand-800 mb-2">{b.title}</h3>
                  <p className="text-sm text-brand-700 leading-relaxed">{b.desc}</p>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-gradient-to-br from-brand-50/60 to-white border-y border-brand-100" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection type="fadeUp" delay={0.05}>
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-bold text-brand-600 uppercase tracking-widest">
                Simple by Design
              </div>
              <h2 id="how-heading" className="text-3xl md:text-4xl font-extrabold text-brand-800 tracking-tight">
                Get Started in 4 Steps
              </h2>
              <p className="text-brand-700 font-medium">The entire onboarding process takes less than 10 minutes to complete.</p>
            </div>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <FadeInSection key={i} type="fadeUp" delay={0.1 + i * 0.1}>
                <div className="relative bg-white border border-brand-100 rounded-2xl p-6 hover:shadow-lg hover:border-brand-200 transition-all duration-300 group h-full">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 z-10" aria-hidden="true">
                      <ArrowRight className="w-5 h-5 text-brand-200" />
                    </div>
                  )}
                  <div className="text-4xl font-black text-brand-100 group-hover:text-brand-200 transition-colors mb-4 leading-none">{s.step}</div>
                  <h3 className="font-extrabold text-sm text-brand-800 mb-2">{s.title}</h3>
                  <p className="text-xs text-brand-700 leading-relaxed">{s.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES STRIP ── */}
      <FadeInSection type="fadeUp" delay={0.05}>
        <section className="py-12 max-w-5xl mx-auto px-6 text-center" aria-label="Product categories">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6">Sell across all categories</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Flowers & Floristry', 'Gift Boxes & Hampers', 'Cakes & Confectioneries', 'Perfumes & Cosmetics', 'Fashion & Apparel', 'Phones & Tech Accessories', 'Handmade Crafts', 'Jewelry & Watches', 'Art & Decor', 'Books & Stationery'].map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold rounded-full hover:bg-brand-100 hover:border-brand-200 transition-colors"
              >
                {cat}
              </span>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* ── CTA BANNER ── */}
      <FadeInSection type="zoom" delay={0.1}>
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700 text-white px-8 md:px-16 py-14 text-center shadow-2xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent-teal/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="relative space-y-6">
                <div className="w-14 h-14 mx-auto bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
                  <Store className="w-7 h-7 text-accent-teal" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                  Ready to Start Selling?
                </h2>
                <p className="text-brand-200 max-w-lg mx-auto text-sm md:text-base font-medium leading-relaxed">
                  Join hundreds of verified vendors already growing their businesses on Nigeria's most diverse multi-category marketplace.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                  <button
                    onClick={handleStartSellingClick}
                    disabled={checkingStatus}
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] text-sm disabled:opacity-60"
                  >
                    {checkingStatus ? 'Loading...' : 'Apply as a Vendor'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <a
                    href="mailto:vendors@faflora.com"
                    className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all text-sm"
                  >
                    <Mail size={16} aria-hidden="true" />
                    Contact Vendor Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── INLINE AUTH ── */}
      <div id="auth-anchor" />
      <AnimatePresence>
        {(!isAuthenticated || showAuthSection) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="py-16 bg-brand-50 border-t border-brand-100"
            aria-label="Authentication"
          >
            <div className="max-w-lg mx-auto px-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-extrabold text-brand-800">Sign in or create account to apply</h2>
                <p className="text-sm text-brand-700 mt-1">You need a Faflora account to start your vendor application.</p>
              </div>
              <div className="bg-white border border-brand-100 rounded-2xl shadow-xl p-8">
                <div className="flex border-b border-brand-100 mb-6" role="tablist" aria-label="Authentication options">
                  {(['login', 'register'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={authTab === tab}
                      onClick={() => setAuthTab(tab)}
                      className={`flex-1 pb-4 text-center font-bold text-sm border-b-2 transition-all ${
                        authTab === tab
                          ? 'border-brand-600 text-brand-600'
                          : 'border-transparent text-brand-400 hover:text-brand-600'
                      }`}
                    >
                      {tab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {authTab === 'login' ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-4"
                      aria-label="Sign in form"
                    >
                      <h3 className="text-base font-extrabold text-brand-800">Sign in to continue</h3>
                      <div>
                        <label htmlFor="login-email" className="block text-xs font-semibold text-brand-700 mb-1.5">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" aria-hidden="true" />
                          <input
                            id="login-email"
                            type="email" required placeholder="you@example.com"
                            value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="login-password" className="block text-xs font-semibold text-brand-700 mb-1.5">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" aria-hidden="true" />
                          <input
                            id="login-password"
                            type="password" required placeholder="••••••••"
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit" disabled={loginLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 disabled:opacity-50 text-sm"
                      >
                        {loginLoading ? 'Signing in...' : 'Sign In and Continue'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegisterSubmit}
                      className="space-y-4"
                      aria-label="Create account form"
                    >
                      <h3 className="text-base font-extrabold text-brand-800">Create your vendor account</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="reg-first" className="block text-xs font-semibold text-brand-700 mb-1.5">First Name</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" aria-hidden="true" />
                            <input id="reg-first" type="text" required placeholder="John" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)}
                              className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="reg-last" className="block text-xs font-semibold text-brand-700 mb-1.5">Last Name</label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" aria-hidden="true" />
                            <input id="reg-last" type="text" required placeholder="Doe" value={regLastName} onChange={(e) => setRegLastName(e.target.value)}
                              className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="reg-email" className="block text-xs font-semibold text-brand-700 mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-400" aria-hidden="true" />
                          <input id="reg-email" type="email" required placeholder="vendor@company.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="reg-phone" className="block text-xs font-semibold text-brand-700">Phone number</label>
                        <PhoneInput
                          value={regPhone} onChange={(val) => setRegPhone(val || '')}
                          defaultCountry="NG" international countryCallingCodeEditable={false}
                          placeholder="Enter phone number"
                          className="phone-number-input rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm focus-within:ring-2 focus-within:ring-brand-600/20 focus-within:border-brand-600 transition-all duration-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="reg-pass" className="block text-xs font-semibold text-brand-700 mb-1.5">Password</label>
                          <input id="reg-pass" type="password" required placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                        </div>
                        <div>
                          <label htmlFor="reg-confirm" className="block text-xs font-semibold text-brand-700 mb-1.5">Confirm</label>
                          <input id="reg-confirm" type="password" required placeholder="Confirm" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full bg-white border border-brand-200 hover:border-brand-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 rounded-xl px-4 py-2.5 text-sm transition-all outline-none" />
                        </div>
                      </div>
                      <button
                        type="submit" disabled={regLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 disabled:opacity-50 text-sm"
                      >
                        {regLoading ? 'Creating account...' : 'Create Account & Continue'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── FOOTER SUPPORT BANNER ── */}
      <footer className="bg-brand-950 text-brand-300 py-16" aria-label="Support contact">
        <div className="max-w-5xl mx-auto px-6">
          <FadeInSection type="fadeUp" delay={0.05}>
            <div className="text-center mb-12 space-y-3">
              <Store className="w-10 h-10 text-brand-400 mx-auto" aria-hidden="true" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Need help with your application?</h2>
              <p className="max-w-lg mx-auto text-sm text-brand-400 leading-relaxed">
                Our onboarding team is available to help with required documentation, BVN verification, and business setup.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Phone, label: 'WhatsApp / Call', value: '09069910407', href: 'tel:09069910407' },
                { icon: Mail, label: 'Email Support', value: 'vendors@faflora.com', href: 'mailto:vendors@faflora.com' },
                { icon: Headphones, label: 'Live Chat', value: 'Available 9am – 6pm', href: '#' },
              ].map((contact, i) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={i}
                    href={contact.href}
                    className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group text-center"
                    aria-label={`${contact.label}: ${contact.value}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                      <Icon className="w-5 h-5 text-brand-300" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-brand-500 text-xs font-medium">{contact.label}</p>
                      <p className="text-white font-extrabold text-sm mt-1">{contact.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </FadeInSection>
        </div>
      </footer>
    </div>
  );
}
