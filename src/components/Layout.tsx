import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { siteConfig } from '../site.config';
import { clinicMedia } from '../lib/media';
import { useClinic } from '../context/ClinicContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { path, navigate, user } = useClinic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState(() => {
    try {
      return localStorage.getItem('laurette_cookie_ack') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Services', href: '/services' },
    { label: 'New Patients', href: '/new-patients' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: user ? 'Portal' : 'Sign In', href: user?.role === 'admin' ? '/admin' : user && user.role !== 'patient' ? '/staff' : '/account' },
  ];

  const handleNav = (href: string) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  const acceptCookies = () => {
    setCookieDismissed(true);
    try {
      localStorage.setItem('laurette_cookie_ack', '1');
    } catch {
      // ignore storage failure
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#36363A]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#C6A64B] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Clean 3-Zone Top Bar Contract */}
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4D3] transition-all duration-200 ${
          scrolled ? 'py-2 shadow-sm' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Official Uploaded Logo with white space & preserved proportions */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            aria-label="Laurette Medical Center Home"
            className="shrink-0 flex items-center bg-white rounded-md p-1 focus-visible:outline-[#C6A64B] cursor-pointer"
          >
            <img
              src={clinicMedia.logo}
              alt="Laurette Medical Center Logo"
              referrerPolicy="no-referrer"
              className={`w-auto object-contain transition-all duration-200 ${
                scrolled ? 'h-11 sm:h-12' : 'h-13 sm:h-14'
              }`}
            />
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#444448]"
          >
            {navItems.map((item) => {
              const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#C6A64B] text-[#36363A]'
                      : 'border-transparent hover:border-[#D4BC78] hover:text-[#36363A]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('/book')}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-md bg-[#C6A64B] text-white hover:bg-[#A68834] transition-colors whitespace-nowrap shrink-0 min-h-[44px] cursor-pointer shadow-xs"
            >
              Book Appointment
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#EAE4D3] text-[#444448] hover:bg-[#FAF8F2] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE4D3] bg-white px-4 py-5 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className="w-full text-left px-3 py-3 text-base font-medium text-[#36363A] hover:bg-[#FAF8F2] rounded-md flex items-center justify-between cursor-pointer"
              >
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNav('/blog')}
              className="w-full text-left px-3 py-3 text-base font-medium text-[#36363A] hover:bg-[#FAF8F2] rounded-md cursor-pointer"
            >
              Patient Journal
            </button>
            <button
              type="button"
              onClick={() => handleNav('/gallery')}
              className="w-full text-left px-3 py-3 text-base font-medium text-[#36363A] hover:bg-[#FAF8F2] rounded-md cursor-pointer"
            >
              Smile Gallery
            </button>
            <div className="pt-3 border-t border-[#EAE4D3] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleNav('/book')}
                className="w-full py-3 rounded-md bg-[#C6A64B] text-white font-medium text-center min-h-[44px] cursor-pointer"
              >
                Book Appointment
              </button>
              <a
                href={siteConfig.phoneHref}
                className="w-full py-3 rounded-md border border-[#444448] text-[#444448] font-medium text-center min-h-[44px] inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {siteConfig.phoneDisplay}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#FAF8F2] border-t border-[#EAE4D3] text-[#36363A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 space-y-4">
              <div className="inline-block bg-white p-2 rounded-md border border-[#EAE4D3]">
                <img
                  src={clinicMedia.logo}
                  alt="Laurette Medical Center"
                  referrerPolicy="no-referrer"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-[#444448] leading-relaxed max-w-sm">
                {siteConfig.tagline}. Calm, attentive dental care located in Al Rigga, Dubai, United Arab Emirates.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-[#444448] text-white hover:bg-[#36363A] transition-colors min-h-[44px]"
                >
                  <Phone className="w-4 h-4" />
                  <span>{siteConfig.phoneDisplay}</span>
                </a>
                <a
                  href={siteConfig.getWhatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-[#C6A64B] text-[#36363A] bg-white hover:bg-[#FAF8F2] transition-colors min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#36363A]">Practice</h3>
              <ul className="space-y-2 text-sm text-[#444448]">
                <li>
                  <button type="button" onClick={() => handleNav('/services')} className="hover:text-[#C6A64B] cursor-pointer">
                    Dental Services
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/new-patients')} className="hover:text-[#C6A64B] cursor-pointer">
                    New Patients & Forms
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/about')} className="hover:text-[#C6A64B] cursor-pointer">
                    About & Care Team
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/gallery')} className="hover:text-[#C6A64B] cursor-pointer">
                    Smile Gallery
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/blog')} className="hover:text-[#C6A64B] cursor-pointer">
                    Patient Journal
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#36363A]">Location & Hours</h3>
              <p className="text-sm text-[#444448]">{siteConfig.location.fullLabel}</p>
              <p className="text-xs font-mono text-[#444448] tabular-nums">
                Coordinates: {siteConfig.location.coordinates.lat}, {siteConfig.location.coordinates.lng}
              </p>
              <a
                href={siteConfig.location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A68834] hover:underline"
              >
                <MapPin className="w-4 h-4" />
                <span>Directions on Bing Maps</span>
              </a>
              <p className="text-xs text-[#444448] pt-1">
                Hours: {siteConfig.placeholders.officeHours}
              </p>
              <p className="text-xs text-[#444448]">
                Timezone: {siteConfig.timezoneDisplay}
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#36363A]">Portals & Legal</h3>
              <ul className="space-y-2 text-sm text-[#444448]">
                <li>
                  <button type="button" onClick={() => handleNav('/account')} className="hover:text-[#C6A64B] cursor-pointer">
                    Patient Portal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/staff')} className="hover:text-[#C6A64B] cursor-pointer">
                    Staff Portal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/admin')} className="hover:text-[#C6A64B] cursor-pointer">
                    Clinic Admin
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/privacy')} className="hover:text-[#C6A64B] cursor-pointer">
                    Privacy & Notice
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/terms')} className="hover:text-[#C6A64B] cursor-pointer">
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/accessibility')} className="hover:text-[#C6A64B] cursor-pointer">
                    Accessibility
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#EAE4D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#444448]">
            <p>© {new Date().getFullYear()} Laurette Medical Center · Al Rigga, Dubai, UAE</p>
            <p>General dental information only. Does not constitute medical advice.</p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Notice */}
      {!cookieDismissed && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-30 bg-white border border-[#EAE4D3] rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[#444448] leading-relaxed">
            We use essential session cookies for appointment holds and portal access. No medical details are stored in cookies.
          </p>
          <button
            type="button"
            onClick={acceptCookies}
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded bg-[#444448] text-white hover:bg-[#36363A] cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Compact Sticky Mobile Bottom Bar (<15% viewport height) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EAE4D3] grid grid-cols-3 h-14 shadow-md">
        <a
          href={siteConfig.phoneHref}
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#36363A] border-r border-[#EAE4D3] min-h-[44px]"
        >
          <Phone className="w-4 h-4 text-[#C6A64B]" />
          <span>Call</span>
        </a>
        <a
          href={siteConfig.getWhatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#36363A] border-r border-[#EAE4D3] min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
          <span>WhatsApp</span>
        </a>
        <button
          type="button"
          onClick={() => handleNav('/book')}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#C6A64B] text-white min-h-[44px] cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book</span>
        </button>
      </div>
    </div>
  );
}
