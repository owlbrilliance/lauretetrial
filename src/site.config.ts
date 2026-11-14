export const siteConfig = {
  practiceName: 'Laurette Medical Center',
  tagline: 'Refined Dental Care in Al Rigga, Dubai',
  industry: 'Dental Clinic / Dental Medical Center',
  logoUrl: '/assets/aistudio/482030713_122197681208150511_4759974482729775567_n_2586287d.jpg',
  phoneDisplay: '+971 58 573 3778',
  phoneDigits: '+971585733778',
  phoneHref: 'tel:+971585733778',
  whatsappDigits: '971585733778',
  whatsappDefaultMessage:
    'Hello Laurette Medical Center, I would like to inquire about booking a dental visit.',
  getWhatsappHref: (customMessage?: string) => {
    const text = encodeURIComponent(
      customMessage ||
        'Hello Laurette Medical Center, I would like to inquire about booking a dental visit.'
    );
    return `https://wa.me/971585733778?text=${text}`;
  },
  location: {
    neighborhood: 'Al Rigga',
    city: 'Dubai',
    country: 'United Arab Emirates',
    fullLabel: 'Al Rigga, Dubai, United Arab Emirates',
    nearbyAreas: ['Al Rigga', 'Deira', 'Al Muraqqabat', 'Port Saeed', 'Dubai Creek'],
    coordinates: {
      lat: 25.26706,
      lng: 55.3089,
    },
    directionsUrl: 'https://www.bing.com/maps/search?q=25.26706%2C+55.3089',
    directionsProvider: 'Bing Maps',
  },
  currency: 'AED',
  timezone: 'Asia/Dubai',
  timezoneDisplay: 'Asia/Dubai (GST, UTC+4)',
  placeholders: {
    email: '[EMAIL PLACEHOLDER]',
    officeHours: '[OFFICE HOURS — PLACEHOLDER]',
    emergencyLine: '[NOT PROVIDED — DO NOT ASSUME MAIN NUMBER IS AN EMERGENCY LINE]',
    emergencyHours: '[NOT PROVIDED]',
    adminEmail: '[ADMIN EMAIL — PLACEHOLDER]',
    insuranceAccepted: '[NOT PROVIDED — DO NOT DISPLAY UNVERIFIED INSURANCE PROVIDERS]',
    financingPartner: '[NOT PROVIDED]',
    membershipPlan: 'NONE',
    paymentMethod: '[NOT PROVIDED]',
    cancellationPolicy: '[CANCELLATION POLICY — PLACEHOLDER]',
    newPatientOffer: 'NONE',
    yearsInPractice: '[NOT PROVIDED]',
    technology: '[NOT PROVIDED]',
    teamSize: '[NOT PROVIDED]',
  },
  rules: {
    privacyNoteWarning: "Please don't include medical details here.",
    emergencyNotice:
      'If you are experiencing trouble breathing or swallowing, swelling spreading to the face or neck, uncontrolled bleeding, or head/facial trauma, call 998 (UAE) / 911 or go to the nearest emergency room now.',
    attorneyReviewNotice:
      'Notice of Privacy Practices placeholder — Requires review by a qualified healthcare attorney before clinical launch.',
    estimatePolicy: 'Call for an estimate',
  },
} as const;
