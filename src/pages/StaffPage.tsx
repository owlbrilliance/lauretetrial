import React, { useEffect, useState } from 'react';
import { LogOut, Upload } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import type { Appointment, AppointmentStatus, PatientRequest, WaitlistEntry } from '../types';

export function StaffPage() {
  const { user, refreshUser, logout, showToast } = useClinic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'front_desk' | 'dentist' | 'hygienist'>('front_desk');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);

  // Gallery upload form
  const [galTitle, setGalTitle] = useState('');
  const [galCat, setGalCat] = useState('Aesthetic Care');
  const [galBefore, setGalBefore] = useState('');
  const [galAfter, setGalAfter] = useState('');
  const [galConsent, setGalConsent] = useState(false);

  const loadStaffOverview = async () => {
    const res = await fetch('/api/staff/overview');
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.appointments || []);
      setWaitlist(data.waitlist || []);
      setRequests(data.requests || []);
    }
  };

  useEffect(() => {
    if (user && ['front_desk', 'dentist', 'hygienist', 'admin'].includes(user.role)) {
      loadStaffOverview();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/staff/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshUser();
      showToast('Signed in to Staff Portal.', 'success');
    } else {
      showToast(data.error || 'Login failed.', 'error');
    }
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const res = await fetch(`/api/staff/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadStaffOverview();
      showToast(`Status updated to ${status.replace('_', ' ')}.`, 'success');
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/staff/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: galTitle,
        treatmentCategory: galCat,
        beforeImageUrl: galBefore,
        afterImageUrl: galAfter,
        consentOnFile: galConsent,
        published: galConsent,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setGalTitle('');
      setGalBefore('');
      setGalAfter('');
      setGalConsent(false);
      showToast('Smile gallery item saved.', 'success');
    } else {
      showToast(data.error || 'Could not save gallery photo.', 'error');
    }
  };

  if (!user || !['front_desk', 'dentist', 'hygienist', 'admin'].includes(user.role)) {
    return (
      <div className="bg-[#FAF8F2] min-h-[70vh] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#EAE4D3] rounded-lg p-8 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
              Laurette Medical Center
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#36363A] mt-1">Staff Portal</h1>
            <p className="text-sm text-[#444448] mt-1">
              Restricted to authorized clinic reception, hygienists, and dental practitioners.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#36363A] mb-1">Staff Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'front_desk' | 'dentist' | 'hygienist')}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
              >
                <option value="front_desk">Front Desk Reception</option>
                <option value="dentist">Dentist</option>
                <option value="hygienist">Dental Hygienist</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#36363A] mb-1">Staff Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#36363A] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-[#444448] text-white text-sm font-medium hover:bg-[#36363A] min-h-[44px] cursor-pointer"
            >
              Sign In to Staff Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE4D3] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Role: {user.role.replace('_', ' ')}
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Clinic Staff Workspace</h1>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#EAE4D3] text-sm text-[#444448] hover:bg-[#FAF8F2] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-serif text-2xl font-semibold text-[#36363A]">Scheduled Visits</h2>
          {appointments.length === 0 ? (
            <div className="p-6 rounded-lg bg-[#FAF8F2] border border-[#EAE4D3] text-sm text-[#444448]">
              No appointments scheduled yet.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-lg border border-[#EAE4D3] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-[#36363A]">
                      {apt.patientName} · <span className="font-mono text-xs">{apt.dateStr} {apt.startTime}</span>
                    </p>
                    <p className="text-xs text-[#444448]">
                      {apt.appointmentTypeName} · {apt.providerName} · Forms: {apt.formsComplete ? 'Complete' : 'Pending'}
                    </p>
                  </div>
                  <select
                    value={apt.status}
                    onChange={(e) => updateStatus(apt.id, e.target.value as AppointmentStatus)}
                    className="px-3 py-2 text-xs font-medium border border-[#EAE4D3] rounded bg-[#FAF8F2] min-h-[40px]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="arrived">Arrived</option>
                    <option value="in_chair">In Chair</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No-Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#36363A]">
              Waitlist ({waitlist.length}) & Recent Requests ({requests.length})
            </h2>
            {requests.slice(0, 5).map((r) => (
              <div key={r.id} className="p-4 rounded border border-[#EAE4D3] bg-[#FAF8F2] text-sm flex justify-between">
                <div>
                  <span className="font-semibold text-[#36363A]">{r.name}</span> ·{' '}
                  <span className="font-mono">{r.phone}</span> · {r.reason}
                </div>
                <span className="text-xs font-mono uppercase text-[#A68834]">{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <form onSubmit={handleGallerySubmit} className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C6A64B]" />
              <h2 className="font-serif text-xl font-semibold text-[#36363A]">Add Smile Case</h2>
            </div>
            <input
              type="text"
              required
              placeholder="Case title"
              value={galTitle}
              onChange={(e) => setGalTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
            />
            <input
              type="text"
              required
              placeholder="Treatment category"
              value={galCat}
              onChange={(e) => setGalCat(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
            />
            <input
              type="text"
              required
              placeholder="Before image path / URL"
              value={galBefore}
              onChange={(e) => setGalBefore(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
            />
            <input
              type="text"
              required
              placeholder="After image path / URL"
              value={galAfter}
              onChange={(e) => setGalAfter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
            />
            <label className="flex items-start gap-2 text-xs text-[#36363A] cursor-pointer">
              <input
                type="checkbox"
                checked={galConsent}
                onChange={(e) => setGalConsent(e.target.checked)}
                className="mt-0.5 accent-[#C6A64B]"
              />
              <span>Patient consent on file (mandatory before publishing)</span>
            </label>
            <button
              type="submit"
              disabled={!galConsent}
              className="w-full py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Publish Consent-Verified Case
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
