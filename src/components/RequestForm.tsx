import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';

interface RequestFormProps {
  defaultUrgent?: boolean;
  heading?: string;
}

export function RequestForm({
  defaultUrgent = false,
  heading = 'Request a Callback or Estimate',
}: RequestFormProps) {
  const { bootstrap, showToast } = useClinic();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('New Patient Consultation');
  const [patientType, setPatientType] = useState<'new' | 'existing'>('new');
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'any'>('any');
  const [isUrgent, setIsUrgent] = useState(defaultUrgent);
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const confirmedServices = bootstrap?.confirmedServices || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (name.trim().length < 2 || phone.trim().length < 6) {
      setErrorMsg('Please provide your name and a valid phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          reason,
          patientType,
          preferredTime,
          isUrgent,
          message,
          companyWebsite: honeypot,
          pageUrl: window.location.pathname,
          utmSource: params.get('utm_source') || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not submit request. Please call us directly.');
        return;
      }
      setSubmitted(true);
      showToast('Your request has been received by our reception team.', 'success');
    } catch {
      setErrorMsg('Network issue. Please call or WhatsApp +971 58 573 3778.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-[#EAE4D3] rounded-lg p-8 space-y-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#C6A64B] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#36363A]">Request Received</h3>
            <p className="text-base text-[#444448] mt-1">
              Thank you, {name}. Our reception desk at Laurette Medical Center has received your inquiry.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#C6A64B] text-white font-medium text-sm hover:bg-[#A68834] transition-colors min-h-[44px]"
          >
            <Phone className="w-4 h-4" />
            <span>Call {siteConfig.phoneDisplay}</span>
          </a>
          <a
            href={siteConfig.getWhatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#444448] text-[#36363A] font-medium text-sm hover:bg-[#FAF8F2] transition-colors min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
            <span>Message on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#EAE4D3] rounded-lg p-6 sm:p-8 space-y-5"
      noValidate
    >
      <div>
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#36363A]">{heading}</h3>
        <p className="text-sm text-[#444448] mt-1">
          Prefer immediate assistance? Call or WhatsApp{' '}
          <a href={siteConfig.phoneHref} className="font-mono font-medium text-[#A68834] underline">
            {siteConfig.phoneDisplay}
          </a>
          .
        </p>
      </div>

      {/* Urgent Dental / Medical Emergency Notice */}
      <div className="flex items-center gap-3 pt-1">
        <input
          id="urgent-toggle"
          type="checkbox"
          checked={isUrgent}
          onChange={(e) => setIsUrgent(e.target.checked)}
          className="w-4 h-4 accent-[#C6A64B] rounded"
        />
        <label htmlFor="urgent-toggle" className="text-sm font-medium text-[#36363A] cursor-pointer">
          This is an urgent dental inquiry
        </label>
      </div>

      {isUrgent && (
        <div className="p-4 rounded-md bg-[#FAF8F2] border border-[#C6A64B]/60 text-sm text-[#36363A] space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#A68834] shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{siteConfig.rules.emergencyNotice}</p>
          </div>
          <p className="text-xs text-[#444448] pl-7">
            Dedicated emergency line & hours: {bootstrap?.settings.emergencyLineDisplay || siteConfig.placeholders.emergencyLine}. You may also call reception on {siteConfig.phoneDisplay} during clinic hours.
          </p>
        </div>
      )}

      {/* Honeypot */}
      <input
        type="text"
        name="companyWebsite"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="req-name" className="block text-sm font-medium text-[#36363A] mb-1.5">
            Full Name *
          </label>
          <input
            id="req-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base text-[#36363A] bg-white focus:border-[#C6A64B] min-h-[44px]"
          />
        </div>
        <div>
          <label htmlFor="req-phone" className="block text-sm font-medium text-[#36363A] mb-1.5">
            Phone / WhatsApp *
          </label>
          <input
            id="req-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+971 50 ..."
            className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base font-mono text-[#36363A] bg-white focus:border-[#C6A64B] min-h-[44px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="req-email" className="block text-sm font-medium text-[#36363A] mb-1.5">
            Email (Optional)
          </label>
          <input
            id="req-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base text-[#36363A] bg-white focus:border-[#C6A64B] min-h-[44px]"
          />
        </div>
        <div>
          <label htmlFor="req-reason" className="block text-sm font-medium text-[#36363A] mb-1.5">
            Inquiry Topic
          </label>
          <select
            id="req-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base text-[#36363A] bg-white focus:border-[#C6A64B] min-h-[44px]"
          >
            <option value="New Patient Consultation">New Patient Consultation</option>
            <option value="General Estimate Inquiry">General Estimate Inquiry</option>
            <option value="Appointment Scheduling">Appointment Scheduling</option>
            {confirmedServices.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-medium text-[#36363A] mb-1.5">Patient Status</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPatientType('new')}
              className={`py-2.5 px-3 text-sm font-medium rounded-md border min-h-[44px] cursor-pointer transition-colors ${
                patientType === 'new'
                  ? 'bg-[#444448] text-white border-[#444448]'
                  : 'bg-white text-[#444448] border-[#EAE4D3] hover:bg-[#FAF8F2]'
              }`}
            >
              New Patient
            </button>
            <button
              type="button"
              onClick={() => setPatientType('existing')}
              className={`py-2.5 px-3 text-sm font-medium rounded-md border min-h-[44px] cursor-pointer transition-colors ${
                patientType === 'existing'
                  ? 'bg-[#444448] text-white border-[#444448]'
                  : 'bg-white text-[#444448] border-[#EAE4D3] hover:bg-[#FAF8F2]'
              }`}
            >
              Returning
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="req-time" className="block text-sm font-medium text-[#36363A] mb-1.5">
            Preferred Time of Day
          </label>
          <select
            id="req-time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value as 'morning' | 'afternoon' | 'evening' | 'any')}
            className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base text-[#36363A] bg-white focus:border-[#C6A64B] min-h-[44px]"
          >
            <option value="any">Any available time</option>
            <option value="morning">Morning (GST)</option>
            <option value="afternoon">Afternoon (GST)</option>
            <option value="evening">Late Afternoon / Evening</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="req-note" className="block text-sm font-medium text-[#36363A]">
            Scheduling Note (Optional)
          </label>
          <span className="text-xs font-medium text-[#A68834]">{siteConfig.rules.privacyNoteWarning}</span>
        </div>
        <textarea
          id="req-note"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Preferred callback window or general scheduling question..."
          className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] text-base text-[#36363A] bg-white focus:border-[#C6A64B]"
        />
      </div>

      {errorMsg && (
        <p role="alert" className="text-sm text-red-700 font-medium">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-7 py-3 rounded-md bg-[#C6A64B] text-white font-medium text-base hover:bg-[#A68834] disabled:opacity-60 transition-colors min-h-[44px] cursor-pointer"
      >
        {submitting ? 'Sending Request...' : 'Submit Callback Request'}
      </button>
    </form>
  );
}
