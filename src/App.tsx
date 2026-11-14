import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Layout } from './components/Layout';
import { ChatWidget } from './components/ChatWidget';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { NewPatientsPage } from './pages/NewPatientsPage';
import { AboutTeamPage } from './pages/AboutTeamPage';
import { BlogPage, GalleryPage } from './pages/GalleryBlogPages';
import {
  BookPage,
  ContactPage,
  LegalPage,
  ManageAppointmentPage,
} from './pages/ContactBookManagePages';
import { AccountPage } from './pages/AccountPage';
import { StaffPage } from './pages/StaffPage';
import { AdminPage } from './pages/AdminPage';

function PageRouter() {
  const { path, navigate } = useClinic();
  const cleanPath = path.replace(/\/+$/, '') || '/';

  if (cleanPath === '/') return <HomePage />;
  if (cleanPath === '/services') return <ServicesPage />;
  if (cleanPath.startsWith('/services/')) {
    return <ServicesPage slug={cleanPath.slice('/services/'.length)} />;
  }
  if (cleanPath === '/new-patients') return <NewPatientsPage />;
  if (cleanPath === '/new-patients/forms') return <NewPatientsPage showFormsOnly />;
  if (cleanPath === '/about' || cleanPath === '/team') return <AboutTeamPage />;
  if (cleanPath === '/gallery') return <GalleryPage />;
  if (cleanPath === '/blog') return <BlogPage />;
  if (cleanPath.startsWith('/blog/')) {
    return <BlogPage slug={cleanPath.slice('/blog/'.length)} />;
  }
  if (cleanPath === '/contact') return <ContactPage />;
  if (cleanPath === '/book') return <BookPage />;
  if (cleanPath.startsWith('/manage/')) {
    return <ManageAppointmentPage token={cleanPath.slice('/manage/'.length)} />;
  }
  if (cleanPath === '/account') return <AccountPage />;
  if (cleanPath === '/staff') return <StaffPage />;
  if (cleanPath === '/admin') return <AdminPage />;
  if (cleanPath === '/privacy') return <LegalPage type="privacy" />;
  if (cleanPath === '/terms') return <LegalPage type="terms" />;
  if (cleanPath === '/accessibility') return <LegalPage type="accessibility" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
      <p className="font-mono text-sm text-[#A68834]">404</p>
      <h1 className="font-serif text-4xl font-semibold text-[#36363A]">Page Not Found</h1>
      <p className="text-base text-[#444448]">
        The page you requested could not be found at Laurette Medical Center.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] cursor-pointer"
      >
        Return Home
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <Layout>
        <PageRouter />
      </Layout>
      <ChatWidget />
    </ClinicProvider>
  );
}
