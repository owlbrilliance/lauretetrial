import React, { useEffect, useState } from 'react';
import { Calendar, Download, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';
import { BookingEngine } from '../components/BookingEngine';
import { LocationSection } from '../components/LocationSection';
import { RequestForm } from '../components/RequestForm';
import type { Appointment } from '../types';

export function ContactPage() {
  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Contact & Directions
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">
            Reach Laurette Medical Center
          </h1>
          <p className="text-base sm:text-lg text-[#444448] max-w-2xl leading-relaxed">
            Call or message us on WhatsApp at {siteConfig.phoneDisplay}, request a callback below, or use our coordinates to navigate to Al Rigga, Dubai.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>Call {siteConfig.phoneDisplay}</span>
            </a>
            <a
              href={siteConfig.getWhatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#444448] bg-white text-[#36363A] text-sm font-medium min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
              <span>WhatsApp Contact</span>
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <LocationSection />
        <RequestForm heading="Send a Callback or Urgent Inquiry" />
      </section>
    </div>
  );
}

export function BookPage() {
  return (
    <div className="bg-[#FAF8F2] min-h-[75vh] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Laurette Medical Center · {siteConfig.timezoneDisplay}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">
            Book Your Appointment
          </h1>
          <p className="text-base text-[#444448]">
            Select an available consultation time below, or call/WhatsApp{' '}
            <a href={siteConfig.phoneHref} className="font-mono font-medium text-[#A68834] underline">
              {siteConfig.phoneDisplay}
            </a>{' '}
            for immediate reception assistance.
          </p>
        </div>
        <BookingEngine />
      </div>
    </div>
  );
}

export function ManageAppointmentPage({ token }: { token: string }) {
  const { navigate, showToast } = useClinic();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  useEffect(() => {
    fetch(`/api/booking/manage/${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.appointment) setAppointment(d.appointment);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const performAction = async (action: 'confirm' | 'cancel' | 'reschedule') => {
    const res = await fetch(`/api/booking/manage/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        dateStr: rescheduleDate || undefined,
        startTime: rescheduleTime || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setAppointment(data.appointment);
      showToast(data.message, 'success');
    } else {
      showToast(data.error || 'Could not update appointment.', 'error');
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-sm text-[#444448]">Loading appointment...</div>;
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#36363A]">Appointment Link Not Found</h1>
        <p className="text-sm text-[#444448]">
          Please call or WhatsApp {siteConfig.phoneDisplay} for assistance with your visit.
        </p>
        <button
          type="button"
          onClick={() => navigate('/book')}
          className="px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium cursor-pointer"
        >
          Book New Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">Manage Visit</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#36363A] mt-1">
          {appointment.appointmentTypeName}
        </h1>
      </div>

      <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-3 text-sm">
        <p>
          <strong>Status:</strong> <span className="uppercase font-mono">{appointment.status}</span>
        </p>
        <p>
          <strong>Date & Time (Dubai GST):</strong>{' '}
          <span className="font-mono">
            {appointment.dateStr} · {appointment.startTime} – {appointment.endTime}
          </span>
        </p>
        <p>
          <strong>Provider:</strong> {appointment.providerName}
        </p>
        <p>
          <strong>Location:</strong> Al Rigga, Dubai, UAE
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/booking/ics/${appointment.manageToken}`}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#444448] text-white text-sm font-medium min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>Download .ics</span>
        </a>
        {appointment.status !== 'cancelled' && (
          <>
            <button
              type="button"
              onClick={() => performAction('confirm')}
              className="px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium min-h-[44px] cursor-pointer"
            >
              Confirm Attendance
            </button>
            <button
              type="button"
              onClick={() => performAction('cancel')}
              className="px-5 py-2.5 rounded-md border border-red-300 text-red-700 text-sm font-medium min-h-[44px] cursor-pointer"
            >
              Cancel Visit
            </button>
          </>
        )}
      </div>

      {appointment.status !== 'cancelled' && (
        <div className="border border-[#EAE4D3] rounded-lg p-6 space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#36363A]">Reschedule Time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="px-3 py-2 border border-[#EAE4D3] rounded-md font-mono text-sm min-h-[44px]"
            />
            <input
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="px-3 py-2 border border-[#EAE4D3] rounded-md font-mono text-sm min-h-[44px]"
            />
          </div>
          <button
            type="button"
            onClick={() => performAction('reschedule')}
            className="px-5 py-2.5 rounded-md bg-[#444448] text-white text-sm font-medium min-h-[44px] cursor-pointer"
          >
            Update Appointment Time
          </button>
        </div>
      )}
    </div>
  );
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'accessibility' }) {
  const { navigate } = useClinic();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-6">
      <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
        Laurette Medical Center · Legal & Governance
      </p>
      <h1 className="font-serif text-4xl font-semibold text-[#36363A]">
        {type === 'privacy' && 'Privacy Policy & Notice of Privacy Practices'}
        {type === 'terms' && 'Terms of Website Use'}
        {type === 'accessibility' && 'Accessibility Statement'}
      </h1>

      {type === 'privacy' && (
        <div className="space-y-4 text-base text-[#444448] leading-relaxed">
          <div className="p-4 rounded-md bg-[#FAF8F2] border border-[#C6A64B]/60 text-sm font-medium text-[#36363A]">
            {siteConfig.rules.attorneyReviewNotice}
          </div>
          <p>
            Laurette Medical Center follows a privacy-by-design approach. Public scheduling forms, appointment reminders, calendar exports, and concierge messages collect only essential contact and scheduling details and never request or transmit personal medical details.
          </p>
          <p>
            If you have privacy questions, please contact reception at {siteConfig.phoneDisplay} or speak with our team in person at Al Rigga, Dubai.
          </p>
        </div>
      )}

      {type === 'terms' && (
        <div className="space-y-4 text-base text-[#444448] leading-relaxed">
          <p>
            Information published on this website is intended for general patient education and scheduling convenience only and does not constitute dental or medical diagnosis or treatment advice.
          </p>
          <p>
            Final clinical suitability and treatment estimates in AED are confirmed only after an in-person examination by a licensed clinician at Laurette Medical Center.
          </p>
        </div>
      )}

      {type === 'accessibility' && (
        <div className="space-y-4 text-base text-[#444448] leading-relaxed">
          <p>
            Laurette Medical Center is committed to maintaining an accessible, high-contrast, keyboard-friendly website experience compliant with WCAG 2.2 AA standards across mobile and desktop devices.
          </p>
          <p>
            If you need assistance booking an appointment or accessing information, please call or message {siteConfig.phoneDisplay}.
          </p>
          <button
            type="button"
            onClick={() => navigate('/book')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Go to Booking</span>
          </button>
        </div>
      )}
    </div>
  );
}
