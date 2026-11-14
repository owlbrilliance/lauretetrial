# Laurette Medical Center — Al Rigga, Dubai

Luxury dental clinic full-stack web application built for **Laurette Medical Center** in Al Rigga, Dubai, UAE.

## Practice Configuration
All static clinic defaults live in `src/site.config.ts`, while live services, provider bios, schedule rules, reviews, offers, and clinic settings persist in `data/clinic-db.json` and are editable through `/admin`.

- **Phone & WhatsApp:** `+971 58 573 3778`
- **Coordinates:** `25.26706, 55.3089` (Al Rigga, Dubai, UAE)
- **Directions Link:** `https://www.bing.com/maps/search?q=25.26706%2C+55.3089`
- **Currency & Timezone:** `AED` · `Asia/Dubai (GST, UTC+4)`

## Running Locally
1. Copy `.env.example` to `.env` and configure `GEMINI_API_KEY`, `SESSION_SECRET`, `ADMIN_PASSWORD`, and `STAFF_PASSWORD`.
2. Install dependencies: `npm install`
3. Start development server: `npm run dev` (runs Express + Vite on port `3000`)
4. Build for production: `npm run build` then `npm start`

## Default Sandbox Credentials (Replace in `.env` Before Launch)
- **Admin Console (`/admin`):** Any email + `ADMIN_PASSWORD` (default dev fallback: `LauretteAdmin2026!`)
- **Staff Portal (`/staff`):** Select role (`front_desk`, `dentist`, or `hygienist`) + `STAFF_PASSWORD` (default dev fallback: `LauretteStaff2026!`)
- **Patient Portal (`/account`):** Enter email to generate a 6-digit preview verification code.

## Healthcare Compliance Checklist
- Execute Business Associate Agreements (BAAs) / UAE PDPL & DHA data-processing agreements with your hosting, database, email, SMS, and AI providers before handling patient records.
- Enable TLS/HTTPS end-to-end, encrypt backups at rest, and rotate `SESSION_SECRET`.
- Review and retain `auditLogs` and access logs per local healthcare retention policy.
- Keep `FEATURE_MEDICAL_HISTORY="false"` unless encrypted clinical storage and authorized clinician workflows are legally approved.
- Have a qualified healthcare attorney review `/privacy` (Notice of Privacy Practices) and `/terms` before clinical launch.

## Launch Checklist
1. Log into `/admin` and review the 12 suggested dental categories under **Services**. Confirm & publish only the treatments Laurette Medical Center offers, and set verified AED prices or keep `"Call for an estimate"`.
2. Replace all `[PLACEHOLDER]` fields in **Settings** and **Providers & Bio** (official doctor names, DHA license/credentials, languages spoken, office hours, clinic email, insurance accepted, cancellation policy).
3. Upload real clinic and smile gallery photography only with written patient consent on file.
4. Connect your official Bing/Google Business listings and replace `ADMIN_PASSWORD` / `STAFF_PASSWORD` in environment secrets.
5. Submit `/sitemap.xml` to search engines (`/admin`, `/staff`, `/account`, and `/api` are automatically excluded in `/robots.txt`).
