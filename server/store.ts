import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Appointment,
  AppointmentHold,
  AppointmentType,
  BlogPost,
  ChatTranscript,
  ClinicSettings,
  GalleryItem,
  IntakeFormRecord,
  MembershipPlan,
  OfferItem,
  Operatory,
  PatientAccount,
  PatientRequest,
  ProviderProfile,
  ReviewItem,
  ServiceItem,
  WaitlistEntry,
} from '../src/types';

export interface ClinicDatabase {
  settings: ClinicSettings;
  services: ServiceItem[];
  providers: ProviderProfile[];
  operatories: Operatory[];
  appointmentTypes: AppointmentType[];
  appointments: Appointment[];
  holds: AppointmentHold[];
  waitlist: WaitlistEntry[];
  requests: PatientRequest[];
  offers: OfferItem[];
  membershipPlans: MembershipPlan[];
  reviews: ReviewItem[];
  galleryItems: GalleryItem[];
  blogPosts: BlogPost[];
  intakeForms: IntakeFormRecord[];
  patients: PatientAccount[];
  chatTranscripts: ChatTranscript[];
  auditLogs: { id: string; action: string; actorRole: string; timestamp: string }[];
  pendingAuthCodes: { email: string; code: string; expiresAt: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic-db.json');

const SUGGESTED_SERVICE_CATEGORIES: {
  name: string;
  slug: string;
  category: string;
  shortSummary: string;
  whatItIs: string;
  whoItIsFor: string;
  whatToExpect: string;
  durationMinutes: number;
}[] = [
  {
    name: 'General Dentistry',
    slug: 'general-dentistry',
    category: 'Foundational Care',
    shortSummary: 'Comprehensive oral examinations, preventive guidance, and routine restorative care.',
    whatItIs: 'Ongoing oral health evaluations and everyday dental care tailored to preserve natural teeth and gums.',
    whoItIsFor: 'Adults and families seeking attentive, calm routine dental care in Al Rigga, Dubai.',
    whatToExpect: 'A unhurried conversation about your goals, a gentle examination, and clear explanation of any findings before any care begins.',
    durationMinutes: 45,
  },
  {
    name: 'Dental Checkups',
    slug: 'dental-checkups',
    category: 'Preventive Care',
    shortSummary: 'Thorough periodic oral assessments to support long-term tooth and gum wellness.',
    whatItIs: 'A structured evaluation of teeth, gums, bite alignment, and existing dental restorations.',
    whoItIsFor: 'New and returning patients establishing a calm, consistent preventive schedule.',
    whatToExpect: 'Your dentist reviews your comfort preferences, checks each tooth carefully, and answers all questions in plain language.',
    durationMinutes: 30,
  },
  {
    name: 'Teeth Cleaning',
    slug: 'teeth-cleaning',
    category: 'Preventive Care',
    shortSummary: 'Professional plaque and tartar removal paired with gentle surface polishing.',
    whatItIs: 'Professional dental hygiene care designed to remove buildup along the gumline and refresh tooth surfaces.',
    whoItIsFor: 'Patients maintaining fresh breath, healthy gums, and smooth enamel between routine checkups.',
    whatToExpect: 'Comfort-focused scaling and gentle polishing at a pace suited to your sensitivity level.',
    durationMinutes: 45,
  },
  {
    name: 'Teeth Whitening',
    slug: 'teeth-whitening',
    category: 'Aesthetic Care',
    shortSummary: 'Clinically supervised brightening options discussed after an oral health evaluation.',
    whatItIs: 'Professional tooth shade brightening planned around enamel health and sensitivity considerations.',
    whoItIsFor: 'Adults interested in lifting surface discoloration from coffee, tea, or natural aging.',
    whatToExpect: 'An initial suitability check followed by a clear overview of options and realistic shade expectations. Individual results vary.',
    durationMinutes: 60,
  },
  {
    name: 'Dental Implants',
    slug: 'dental-implants',
    category: 'Restorative Care',
    shortSummary: 'Consultations and restorative planning for single or multiple missing teeth.',
    whatItIs: 'A dedicated assessment exploring biocompatible tooth-root replacement and custom crown restoration.',
    whoItIsFor: 'Patients seeking stable, natural-looking options for missing teeth.',
    whatToExpect: 'A calm consultation reviewing oral structure, timeline stages, and personalized pricing before any decision is made.',
    durationMinutes: 60,
  },
  {
    name: 'Veneers',
    slug: 'veneers',
    category: 'Aesthetic Care',
    shortSummary: 'Custom-crafted thin aesthetic facings planned to complement natural facial harmony.',
    whatItIs: 'Individually designed ceramic or composite shells crafted to refine tooth shape, alignment, or shade.',
    whoItIsFor: 'Patients exploring conservative aesthetic enhancements for chipped, worn, or uneven teeth.',
    whatToExpect: 'An unhurried aesthetic consultation focusing on natural proportions and conservative preparation.',
    durationMinutes: 60,
  },
  {
    name: 'Crowns and Bridges',
    slug: 'crowns-and-bridges',
    category: 'Restorative Care',
    shortSummary: 'Custom protective restorations to reinforce weakened teeth or span gaps.',
    whatItIs: 'Tailored dental restorations engineered to restore strength, bite comfort, and natural appearance.',
    whoItIsFor: 'Patients with fractured teeth, large older fillings, or single-tooth spaces.',
    whatToExpect: 'Precision measurement, clear material choices, and a transparent estimate prior to treatment.',
    durationMinutes: 60,
  },
  {
    name: 'Root Canal Treatment',
    slug: 'root-canal-treatment',
    category: 'Endodontic Care',
    shortSummary: 'Calm, meticulous care focused on relieving internal tooth discomfort and preserving natural teeth.',
    whatItIs: 'Careful cleaning and sealing of the tooth’s inner canal space when pulp tissue becomes inflamed.',
    whoItIsFor: 'Patients experiencing tooth sensitivity or discomfort who wish to preserve their natural tooth.',
    whatToExpect: 'Gentle local numbing, calm pacing, and step-by-step communication throughout your visit.',
    durationMinutes: 60,
  },
  {
    name: 'Clear Aligners',
    slug: 'clear-aligners',
    category: 'Orthodontic Care',
    shortSummary: 'Removable, discreet orthodontic trays planned for gradual alignment.',
    whatItIs: 'A series of custom-fitted transparent trays designed to guide teeth toward balanced alignment.',
    whoItIsFor: 'Teens and adults seeking a subtle, removable alternative to traditional brackets.',
    whatToExpect: 'A comprehensive bite consultation, timeline review, and clear fee discussion before starting.',
    durationMinutes: 45,
  },
  {
    name: 'Cosmetic Dentistry',
    slug: 'cosmetic-dentistry',
    category: 'Aesthetic Care',
    shortSummary: 'Tailored smile design consultations balancing aesthetics with natural tooth preservation.',
    whatItIs: 'Personalized aesthetic planning combining shade, contour, and alignment considerations.',
    whoItIsFor: 'Patients looking for subtle, natural-looking refinements tailored to their smile.',
    whatToExpect: 'A relaxed conversation to understand your goals without pressure. Individual results vary.',
    durationMinutes: 45,
  },
  {
    name: "Children's Dentistry",
    slug: 'childrens-dentistry',
    category: 'Family Care',
    shortSummary: 'Gentle, reassuring dental visits designed to help children feel safe and relaxed.',
    whatItIs: 'Age-appropriate preventive checkups and friendly guidance for growing smiles.',
    whoItIsFor: 'Infants, children, and teens visiting with parents or guardians in Dubai.',
    whatToExpect: 'Slow, welcoming introductions to the dental chair and positive reinforcement at every step.',
    durationMinutes: 30,
  },
  {
    name: 'Emergency Dental Services',
    slug: 'emergency-dental-services',
    category: 'Urgent Care',
    shortSummary: 'Prompt evaluation requests for sudden tooth discomfort, chipped teeth, or lost restorations.',
    whatItIs: 'Focused assessment slots to address acute dental concerns and plan next steps calmly.',
    whoItIsFor: 'Patients experiencing sudden dental discomfort or accidental tooth damage.',
    whatToExpect: 'Please contact our clinic or submit an urgent request. For severe facial swelling, trouble breathing/swallowing, or uncontrolled bleeding, call 998 (UAE) / 911 or visit the nearest ER immediately.',
    durationMinutes: 30,
  },
];

function createSeedDatabase(): ClinicDatabase {
  const now = new Date().toISOString();
  const defaultWeeklyHours = {
    0: null, // Sunday closed by default until clinic sets hours
    1: { open: '09:00', close: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    2: { open: '09:00', close: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    3: { open: '09:00', close: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    4: { open: '09:00', close: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    5: { open: '09:00', close: '19:00', lunchStart: '13:00', lunchEnd: '14:00' },
    6: { open: '10:00', close: '17:00', lunchStart: '13:00', lunchEnd: '13:45' },
  };

  return {
    settings: {
      practiceName: 'Laurette Medical Center',
      tagline: 'Refined Dental Care in Al Rigga, Dubai',
      phone: '+971 58 573 3778',
      whatsapp: '+971 58 573 3778',
      email: '[EMAIL PLACEHOLDER]',
      officeHoursDisplay: '[OFFICE HOURS — PLACEHOLDER]',
      emergencyLineDisplay: '[NOT PROVIDED — DO NOT ASSUME MAIN NUMBER IS AN EMERGENCY LINE]',
      emergencyHoursDisplay: '[NOT PROVIDED]',
      insuranceAcceptedDisplay: '[NOT PROVIDED — DO NOT DISPLAY UNVERIFIED INSURANCE PROVIDERS]',
      financingPartnerDisplay: '[NOT PROVIDED]',
      paymentMethodDisplay: '[NOT PROVIDED]',
      cancellationPolicyDisplay: '[CANCELLATION POLICY — PLACEHOLDER]',
      newPatientOfferDisplay: 'NONE',
      yearsInPracticeDisplay: '[NOT PROVIDED]',
      technologyDisplay: '[NOT PROVIDED]',
      teamSizeDisplay: '[NOT PROVIDED]',
      sterilizationBufferMinutes: 15,
      minimumNoticeHours: 2,
      blackoutDates: [],
      chatbotEnabled: true,
      chatbotSaveTranscripts: true,
      chatbotKnowledgeBase:
        'Laurette Medical Center is a dental clinic located in Al Rigga, Dubai, UAE (Coordinates: 25.26706, 55.3089). Phone and WhatsApp: +971 58 573 3778. Currency: AED. Timezone: Asia/Dubai (GST, UTC+4). Suggested dental categories are awaiting clinic confirmation unless marked confirmed in the database. Pricing is "Call for an estimate" unless a confirmed AED price is listed.',
    },
    services: SUGGESTED_SERVICE_CATEGORIES.map((item, idx) => ({
      id: `svc_${idx + 1}`,
      slug: item.slug,
      name: item.name,
      confirmed: false, // CRITICAL: Marked unconfirmed until clinic confirms in Admin
      category: item.category,
      shortSummary: item.shortSummary,
      whatItIs: item.whatItIs,
      whoItIsFor: item.whoItIsFor,
      whatToExpect: item.whatToExpect,
      priceLabel: 'Call for an estimate',
      durationMinutes: item.durationMinutes,
      faqs: [
        {
          question: `How do I request an estimate for ${item.name}?`,
          answer:
            'Please call or message Laurette Medical Center on +971 58 573 3778. A final treatment plan and estimate in AED are always confirmed after an in-person clinical examination.',
        },
      ],
      updatedAt: now,
    })),
    providers: [
      {
        id: 'prov_1',
        slug: 'lead-dental-practitioner',
        name: '[DENTIST NAME — PLACEHOLDER]',
        credentials: '[CREDENTIALS — PLACEHOLDER]',
        roleTitle: 'Dental Practitioner',
        providerType: 'dentist',
        specialty: '[SPECIALTY — PLACEHOLDER]',
        languages: '[LANGUAGES SPOKEN — PLACEHOLDER]',
        bio: '[PROVIDER BIO — PLACEHOLDER: Replace with verified biography, licensing details, and clinical focus in the Admin Panel.]',
        isPlaceholder: true,
        active: true,
        weeklyHours: defaultWeeklyHours,
      },
      {
        id: 'prov_2',
        slug: 'dental-hygienist-care-team',
        name: '[HYGIENIST NAME — PLACEHOLDER]',
        credentials: '[CREDENTIALS — PLACEHOLDER]',
        roleTitle: 'Dental Hygienist & Preventive Care',
        providerType: 'hygienist',
        specialty: '[SPECIALTY — PLACEHOLDER]',
        languages: '[LANGUAGES SPOKEN — PLACEHOLDER]',
        bio: '[HYGIENIST BIO — PLACEHOLDER: Replace with verified staff credentials and preventive care overview in the Admin Panel.]',
        isPlaceholder: true,
        active: true,
        weeklyHours: defaultWeeklyHours,
      },
    ],
    operatories: [
      { id: 'op_1', name: 'Suite 01', active: true },
      { id: 'op_2', name: 'Suite 02', active: true },
    ],
    appointmentTypes: [
      {
        id: 'apt_new_patient',
        name: 'New Patient Consultation & Exam',
        description: 'Unhurried initial visit to meet your dentist, discuss goals, and review oral health.',
        durationMinutes: 45,
        newPatientsAllowed: true,
        eligibleProviderIds: ['prov_1'],
        depositAmountAed: 0,
        active: true,
      },
      {
        id: 'apt_checkup',
        name: 'Routine Checkup & Care',
        description: 'Follow-up oral assessment and preventive consultation for returning patients.',
        durationMinutes: 30,
        newPatientsAllowed: true,
        eligibleProviderIds: ['prov_1', 'prov_2'],
        depositAmountAed: 0,
        active: true,
      },
      {
        id: 'apt_consultation',
        name: 'Aesthetic & Restorative Consultation',
        description: 'Dedicated consultation to discuss smile goals, timelines, and personalized AED estimates.',
        durationMinutes: 45,
        newPatientsAllowed: true,
        eligibleProviderIds: ['prov_1'],
        depositAmountAed: 0,
        active: true,
      },
      {
        id: 'apt_urgent',
        name: 'Urgent Dental Request',
        description: 'Priority appointment request for sudden tooth discomfort or broken restorations.',
        durationMinutes: 30,
        newPatientsAllowed: true,
        eligibleProviderIds: ['prov_1'],
        depositAmountAed: 0,
        active: true,
      },
      {
        id: 'apt_child',
        name: "Child's First Visit",
        description: 'Gentle, reassuring introduction to dental care for younger patients.',
        durationMinutes: 30,
        newPatientsAllowed: true,
        eligibleProviderIds: ['prov_1', 'prov_2'],
        depositAmountAed: 0,
        active: true,
      },
    ],
    appointments: [],
    holds: [],
    waitlist: [],
    requests: [],
    offers: [], // NONE UNTIL CONFIRMED
    membershipPlans: [], // NOT PROVIDED — DO NOT INVENT ONE
    reviews: [], // Show only real reviews
    galleryItems: [], // Consent-verified items only
    blogPosts: [
      {
        id: 'blog_1',
        slug: 'dental-checkup-costs-and-estimates-in-dubai',
        title: 'Understanding Dental Checkup & Cleaning Estimates in Al Rigga, Dubai',
        excerpt:
          'A calm, transparent guide to what influences dental visit pricing in Dubai, why an in-person exam comes first, and how to request an estimate in AED.',
        category: 'Patient Guide',
        tags: ['Al Rigga', 'Dubai', 'Dental Checkup', 'Estimates'],
        readingMinutes: 5,
        reviewedBy: 'Reviewed by [DOCTOR NAME, CREDENTIALS]',
        status: 'published',
        publishedAt: now,
        coverImageUrl: '/src/assets/images/consultation_lounge_dubai_1794669775983.jpg',
        content: `Planning a dental visit in Dubai often begins with a straightforward question: what will my appointment cost in AED? Because every mouth and every clinical history is unique, ethical dental clinics avoid quoting fixed treatment prices without first evaluating your teeth and gums in person.

### Why Prices Begin With an Examination
A routine checkup or cleaning is never a one-size-fits-all procedure. During a consultation, a dentist evaluates several practical factors:
- **Existing gum and enamel health:** Some patients need simple preventive polishing, while others benefit from deeper periodontal care staged across visits.
- **Diagnostic imaging needs:** Whether digital radiographs or specific views are clinically helpful depends on when your last images were taken and what symptoms or goals you have.
- **Time required in the suite:** A calm, unhurried appointment takes the time needed to answer your questions without rushing.

### Transparent Estimates Before Any Care Begins
At Laurette Medical Center in Al Rigga, Dubai, patients are always encouraged to ask about estimated fees upfront. Before any recommended care proceeds, your clinician walks through the proposed steps and provides a clear written estimate in AED so there are no surprises.

### How to Prepare When Calling for an Estimate
When you reach out by phone or WhatsApp on +971 58 573 3778, sharing a brief overview of whether you are seeking a routine checkup, an aesthetic consultation, or an urgent evaluation helps our reception team guide you to the right appointment length. Please remember never to send confidential personal medical records over unencrypted messaging—those details are always discussed privately with your dentist inside the clinic.

### Scheduling at Your Convenience
Whether you live or work in Al Rigga, Deira, Al Muraqqabat, or Port Saeed, scheduling a quiet morning or afternoon consultation lets you receive tailored answers grounded in a thorough clinical exam. Final pricing is always confirmed after your examination.

*Reviewed by [DOCTOR NAME, CREDENTIALS]*`,
      },
      {
        id: 'blog_2',
        slug: 'what-to-expect-at-your-first-dental-visit',
        title: 'What to Expect at Your First Visit to a Dubai Dental Clinic',
        excerpt:
          'If it has been a while since your last dental appointment, knowing each calm step in advance can ease uncertainty and make your visit comfortable.',
        category: 'New Patients',
        tags: ['First Visit', 'Anxiety-Friendly Care', 'Dubai'],
        readingMinutes: 6,
        reviewedBy: 'Reviewed by [DOCTOR NAME, CREDENTIALS]',
        status: 'published',
        publishedAt: now,
        coverImageUrl: '/src/assets/images/hero_laurette_reception_1794669774690.jpg',
        content: `Feeling hesitant before a first visit to a new dental clinic is completely normal. Whether you recently relocated to Dubai or simply have not had a checkup in some time, knowing exactly how your appointment unfolds removes much of the guesswork.

### 1. A Quiet Welcome in Reception
Upon arriving at Laurette Medical Center in Al Rigga, you are greeted in a calm, hospitality-inspired lounge rather than a rushed waiting room. Completing your basic contact preferences online ahead of time helps keep check-in brief and effortless.

### 2. Conversation Before Examination
Your first minutes with the dentist happen away from clinical instruments—just a straightforward conversation about what brought you in, what your long-term smile priorities are, and whether you experience any sensitivity or dental anxiety. You are always in control of the pace; raising a hand pauses care immediately.

### 3. Gentle Clinical Assessment
When you are ready, your dentist performs a thorough, unhurried assessment of your teeth, gums, and bite. Every observation is explained in plain, everyday English rather than dense clinical jargon.

### 4. Clear Next Steps Without Pressure
At the conclusion of your initial consultation, you receive a straightforward summary of findings, optional preventive or restorative pathways, and a transparent estimate in AED. You never have to commit to a multi-step plan on the spot—take the information home, review it comfortably, and proceed only when you feel fully informed.

### Booking Your First Visit
To schedule your first visit or ask our reception team a question before booking, call or message +971 58 573 3778.

*Reviewed by [DOCTOR NAME, CREDENTIALS]*`,
      },
      {
        id: 'blog_3',
        slug: 'clear-aligners-and-orthodontic-consultations',
        title: 'Clear Aligners vs Traditional Braces: Questions for Your Consultation',
        excerpt:
          'A balanced, medically conservative overview of removable aligners and fixed orthodontics to help you prepare for a consultation in Dubai.',
        category: 'Orthodontic Education',
        tags: ['Clear Aligners', 'Orthodontics', 'Consultation'],
        readingMinutes: 6,
        reviewedBy: 'Reviewed by [DOCTOR NAME, CREDENTIALS]',
        status: 'published',
        publishedAt: now,
        coverImageUrl: '/src/assets/images/luxury_care_still_life_1794669776597.jpg',
        content: `Many adults and teens exploring tooth alignment in Dubai wonder whether removable clear aligners or traditional braces are better suited to their bite. Rather than one option being universally "best," suitability depends closely on your individual tooth movement goals and daily routine.

### How Clear Aligners Work
Clear aligners use a sequence of custom-molded transparent trays worn for approximately 20 to 22 hours each day. Because they are removable for meals and brushing, many patients appreciate the convenience for dining and oral hygiene. Consistent daily wear is essential to keep progress on track.

### When Fixed Braces May Be Discussed
Certain complex bite relationships, vertical tooth movements, or rotated teeth can respond more predictably to fixed brackets and wires. During a diagnostic consultation, a dentist evaluates your bite mechanics, gum support, and alignment priorities before outlining which approaches are clinically appropriate.

### Key Questions to Ask at Your Consultation
1. Are my gums and supporting bone healthy enough to begin orthodontic movement?
2. What is the realistic range of treatment duration for my specific bite?
3. What post-treatment retention (retainers) will be needed to maintain alignment long term?
4. What is the complete estimated fee in AED, and what follow-up visits are included?

### Individual Results Vary
Every orthodontic journey is personal. To explore whether an alignment consultation is currently available at Laurette Medical Center, contact our Al Rigga reception team at +971 58 573 3778.

*Reviewed by [DOCTOR NAME, CREDENTIALS]*`,
      },
    ],
    intakeForms: [],
    patients: [
      {
        id: 'pat_demo_1',
        email: 'patient@example.com',
        name: 'Sample Patient',
        phone: '+971 50 000 0000',
        referralCode: 'LAURETTE-SAMPLE',
        referralCreditAed: 0,
        emailReminders: true,
        recallOptIn: true,
        familyMembers: [],
        membershipStatus: null,
      },
    ],
    chatTranscripts: [],
    auditLogs: [],
    pendingAuthCodes: [],
  };
}

let cachedDb: ClinicDatabase | null = null;

export function getDb(): ClinicDatabase {
  if (cachedDb) return cachedDb;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw) as ClinicDatabase;
      return cachedDb;
    }
  } catch (err) {
    console.error('Error loading database, creating fresh seed:', err);
  }
  cachedDb = createSeedDatabase();
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(db: ClinicDatabase): void {
  cachedDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

export function addAuditLog(action: string, actorRole: string) {
  const db = getDb();
  db.auditLogs.unshift({
    id: `aud_${crypto.randomBytes(5).toString('hex')}`,
    action,
    actorRole,
    timestamp: new Date().toISOString(),
  });
  if (db.auditLogs.length > 250) {
    db.auditLogs = db.auditLogs.slice(0, 250);
  }
  saveDb(db);
}

// ---------- BOOKING ENGINE (Asia/Dubai UTC+4) ----------

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function dubaiDateTimeToUtcIso(dateStr: string, timeStr: string): string {
  // Asia/Dubai is strictly UTC+4 year-round (no DST)
  return new Date(`${dateStr}T${timeStr}:00+04:00`).toISOString();
}

export function getDubaiTodayString(): string {
  const now = new Date();
  const dubaiTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  return dubaiTime.toISOString().slice(0, 10);
}

export function getDubaiCurrentMinutes(): number {
  const now = new Date();
  const dubaiTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  return dubaiTime.getUTCHours() * 60 + dubaiTime.getUTCMinutes();
}

export function purgeExpiredHolds(db: ClinicDatabase) {
  const nowMs = Date.now();
  const before = db.holds.length;
  db.holds = db.holds.filter((h) => new Date(h.expiresAt).getTime() > nowMs);
  if (db.holds.length !== before) {
    saveDb(db);
  }
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  operatoryId: string;
}

export function computeAvailableSlots(
  dateStr: string,
  appointmentTypeId: string,
  requestedProviderId?: string
): AvailableSlot[] {
  const db = getDb();
  purgeExpiredHolds(db);

  if (db.settings.blackoutDates.includes(dateStr)) {
    return [];
  }

  const todayStr = getDubaiTodayString();
  if (dateStr < todayStr) {
    return [];
  }

  const aptType = db.appointmentTypes.find((t) => t.id === appointmentTypeId && t.active);
  if (!aptType) return [];

  const duration = aptType.durationMinutes;
  const buffer = db.settings.sterilizationBufferMinutes || 15;
  const activeOperatories = db.operatories.filter((o) => o.active);
  if (activeOperatories.length === 0) return [];

  // Day of week in Dubai
  const dayOfWeek = new Date(`${dateStr}T12:00:00+04:00`).getUTCDay();

  const candidateProviders = db.providers.filter((p) => {
    if (!p.active) return false;
    if (!aptType.eligibleProviderIds.includes(p.id)) return false;
    if (requestedProviderId && requestedProviderId !== 'first_available' && p.id !== requestedProviderId) {
      return false;
    }
    return true;
  });

  const existingBookings = db.appointments.filter(
    (a) => a.dateStr === dateStr && a.status !== 'cancelled' && !a.deletedAt
  );
  const activeHolds = db.holds.filter((h) => h.dateStr === dateStr);

  const nowMinutesDubai = getDubaiCurrentMinutes();
  const minNoticeMins = (db.settings.minimumNoticeHours || 2) * 60;

  const slots: AvailableSlot[] = [];
  const seenStartTimes = new Set<string>();

  for (const provider of candidateProviders) {
    const hours = provider.weeklyHours[dayOfWeek];
    if (!hours) continue;

    const openMin = toMinutes(hours.open);
    const closeMin = toMinutes(hours.close);
    const lunchStartMin = hours.lunchStart ? toMinutes(hours.lunchStart) : null;
    const lunchEndMin = hours.lunchEnd ? toMinutes(hours.lunchEnd) : null;

    for (let start = openMin; start + duration <= closeMin; start += 30) {
      const end = start + duration;

      // Minimum notice on today's date
      if (dateStr === todayStr && start < nowMinutesDubai + minNoticeMins) {
        continue;
      }

      // Skip lunch overlap
      if (lunchStartMin !== null && lunchEndMin !== null) {
        if (start < lunchEndMin && end > lunchStartMin) {
          continue;
        }
      }

      const endWithBuffer = end + buffer;

      // Check provider conflict (appointments + holds)
      const providerBusy =
        existingBookings.some((b) => {
          if (b.providerId !== provider.id) return false;
          const bStart = toMinutes(b.startTime);
          const bEnd = toMinutes(b.endTime) + buffer;
          return start < bEnd && endWithBuffer > bStart;
        }) ||
        activeHolds.some((h) => {
          if (h.providerId !== provider.id) return false;
          const hStart = toMinutes(h.startTime);
          const hEnd = toMinutes(h.endTime) + buffer;
          return start < hEnd && endWithBuffer > hStart;
        });

      if (providerBusy) continue;

      // Find free operatory
      const freeOp = activeOperatories.find((op) => {
        const opBusy =
          existingBookings.some((b) => {
            if (b.operatoryId !== op.id) return false;
            const bStart = toMinutes(b.startTime);
            const bEnd = toMinutes(b.endTime) + buffer;
            return start < bEnd && endWithBuffer > bStart;
          }) ||
          activeHolds.some((h) => {
            if (h.operatoryId !== op.id) return false;
            const hStart = toMinutes(h.startTime);
            const hEnd = toMinutes(h.endTime) + buffer;
            return start < hEnd && endWithBuffer > hStart;
          });
        return !opBusy;
      });

      if (!freeOp) continue;

      const startTimeStr = fromMinutes(start);
      // For "first_available", deduplicate by startTime so clean grid renders
      if (requestedProviderId === 'first_available' || !requestedProviderId) {
        if (seenStartTimes.has(startTimeStr)) continue;
        seenStartTimes.add(startTimeStr);
      }

      slots.push({
        startTime: startTimeStr,
        endTime: fromMinutes(end),
        providerId: provider.id,
        providerName: provider.name,
        operatoryId: freeOp.id,
      });
    }
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
