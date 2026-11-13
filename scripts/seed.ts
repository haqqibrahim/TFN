/* Seed the TFN database with sample content.
 * Usage: pnpm seed            (adds sample content, keeps existing admin users)
 *        pnpm seed --reset    (wipes all collections first)
 * Admin test account comes from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { db } from "../src/lib/db";
import {
  Activity, AdminUser, Channel, ChannelPost, Enquiry, Event, EventRegistration, Incident,
  JoinRegistration, Opportunity, Post, Publication,
} from "../src/lib/models";

const d = (s: string) => new Date(s);
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86400000);

async function main() {
  await db();
  const reset = process.argv.includes("--reset");
  const all = [Post, Publication, Opportunity, Event, EventRegistration, JoinRegistration, Enquiry, ChannelPost, Channel, Incident, Activity];
  if (reset) {
    for (const m of all) await (m as unknown as mongoose.Model<unknown>).deleteMany({});
    console.log("Cleared content collections");
  }

  /* ---------- Admin users ---------- */
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  // The default super admin. Its password is temporary: the first sign-in asks for a new one.
  if (email && password && !(await AdminUser.exists({ email }))) {
    await AdminUser.create({ name: process.env.SEED_ADMIN_NAME || "Administrator", email, role: "Super admin", passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true });
    console.log("Created the default admin", email);
  }
  const staff = [
    { name: "Tunde Bakare", email: "tunde.bakare@tfnetwork.org", role: "Editor" },
    { name: "Zainab Yusuf", email: "zainab.yusuf@tfnetwork.org", role: "Reviewer" },
    { name: "Chidi Nnamdi", email: "chidi.nnamdi@tfnetwork.org", role: "Channels lead" },
    { name: "Hauwa Lawal", email: "hauwa.lawal@tfnetwork.org", role: "Events lead" },
  ];
  for (const s of staff) {
    if (!(await AdminUser.exists({ email: s.email }))) {
      await AdminUser.create({ ...s, passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10), lastSignIn: daysAgo(Math.ceil(Math.random() * 9)) });
    }
  }

  if ((await Post.countDocuments()) > 0 && !reset) {
    console.log("Content already present. Run with --reset to replace it.");
    await mongoose.disconnect();
    return;
  }

  /* ---------- News ---------- */
  await Post.insertMany([
    {
      slug: "policy-forum-students-lawmakers-student-loans",
      title: "Policy Forum brings students and lawmakers together on student loans",
      category: "Programme updates",
      programme: "TFN Policy Forum",
      author: "Aisha Bello",
      image: "/photos/panel-audience.jpg",
      imageAlt: "A panel speaking in front of an audience",
      caption: "Speakers at the TFN Policy Forum in Ibadan. Photo: TFN.",
      summary: "More than 200 students, lecturers and two lawmakers met in Ibadan to talk about who the new loan scheme is leaving out.",
      body: `More than 200 students, lecturers and two members of the House Committee on Tertiary Education met at the University of Ibadan on Saturday to discuss the new student loan scheme, and who it is leaving out.

Student leaders from nine institutions shared what they had heard on their campuses: delayed payments, confusing eligibility rules and little information for students at state polytechnics.

Lawmakers listened, asked questions and agreed to receive a written summary of the recommendations within a month.

> “We didn’t come to complain. We came with solutions, and they listened.”

TFN Research & Insights will publish the forum’s recommendations as a policy brief in January. The next Policy Forum takes place in Lagos in March.`,
      status: "published",
      publishedAt: daysAgo(5),
    },
    {
      slug: "tfn-opens-digital-communities",
      title: "TFN opens its Digital Communities on WhatsApp and Telegram",
      category: "TFN news",
      programme: "Tertiary Digital Communities",
      author: "TFN Communications",
      image: "/photos/pair-laptop.jpg",
      imageAlt: "Two young people looking at a laptop together",
      summary: "Official TFN updates and opportunities now come straight to your phone. Free to join, and easy to leave.",
      body: `TFN’s official WhatsApp Channel and Telegram Channel are now open to anyone connected to Nigeria’s universities, polytechnics and colleges.

The channels carry TFN news, new listings from the Opportunity Hub, research and calls to take part. They are one-to-many, so nobody is added to a large group chat, and you can leave at any time.

Official links are only ever published on the TFN join page. If someone sends you a different link, or asks for money, a password or your bank details, it is not TFN. Report it through the contact page.`,
      status: "published",
      publishedAt: daysAgo(21),
    },
    {
      slug: "abu-to-host-campus-connect",
      title: "Ahmadu Bello University to host the next Campus Connect visit",
      category: "Announcements",
      programme: "TFN Campus Connect",
      author: "Musa Abdullahi",
      image: "/photos/campus-outdoors.jpg",
      imageAlt: "Students with laptops sitting outdoors on campus",
      summary: "Campus Connect heads to Zaria in May, with a student dialogue and a meeting with the university’s leadership.",
      body: `Ahmadu Bello University, Zaria, will host the next TFN Campus Connect visit in May.

The day includes an open dialogue with student leaders, a session with campus organisations and a meeting with the university’s leadership on how TFN and ABU can work together.

Students at ABU and nearby institutions can register interest now. Places in the dialogue are limited.`,
      status: "published",
      publishedAt: daysAgo(29),
    },
    {
      slug: "tfn-on-channels-tv-student-loans",
      title: "TFN on Channels TV: what the new loan scheme means for students",
      category: "Media",
      author: "TFN Communications",
      image: "/photos/speaker-stage.jpg",
      imageAlt: "A speaker on a stage addressing an audience",
      summary: "Our Research & Insights lead explained the loan scheme’s eligibility rules, and where the gaps are.",
      body: `TFN’s Research & Insights lead joined Channels TV to talk about the student loan scheme: who qualifies, how repayment works and where students at state institutions are being missed.

The full brief, *Making student loans work for every student*, is available in Research.`,
      status: "published",
      publishedAt: daysAgo(40),
    },
    {
      slug: "leadership-academy-first-40",
      title: "Leadership Academy welcomes its first 40 participants",
      category: "Programme updates",
      programme: "TFN Leadership Academy",
      author: "Grace Etim",
      image: "/photos/laptop-trio.jpg",
      imageAlt: "Three students working together around a laptop",
      summary: "Forty students from 17 institutions start a six-month programme of workshops, mentoring and campus projects.",
      body: `Forty students from 17 institutions have started the first TFN Leadership Academy cohort.

Over six months they will take part in leadership workshops, be paired with a mentor and work in teams on a real problem on their own campuses.

Applications for the next cohort open in the spring. Join the Digital Communities to hear first.`,
      status: "published",
      publishedAt: daysAgo(55),
    },
    {
      slug: "new-brief-campus-housing",
      title: "New brief: who pays for campus housing?",
      category: "TFN news",
      programme: "TFN Research & Insights",
      author: "Tunde Adeyemi",
      image: "/photos/students-steps.jpg",
      imageAlt: "Students standing together on campus steps",
      summary: "Hostel places have not kept up with enrolment. Our new report looks at who is paying the difference.",
      body: `Hostel places at Nigerian universities have not kept up with enrolment. Our new institutional report looks at who is paying the difference, and what universities can do about it.

Read *Who pays for campus housing?* in Research.`,
      status: "published",
      publishedAt: daysAgo(70),
    },
    {
      slug: "annual-summit-theme-announced",
      title: "Annual Summit 2027 theme announced",
      category: "Announcements",
      programme: "TFN Annual Summit",
      author: "TFN Communications",
      image: "/photos/auditorium-full.jpg",
      imageAlt: "A packed conference hall during a session",
      summary: "Draft for review.",
      body: "The theme for the 2027 Annual Summit will be announced here.",
      status: "review",
      updatedBy: "Tunde Bakare",
    },
    {
      slug: "opportunity-hub-december-roundup",
      title: "December round-up: 12 opportunities closing in January",
      category: "TFN news",
      programme: "TFN Opportunity Hub",
      author: "TFN Communications",
      image: "/photos/students-laptops.jpg",
      imageAlt: "Students working on laptops together",
      summary: "Scholarships, internships and grants worth checking before the new year.",
      body: "Draft.",
      status: "draft",
      updatedBy: "Tunde Bakare",
    },
  ]);

  /* ---------- Publications ---------- */
  const okafor = { name: "Dr Ngozi Okafor", role: "Lead author", affiliation: "Senior Fellow, TFN Research & Insights" };
  const adeyemi = { name: "Tunde Adeyemi", role: "Co-author", affiliation: "Policy Analyst, University of Ibadan" };
  await Publication.insertMany([
    {
      slug: "funding-nigerias-public-universities",
      title: "Funding Nigeria’s public universities beyond the federal purse",
      type: "Policy brief",
      topic: "University funding",
      summary: "Four practical options for funding federal and state universities, beyond government allocations.",
      body: `Nigeria’s public universities depend on government allocations that rarely match what they cost to run. We studied twelve federal and state universities between 2020 and 2026, using budget records and interviews with bursars, union leaders and students.

Each option below can help. None works without open reporting of how the money is spent.

## Four options

**Research income.** Grants and contracts managed by a dedicated office.

**Industry partnerships.** Structured, long-term deals, not one-off sponsorship.

**Alumni giving.** Simple, visible ways for graduates to give back.

**Fairer student loans.** Repayment tied to what graduates earn.

The condition for all four: publish what comes in and where it goes.`,
      authors: [okafor, adeyemi],
      programme: "TFN Policy Forum",
      pages: 14,
      readMinutes: 9,
      pdfSize: "1.2 MB",
      findings: [
        { figure: "48%", line: "of yearly running costs are covered by government allocations at the universities studied." },
        { figure: "31 days", line: "fewer teaching days lost where universities had research and partnership income." },
        { figure: "₦0", line: "extra fees for the poorest students under a needs-based loan scheme." },
      ],
      tags: ["University funding", "Student loans", "Higher education policy"],
      image: "/photos/meeting-table.jpg",
      featured: true,
      status: "published",
      publishedAt: daysAgo(3),
    },
    ...[
      ["making-student-loans-work", "Making student loans work for every student", "Research paper", "Student loans", "Prof. Ibrahim Danjuma", 18, 12],
      ["graduate-unemployment-universities", "Graduate unemployment: what universities can do", "Policy brief", "Graduate jobs", "Aisha Bello", 7, 25],
      ["who-pays-for-campus-housing", "Who pays for campus housing?", "Report", "Campus housing", "Tunde Adeyemi", 22, 33],
      ["research-funding-after-tetfund-reforms", "Research funding after the TETFund reforms", "Working paper", "Research funding", "Dr Chiamaka Eze", 15, 44],
      ["why-student-unions-still-matter", "Why student unions still matter", "Opinion", "Access and inclusion", "Musa Abdullahi", 5, 70],
      ["teaching-online-after-the-strikes", "Teaching online after the strikes", "Research paper", "University funding", "Dr Ngozi Okafor", 12, 83],
      ["polytechnic-graduates-hnd-gap", "Polytechnic graduates and the HND gap", "Policy brief", "Graduate jobs", "Halima Musa", 16, 95],
      ["women-in-stem-federal-universities", "Women in STEM at federal universities", "Conference paper", "Access and inclusion", "Grace Etim", 20, 109],
      ["fair-deal-adjunct-lecturers", "A fair deal for adjunct lecturers", "Opinion", "University funding", "Emeka Obi", 4, 122],
    ].map(([slug, title, type, topic, author, mins, ago]) => ({
      slug, title, type, topic,
      summary: `${title}. A ${String(type).toLowerCase()} from TFN Research & Insights.`,
      body: `This ${String(type).toLowerCase()} looks at ${String(topic).toLowerCase()} in Nigeria’s tertiary institutions, drawing on interviews, institutional records and recent policy changes.\n\nThe full text is available as a PDF.`,
      authors: [{ name: String(author), role: "Author", affiliation: "TFN Research & Insights" }],
      programme: "TFN Research & Insights",
      pages: Math.max(4, Math.round(Number(mins) * 0.9)),
      readMinutes: Number(mins),
      pdfSize: `${(Number(mins) / 14).toFixed(1)} MB`,
      tags: [String(topic)],
      status: "published",
      publishedAt: daysAgo(Number(ago)),
    })),
  ]);

  /* ---------- Opportunities ---------- */
  await Opportunity.insertMany([
    {
      slug: "undergraduate-merit-scholarship-2027",
      title: "Undergraduate Merit Scholarship 2027",
      provider: "Ajala Education Trust",
      category: "Scholarships",
      location: "Nigeria",
      level: "Undergraduate, 200 level and above",
      value: "Full tuition and ₦200,000 a year",
      summary: "Full tuition for strong students at Nigerian public universities.",
      description: "The Ajala Education Trust funds students who have done well and need support to finish their degree. Awards run until graduation, as long as you keep a 3.5 CGPA.",
      offers: ["Full tuition, paid to your university", "₦200,000 a year for books and living costs", "A mentor from the Trust’s alumni network"],
      eligibility: ["Nigerian citizen at a federal or state university", "In 200 level or above", "CGPA of 3.5 or higher", "Household income below ₦3 million a year"],
      howToApply: ["Apply on the Trust’s website", "Upload your latest transcript and a reference", "Shortlisted applicants are interviewed online"],
      opensAt: daysAgo(20), closesAt: d("2027-03-14T22:59:00Z"),
      applyUrl: "https://example.org/ajala-scholarship",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(6),
    },
    {
      slug: "public-policy-fellowship-2027",
      title: "Public Policy Fellowship 2027",
      provider: "Unity Bridge Foundation",
      category: "Fellowships",
      location: "Abroad",
      level: "Graduates under 32",
      value: "Funded nine-month fellowship",
      summary: "Nine months with a policy institute abroad, fully funded.",
      description: "Fellows spend nine months with a partner policy institute, working on a research project linked to their home country.",
      offers: ["Flights, visa and accommodation", "Monthly stipend", "A supervised research project"],
      eligibility: ["First degree completed", "Under 32 on 1 September 2027", "Two years of relevant work or study"],
      howToApply: ["Online application with a 1,000-word proposal", "Two references", "Panel interview"],
      opensAt: daysAgo(14), closesAt: d("2027-04-02T22:59:00Z"),
      applyUrl: "https://example.org/unity-bridge-fellowship",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(9),
    },
    {
      slug: "graduate-internship-energy",
      title: "Graduate Internship in Energy",
      provider: "Coastline Energy Ltd",
      category: "Internships",
      location: "Lagos",
      level: "Recent graduates",
      value: "Six months, paid",
      summary: "A paid six-month placement in engineering, finance or operations.",
      description: "Coastline Energy takes recent graduates into its Lagos office for six months, across engineering, finance and operations.",
      offers: ["Monthly allowance", "Rotations across three teams", "Chance of a permanent role"],
      eligibility: ["Graduated in the last two years", "Second class upper or HND upper credit", "Completed NYSC or exempt"],
      howToApply: ["Apply online with your CV", "Aptitude test", "Assessment day in Lagos"],
      opensAt: daysAgo(10), closesAt: d("2027-03-28T22:59:00Z"),
      applyUrl: "https://example.org/coastline-internship",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(12),
    },
    {
      slug: "student-innovation-grant",
      title: "Student Innovation Grant",
      provider: "Innovate Naija Fund",
      category: "Grants",
      location: "Online",
      level: "Student teams",
      value: "Up to ₦2,500,000",
      summary: "Seed funding for student teams with a working prototype.",
      description: "Grants for student teams turning a campus project into a product, with six months of online support.",
      offers: ["Up to ₦2,500,000", "Monthly mentor calls", "Demo day with investors"],
      eligibility: ["Team of two to five", "At least one member currently enrolled", "A working prototype"],
      howToApply: ["Online form and two-minute video", "Shortlist pitch online"],
      opensAt: daysAgo(4), closesAt: d("2027-04-30T22:59:00Z"),
      applyUrl: "https://example.org/innovate-naija",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(4),
    },
    {
      slug: "data-analysis-for-beginners",
      title: "Data Analysis for Beginners",
      provider: "Sahel Learning Fund",
      category: "Training",
      location: "Online",
      level: "Any level",
      value: "Free eight-week course",
      summary: "Eight weeks of spreadsheets, SQL and dashboards, free.",
      description: "A free online course for students and graduates who want practical data skills.",
      offers: ["Live classes twice a week", "Certificate on completion"],
      eligibility: ["Student or graduate", "A laptop and internet access"],
      howToApply: ["Register on the provider’s site"],
      opensAt: daysAgo(15), closesAt: d("2027-03-21T22:59:00Z"),
      applyUrl: "https://example.org/sahel-data",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(15),
    },
    {
      slug: "national-campus-debate-challenge",
      title: "National Campus Debate Challenge",
      provider: "Campus Debaters Association",
      category: "Competitions",
      location: "Nigeria",
      level: "Undergraduate teams",
      value: "₦1,000,000 first prize",
      summary: "Teams of three from any tertiary institution.",
      description: "A national debate competition with regional rounds and a televised final.",
      offers: ["₦1,000,000 first prize", "Travel for finalists"],
      eligibility: ["Teams of three from one institution", "All members currently enrolled"],
      howToApply: ["Register your team online"],
      opensAt: daysAgo(2), closesAt: d("2027-05-09T22:59:00Z"),
      applyUrl: "https://example.org/campus-debate",
      checks: { provider: true, link: true, free: true, deadline: true },
      status: "published", publishedAt: daysAgo(2),
    },
    {
      slug: "women-in-tech-bootcamp",
      title: "Women in Tech Bootcamp",
      provider: "CodeHer Africa",
      category: "Training",
      location: "Abuja",
      level: "Female students",
      value: "Free 12-week bootcamp",
      description: "A 12-week software bootcamp for female students in Abuja.",
      eligibility: ["Female student at an Abuja institution"],
      closesAt: d("2027-02-15T22:59:00Z"),
      applyUrl: "https://example.org/codeher",
      submitterName: "Blessing Ade", submitterEmail: "blessing@codeher.example",
      checks: { provider: true, link: true, free: false, deadline: true },
      status: "pending",
    },
    {
      slug: "guaranteed-uk-visa-scholarship",
      title: "Guaranteed UK Visa Scholarship",
      provider: "Global Edu Agents",
      category: "Scholarships",
      location: "Abroad",
      description: "Pay a ₦50,000 processing fee to secure your place.",
      closesAt: daysAhead(10),
      applyUrl: "https://example.org/suspicious",
      submitterName: "Agent K", submitterEmail: "info@globaledu.example",
      checks: { provider: false, link: false, free: false, deadline: true },
      status: "pending",
    },
  ]);

  /* ---------- Events ---------- */
  const [dialogue, forum, campus, academy] = await Event.insertMany([
    {
      slug: "national-tertiary-policy-dialogue-2027",
      title: "National Tertiary Policy Dialogue",
      programme: "National Tertiary Policy Dialogue",
      theme: "Funding, quality and access: the next decade of tertiary education",
      summary: "A full day on how Nigeria funds and runs its universities, polytechnics and colleges.",
      about: "A full day of conversation between vice-chancellors, policymakers, lecturers and student leaders on how Nigeria funds and runs its universities, polytechnics and colleges. Open to anyone working or studying in tertiary education.",
      objectives: ["Agree shared priorities for tertiary education funding", "Hear directly from students and staff on access and quality", "Publish a communiqué with clear recommendations"],
      startsAt: d("2027-03-12T08:00:00Z"), endsAt: d("2027-03-12T15:30:00Z"),
      venue: "Shehu Musa Yar’Adua Centre", city: "Abuja", online: true, free: true, capacity: 400,
      image: "/photos/young-woman-mic.jpg", imageAlt: "A young woman speaking into a microphone",
      agenda: [
        { time: "09:00", item: "Arrival and registration|Main hall foyer" },
        { time: "10:00", item: "Opening address|Prof. Adaeze Nwosu" },
        { time: "10:45", item: "Panel: student loans|Vice-chancellors and student union presidents" },
        { time: "12:30", item: "Lunch and networking|" },
        { time: "14:00", item: "Breakout sessions|Three rooms" },
        { time: "16:00", item: "Closing and communiqué|Hon. Bello Garba" },
      ],
      speakers: [
        { name: "Prof. Adaeze Nwosu", role: "Chair, TFN Governing Board" },
        { name: "Hon. Bello Garba", role: "House Committee on Tertiary Education" },
        { name: "Dr Chiamaka Eze", role: "Senior Lecturer, University of Nigeria" },
        { name: "Ifeoluwa Ogunleye", role: "President, National Association of Students" },
      ],
      accessibility: "The venue has step-free access and accessible toilets. Online sessions have live captions. Tell us what you need when you register.",
    },
    {
      slug: "policy-forum-student-loans-lagos",
      title: "TFN Policy Forum: student loans",
      programme: "TFN Policy Forum",
      theme: "Student loans: who benefits, and who is left out?",
      summary: "Students, lecturers and lawmakers on the loan scheme’s first year.",
      about: "An afternoon forum on the student loan scheme’s first year: what has worked, who is being missed and what should change.",
      objectives: ["Hear from students at state polytechnics and colleges", "Agree three changes to put to lawmakers"],
      startsAt: d("2027-03-20T09:00:00Z"), endsAt: d("2027-03-20T13:00:00Z"),
      venue: "University of Lagos Main Auditorium", city: "Lagos", online: true, free: true, capacity: 300,
      image: "/photos/conference-stage.jpg", imageAlt: "A speaker addressing a full room",
      agenda: [
        { time: "10:00", item: "Welcome|" },
        { time: "10:15", item: "What the data says|TFN Research & Insights" },
        { time: "11:00", item: "Open floor|Students and lecturers" },
        { time: "13:00", item: "Close|" },
      ],
      speakers: [{ name: "Prof. Ibrahim Danjuma", role: "Author, Making student loans work" }],
      accessibility: "Step-free access. Live captions online.",
    },
    {
      slug: "campus-connect-abu-zaria",
      title: "Campus Connect: Ahmadu Bello University",
      programme: "TFN Campus Connect",
      summary: "Student dialogue and campus organisations session in Zaria.",
      about: "TFN visits Ahmadu Bello University for a student dialogue, a session with campus organisations and a meeting with university leadership.",
      objectives: ["Meet student leaders and campus organisations", "Agree how TFN and ABU will work together"],
      startsAt: d("2027-05-22T09:00:00Z"), endsAt: d("2027-05-22T14:00:00Z"),
      venue: "Ahmadu Bello University", city: "Zaria", online: false, free: true, capacity: 250,
      image: "/photos/campus-outdoors.jpg", imageAlt: "Students with laptops sitting outdoors on campus",
      agenda: [{ time: "10:00", item: "Student dialogue|Assembly hall" }, { time: "12:00", item: "Campus organisations|" }],
      speakers: [],
      accessibility: "Tell us what you need when you register.",
    },
    {
      slug: "leadership-academy-open-evening",
      title: "Leadership Academy open evening",
      programme: "TFN Leadership Academy",
      summary: "Meet the first cohort and hear how the next intake works.",
      about: "An hour online with the first Leadership Academy cohort and their mentors, with time for questions about the next intake.",
      objectives: ["Hear from current participants", "Ask about the next intake"],
      startsAt: daysAhead(16), endsAt: daysAhead(16),
      venue: "Online", city: "Online", online: true, free: true, capacity: 500,
      image: "/photos/laptop-trio.jpg", imageAlt: "Three students working together around a laptop",
      agenda: [{ time: "18:00", item: "Welcome and stories from the cohort|" }, { time: "18:40", item: "Questions|" }],
      speakers: [],
      accessibility: "Live captions throughout.",
    },
  ]);

  const names = ["Chinedu Okafor", "Fatima Bello", "Seun Adebayo", "Ngozi Eze", "Ibrahim Sani", "Kemi Ojo", "Uche Obi", "Halima Musa", "Tobi Ade", "Amaka Nwosu", "Yusuf Garba", "Bisi Coker", "Emeka Ude", "Zainab Ali", "David Etim"];
  const insts = ["University of Lagos", "Ahmadu Bello University", "University of Ibadan", "Yaba College of Technology", "University of Nigeria, Nsukka", "Federal Polytechnic Bida", "University of Abuja", "Kano State Polytechnic", "Obafemi Awolowo University", "Federal College of Education, Zaria"];
  const regs = [];
  for (const [ev, n] of [[dialogue, 312], [forum, 160], [campus, 41], [academy, 87]] as const) {
    for (let i = 0; i < n; i++) {
      const first = names[i % names.length].split(" ")[0];
      const last = names[(i * 7 + Math.floor(i / names.length)) % names.length].split(" ")[1];
      const nm = `${first} ${last}`;
      regs.push({
        event: ev._id,
        name: nm,
        email: `${first}.${last}${i}@example.com`.toLowerCase(),
        institution: insts[i % insts.length],
        role: i % 4 === 0 ? "Academic staff" : "Student",
        attendance: ev.venue === "Online" || i % 3 === 0 ? "Online" : "In person",
        access: i % 23 === 5 ? "Step-free access, please" : i % 31 === 9 ? "Live captions" : "",
        createdAt: daysAgo(i % 30),
      });
    }
  }
  await EventRegistration.insertMany(regs);

  /* ---------- Digital Communities registrations ---------- */
  const states = ["Lagos", "FCT", "Kaduna", "Oyo", "Enugu", "Kano", "Rivers", "Niger", "Osun", "Plateau"];
  const joins = [];
  for (let i = 0; i < 180; i++) {
    const nm = names[i % names.length];
    joins.push({
      firstName: nm.split(" ")[0],
      email: `${nm.split(" ")[0].toLowerCase()}.${i}@example.com`,
      whatsapp: `+23480${String(30000000 + i * 7919).slice(0, 8)}`,
      institution: insts[i % insts.length],
      state: states[i % states.length],
      role: ["Student", "Student", "Student", "Graduate", "Academic staff", "Campus organisation"][i % 6],
      channels: i % 3 === 0 ? ["Telegram"] : i % 3 === 1 ? ["WhatsApp"] : ["WhatsApp", "Telegram"],
      emailUpdates: i % 2 === 0,
      deleteToken: crypto.randomBytes(16).toString("hex"),
      createdAt: daysAgo(Math.floor(i / 7)),
    });
  }
  await JoinRegistration.insertMany(joins);

  /* ---------- Inbox ---------- */
  await Enquiry.insertMany([
    { kind: "partnership", category: "Partnerships", name: "Dr Funmi Alade", email: "f.alade@example.edu.ng", organisation: "Lagos State University", subject: "Hosting a Policy Forum at LASU", message: "We would like to host a Policy Forum on graduate employability in the second semester. Who should we speak to about dates and format?", status: "new", createdAt: daysAgo(0) },
    { kind: "contact", category: "Digital Communities", name: "Samuel Okon", email: "samuel.okon@example.com", subject: "Fake TFN WhatsApp group", message: "Someone added me to a WhatsApp group called ‘TFN Scholarships 2027’ and is asking for ₦5,000 to process applications. Is this you?", status: "new", createdAt: daysAgo(1) },
    { kind: "contact", category: "Media", name: "Ruth Danladi", email: "ruth@newsdesk.example", organisation: "Daily Ledger", subject: "Interview request: student loans", message: "Could someone from TFN speak to us about the Policy Forum recommendations this week?", status: "open", assignee: "Tunde Bakare", createdAt: daysAgo(2) },
    { kind: "contact", category: "Research", name: "Dr Kola Ayeni", email: "k.ayeni@example.edu.ng", organisation: "University of Ilorin", subject: "Submitting a working paper", message: "I have a working paper on polytechnic funding I would like TFN to consider.", status: "open", assignee: "Zainab Yusuf", createdAt: daysAgo(4) },
    { kind: "contact", category: "Membership", name: "Aisha Lawal", email: "aisha.lawal@example.com", subject: "When does membership open?", message: "I’d like to apply for membership. When will applications open?", status: "replied", assignee: "Chidi Nnamdi", createdAt: daysAgo(6) },
    { kind: "contact", category: "General", name: "Peter Udo", email: "peter.udo@example.com", subject: "Volunteering", message: "Can students volunteer at the Policy Dialogue?", status: "closed", createdAt: daysAgo(12) },
  ]);

  /* ---------- Channels ---------- */
  await Channel.insertMany([
    { name: "TFN WhatsApp Channel", platform: "WhatsApp", handle: "Tertiary Futures Network", url: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://whatsapp.com/channel/tfnetwork", members: 4820, owner: "Chidi Nnamdi" },
    { name: "TFN Telegram Channel", platform: "Telegram", handle: "@tfnetwork", url: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/tfnetwork", members: 2160, owner: "Chidi Nnamdi" },
    { name: "Questions and support (moderated)", platform: "Telegram", handle: "@tfnetwork_help", url: "https://t.me/tfnetwork_help", members: 310, owner: "Zainab Yusuf" },
    { name: "TFN on X", platform: "X", handle: "@tfnetwork", url: "https://x.com/tfnetwork", members: 1290, owner: "Chidi Nnamdi" },
  ]);
  await ChannelPost.insertMany([
    { title: "Policy Dialogue registration reminder", body: "Registration for the National Tertiary Policy Dialogue is open. It’s free, in Abuja and online.", channels: ["WhatsApp", "Telegram"], scheduledFor: daysAhead(1), status: "approved", owner: "Chidi Nnamdi", approvedBy: "Zainab Yusuf", link: "/events/national-tertiary-policy-dialogue-2027" },
    { title: "New: Student Innovation Grant", body: "Up to ₦2.5m for student teams with a working prototype. Closes 30 April.", channels: ["WhatsApp", "Telegram", "X"], scheduledFor: daysAhead(2), status: "review", owner: "Chidi Nnamdi", link: "/opportunities/student-innovation-grant" },
    { title: "Leadership Academy open evening", body: "Meet the first cohort online.", channels: ["WhatsApp", "Telegram"], scheduledFor: daysAhead(4), status: "draft", owner: "Hauwa Lawal" },
    { title: "Funding brief launch", body: "Our new brief on funding public universities is out.", channels: ["WhatsApp", "Telegram", "LinkedIn"], scheduledFor: daysAgo(3), status: "published", owner: "Chidi Nnamdi", approvedBy: "Zainab Yusuf" },
    { title: "Weekly opportunities round-up", body: "", channels: ["WhatsApp", "Telegram"], scheduledFor: daysAhead(6), status: "brief", owner: "Chidi Nnamdi" },
    { title: "Safety reminder: we never ask for money", body: "TFN will never ask for payment, passwords or bank details.", channels: ["WhatsApp", "Telegram"], scheduledFor: daysAhead(3), status: "approved", owner: "Chidi Nnamdi", approvedBy: "Amara Okeke" },
  ]);
  await Incident.insertMany([
    { title: "Fake ‘TFN Scholarships 2027’ WhatsApp group asking for fees", detail: "Reported via contact form. Screenshot requested; warning post scheduled.", severity: "high", status: "open", reportedBy: "Samuel Okon", createdAt: daysAgo(1) },
    { title: "Impersonation account on Instagram", detail: "Reported to Instagram; account removed.", severity: "medium", status: "resolved", reportedBy: "Chidi Nnamdi", createdAt: daysAgo(18) },
  ]);

  await Activity.insertMany([
    { who: "Tunde Bakare", what: "sent “Annual Summit 2027 theme announced” for review", href: "/admin/content", createdAt: daysAgo(0) },
    { who: "Zainab Yusuf", what: "approved “Policy Dialogue registration reminder”", href: "/admin/channels", createdAt: daysAgo(0) },
    { who: "Chidi Nnamdi", what: "logged a fake WhatsApp group incident", href: "/admin/channels", createdAt: daysAgo(1) },
    { who: "Amara Okeke", what: "published “Funding Nigeria’s public universities beyond the federal purse”", href: "/admin/content", createdAt: daysAgo(3) },
    { who: "Hauwa Lawal", what: "opened registration for the Leadership Academy open evening", href: "/admin/events", createdAt: daysAgo(5) },
  ]);

  console.log("Seeded sample content");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
