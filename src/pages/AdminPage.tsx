import React, { useEffect, useState } from 'react';
import { Check, LogOut, Plus, Trash2 } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import type {
  Appointment,
  BlogPost,
  ChatTranscript,
  ClinicSettings,
  OfferItem,
  PatientRequest,
  ProviderProfile,
  ReviewItem,
  ServiceItem,
} from '../types';

type AdminTab =
  | 'today'
  | 'services'
  | 'appointments'
  | 'requests'
  | 'providers'
  | 'reviews'
  | 'offers'
  | 'chats'
  | 'settings';

export function AdminPage() {
  const { user, refreshUser, refreshBootstrap, logout, showToast } = useClinic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<AdminTab>('today');

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [chats, setChats] = useState<ChatTranscript[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  // New Service Form
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCat, setNewSvcCat] = useState('General Care');
  const [newSvcSummary, setNewSvcSummary] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('Call for an estimate');

  // New Offer Form
  const [offCode, setOffCode] = useState('');
  const [offTitle, setOffTitle] = useState('');
  const [offAmount, setOffAmount] = useState(100);

  // Prevent search engine indexing of /admin
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const loadAdminState = async () => {
    const res = await fetch('/api/admin/state');
    if (res.ok) {
      const d = await res.json();
      setServices(d.services || []);
      setAppointments(d.appointments || []);
      setRequests(d.requests || []);
      setProviders(d.providers || []);
      setReviews(d.reviews || []);
      setOffers(d.offers || []);
      setChats(d.chatTranscripts || []);
      setBlogPosts(d.blogPosts || []);
      setSettings(d.settings || null);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminState();
    }
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/staff/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'admin' }),
    });
    const data = await res.json();
    if (res.ok) {
      await refreshUser();
      showToast('Signed in to Clinic Admin Console.', 'success');
    } else {
      showToast(data.error || 'Admin credentials invalid.', 'error');
    }
  };

  const toggleConfirmService = async (svc: ServiceItem) => {
    const res = await fetch(`/api/admin/services/${svc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: !svc.confirmed }),
    });
    if (res.ok) {
      await loadAdminState();
      await refreshBootstrap();
      showToast(
        !svc.confirmed
          ? `${svc.name} confirmed and published to website.`
          : `${svc.name} unpublished to unconfirmed draft.`,
        'success'
      );
    }
  };

  const updateServicePrice = async (svc: ServiceItem, priceLabel: string) => {
    await fetch(`/api/admin/services/${svc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceLabel }),
    });
    await loadAdminState();
    await refreshBootstrap();
    showToast('Service price label updated.', 'success');
  };

  const deleteService = async (id: string) => {
    if (!window.confirm('Delete this service category permanently?')) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    await loadAdminState();
    await refreshBootstrap();
    showToast('Service deleted.', 'neutral');
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSvcName,
        category: newSvcCat,
        shortSummary: newSvcSummary,
        priceLabel: newSvcPrice,
        confirmed: false,
      }),
    });
    if (res.ok) {
      setNewSvcName('');
      setNewSvcSummary('');
      await loadAdminState();
      showToast('Service draft added (mark Confirmed to publish).', 'success');
    }
  };

  const updateRequestStatus = async (id: string, status: PatientRequest['status']) => {
    await fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAdminState();
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm('Delete this callback request?')) return;
    await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
    await loadAdminState();
  };

  const softDeleteAppointment = async (id: string) => {
    if (!window.confirm('Cancel and archive this appointment (30-day restore window)?')) return;
    await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' });
    await loadAdminState();
    showToast('Appointment archived.', 'neutral');
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      await refreshBootstrap();
      showToast('Clinic settings saved.', 'success');
    }
  };

  const createOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: offCode,
        title: offTitle,
        discountType: 'fixed',
        amount: Number(offAmount),
        appliesTo: 'self_pay_only',
      }),
    });
    if (res.ok) {
      setOffCode('');
      setOffTitle('');
      await loadAdminState();
      await refreshBootstrap();
      showToast('Self-pay offer created.', 'success');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-[#FAF8F2] min-h-[75vh] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#EAE4D3] rounded-lg p-8 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
              Laurette Medical Center · Restricted
            </p>
            <h1 className="font-serif text-3xl font-semibold text-[#36363A] mt-1">
              Clinic Admin Login
            </h1>
            <p className="text-sm text-[#444448] mt-1">
              Administrator credentials are required to confirm services, edit pricing, and manage clinic settings.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#36363A] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@laurette-placeholder.ae"
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
              Sign In as Administrator
            </button>
          </form>
        </div>
      </div>
    );
  }

  const confirmedCount = services.filter((s) => s.confirmed).length;

  return (
    <div className="min-h-[80vh] bg-[#FAF8F2] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#EAE4D3] p-5 space-y-6 shrink-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">Admin Console</p>
          <p className="font-serif text-xl font-semibold text-[#36363A]">Laurette Medical</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {(
            [
              ['today', 'Today & Overview'],
              ['services', `Services (${confirmedCount}/${services.length})`],
              ['appointments', `Appointments (${appointments.filter((a) => !a.deletedAt).length})`],
              ['requests', `Requests (${requests.length})`],
              ['providers', 'Providers & Bio'],
              ['reviews', `Reviews (${reviews.length})`],
              ['offers', 'Offers'],
              ['chats', `Chat Logs (${chats.length})`],
              ['settings', 'Clinic Settings'],
            ] as [AdminTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer ${
                tab === key
                  ? 'bg-[#444448] text-white'
                  : 'text-[#444448] hover:bg-[#FAF8F2] hover:text-[#36363A]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#444448] hover:text-[#36363A] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-x-auto">
        {tab === 'today' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Clinic Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Confirmed Services', `${confirmedCount} of ${services.length}`],
                ['Active Bookings', String(appointments.filter((a) => !a.deletedAt && a.status !== 'cancelled').length)],
                ['Pending Requests', String(requests.filter((r) => r.status === 'new').length)],
                ['Published Articles', String(blogPosts.filter((b) => b.status === 'published').length)],
              ].map(([label, val]) => (
                <div key={label} className="bg-white border border-[#EAE4D3] rounded-lg p-5">
                  <p className="text-xs text-[#444448]">{label}</p>
                  <p className="font-mono text-2xl font-semibold text-[#36363A] tabular-nums mt-1">{val}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#EAE4D3] rounded-lg p-6 space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#36363A]">Launch Readiness Reminder</h2>
              <p className="text-sm text-[#444448]">
                Suggested dental service categories remain marked as <strong>Unconfirmed Draft</strong> until you review and confirm them in the <strong>Services</strong> tab. Replace provider, office hour, email, and policy placeholders before marketing launch.
              </p>
              <button
                type="button"
                onClick={() => setTab('services')}
                className="px-4 py-2 rounded-md bg-[#C6A64B] text-white text-sm font-medium cursor-pointer"
              >
                Review & Confirm Dental Services
              </button>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-[#36363A]">
                Editable Dental Services Catalog
              </h1>
              <p className="text-sm text-[#444448] mt-1">
                Suggested categories are marked <strong>Unconfirmed Draft</strong> and remain hidden from public service pages until confirmed here. Default pricing stays &ldquo;Call for an estimate&rdquo; unless an AED price is entered.
              </p>
            </div>

            <div className="space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white border border-[#EAE4D3] rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#36363A]">{svc.name}</span>
                      <span
                        className={`text-xs font-mono ${
                          svc.confirmed ? 'text-emerald-700' : 'text-[#A68834]'
                        }`}
                      >
                        {svc.confirmed ? 'CONFIRMED & PUBLISHED' : 'UNCONFIRMED DRAFT'}
                      </span>
                    </div>
                    <p className="text-xs text-[#444448]">{svc.shortSummary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      defaultValue={svc.priceLabel}
                      onBlur={(e) => {
                        if (e.target.value !== svc.priceLabel) {
                          updateServicePrice(svc, e.target.value);
                        }
                      }}
                      aria-label={`Price label for ${svc.name}`}
                      className="px-3 py-1.5 text-xs border border-[#EAE4D3] rounded bg-[#FAF8F2] w-44"
                    />
                    <button
                      type="button"
                      onClick={() => toggleConfirmService(svc)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium cursor-pointer ${
                        svc.confirmed
                          ? 'bg-[#FAF8F2] border border-[#EAE4D3] text-[#444448]'
                          : 'bg-[#C6A64B] text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{svc.confirmed ? 'Unpublish' : 'Confirm & Publish'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteService(svc.id)}
                      aria-label={`Delete ${svc.name}`}
                      className="p-2 rounded border border-[#EAE4D3] text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={addService} className="bg-white border border-[#EAE4D3] rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-xl font-semibold text-[#36363A]">Add Custom Service Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Service name"
                  value={newSvcName}
                  onChange={(e) => setNewSvcName(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Category"
                  value={newSvcCat}
                  onChange={(e) => setNewSvcCat(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Price (e.g. Call for an estimate)"
                  value={newSvcPrice}
                  onChange={(e) => setNewSvcPrice(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Plain-language summary"
                value={newSvcSummary}
                onChange={(e) => setNewSvcSummary(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#444448] text-white text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Draft Service</span>
              </button>
            </form>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Appointments</h1>
            {appointments.length === 0 ? (
              <p className="text-sm text-[#444448]">No appointments recorded yet.</p>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-[#EAE4D3] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#36363A]">
                      {apt.patientName} ({apt.patientPhone})
                    </p>
                    <p className="text-xs font-mono text-[#444448]">
                      {apt.dateStr} {apt.startTime} · {apt.appointmentTypeName} · {apt.status}
                      {apt.deletedAt ? ' [ARCHIVED]' : ''}
                    </p>
                  </div>
                  {!apt.deletedAt && (
                    <button
                      type="button"
                      onClick={() => softDeleteAppointment(apt.id)}
                      className="px-3 py-1.5 rounded border border-red-300 text-red-700 text-xs cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Callback & Urgent Requests</h1>
            {requests.length === 0 ? (
              <p className="text-sm text-[#444448]">No requests received yet.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="bg-white border border-[#EAE4D3] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-[#36363A]">
                      {r.name} · <span className="font-mono">{r.phone}</span> {r.isUrgent ? '· URGENT' : ''}
                    </p>
                    <p className="text-xs text-[#444448]">
                      {r.reason} · Preferred: {r.preferredTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={(e) => updateRequestStatus(r.id, e.target.value as PatientRequest['status'])}
                      className="px-2 py-1.5 text-xs border border-[#EAE4D3] rounded bg-[#FAF8F2]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="booked">Booked</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteRequest(r.id)}
                      className="p-1.5 text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'providers' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Providers & Staff Placeholders</h1>
            {providers.map((p) => (
              <div key={p.id} className="bg-white border border-[#EAE4D3] rounded-lg p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    defaultValue={p.name}
                    onBlur={async (e) => {
                      await fetch(`/api/admin/providers/${p.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: e.target.value, isPlaceholder: false }),
                      });
                      refreshBootstrap();
                    }}
                    className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
                  />
                  <input
                    type="text"
                    defaultValue={p.credentials}
                    onBlur={async (e) => {
                      await fetch(`/api/admin/providers/${p.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credentials: e.target.value }),
                      });
                      refreshBootstrap();
                    }}
                    className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
                  />
                </div>
                <p className="text-xs text-[#444448]">Edit fields and click outside to save.</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Review Moderation</h1>
            {reviews.length === 0 ? (
              <p className="text-sm text-[#444448]">No patient reviews submitted yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-[#EAE4D3] rounded-lg p-4 flex justify-between items-center gap-4 text-sm">
                  <div>
                    <p className="font-semibold">
                      {rev.authorName} · {rev.rating}/5 · <span className="font-mono text-xs">{rev.status}</span>
                    </p>
                    <p className="text-xs text-[#444448]">{rev.comment}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/reviews/${rev.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'approved' }),
                        });
                        loadAdminState();
                        refreshBootstrap();
                      }}
                      className="px-3 py-1.5 rounded bg-[#C6A64B] text-white text-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/reviews/${rev.id}`, { method: 'DELETE' });
                        loadAdminState();
                      }}
                      className="px-3 py-1.5 rounded border border-red-300 text-red-700 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'offers' && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Offers (Self-Pay Only Default)</h1>
            <p className="text-sm text-[#444448]">
              Currently {offers.length} active offers. Keep empty until clinic confirms promotional terms.
            </p>
            <form onSubmit={createOffer} className="bg-white border border-[#EAE4D3] rounded-lg p-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Code (e.g. WELCOME)"
                value={offCode}
                onChange={(e) => setOffCode(e.target.value)}
                className="px-3 py-2 text-sm border border-[#EAE4D3] rounded font-mono"
              />
              <input
                type="text"
                required
                placeholder="Title"
                value={offTitle}
                onChange={(e) => setOffTitle(e.target.value)}
                className="px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
              <input
                type="number"
                required
                value={offAmount}
                onChange={(e) => setOffAmount(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-[#EAE4D3] rounded font-mono"
              />
              <button type="submit" className="px-4 py-2 rounded bg-[#C6A64B] text-white text-sm font-medium cursor-pointer">
                Add Self-Pay Offer
              </button>
            </form>
            {offers.map((o) => (
              <div key={o.id} className="bg-white border border-[#EAE4D3] rounded-lg p-4 flex justify-between items-center text-sm">
                <span>
                  <strong className="font-mono">{o.code}</strong> · {o.title} ({o.amount} AED · {o.appliesTo})
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/admin/offers/${o.id}`, { method: 'DELETE' });
                    loadAdminState();
                    refreshBootstrap();
                  }}
                  className="text-xs text-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'chats' && (
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Concierge Chat Transcripts</h1>
            {chats.length === 0 ? (
              <p className="text-sm text-[#444448]">No concierge sessions recorded yet.</p>
            ) : (
              chats.map((c) => (
                <div key={c.id} className="bg-white border border-[#EAE4D3] rounded-lg p-5 space-y-2">
                  <p className="text-xs font-mono text-[#A68834]">{c.sessionId}</p>
                  {c.messages.map((m, idx) => (
                    <p key={idx} className="text-xs text-[#36363A]">
                      <strong className="uppercase">{m.role}:</strong> {m.text}
                    </p>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'settings' && settings && (
          <form onSubmit={saveSettings} className="bg-white border border-[#EAE4D3] rounded-lg p-6 space-y-4 max-w-2xl">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Clinic Settings</h1>
            <div>
              <label className="block text-xs font-medium text-[#444448] mb-1">Office Hours Display</label>
              <input
                type="text"
                value={settings.officeHoursDisplay}
                onChange={(e) => setSettings({ ...settings, officeHoursDisplay: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444448] mb-1">Clinic Email</label>
              <input
                type="text"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444448] mb-1">Insurance Accepted Display</label>
              <input
                type="text"
                value={settings.insuranceAcceptedDisplay}
                onChange={(e) => setSettings({ ...settings, insuranceAcceptedDisplay: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444448] mb-1">Cancellation Policy</label>
              <input
                type="text"
                value={settings.cancellationPolicyDisplay}
                onChange={(e) => setSettings({ ...settings, cancellationPolicyDisplay: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444448] mb-1">Concierge Knowledge Base</label>
              <textarea
                rows={4}
                value={settings.chatbotKnowledgeBase}
                onChange={(e) => setSettings({ ...settings, chatbotKnowledgeBase: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#36363A] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chatbotEnabled}
                onChange={(e) => setSettings({ ...settings, chatbotEnabled: e.target.checked })}
                className="accent-[#C6A64B]"
              />
              <span>Enable Live AI Reception Concierge</span>
            </label>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium cursor-pointer"
            >
              Save Clinic Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
