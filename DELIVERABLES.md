# TFN website deliverables

The project is delivered in three phases. Each phase has its own Git branch, and `main` is always what's live.

| Phase | Share | Branch | Status |
| --- | --- | --- | --- |
| 1. Core public website | 25% | `main` | Live |
| 2. Content hubs | 25% | `phase-2` | Built, waiting for release |
| 3. Admin panel | 50% | `phase-3` | Built, waiting for release |

## Phase 1: Core public website (25%)

- Visual identity: navy, cream and coral glass style, TFN logo, Inter type, chosen photography
- Responsive layout for phones, tablets and desktops, with accessible navigation and a mobile menu
- Home page: hero, official WhatsApp and Telegram channels (through the sign-up), programmes, divisions, about, partner and membership calls to action
- About TFN, including mission and the six divisions
- Programmes overview and a page for each of the ten flagship programmes, with GOTV kept separate from the Digital Communities
- Membership page
- Tertiary Digital Communities sign-up: name, email, WhatsApp number, state, institution (searchable list of 590+ Nigerian universities, polytechnics and colleges of education, with short names like UNILAG) and a yes/no PVC question, saved to the database
- Gated community links: every WhatsApp and Telegram button leads to the sign-up first, and the real channel links are shown only after registering; returning members see them straight away, with a self-service "delete my registration" option
- Partners page with a partnership enquiry form and document upload
- Contact page with an enquiry form, including reporting fake TFN channels
- Privacy, cookies, terms, accessibility, opportunity information and Digital Communities notices
- Spam protection on forms, a custom "page not found" and error page, and security headers
- MongoDB database and hosting on Vercel

## Phase 2: Content hubs (25%)

- Opportunity Hub: scholarships, fellowships, internships, grants and more, with filters by type, location and closing date
- Opportunity detail pages with eligibility, how to apply, days left to apply and a share button
- Public "Submit an opportunity" form, with submissions held for review
- Research and publications library with search, type filters, key findings, PDF links and ready-made citations (Harvard, APA, Chicago)
- News section with articles, photos and programme links
- Event pages with agenda, speakers, venue, places left, online registration and an "add to calendar" download
- Home page and programme pages updated to show live events, opportunities, research and news

## Phase 3: Admin panel (50%)

- Secure admin sign-in with email and password, a temporary password that must be changed on first sign-in, and attempt limits
- Dashboard with registrations this week, items waiting for approval, closing opportunities, new messages, an 8-week chart and recent activity
- Content: write and edit news and publications with a Draft, In review, Approved, Published workflow
- Opportunity review with four safety checks (real provider, official link, free to apply, valid closing date) before anything is published
- Inbox for contact and partnership messages: assign, reply, close, download attachments, and log reports of fake channels as incidents
- Digital Communities registrations: search, filters (institution, state, channel, PVC), PVC count, partly hidden phone numbers, CSV export (logged) and deletion on request
- Channels: weekly posting calendar, approval before posting, official channel list, an incident log, and the WhatsApp, Telegram and help-group links members get after registering (Super admin and Channels lead only, checked to be real WhatsApp or Telegram links)
- Events: attendee lists, filters, access needs, door check-in and attendee export
- Users and roles: add staff, six roles with set permissions, reset passwords, switch accounts off
- Activity log of who did what

## Releasing the next phase

When a phase is approved, merge its branch into `main` and deploy:

```bash
git checkout main && git merge phase-2 && git push
```

Any fix made on `main` is carried forward by merging `main` into `phase-2`, then `phase-2` into `phase-3`.
