import React from 'react';
import { ArrowLeft, Calendar, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { clinicMedia } from '../lib/media';
import { useClinic } from '../context/ClinicContext';

export function ServicesPage({ slug }: { slug?: string }) {
  const { bootstrap, navigate } = useClinic();
  const confirmedServices = bootstrap?.confirmedServices || [];

  if (slug) {
    const svc = confirmedServices.find((s) => s.slug === slug);
    if (!svc) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#444448] hover:text-[#36363A] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </button>
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-8 space-y-4">
            <h1 className="font-serif text-3xl font-semibold text-[#36363A]">
              Service Information Pending Clinic Confirmation
            </h1>
            <p className="text-base text-[#444448] leading-relaxed">
              This service category has not yet been published as a confirmed offering by Laurette Medical Center. Please contact our reception team directly for current availability and estimates in AED.
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
                href={siteConfig.getWhatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#444448] bg-white text-[#36363A] text-sm font-medium min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#444448] hover:text-[#36363A] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Confirmed Services</span>
        </button>

        <div className="space-y-4 border-b border-[#EAE4D3] pb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            {svc.category} · Al Rigga, Dubai
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">{svc.name}</h1>
          <p className="text-lg text-[#444448] max-w-3xl leading-relaxed">{svc.shortSummary}</p>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
            <span className="font-semibold text-[#36363A]">Estimate: {svc.priceLabel}</span>
            <span aria-hidden="true" className="text-[#D4BC78]">·</span>
            <span className="font-mono text-[#444448]">Typical Visit: {svc.durationMinutes} min</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-2">
            <h2 className="font-serif text-xl font-semibold text-[#36363A]">What It Is</h2>
            <p className="text-sm text-[#444448] leading-relaxed">{svc.whatItIs}</p>
          </div>
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-2">
            <h2 className="font-serif text-xl font-semibold text-[#36363A]">Who It May Suit</h2>
            <p className="text-sm text-[#444448] leading-relaxed">{svc.whoItIsFor}</p>
          </div>
          <div className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-2">
            <h2 className="font-serif text-xl font-semibold text-[#36363A]">What to Expect</h2>
            <p className="text-sm text-[#444448] leading-relaxed">{svc.whatToExpect}</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAE4D3] rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-semibold text-[#36363A]">Schedule a Consultation</h3>
            <p className="text-sm text-[#444448]">
              Final suitability and fee estimates in AED are always confirmed after an in-person clinical exam.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/book')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <a
              href={siteConfig.getWhatsappHref(`Hello Laurette Medical Center, I would like to inquire about ${svc.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#444448] text-[#36363A] text-sm font-medium min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            Laurette Medical Center · Al Rigga, Dubai
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A]">
            Dental Services & Estimate Policy
          </h1>
          <p className="text-base sm:text-lg text-[#444448] max-w-2xl leading-relaxed">
            We publish only verified treatments confirmed by Laurette Medical Center leadership. For individualized treatment questions or estimates in AED, please call or message +971 58 573 3778.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {confirmedServices.length > 0 ? (
          <div className="space-y-8">
            {confirmedServices.map((svc, idx) => (
              <div
                key={svc.id}
                className="border border-[#EAE4D3] rounded-lg p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-8 space-y-3">
                  <div className="text-xs font-medium text-[#A68834] flex items-center gap-2">
                    <span className="font-mono">{String(idx + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{svc.category}</span>
                  </div>
                  <h2 className="font-serif text-3xl font-semibold text-[#36363A]">{svc.name}</h2>
                  <p className="text-base text-[#444448] leading-relaxed">{svc.whatItIs}</p>
                  <p className="text-sm text-[#444448]">
                    <strong className="text-[#36363A]">What to expect:</strong> {svc.whatToExpect}
                  </p>
                </div>
                <div className="lg:col-span-4 bg-[#FAF8F2] border border-[#EAE4D3] rounded-md p-5 space-y-4">
                  <div>
                    <span className="text-xs text-[#444448] block">Pricing Guidance (AED)</span>
                    <span className="font-semibold text-[#36363A]">{svc.priceLabel}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className="w-full py-2.5 rounded-md border border-[#444448] text-sm font-medium text-[#36363A] bg-white hover:bg-[#FAF8F2] cursor-pointer min-h-[44px]"
                    >
                      View Service Details
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/book')}
                      className="w-full py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] cursor-pointer min-h-[44px]"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-serif text-3xl font-semibold text-[#36363A]">
                Service Menu Awaiting Clinic Confirmation
              </h2>
              <p className="text-base text-[#444448] leading-relaxed">
                To maintain complete clinical accuracy, Laurette Medical Center does not list unverified treatment categories as confirmed offerings until approved by our clinic administration.
              </p>
              <p className="text-base text-[#444448] leading-relaxed">
                You may book an initial consultation online, call our reception desk for an AED estimate, or reach us directly via WhatsApp. Clinic administrators can review and publish confirmed service categories from the Admin Console.
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#444448] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
                  <span>WhatsApp Inquiry</span>
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/book')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#EAE4D3] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px] cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#C6A64B]" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#EAE4D3]">
                <img
                  src={clinicMedia.treatmentSuite}
                  alt="Laurette Medical Center serene dental suite"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
