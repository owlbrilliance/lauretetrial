import React, { useEffect, useState } from 'react';
import { Calendar, Download, LogOut, UserPlus } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import type { Appointment, IntakeFormRecord, PatientAccount } from '../types';

export function AccountPage() {
  const { user, refreshUser, logout, navigate, showToast } = useClinic();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [previewCodeHint, setPreviewCodeHint] = useState('');

  const [patient, setPatient] = useState<PatientAccount | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [forms, setForms] = useState<IntakeFormRecord[]>([]);
  const [loadingDash, setLoadingDash] = useState(false);

  // Family member form
  const [famName, setFamName] = useState('');
  const [famRel, setFamRel] = useState<'child' | 'spouse' | 'parent' | 'other'>('child');

  const loadDashboard = async () => {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/account/dashboard');
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setAppointments(data.appointments || []);
        setForms(data.forms || []);
      }
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'patient') {
      loadDashboard();
    }
  }, [user]);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/patient/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setCodeSent(true);
      if (data.previewCode) setPreviewCodeHint(data.previewCode);
      showToast('Verification code sent.', 'success');
    } else {
      showToast(data.error || 'Please enter a valid email.', 'error');
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/patient/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshUser();
      showToast('Signed in to Patient Portal.', 'success');
    } else {
      showToast(data.error || 'Invalid code.', 'error');
    }
  };

  const addFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/account/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: famName, relationship: famRel }),
    });
    if (res.ok) {
      setFamName('');
      await loadDashboard();
      showToast('Family member added.', 'success');
    }
  };

  const updatePreferences = async (patch: { emailReminders?: boolean; recallOptIn?: boolean }) => {
    const res = await fetch('/api/account/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setPatient(data.patient);
      showToast('Preferences updated.', 'success');
    }
  };

  if (!user || user.role !== 'patient') {
    return (
      <div className="bg-[#FAF8F2] min-h-[70vh] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#EAE4D3] rounded-lg p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
              Laurette Medical Center
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Patient Portal</h1>
            <p className="text-sm text-[#444448]">
              Sign in with your email address to view appointments, manage family visits, and download calendar confirmations.
            </p>
          </div>

          {!codeSent ? (
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-[#C6A64B] text-white font-medium text-sm hover:bg-[#A68834] min-h-[44px] cursor-pointer"
              >
                Send One-Time Sign-In Code
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              {previewCodeHint && (
                <div className="p-3 rounded bg-[#FAF8F2] border border-[#EAE4D3] text-xs text-[#36363A]">
                  Verification code (preview mode):{' '}
                  <span className="font-mono font-semibold text-[#A68834]">{previewCodeHint}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">6-Digit Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] font-mono min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-[#444448] text-white font-medium text-sm hover:bg-[#36363A] min-h-[44px] cursor-pointer"
              >
                Verify & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE4D3] pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">Patient Account</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#36363A]">
            Welcome, {patient?.name || user.name}
          </h1>
          <p className="text-sm text-[#444448]">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/book')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px] cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#EAE4D3] text-sm font-medium text-[#444448] hover:bg-[#FAF8F2] min-h-[44px] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {loadingDash ? (
        <p className="text-sm text-[#444448]">Loading account details...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Appointments */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#36363A]">Your Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-3">
                <p className="text-sm text-[#444448]">No appointments scheduled under this email yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/book')}
                  className="px-4 py-2 rounded-md bg-[#C6A64B] text-white text-sm font-medium cursor-pointer"
                >
                  Schedule an Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-[#EAE4D3] rounded-lg p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[#36363A]">{apt.appointmentTypeName}</p>
                      <p className="text-xs font-mono text-[#444448] tabular-nums">
                        {apt.dateStr} · {apt.startTime} GST · Status: {apt.status}
                      </p>
                      <p className="text-xs text-[#444448]">
                        Forms: {apt.formsComplete ? 'Completed' : 'Pending pre-visit contact form'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/api/booking/ics/${apt.manageToken}`}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[#EAE4D3] text-xs font-medium text-[#36363A] hover:bg-[#FAF8F2]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.ics</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate(`/manage/${apt.manageToken}`)}
                        className="px-3 py-2 rounded bg-[#444448] text-white text-xs font-medium cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Family & Preferences */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#C6A64B]" />
                <h2 className="font-serif text-xl font-semibold text-[#36363A]">Family Members</h2>
              </div>
              {patient?.familyMembers.length ? (
                <ul className="space-y-2 text-sm">
                  {patient.familyMembers.map((fm) => (
                    <li key={fm.id} className="flex justify-between bg-white px-3 py-2 rounded border border-[#EAE4D3]">
                      <span className="font-medium text-[#36363A]">{fm.name}</span>
                      <span className="text-xs text-[#444448] capitalize">{fm.relationship}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#444448]">Add a spouse or child to simplify family scheduling.</p>
              )}

              <form onSubmit={addFamilyMember} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={famName}
                  onChange={(e) => setFamName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
                />
                <select
                  value={famRel}
                  onChange={(e) => setFamRel(e.target.value as 'child' | 'spouse' | 'parent' | 'other')}
                  className="px-2 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
                >
                  <option value="child">Child</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-[#444448] text-white text-xs font-medium cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="border border-[#EAE4D3] rounded-lg p-6 space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#36363A]">Communication & Forms</h2>
              <p className="text-xs text-[#444448]">
                Submitted pre-visit contact forms: {forms.length}
              </p>
              <label className="flex items-center gap-2 text-sm text-[#36363A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={patient?.emailReminders ?? true}
                  onChange={(e) => updatePreferences({ emailReminders: e.target.checked })}
                  className="accent-[#C6A64B]"
                />
                <span>Receive appointment reminder emails</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-[#36363A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={patient?.recallOptIn ?? true}
                  onChange={(e) => updatePreferences({ recallOptIn: e.target.checked })}
                  className="accent-[#C6A64B]"
                />
                <span>Receive 6-month routine checkup reminders</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/new-patients/forms')}
                className="text-xs font-medium text-[#A68834] underline cursor-pointer block pt-1"
              >
                Open Pre-Visit Contact Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
