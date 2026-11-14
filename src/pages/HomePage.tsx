import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react';
import { siteConfig } from '../site.config';
import { clinicMedia } from '../lib/media';
import { useClinic } from '../context/ClinicContext';
import { RequestForm } from '../components/RequestForm';
import { LocationSection } from '../components/LocationSection';

export function HomePage() {
  const { bootstrap, navigate, showToast } = useClinic();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  const confirmedServices = bootstrap?.confirmedServices || [];
  const providers = bootstrap?.providers || [];
  const reviews = bootstrap?.reviews || [];

  const faqs = [
    {
      q: 'Where is Laurette Medical Center located in Dubai?',
      a: 'We are located in Al Rigga, Dubai, United Arab Emirates (coordinates 25.26706, 55.3089), serving Al Rigga, Deira, Al Muraqqabat, Port Saeed, and nearby neighborhoods. Use our Bing Maps directions link on this page for navigation.',
    },
    {
      q: 'How can I request a price estimate in AED?',
      a: 'Please call or message our reception desk on +971 58 573 3778. Every dental treatment plan is personalized, so final fees in AED are confirmed after an in-person clinical examination.',
    },
    {
      q: 'How do I book or inquire via WhatsApp?',
      a: 'You can tap any WhatsApp button across the website to start a direct conversation with +971 58 573 3778, or use our online booking calendar to reserve an open consultation window.',
    },
    {
      q: 'Should I include medical details in online forms or chat?',
      a: 'No. For your privacy, please do not enter personal medical details or symptoms in website forms, emails, or WhatsApp messages. Clinical history is always discussed privately with your dentist in person.',
    },
  ];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewSent(true);
        setReviewName('');
        setReviewComment('');
        showToast('Thank you. Your feedback has been submitted for clinic review.', 'success');
      } else {
        const d = await res.json();
        showToast(d.error || 'Please check your review fields.', 'error');
      }
    } catch {
      showToast('Could not submit feedback right now.', 'error');
    }
  };

  return (
    <div>
      {/* 1. LUXURY HERO SECTION */}
      <section className="bg-white border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center space-y-6"
            >
              <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-[#A68834]">
                <span>Al Rigga, Dubai</span>
                <span aria-hidden="true">·</span>
                <span>Dental Medical Center</span>
              </div>

              <h1 className="font-serif text-[clamp(2.35rem,4vw,3.75rem)] leading-[1.08] font-semibold text-[#36363A] text-balance">
                Calm, Refined Dental Care in the Heart of Al Rigga
              </h1>

              <p className="text-base sm:text-lg text-[#444448] leading-relaxed max-w-xl">
                Laurette Medical Center welcomes patients from Al Rigga and across Dubai into a serene, unhurried clinical setting built around clear communication, comfort, and attentive care.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/book')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-[#C6A64B] text-white font-medium text-base hover:bg-[#A68834] transition-colors min-h-[48px] cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
                <a
                  href={siteConfig.getWhatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-[#444448] bg-white text-[#36363A] font-medium text-base hover:bg-[#FAF8F2] transition-colors min-h-[48px]"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                  <span>WhatsApp Contact</span>
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#444448]">
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center gap-1.5 font-mono font-medium text-[#36363A] hover:text-[#C6A64B]"
                >
                  <Phone className="w-4 h-4 text-[#C6A64B]" />
                  <span>{siteConfig.phoneDisplay}</span>
                </a>
                <span aria-hidden="true" className="text-[#D4BC78]">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/new-patients')}
                  className="underline decoration-[#D4BC78] underline-offset-4 hover:text-[#A68834] cursor-pointer"
                >
                  New Patient Guide
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6"
            >
              <div className="h-full min-h-[320px] lg:min-h-[460px] rounded-lg overflow-hidden border border-[#EAE4D3] bg-[#FAF8F2]">
                <img
                  src={clinicMedia.heroReception}
                  alt="Laurette Medical Center serene marble and champagne gold reception lounge in Dubai"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRUST & ACCESS STRIP (Real Facts Only) */}
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#A68834] font-medium block">
                Location
              </span>
              <span className="font-medium text-[#36363A] block">Al Rigga, Dubai, UAE</span>
              <span className="text-xs font-mono text-[#444448] tabular-nums">
                25.26706, 55.3089
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#A68834] font-medium block">
                Direct Reception
              </span>
              <a
                href={siteConfig.phoneHref}
                className="font-mono font-medium text-[#36363A] hover:text-[#C6A64B] block"
              >
                {siteConfig.phoneDisplay}
              </a>
              <span className="text-xs text-[#444448]">Call or WhatsApp</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#A68834] font-medium block">
                Fee Transparency
              </span>
              <span className="font-medium text-[#36363A] block">AED Estimates</span>
              <span className="text-xs text-[#444448]">Confirmed after exam</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-[#A68834] font-medium block">
                Scheduling Timezone
              </span>
              <span className="font-medium text-[#36363A] block">Asia/Dubai (GST)</span>
              <span className="text-xs text-[#444448]">Online & reception support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CLINICAL SERVICES (Respects Confirmed vs Unconfirmed Rule) */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAE4D3] pb-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
                Clinical Care & Consultations
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#36363A] text-balance">
                Thoughtful Care Tailored After Examination
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#36363A] hover:text-[#C6A64B] shrink-0 cursor-pointer"
            >
              <span>View Services Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {confirmedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedServices.slice(0, 6).map((svc, idx) => (
                <div
                  key={svc.id}
                  className="bg-white border border-[#EAE4D3] rounded-lg p-6 flex flex-col justify-between space-y-5 hover:border-[#C6A64B] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="text-xs text-[#A68834] font-medium flex items-center gap-2">
                      <span className="font-mono">{String(idx + 1).padStart(2, '0')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{svc.category}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-[#36363A]">{svc.name}</h3>
                    <p className="text-sm text-[#444448] leading-relaxed">{svc.shortSummary}</p>
                  </div>
                  <div className="pt-4 border-t border-[#EAE4D3] flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-[#36363A]">{svc.priceLabel}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className="text-[#A68834] font-medium hover:underline cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 sm:p-10">
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#36363A]">
                  Clinical Service Menu Currently Being Confirmed
                </h3>
                <p className="text-base text-[#444448] leading-relaxed">
                  Laurette Medical Center only publishes verified clinical offerings once confirmed by our medical leadership. While our full online treatment menu is being finalized, our reception team is pleased to confirm availability and provide guidance by phone or WhatsApp.
                </p>
                <p className="text-sm font-medium text-[#36363A]">
                  Estimates in AED: Call {siteConfig.phoneDisplay} for an estimate.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={siteConfig.phoneHref}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {siteConfig.phoneDisplay}</span>
                  </a>
                  <a
                    href={siteConfig.getWhatsappHref('Hello Laurette Medical Center, I would like to ask about available dental services and estimates.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#444448] bg-white text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#EAE4D3]">
                  <img
                    src={clinicMedia.treatmentSuite}
                    alt="Private dental treatment suite with warm ivory cabinetry and champagne gold trim"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW YOUR VISIT WORKS */}
      <section className="py-16 lg:py-20 bg-[#FAF8F2] border-y border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
              Patient Experience
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#36363A]">
              Three Calm Steps to Your Appointment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Choose & Request',
                body: 'Select an open consultation time online, call +971 58 573 3778, or message our reception desk on WhatsApp.',
              },
              {
                num: '02',
                title: 'Unhurried Consultation',
                body: 'Arrive at our Al Rigga sanctuary where your clinician listens to your goals and performs a gentle, attentive evaluation.',
              },
              {
                num: '03',
                title: 'Clear AED Plan',
                body: 'Receive a straightforward explanation of findings and a written AED estimate before deciding on any next step.',
              },
            ].map((item) => (
              <div key={item.num} className="bg-white border border-[#EAE4D3] rounded-lg p-6 space-y-3">
                <span className="font-mono text-sm text-[#C6A64B] font-medium block">{item.num}</span>
                <h3 className="font-serif text-2xl font-semibold text-[#36363A]">{item.title}</h3>
                <p className="text-sm text-[#444448] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURAL SANCTUARY & CARE TEAM PLACEHOLDERS */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
                Environment & Comfort
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#36363A] text-balance">
                Designed to Replace Clinical Tension With Calm
              </h2>
              <p className="text-base text-[#444448] leading-relaxed">
                Every suite at Laurette Medical Center pairs warm natural tones, soft daylight, and quiet privacy with attentive hospitality so patients of every age feel at ease from arrival to departure.
              </p>
            </div>
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#EAE4D3]">
                <img
                  src={clinicMedia.consultationLounge}
                  alt="Laurette Medical Center private consultation lounge in Dubai"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#EAE4D3]">
                <img
                  src={clinicMedia.careStillLife}
                  alt="Champagne gold tray and travertine oral care presentation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Clinical Team (Honest Placeholders, Zero Fake Stock Doctors) */}
          <div className="pt-8 border-t border-[#EAE4D3] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
                  Clinical Leadership
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#36363A] mt-1">
                  Meet the Care Team
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="text-sm font-medium text-[#A68834] hover:underline cursor-pointer"
              >
                About Laurette Medical Center
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((prov) => (
                <div
                  key={prov.id}
                  className="border border-[#EAE4D3] rounded-lg p-6 bg-[#FAF8F2] flex flex-col sm:flex-row gap-5 items-start"
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-[#C6A64B]/60 flex items-center justify-center shrink-0 font-serif text-xl font-semibold text-[#C6A64B]">
                    LMC
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-2xl font-semibold text-[#36363A]">{prov.name}</h3>
                    <p className="text-xs font-medium text-[#A68834]">
                      {prov.roleTitle} · {prov.credentials}
                    </p>
                    <p className="text-xs text-[#444448]">
                      Specialty: {prov.specialty} · Languages: {prov.languages}
                    </p>
                    <p className="text-sm text-[#444448] pt-1 leading-relaxed">{prov.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. LOCATION & GENUINE PATIENT FEEDBACK */}
      <section className="py-16 lg:py-24 bg-[#FAF8F2] border-t border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <LocationSection />

          {/* Patient Reviews Section (Real Approved Reviews Only) */}
          <div className="pt-10 border-t border-[#EAE4D3] grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
                Patient Reflections
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#36363A]">
                Verified Clinic Feedback
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-[#EAE4D3] rounded-lg p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#36363A]">{rev.authorName}</span>
                        <div className="flex items-center gap-0.5 text-[#C6A64B]" aria-label={`${rev.rating} out of 5 stars`}>
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#C6A64B]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#444448] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#EAE4D3] rounded-lg p-6 space-y-3">
                  <p className="text-base text-[#444448]">
                    Laurette Medical Center publishes only genuine, verified patient feedback. No placeholder reviews are displayed here.
                  </p>
                  <a
                    href={siteConfig.location.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#A68834] hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>View Clinic Location on Bing Maps</span>
                  </a>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white border border-[#EAE4D3] rounded-lg p-6">
              <h3 className="font-serif text-2xl font-semibold text-[#36363A] mb-3">
                Share Your Visit Experience
              </h3>
              {reviewSent ? (
                <p className="text-sm text-[#444448]">
                  Thank you. Your feedback has been received and awaits clinic approval before appearing publicly.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#EAE4D3] rounded-md min-h-[44px]"
                  />
                  <div>
                    <label className="block text-xs text-[#444448] mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE4D3] rounded-md bg-white min-h-[44px]"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your experience with our team (please avoid personal medical details)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#EAE4D3] rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-md bg-[#444448] text-white text-sm font-medium hover:bg-[#36363A] min-h-[44px] cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ & QUICK REQUEST */}
      <section className="py-16 lg:py-24 bg-white border-t border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
                Common Questions
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#36363A]">
                Before Your Visit
              </h2>
            </div>

            <div className="divide-y divide-[#EAE4D3] border-y border-[#EAE4D3]">
              {faqs.map((f, i) => {
                const isOpen = openFaqIdx === i;
                return (
                  <div key={i} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left font-medium text-[#36363A] cursor-pointer"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C6A64B] shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && <p className="mt-2.5 text-sm text-[#444448] leading-relaxed">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <RequestForm heading="Request an Appointment or Callback" />
          </div>
        </div>
      </section>
    </div>
  );
}
