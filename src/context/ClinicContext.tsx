import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  AppointmentType,
  BlogPost,
  ClinicSettings,
  GalleryItem,
  MembershipPlan,
  OfferItem,
  ProviderProfile,
  ReviewItem,
  ServiceItem,
  SessionUser,
} from '../types';

export interface BootstrapData {
  settings: ClinicSettings;
  confirmedServices: ServiceItem[];
  totalSuggestedServicesCount: number;
  providers: ProviderProfile[];
  appointmentTypes: AppointmentType[];
  offers: OfferItem[];
  membershipPlans: MembershipPlan[];
  reviews: ReviewItem[];
  galleryItems: GalleryItem[];
  blogPosts: BlogPost[];
}

interface ToastMessage {
  id: string;
  text: string;
  tone: 'neutral' | 'success' | 'error';
}

interface ClinicContextValue {
  path: string;
  navigate: (to: string) => void;
  bootstrap: BootstrapData | null;
  loading: boolean;
  refreshBootstrap: () => Promise<void>;
  user: SessionUser | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (text: string, tone?: 'neutral' | 'success' | 'error') => void;
  returnToAfterLogin: string | null;
  setReturnToAfterLogin: (path: string | null) => void;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(() => window.location.pathname || '/');
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [returnToAfterLogin, setReturnToAfterLogin] = useState<string | null>(null);

  const showToast = useCallback(
    (text: string, tone: 'neutral' | 'success' | 'error' = 'neutral') => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, text, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const refreshBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = (await res.json()) as BootstrapData;
        setBootstrap(data);
      }
    } catch (err) {
      console.error('Bootstrap fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = (await res.json()) as { user: SessionUser | null };
        setUser(data.user);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    showToast('You have signed out.', 'neutral');
  }, [showToast]);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    refreshBootstrap();
    refreshUser();
    const onPopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [refreshBootstrap, refreshUser]);

  return (
    <ClinicContext.Provider
      value={{
        path,
        navigate,
        bootstrap,
        loading,
        refreshBootstrap,
        user,
        refreshUser,
        logout,
        toasts,
        showToast,
        returnToAfterLogin,
        setReturnToAfterLogin,
      }}
    >
      {children}
      {/* Toast Notifications */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 text-sm rounded-lg shadow-lg border transition-all ${
              t.tone === 'error'
                ? 'bg-[#36363A] text-white border-red-400/50'
                : t.tone === 'success'
                  ? 'bg-[#36363A] text-white border-[#C6A64B]'
                  : 'bg-white text-[#36363A] border-[#EAE4D3]'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
}
