export type UserRole = 'patient' | 'front_desk' | 'hygienist' | 'dentist' | 'admin';

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  confirmed: boolean;
  category: string;
  shortSummary: string;
  whatItIs: string;
  whoItIsFor: string;
  whatToExpect: string;
  priceLabel: string; // e.g., "Call for an estimate" or "From 350 AED"
  durationMinutes: number;
  faqs: { question: string; answer: string }[];
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  roleTitle: string;
  providerType: 'dentist' | 'hygienist';
  specialty: string;
  languages: string;
  bio: string;
  isPlaceholder: boolean;
  active: boolean;
  weeklyHours: Record<number, { open: string; close: string; lunchStart?: string; lunchEnd?: string } | null>;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  newPatientsAllowed: boolean;
  eligibleProviderIds: string[];
  depositAmountAed: number;
  active: boolean;
}

export interface Operatory {
  id: string;
  name: string;
  active: boolean;
}

export type AppointmentStatus =
  | 'confirmed'
  | 'arrived'
  | 'in_chair'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface Appointment {
  id: string;
  manageToken: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  bookingFor: 'myself' | 'family_member';
  familyMemberName?: string;
  isNewPatient: boolean;
  appointmentTypeId: string;
  appointmentTypeName: string;
  providerId: string;
  providerName: string;
  operatoryId: string;
  dateStr: string; // YYYY-MM-DD in Asia/Dubai
  startTime: string; // HH:mm in Asia/Dubai
  endTime: string; // HH:mm in Asia/Dubai
  startUtc: string; // ISO UTC
  endUtc: string; // ISO UTC
  status: AppointmentStatus;
  formsComplete: boolean;
  reminderConsent: boolean;
  cancellationAck: boolean;
  offerCode?: string;
  discountAppliedAed?: number;
  estimatedTotalLabel: string;
  note?: string; // Sanitized, privacy-warned non-medical note
  deletedAt?: string | null;
  createdAt: string;
}

export interface AppointmentHold {
  id: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  providerId: string;
  operatoryId: string;
  appointmentTypeId: string;
  expiresAt: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateStr: string;
  providerId: string;
  appointmentTypeId: string;
  status: 'waiting' | 'notified' | 'claimed' | 'expired';
  claimToken?: string;
  claimExpiresAt?: string;
  createdAt: string;
}

export interface PatientRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  reason: string;
  patientType: 'new' | 'existing';
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any';
  isUrgent: boolean;
  message?: string;
  pageUrl?: string;
  utmSource?: string;
  status: 'new' | 'contacted' | 'booked' | 'closed';
  staffNotes?: string;
  createdAt: string;
}

export interface OfferItem {
  id: string;
  code: string;
  title: string;
  discountType: 'percent' | 'fixed';
  amount: number;
  appliesTo: 'self_pay_only' | 'all';
  active: boolean;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  priceAed: number;
  billingCycle: 'monthly' | 'yearly';
  includedItems: string[];
  active: boolean;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  source: 'onsite' | 'external';
  status: 'pending' | 'approved' | 'hidden';
  featured: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  treatmentCategory: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption: string;
  consentOnFile: boolean;
  published: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  readingMinutes: number;
  reviewedBy: string;
  status: 'draft' | 'published';
  publishedAt: string;
}

export interface IntakeFormRecord {
  id: string;
  appointmentId?: string;
  patientEmail: string;
  fullName: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  insuranceInfoNote?: string;
  consentReminders: boolean;
  submittedAt: string;
}

export interface FamilyMember {
  id: string;
  ownerEmail: string;
  name: string;
  relationship: 'child' | 'spouse' | 'parent' | 'other';
  birthYear?: string;
}

export interface PatientAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  referralCode: string;
  referralCreditAed: number;
  emailReminders: boolean;
  recallOptIn: boolean;
  familyMembers: FamilyMember[];
  membershipStatus?: {
    planId: string;
    planName: string;
    status: 'pending_at_clinic' | 'active' | 'paused' | 'cancelled';
    joinedAt: string;
  } | null;
}

export interface ChatTranscript {
  id: string;
  sessionId: string;
  messages: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  updatedAt: string;
}

export interface ClinicSettings {
  practiceName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeHoursDisplay: string;
  emergencyLineDisplay: string;
  emergencyHoursDisplay: string;
  insuranceAcceptedDisplay: string;
  financingPartnerDisplay: string;
  paymentMethodDisplay: string;
  cancellationPolicyDisplay: string;
  newPatientOfferDisplay: string;
  yearsInPracticeDisplay: string;
  technologyDisplay: string;
  teamSizeDisplay: string;
  sterilizationBufferMinutes: number;
  minimumNoticeHours: number;
  blackoutDates: string[];
  chatbotEnabled: boolean;
  chatbotSaveTranscripts: boolean;
  chatbotKnowledgeBase: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
