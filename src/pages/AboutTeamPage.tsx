import React from 'react';
import { Calendar, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { clinicMedia } from '../lib/media';
import { useClinic } from '../context/ClinicContext';

export function AboutTeamPage() {
  const { bootstrap, navigate } = useClinic();
  const providers = bootstrap?.providers || [];

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F2] border-b border-[#EAE4D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
            About Laurette Medical Center
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#36363A] text-balance">
            Quiet Clinical Excellence in Al Rigga, Dubai
          </h1>
          <p className="text-base sm:text-lg text-[#444448] max-w-2xl leading-relaxed">
            Every element of Laurette Medical Center is designed around patient calm, unhurried dialogue, and respectful communication.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="font-serif text-3xl font-semibold text-[#36363A]">Practice Overview</h2>
            <p className="text-base text-[#444448] leading-relaxed">
              Situated in Al Rigga, Dubai, Laurette Medical Center serves residents and visitors across Deira, Al Muraqqabat, Port Saeed, and neighboring Dubai districts.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-sm border-t border-[#EAE4D3]">
              <div>
                <dt className="text-[#444448]">Years in Practice</dt>
                <dd className="font-medium text-[#36363A] mt-0.5">
                  {bootstrap?.settings.yearsInPracticeDisplay || siteConfig.placeholders.yearsInPractice}
                </dd>
              </div>
              <div>
                <dt className="text-[#444448]">Clinical Technology</dt>
                <dd className="font-medium text-[#36363A] mt-0.5">
                  {bootstrap?.settings.technologyDisplay || siteConfig.placeholders.technology}
                </dd>
              </div>
              <div>
                <dt className="text-[#444448]">Team Size</dt>
                <dd className="font-medium text-[#36363A] mt-0.5">
                  {bootstrap?.settings.teamSizeDisplay || siteConfig.placeholders.teamSize}
                </dd>
              </div>
              <div>
                <dt className="text-[#444448]">Currency & Timezone</dt>
                <dd className="font-medium text-[#36363A] mt-0.5">AED · Asia/Dubai (GST)</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#EAE4D3]">
              <img
                src={clinicMedia.consultationLounge}
                alt="Laurette Medical Center consultation suite"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-[#EAE4D3] space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#A68834]">
              Clinical Directory
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#36363A] mt-1">
              Dentists & Care Staff
            </h2>
            <p className="text-sm text-[#444448] mt-1">
              Doctor names, credentials, and verified clinical bios are clearly marked as placeholders until published by clinic leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((p) => (
              <div key={p.id} className="bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white border border-[#C6A64B] flex items-center justify-center font-serif text-lg font-semibold text-[#C6A64B]">
                    LMC
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#36363A]">{p.name}</h3>
                    <p className="text-xs font-medium text-[#A68834]">
                      {p.roleTitle} · {p.credentials}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#444448]">
                  Specialty: {p.specialty} · Languages: {p.languages}
                </p>
                <p className="text-sm text-[#444448] leading-relaxed">{p.bio}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/book')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] min-h-[44px] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
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
      </section>
    </div>
  );
}
