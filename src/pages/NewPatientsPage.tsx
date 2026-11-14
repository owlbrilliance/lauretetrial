import React, { useState } from 'react';
import { Calendar, CheckCircle2, FileText, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';

export function NewPatientsPage({ showFormsOnly = false }: { showFormsOnly?: boolean }) {
  const { bootstrap, user, navigate, showToast } = useClinic();
  const [fullName, setFullName] = useState(user?.name || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'whatsapp' | 'email'>('whatsapp');
  const [insuranceInfoNote, setInsuranceInfoNote] = useState('');
  const [consentReminders, setConsentReminders] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/intake-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail,
          fullName,
          phone,
          emergencyContactName,
          emergencyContactPhone,
          preferredContact,
          insuranceInfoNote,
          consentReminders,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        showToast('Pre-visit contact details saved.', 'success');
      } else {
        const d = await res.json();
        showToast(d.error || 'Please check required fields.', 'error');
      }
    } catch {
      showToast('Could not submit pre-visit form.', 'error');
    }
  };

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            First Visit Guide · Al Rigga, Dubai
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">
            {showFormsOnly ? 'Digital Pre-Visit Contact Form' : 'Welcome to Laurette Medical Center'}
          </h1>
          <p className="text-base sm:text-lg text-[#444448] max-w-2xl leading-relaxed">
            Your first visit begins with an unhurried conversation in a calm setting. No rushed waiting rooms and no pressure to commit on the spot.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {!showFormsOnly && (
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <h2 className="font-serif text-3xl font-semibold text-[#36363A]">What to Expect</h2>
              <p className="text-base text-[#444448] leading-relaxed">
                From reception welcome to clinical evaluation, we explain every step clearly in plain English and pause whenever you ask.
              </p>
            </div>

            <div className="space-y-4 border-t border-[#EAE4D3] pt-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#36363A]">Insurance & Payment Policy</h3>
                <p className="text-sm text-[#444448] mt-1">
                  Accepted Insurance: {bootstrap?.settings.insuranceAcceptedDisplay || siteConfig.placeholders.insuranceAccepted}
                </p>
                <p className="text-sm text-[#444448] mt-1">
                  Financing / Payment Options: {bootstrap?.settings.paymentMethodDisplay || siteConfig.placeholders.paymentMethod}
                </p>
                <p className="text-sm text-[#444448] mt-1">
                  New-Patient Offer: {bootstrap?.settings.newPatientOfferDisplay || siteConfig.placeholders.newPatientOffer}
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#36363A]">Estimates in AED</h3>
                <p className="text-sm text-[#444448] mt-1">
                  Call {siteConfig.phoneDisplay} for general inquiries. A clear AED estimate is provided after your clinician completes an exam.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/book')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px] cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your First Visit</span>
              </button>
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#444448] text-[#36363A] text-sm font-medium min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                <span>{siteConfig.phoneDisplay}</span>
              </a>
              <a
                href={siteConfig.getWhatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#EAE4D3] text-[#36363A] text-sm font-medium min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        <div className={showFormsOnly ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-6'}>
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-[#C6A64B] shrink-0 mt-0.5" />
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#36363A]">
                  Pre-Visit Contact Registration
                </h2>
                <p className="text-xs text-[#A68834] mt-1 font-medium">
                  Privacy-first: Only basic contact and emergency contact information is collected online. Medical history is reviewed privately in person with your clinician.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="bg-white border border-[#EAE4D3] rounded-md p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#36363A] font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#C6A64B]" />
                  <span>Pre-Visit Form Completed</span>
                </div>
                <p className="text-sm text-[#444448]">
                  Thank you, {fullName}. Your registration has been linked to your email address for smooth check-in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 5..."
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white font-mono min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Preferred Contact</label>
                    <select
                      value={preferredContact}
                      onChange={(e) => setPreferredContact(e.target.value as 'phone' | 'whatsapp' | 'email')}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Phone Call</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Emergency Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36363A] mb-1">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#36363A] mb-1">
                    Insurance Carrier Name (Optional, if applicable)
                  </label>
                  <input
                    type="text"
                    value={insuranceInfoNote}
                    onChange={(e) => setInsuranceInfoNote(e.target.value)}
                    placeholder="Coverage confirmation is handled at clinic reception"
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#EAE4D3] bg-white min-h-[44px]"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-sm text-[#444448] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentReminders}
                    onChange={(e) => setConsentReminders(e.target.checked)}
                    className="mt-1 accent-[#C6A64B]"
                  />
                  <span>I consent to receive non-clinical appointment reminders.</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-md bg-[#C6A64B] text-white font-medium text-base hover:bg-[#A68834] min-h-[44px] cursor-pointer"
                >
                  Save Pre-Visit Contact Form
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
