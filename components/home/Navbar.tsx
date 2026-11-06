'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { categoryApi, authApi } from '@/lib/api';
import { fetchWishlistCount } from '@/lib/features/wishlist/wishlistSlice';
import { fetchCartCount, fetchCart } from '@/lib/features/cart/cartSlice';
import { setUser } from '@/lib/features/auth/authSlice';

import { departments, departmentSlug } from '@/lib/data/departments';
import TopBar from './TopBar';
import DesktopNavbar from './DesktopNavbar';
import MobileHeader from './MobileHeader';
import MobileCategorySidebar from './MobileCategorySidebar';

import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ProfileModal } from '@/components/auth/ProfileModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';

const navigationDepartments = departments.map(name => {
  const slug = departmentSlug(name);
  return { id: slug, name, slug, imageUrl: `/images/departments/${slug}.webp`, subcategories: [] };
});

export default function Navbar() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [categories, setCategories] = useState<any[]>(navigationDepartments);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOTPVerificationModalOpen, setIsOTPVerificationModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');

  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
      dispatch(fetchCartCount());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      const fetchUserProfile = async () => {
        try {
          const res = await authApi.getProfile();
          if (res?.success && res.data) {
            dispatch(setUser(res.data));
          }
        } catch (err) {
          console.error('Failed to fetch user profile in navbar:', err);
        }
      };
      void fetchUserProfile();
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    const openLogin = () => setIsLoginModalOpen(true);
    window.addEventListener('ekivamart:sign-in', openLogin);
    return () => window.removeEventListener('ekivamart:sign-in', openLogin);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        let data: any[] = [];
        if (res?.data && Array.isArray(res.data)) data = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) data = res.data.data;
        else if (res?.data?.categories && Array.isArray(res.data.categories)) data = res.data.categories;
        else if (res?.data?.docs && Array.isArray(res.data.docs)) data = res.data.docs;
        else if (Array.isArray(res)) data = res;

        const published = data.filter((item: any) =>
          Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'))
        );
        const parents = published.filter((item: any) => !item.parentId);

        const formatted = await Promise.all(
          parents.map(async (parent: any) => {
            const parentId = String(parent.id || parent._id || parent.categoryId || parent.uuid);
            let subData: any[] = [];
            try {
              const subRes = await categoryApi.getSubcategories(parentId);
              if (subRes?.data && Array.isArray(subRes.data)) subData = subRes.data;
              else if (subRes?.data?.data && Array.isArray(subRes.data.data)) subData = subRes.data.data;
              else if (subRes?.data?.categories && Array.isArray(subRes.data.categories)) subData = subRes.data.categories;
              else if (subRes?.data?.docs && Array.isArray(subRes.data.docs)) subData = subRes.data.docs;
              else if (Array.isArray(subRes)) subData = subRes;
            } catch (err) {
              console.error(`Subcategories failed for ${parentId}:`, err);
            }

            const subcategories = subData
              .filter((item: any) => {
                const ok = Boolean(item.isActive ?? item.is_active ?? (item.status === 'published' || item.status === 'active'));
                return ok && item.status !== 'draft';
              })
              .map((sub: any) => ({
                id: String(sub.id || sub._id || sub.categoryId || sub.uuid),
                name: sub.name || sub.title || sub.displayName || 'Unknown',
                slug: (sub.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
              }));

            return {
              id: parentId,
              name: parent.name || parent.title || parent.displayName || 'Unknown',
              slug: departmentSlug(parent.slug || parent.name || ''),
              imageUrl: parent.imageUrl || '/images/product_cover_image.png',
              subcategories,
            };
          })
        );

        if (isMounted) {
          setCategories(navigationDepartments.map(department => {
            const live = formatted.find(item => item.slug === department.slug || departmentSlug(item.name) === department.slug);
            return live ? { ...department, id: live.id, subcategories: live.subcategories } : department;
          }));
        }
      } catch (err) {
        console.warn('Failed to load navbar categories:', err);
      }
    };
    void loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Hide TopBar on scroll (desktop) — mobile rows stay fixed via sticky header
  useEffect(() => {
    let lastY = 0;
    function handleScroll() {
      const y = window.scrollY;
      setTopBarHidden(y > 50);
      lastY = y;
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Row 1: TopBar — scrolls out of view naturally without causing sticky layout shifts */}
      <TopBar />

      {/*
        The <header> is sticky so rows 2 & 3 stay visible while scrolling.
        On mobile and desktop, the sticky header height remains constant, avoiding scrolling jitter.
      */}
      <header className="!sticky top-0 z-50 w-full bg-white shadow-sm">
        {/* Rows 2 & 3: Desktop navbar */}
        <DesktopNavbar
          categories={categories}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Rows 2 & 3: Mobile header */}
        <MobileHeader
          categories={categories}
          onOpenCategories={() => setMobileSidebarOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Mobile category sidebar (portal-like overlay) */}
        <MobileCategorySidebar
          categories={categories}
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

      </header>

      {/* Auth modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => { setIsLoginModalOpen(false); setIsSignupModalOpen(true); }}
        onSwitchToForgotPassword={() => { setIsLoginModalOpen(false); setIsForgotPasswordModalOpen(true); }}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onSwitchToLogin={() => { setIsForgotPasswordModalOpen(false); setIsLoginModalOpen(true); }}
        onSuccess={(email) => { setResetEmail(email); setIsForgotPasswordModalOpen(false); setIsOTPVerificationModalOpen(true); }}
      />
      <OTPVerificationModal
        isOpen={isOTPVerificationModalOpen}
        email={resetEmail}
        onClose={() => setIsOTPVerificationModalOpen(false)}
        onBack={() => { setIsOTPVerificationModalOpen(false); setIsForgotPasswordModalOpen(true); }}
        onSuccess={(otp) => { setResetOtp(otp); setIsOTPVerificationModalOpen(false); setIsResetPasswordModalOpen(true); }}
      />
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        email={resetEmail}
        otp={resetOtp}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onBack={() => { setIsResetPasswordModalOpen(false); setIsOTPVerificationModalOpen(true); }}
        onSuccess={() => { setIsResetPasswordModalOpen(false); setIsLoginModalOpen(true); }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => { setIsSignupModalOpen(false); setIsLoginModalOpen(true); }}
      />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      {/* SVG clipPath definition for curved-triangle category images — global, zero-size */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden>
        <defs>
          <clipPath id="curved-triangle" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0.04 C 0.82,0.04 0.97,0.76 0.86,0.88 C 0.75,0.98 0.25,0.98 0.14,0.88 C 0.03,0.76 0.18,0.04 0.5,0.04 Z" />
          </clipPath>
        </defs>
      </svg>
    </>
  );
}
