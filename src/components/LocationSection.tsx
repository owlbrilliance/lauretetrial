import React, { useState } from 'react';
import { ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '../site.config';
import { useClinic } from '../context/ClinicContext';

export function LocationSection() {
  const { bootstrap } = useClinic();
  const [mapLoaded, setMapLoaded] = useState(false);

  const { lat, lng } = siteConfig.location.coordinates;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-5 bg-white border border-[#EAE4D3] rounded-lg p-6 sm:p-8 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <p className="text-xs font-medium tracking-wider uppercase text-[#A68834]">
            Al Rigga · Dubai, UAE
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#36363A]">
            Visit Laurette Medical Center
          </h3>
          <p className="text-base text-[#444448] leading-relaxed">
            Conveniently situated in Al Rigga, Dubai, serving neighboring communities across Deira, Al Muraqqabat, Port Saeed, and Dubai Creek.
          </p>

          <dl className="space-y-3 pt-2 text-sm border-t border-[#EAE4D3]">
            <div className="flex justify-between gap-4 pt-3">
              <dt className="text-[#444448]">Location</dt>
              <dd className="font-medium text-[#36363A] text-right">{siteConfig.location.fullLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#444448]">Coordinates</dt>
              <dd className="font-mono text-[#36363A] tabular-nums text-right">
                {lat}, {lng}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#444448]">Phone & WhatsApp</dt>
              <dd className="font-mono font-medium text-[#36363A] text-right">{siteConfig.phoneDisplay}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#444448]">Clinic Hours</dt>
              <dd className="text-[#444448] text-right">
                {bootstrap?.settings.officeHoursDisplay || siteConfig.placeholders.officeHours}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={siteConfig.location.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C6A64B] text-white text-sm font-medium hover:bg-[#A68834] transition-colors min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Directions on Bing Maps</span>
          </a>
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#444448] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px]"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>
          <a
            href={siteConfig.getWhatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#EAE4D3] text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 text-[#C6A64B]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="lg:col-span-7 bg-[#FAF8F2] border border-[#EAE4D3] rounded-lg overflow-hidden min-h-[340px] flex flex-col">
        {!mapLoaded ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#EAE4D3] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#C6A64B]" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="font-serif text-xl font-semibold text-[#36363A]">
                Al Rigga, Dubai · Interactive Location Map
              </p>
              <p className="text-sm font-mono text-[#444448] tabular-nums">
                {lat}° N, {lng}° E
              </p>
              <p className="text-sm text-[#444448]">
                Click below to load the interactive coordinate map or open Bing Maps for turn-by-turn navigation.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setMapLoaded(true)}
                className="px-5 py-2.5 rounded-md bg-[#444448] text-white text-sm font-medium hover:bg-[#36363A] min-h-[44px] cursor-pointer"
              >
                Load Interactive Map
              </button>
              <a
                href={siteConfig.location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-md border border-[#C6A64B] bg-white text-[#36363A] text-sm font-medium hover:bg-[#FAF8F2] min-h-[44px] inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[#C6A64B]" />
                <span>Bing Maps</span>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            title="Laurette Medical Center Location in Al Rigga, Dubai"
            src={osmEmbedUrl}
            className="w-full h-full min-h-[360px] border-0"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
