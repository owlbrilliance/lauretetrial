import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  MessageCircle,
  Phone,
  Printer,
} from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';
import type { Appointment, AppointmentHold } from '../types';

interface SlotOption {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  operatoryId: string;
}

export function BookingEngine() {
  const { bootstrap, user, navigate, showToast } = useClinic();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [appointmentTypeId, setAppointmentTypeId] = useState('apt_new_patient');
  const [providerId, setProviderId] = useState('first_available');

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [calendarAvailability, setCalendarAvailability] = useState<
    Record<string, { openCount: number; reason?: string }>
  >({});
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [hold, setHold] = useState<AppointmentHold | null>(null);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);

  // Patient form fields
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingFor, setBookingFor] = useState<'myself' | 'family_member'>('myself');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [note, setNote] = useState('');
  const [reminderConsent, setReminderConsent] = useState(true);
  const [cancellationAck, setCancellationAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Waitlist
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const appointmentTypes = bootstrap?.appointmentTypes || [];
  const providers = bootstrap?.providers || [];
  const activeOffers = bootstrap?.offers || [];

  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.name);
      if (!patientEmail) setPatientEmail(user.email);
    }
  }, [user, patientName, patientEmail]);

  // Fetch calendar month availability
  useEffect(() => {
    let active = true;
    fetch(
      `/api/booking/calendar?month=${encodeURIComponent(currentMonth)}&appointmentTypeId=${encodeURIComponent(appointmentTypeId)}&providerId=${encodeURIComponent(providerId)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (active && data.availability) {
          setCalendarAvailability(data.availability);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentMonth, appointmentTypeId, providerId]);

  // Hold countdown timer
  useEffect(() => {
    if (!hold) {
      setHoldSecondsLeft(0);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000));
      setHoldSecondsLeft(diff);
      if (diff === 0) {
        setHold(null);
        setSelectedSlot(null);
        showToast('Your 10-minute temporary slot hold expired. Please select a slot again.', 'error');
        setStep(3);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hold, showToast]);

  const loadSlotsForDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setWaitlistOpen(false);
    setWaitlistSubmitted(false);
    try {
      const res = await fetch(
        `/api/booking/slots?dateStr=${encodeURIComponent(dateStr)}&appointmentTypeId=${encodeURIComponent(appointmentTypeId)}&providerId=${encodeURIComponent(providerId)}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = async (slot: SlotOption) => {
    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateStr: selectedDate,
          startTime: slot.startTime,
          appointmentTypeId,
          providerId: slot.providerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'That slot was just taken.', 'error');
        loadSlotsForDate(selectedDate);
        return;
      }
      setSelectedSlot(slot);
      setHold(data.hold);
      setStep(4);
    } catch {
      showToast('Could not place hold. Please try again.', 'error');
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) return;
    if (!cancellationAck || !reminderConsent) {
      showToast('Please accept the reminder consent and cancellation acknowledgement.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdId: hold?.id,
          dateStr: selectedDate,
          startTime: selectedSlot.startTime,
          appointmentTypeId,
          providerId: selectedSlot.providerId,
          isNewPatient,
          patientName,
          patientEmail,
          patientPhone,
          bookingFor,
          familyMemberName: bookingFor === 'family_member' ? familyMemberName : undefined,
          reminderConsent,
          cancellationAck,
          offerCode: offerCode.trim() || undefined,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not confirm appointment.', 'error');
        return;
      }
      setConfirmedAppointment(data.appointment);
      setHold(null);
      setStep(5);
      showToast('Appointment confirmed.', 'success');
    } catch {
      showToast('Network error confirming appointment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientEmail,
          patientPhone,
          dateStr: selectedDate,
          providerId,
          appointmentTypeId,
        }),
      });
      if (res.ok) {
        setWaitlistSubmitted(true);
        showToast('Added to the waitlist for this date.', 'success');
      } else {
        const d = await res.json();
        showToast(d.error || 'Could not join waitlist.', 'error');
      }
    } catch {
      showToast('Network issue joining waitlist.', 'error');
    }
  };

  const shiftMonth = (delta: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setCurrentMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    setSelectedDate('');
    setSlots([]);
  };

  // Calendar grid math
  const [yr, mo] = currentMonth.split('-').map(Number);
  const firstDayWeekday = new Date(Date.UTC(yr, mo - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(yr, mo, 0)).getUTCDate();
  const monthLabel = new Date(Date.UTC(yr, mo - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  if (step === 5 && confirmedAppointment) {
    return (
      <div className="bg-white border border-[#EAE4D3] rounded-lg p-6 sm:p-10 space-y-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-[#C6A64B] shrink-0 mt-1" />
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#A68834]">
              Appointment Confirmed · {siteConfig.timezoneDisplay}
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#36363A] mt-1">
              We Look Forward to Welcoming You
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-md bg-[#FAF8F2] border border-[#EAE4D3] text-sm">
          <div>
            <span className="text-xs text-[#444448] block">Visit Type</span>
            <span className="font-semibold text-[#36363A]">{confirmedAppointment.appointmentTypeName}</span>
          </div>
          <div>
            <span className="text-xs text-[#444448] block">Provider</span>
            <span className="font-semibold text-[#36363A]">{confirmedAppointment.providerName}</span>
          </div>
          <div>
            <span className="text-xs text-[#444448] block">Date & Time (Dubai GST)</span>
            <span className="font-mono font-semibold text-[#36363A] tabular-nums">
              {confirmedAppointment.dateStr} · {confirmedAppointment.startTime} – {confirmedAppointment.endTime}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#444448] block">Estimated Fee</span>
            <span className="font-medium text-[#36363A]">{confirmedAppointment.estimatedTotalLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/booking/ics/${confirmedAppointment.manageToken}`}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#444448] text-white text-sm font-medium hover:bg-[#36363A] min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Add to Calendar (.ics)</span>
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#EAE4D3] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/manage/${confirmedAppointment.manageToken}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[#C6A64B] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px] cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#C6A64B]" />
            <span>Manage / Reschedule</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/new-patients/forms')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px] cursor-pointer"
          >
            <span>Complete Pre-Visit Contact Form</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAE4D3] rounded-lg overflow-hidden">
      {/* Progress Header */}
      <div className="px-6 py-4 bg-[#FAF8F2] border-b border-[#EAE4D3] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm font-medium text-[#36363A]">
          <span className="font-mono text-xs text-[#A68834] tabular-nums">Step {step} of 4</span>
          <span aria-hidden="true">·</span>
          <span>
            {step === 1 && 'Visit Type'}
            {step === 2 && 'Care Provider'}
            {step === 3 && 'Date & Open Times (Asia/Dubai)'}
            {step === 4 && 'Patient Details'}
          </span>
        </div>
        {hold && holdSecondsLeft > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#A68834] tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Slot held: {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="block text-sm font-medium text-[#36363A] mb-2">Are you a new or returning patient?</span>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setIsNewPatient(true)}
                  className={`py-3 px-4 rounded-md border text-sm font-medium min-h-[44px] cursor-pointer transition-colors ${
                    isNewPatient
                      ? 'bg-[#444448] text-white border-[#444448]'
                      : 'bg-white text-[#36363A] border-[#EAE4D3] hover:bg-[#FAF8F2]'
                  }`}
                >
                  New Patient
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPatient(false)}
                  className={`py-3 px-4 rounded-md border text-sm font-medium min-h-[44px] cursor-pointer transition-colors ${
                    !isNewPatient
                      ? 'bg-[#444448] text-white border-[#444448]'
                      : 'bg-white text-[#36363A] border-[#EAE4D3] hover:bg-[#FAF8F2]'
                  }`}
                >
                  Returning Patient
                </button>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#36363A] mb-2">Select Appointment Type</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {appointmentTypes.map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setAppointmentTypeId(apt.id)}
                    className={`text-left p-4 rounded-md border transition-colors cursor-pointer ${
                      appointmentTypeId === apt.id
                        ? 'border-[#C6A64B] bg-[#FAF8F2]'
                        : 'border-[#EAE4D3] bg-white hover:border-[#D4BC78]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#36363A] text-base">{apt.name}</span>
                      <span className="font-mono text-xs text-[#444448] tabular-nums">{apt.durationMinutes} min</span>
                    </div>
                    <p className="text-sm text-[#444448] mt-1">{apt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 text-sm text-[#444448]">
                <a href={siteConfig.phoneHref} className="inline-flex items-center gap-1.5 hover:text-[#C6A64B]">
                  <Phone className="w-4 h-4 text-[#C6A64B]" />
                  <span>{siteConfig.phoneDisplay}</span>
                </a>
                <a
                  href={siteConfig.getWhatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#C6A64B]"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-md bg-[#C6A64B] text-white font-medium text-sm hover:bg-[#A68834] min-h-[44px] cursor-pointer"
              >
                Continue to Provider
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#36363A]">Select Provider Preference</h3>
              <p className="text-sm text-[#444448] mt-1">
                Choose first available time or select a clinician profile below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProviderId('first_available')}
                className={`text-left p-4 rounded-md border transition-colors cursor-pointer ${
                  providerId === 'first_available'
                    ? 'border-[#C6A64B] bg-[#FAF8F2]'
                    : 'border-[#EAE4D3] bg-white hover:border-[#D4BC78]'
                }`}
              >
                <span className="font-semibold text-[#36363A] block">First Available Clinician</span>
                <span className="text-sm text-[#444448] mt-1 block">
                  Displays the widest choice of open appointment times.
                </span>
              </button>

              {providers.map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setProviderId(prov.id)}
                  className={`text-left p-4 rounded-md border transition-colors cursor-pointer ${
                    providerId === prov.id
                      ? 'border-[#C6A64B] bg-[#FAF8F2]'
                      : 'border-[#EAE4D3] bg-white hover:border-[#D4BC78]'
                  }`}
                >
                  <span className="font-semibold text-[#36363A] block">{prov.name}</span>
                  <span className="text-xs text-[#A68834] block mt-0.5">{prov.roleTitle} · {prov.credentials}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm font-medium text-[#444448] hover:text-[#36363A] min-h-[44px] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-md bg-[#C6A64B] text-white font-medium text-sm hover:bg-[#A68834] min-h-[44px] cursor-pointer"
              >
                Choose Date & Time
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Interactive Calendar + Slots */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-[#36363A]">{monthLabel}</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="w-10 h-10 rounded-md border border-[#EAE4D3] flex items-center justify-center hover:bg-[#FAF8F2] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="w-10 h-10 rounded-md border border-[#EAE4D3] flex items-center justify-center hover:bg-[#FAF8F2] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#444448] pb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                  <div key={`empty_${idx}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
                  const info = calendarAvailability[dateStr];
                  const isOpen = info ? info.openCount > 0 : false;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!isOpen}
                      onClick={() => loadSlotsForDate(dateStr)}
                      aria-label={`${dateStr}${isOpen ? ` (${info?.openCount} slots available)` : ' (unavailable)'}`}
                      className={`h-11 rounded-md text-sm font-mono tabular-nums transition-colors ${
                        isSelected
                          ? 'bg-[#C6A64B] text-white font-semibold'
                          : isOpen
                            ? 'bg-white border border-[#EAE4D3] text-[#36363A] hover:border-[#C6A64B] cursor-pointer'
                            : 'bg-[#FAF8F2] text-[#444448]/35 cursor-not-allowed'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#444448]">
                All times displayed in {siteConfig.timezoneDisplay}. Grayed dates are closed or fully booked.
              </p>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#36363A]">
                <CalendarIcon className="w-4 h-4 text-[#C6A64B]" />
                <span>{selectedDate ? `Open Times for ${selectedDate}` : 'Select an available date'}</span>
              </div>

              {loadingSlots && (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-11 rounded-md bg-[#FAF8F2] animate-pulse" />
                  ))}
                </div>
              )}

              {!loadingSlots && selectedDate && slots.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {slots.map((s) => (
                    <button
                      key={`${s.startTime}_${s.providerId}`}
                      type="button"
                      onClick={() => handleSelectSlot(s)}
                      className="py-2.5 px-3 rounded-md border border-[#EAE4D3] bg-white hover:border-[#C6A64B] hover:bg-[#FAF8F2] text-sm font-mono tabular-nums text-[#36363A] min-h-[44px] cursor-pointer transition-colors"
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}

              {!loadingSlots && selectedDate && slots.length === 0 && (
                <div className="p-4 rounded-md bg-[#FAF8F2] border border-[#EAE4D3] space-y-3">
                  <p className="text-sm text-[#36363A]">No open times remain on {selectedDate}.</p>
                  {!waitlistOpen && !waitlistSubmitted && (
                    <button
                      type="button"
                      onClick={() => setWaitlistOpen(true)}
                      className="px-4 py-2 rounded-md bg-[#444448] text-white text-xs font-medium cursor-pointer"
                    >
                      Join Waitlist for {selectedDate}
                    </button>
                  )}
                  {waitlistOpen && !waitlistSubmitted && (
                    <form onSubmit={handleJoinWaitlist} className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone (+971...)"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#EAE4D3] rounded bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded bg-[#C6A64B] text-white text-xs font-medium cursor-pointer"
                      >
                        Request Waitlist Alert
                      </button>
                    </form>
                  )}
                  {waitlistSubmitted && (
                    <p className="text-xs font-medium text-[#A68834]">
                      Waitlist request saved. If a slot opens, we will send a 15-minute claim notice.
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-[#444448] hover:text-[#36363A] cursor-pointer"
                >
                  Back to Provider Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Patient Details */}
        {step === 4 && selectedSlot && (
          <form onSubmit={handleConfirmBooking} className="space-y-5">
            <div className="p-4 rounded-md bg-[#FAF8F2] border border-[#EAE4D3] flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-semibold text-[#36363A]">{selectedDate}</span> at{' '}
                <span className="font-mono font-semibold text-[#A68834]">{selectedSlot.startTime} GST</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs underline text-[#444448] cursor-pointer"
              >
                Change time
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+971 5..."
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Booking For</label>
                <select
                  value={bookingFor}
                  onChange={(e) => setBookingFor(e.target.value as 'myself' | 'family_member')}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                >
                  <option value="myself">Myself</option>
                  <option value="family_member">Family Member (Child / Spouse)</option>
                </select>
              </div>
            </div>

            {bookingFor === 'family_member' && (
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">Family Member Name *</label>
                <input
                  type="text"
                  required
                  value={familyMemberName}
                  onChange={(e) => setFamilyMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] min-h-[44px]"
                />
              </div>
            )}

            {activeOffers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#36363A] mb-1">
                  Offer Code (Self-Pay Only)
                </label>
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="Optional code"
                  className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-md border border-[#EAE4D3] font-mono min-h-[44px]"
                />
                <p className="text-xs text-[#444448] mt-1">
                  Offer applies to self-pay patients and is not valid with insurance.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[#36363A]">Scheduling Note (Optional)</label>
                <span className="text-xs font-medium text-[#A68834]">{siteConfig.rules.privacyNoteWarning}</span>
              </div>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Preferred language or accessibility request..."
                className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3]"
              />
            </div>

            <div className="space-y-2.5 text-sm text-[#444448]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderConsent}
                  onChange={(e) => setReminderConsent(e.target.checked)}
                  className="mt-1 accent-[#C6A64B]"
                />
                <span>
                  I consent to receive non-clinical appointment reminders by email or phone (never includes health details).
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancellationAck}
                  onChange={(e) => setCancellationAck(e.target.checked)}
                  className="mt-1 accent-[#C6A64B]"
                />
                <span>
                  I acknowledge the clinic cancellation terms ({bootstrap?.settings.cancellationPolicyDisplay || siteConfig.placeholders.cancellationPolicy}).
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 text-sm font-medium text-[#444448] cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-md bg-[#C6A64B] text-white font-medium text-base hover:bg-[#A68834] disabled:opacity-60 min-h-[44px] cursor-pointer"
              >
                {submitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
