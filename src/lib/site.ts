import type { IconName } from "@/components/icons";

export const SITE = {
  name: "Tertiary Futures Network",
  short: "TFN",
  joinPath: "/join",
  /** The community links are gated: these send people to the sign-up form first. */
  whatsapp: "/join?channel=WhatsApp#register",
  telegram: "/join?channel=Telegram#register",
  x: "https://x.com/tfnetwork",
  linkedin: "https://www.linkedin.com/company/tfnetwork",
  instagram: "https://www.instagram.com/tfnetwork",
  email: "info@tfnetwork.org",
  phone: "+234 803 555 0142",
  address: ["14 Aminu Kano Crescent", "Wuse II, Abuja"],
};

export const NAV = [
  { href: "/about", label: "About TFN" },
  { href: "/programmes", label: "Programmes" },
  { href: "/research", label: "Research" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/news", label: "News & Events" },
  { href: "/partners", label: "Partners" },
  { href: "/contact", label: "Contact" },
];

export type Division = { slug: string; name: string; line: string; icon: IconName };
export const DIVISIONS: Division[] = [
  { slug: "policy", name: "Policy & Public Affairs", line: "Policy conversations, public affairs and stakeholder dialogue.", icon: "policy" },
  { slug: "leadership", name: "Leadership & Development", line: "Leadership development, mentorship and capacity building.", icon: "leadership" },
  { slug: "institutions", name: "Institutional Engagement", line: "Relationships with institutions, public bodies and partners.", icon: "institutions" },
  { slug: "research", name: "Research & Knowledge", line: "Research, policy analysis, publications and knowledge exchange.", icon: "research" },
  { slug: "opportunities", name: "Opportunities & Innovation", line: "Opportunities in education, enterprise, innovation and training.", icon: "opportunities" },
  { slug: "digital", name: "Digital Network & Partnerships", line: "TFN’s digital presence and partnerships. Leads the Tertiary Digital Communities.", icon: "digital" },
];

export type Audience = "Students" | "Institutions" | "Researchers" | "Partners";

export type Programme = {
  slug: string;
  name: string;
  short: string;
  line: string;
  intro: string;
  approach: string;
  img: string;
  alt: string;
  pos?: string;
  division: string;
  audiences: Audience[];
  serves: string[];
  formatsTitle: string;
  formats: { name: string; line: string }[];
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  ownChannels?: boolean;
};

export const PROGRAMMES: Programme[] = [
  {
    slug: "policy-forum",
    name: "TFN Policy Forum",
    short: "Policy Forum",
    line: "Roundtables, lectures and consultations on policy.",
    intro: "Where students, academics and policymakers sit at the same table to work through the issues facing tertiary education.",
    approach: "Constructive dialogue that brings research and policy closer together, with practical follow-up.",
    img: "/photos/speaker-hall.jpg",
    alt: "A speaker with a microphone in an auditorium",
    pos: "50% 35%",
    division: "policy",
    audiences: ["Students", "Institutions", "Researchers", "Partners"],
    serves: ["Students", "Academics", "Policymakers", "Institution leaders", "Researchers", "Practitioners", "Partner organisations"],
    formatsTitle: "What happens at a forum",
    formats: [
      { name: "Policy roundtables", line: "Small, focused discussions on one issue." },
      { name: "Public lectures", line: "Open talks from experienced voices." },
      { name: "Expert conversations", line: "Practitioners and researchers in dialogue." },
      { name: "Stakeholder consultations", line: "Your views gathered on live policy questions." },
      { name: "Thematic discussions", line: "A season of sessions around one theme." },
    ],
    primary: { label: "Take part in a forum", href: "/events/national-tertiary-policy-dialogue-2027" },
    secondary: { label: "Propose a topic", href: "/contact?topic=Programmes" },
  },
  {
    slug: "campus-connect",
    name: "TFN Campus Connect",
    short: "Campus Connect",
    line: "TFN on your campus: visits, dialogues, partnerships.",
    intro: "TFN on your campus. Visits, dialogues and partnerships that link campus ideas to wider networks.",
    approach: "Campus visits, student engagement and institutional partnerships, so TFN and each institution work together properly.",
    img: "/photos/campus-outdoors.jpg",
    alt: "Students with laptops sitting outdoors on campus",
    division: "institutions",
    audiences: ["Students", "Institutions"],
    serves: ["Tertiary institutions", "Student organisations", "Student leaders", "Academics", "Campus initiatives"],
    formatsTitle: "What Campus Connect does",
    formats: [
      { name: "Campus visits", line: "TFN comes to your institution, by invitation." },
      { name: "Student dialogues", line: "Open sessions with student leaders and unions." },
      { name: "Institutional partnerships", line: "Agreements that make the relationship formal." },
      { name: "Campus representatives", line: "A named contact on the ground at each institution." },
    ],
    primary: { label: "Connect your institution", href: "/partners#enquiry" },
    secondary: { label: "Register interest", href: "/join" },
  },
  {
    slug: "leadership-academy",
    name: "TFN Leadership Academy",
    short: "Leadership Academy",
    line: "Workshops, mentorship and real leadership projects.",
    intro: "Practical leadership training for students and young professionals: workshops, mentors and real projects.",
    approach: "Knowledge, reflection and applied learning, with experienced leaders in the room.",
    img: "/photos/laptop-trio.jpg",
    alt: "Three students working together around a laptop",
    division: "leadership",
    audiences: ["Students"],
    serves: ["Students", "Emerging leaders", "Young professionals", "Institutional representatives"],
    formatsTitle: "How the Academy works",
    formats: [
      { name: "Leadership workshops", line: "Hands-on sessions on decisions, teams and judgement." },
      { name: "Mentorship", line: "Paired with someone a few steps ahead of you." },
      { name: "Leader conversations", line: "Candid dialogues with experienced leaders." },
      { name: "Applied projects", line: "A real problem on your campus, worked through as a team." },
    ],
    primary: { label: "Register interest", href: "/join" },
    secondary: { label: "Become a mentor", href: "/contact?topic=Programmes" },
  },
  {
    slug: "research-insights",
    name: "TFN Research & Insights",
    short: "Research & Insights",
    line: "Policy briefs and papers to read or contribute to.",
    intro: "Evidence and analysis on tertiary education, leadership and public policy, written to be read and used.",
    approach: "Briefs, papers and reports from researchers and practitioners, with collaboration open to institutions.",
    img: "/photos/women-laptop.jpg",
    alt: "Young women gathered around a laptop",
    division: "research",
    audiences: ["Researchers", "Institutions"],
    serves: ["Researchers", "Academics", "Students", "Policy practitioners", "Institutions", "Knowledge partners"],
    formatsTitle: "What we publish",
    formats: [
      { name: "Policy briefs", line: "Short, practical, and written for decision-makers." },
      { name: "Research papers", line: "Longer studies with methods and data." },
      { name: "Institutional reports", line: "What is happening inside institutions, documented." },
      { name: "Opinion", line: "Considered arguments from people in the sector." },
    ],
    primary: { label: "Read publications", href: "/research" },
    secondary: { label: "Submit research", href: "/contact?topic=Research" },
  },
  {
    slug: "opportunity-hub",
    name: "TFN Opportunity Hub",
    short: "Opportunity Hub",
    line: "Scholarships, fellowships, internships and grants.",
    intro: "Scholarships, fellowships, internships, grants and training, checked and gathered in one place.",
    approach: "Every listing shows eligibility, deadline and a link to the original provider, and is reviewed before it goes live.",
    img: "/photos/coding-pair.jpg",
    alt: "Two students coding together at a desk",
    division: "opportunities",
    audiences: ["Students", "Researchers"],
    serves: ["Students", "Graduates", "Researchers", "Emerging leaders", "Entrepreneurs"],
    formatsTitle: "What you’ll find",
    formats: [
      { name: "Scholarships and fellowships", line: "Funding for study and research, at home and abroad." },
      { name: "Internships", line: "Placements with organisations that want graduates." },
      { name: "Grants and enterprise", line: "Support for ideas and young businesses." },
      { name: "Training and competitions", line: "Skills courses and national challenges." },
    ],
    primary: { label: "Explore opportunities", href: "/opportunities" },
    secondary: { label: "Submit an opportunity", href: "/opportunities/submit" },
  },
  {
    slug: "global-network",
    name: "TFN Global Network",
    short: "Global Network",
    line: "Exchanges and partnerships with institutions abroad.",
    intro: "Exchange, research collaboration and shared learning with institutions across countries and regions.",
    approach: "Built step by step as TFN’s institutional relationships grow, starting with virtual dialogues and visiting speakers.",
    img: "/photos/delegates.jpg",
    alt: "Delegates talking at an event",
    division: "digital",
    audiences: ["Institutions", "Researchers", "Partners"],
    serves: ["International institutions", "Researchers", "Students", "Alumni", "Development partners"],
    formatsTitle: "What the Global Network does",
    formats: [
      { name: "Institutional partnerships", line: "Links between Nigerian and international institutions." },
      { name: "Virtual dialogues", line: "Conversations across borders, online." },
      { name: "Visiting speakers", line: "Voices from abroad on Nigerian campuses." },
      { name: "Collaborative research", line: "Joint studies on shared questions." },
    ],
    primary: { label: "Propose a partnership", href: "/partners#enquiry" },
    secondary: { label: "Join the network", href: "/join" },
  },
  {
    slug: "annual-summit",
    name: "TFN Annual Summit",
    short: "Annual Summit",
    line: "The yearly gathering of leaders across sectors.",
    intro: "One day a year when leaders from campuses, government, business and civil society meet on the same stage.",
    approach: "Each edition has a theme and a published programme: keynotes, panels, research and the year’s TFN initiatives.",
    img: "/photos/auditorium-full.jpg",
    alt: "A packed conference hall during a session",
    division: "policy",
    audiences: ["Students", "Institutions", "Researchers", "Partners"],
    serves: ["Institutional leaders", "Policymakers", "Academics", "Students", "Private-sector leaders", "Development partners"],
    formatsTitle: "At the Summit",
    formats: [
      { name: "Keynote addresses", line: "The year’s big questions, set out plainly." },
      { name: "Panel discussions", line: "Different sectors, one stage." },
      { name: "Research presentations", line: "New evidence from TFN and its partners." },
      { name: "Networking", line: "Time built in to meet people properly." },
    ],
    primary: { label: "Register interest", href: "/join" },
    secondary: { label: "Sponsor the Summit", href: "/partners#enquiry" },
  },
  {
    slug: "national-tertiary-policy-dialogue",
    name: "National Tertiary Policy Dialogue",
    short: "Policy Dialogue",
    line: "National conversation on tertiary education reform.",
    intro: "A national, structured conversation on funding, quality and access in tertiary education.",
    approach: "Institutions, policymakers, students and professional bodies examine reform priorities and agree recommendations.",
    img: "/photos/panel-audience.jpg",
    alt: "A panel speaking in front of an audience",
    division: "policy",
    audiences: ["Institutions", "Researchers", "Partners"],
    serves: ["Institution leaders", "Policymakers", "Academics", "Students", "Researchers", "Professional bodies"],
    formatsTitle: "What the Dialogue produces",
    formats: [
      { name: "National sessions", line: "A full day of structured discussion." },
      { name: "Communiqués", line: "Agreed recommendations, published openly." },
      { name: "Policy summaries", line: "Short notes for ministries and agencies." },
      { name: "Follow-up engagement", line: "Recommendations taken to the people who decide." },
    ],
    primary: { label: "Register for the Dialogue", href: "/events/national-tertiary-policy-dialogue-2027" },
    secondary: { label: "Propose a theme", href: "/contact?topic=Programmes" },
  },
  {
    slug: "gotv",
    name: "National Tertiary Students’ GOTV Project",
    short: "GOTV Project",
    line: "Electoral participation for eligible students. Runs its own channels.",
    intro: "Helping eligible tertiary students take part in elections, informed and within the law.",
    approach: "Participation education and engagement, with its own notices, consent and channels. GOTV data is never mixed with Digital Communities data.",
    img: "/photos/audience-hands.jpg",
    alt: "Students raising their hands in a lecture hall",
    division: "policy",
    audiences: ["Students"],
    serves: ["Eligible tertiary students"],
    formatsTitle: "What the project does",
    formats: [
      { name: "Participation education", line: "How registration and voting work, explained." },
      { name: "Campus engagement", line: "Non-partisan sessions on campus." },
      { name: "Programme channels", line: "Separate from TFN’s Digital Communities." },
    ],
    primary: { label: "Contact the programme team", href: "/contact?topic=Programmes" },
    ownChannels: true,
  },
  {
    slug: "digital-communities",
    name: "Tertiary Digital Communities",
    short: "Digital Communities",
    line: "Official TFN updates and opportunities on WhatsApp and Telegram.",
    intro: "Official TFN updates, opportunities and resources on WhatsApp and Telegram. Free, and easy to leave.",
    approach: "One-to-many channels only. Questions go to small moderated spaces and a support contact, so no one is added to a big group chat.",
    img: "/photos/pair-laptop.jpg",
    alt: "Two young people looking at a laptop together",
    division: "digital",
    audiences: ["Students", "Institutions", "Researchers", "Partners"],
    serves: ["Students", "Graduates", "Emerging leaders", "Academics", "Campus organisations"],
    formatsTitle: "What you’ll receive",
    formats: [
      { name: "TFN news", line: "Programme updates and event announcements." },
      { name: "New opportunities", line: "Fresh listings from the Opportunity Hub." },
      { name: "Research", line: "New publications and learning resources." },
      { name: "Calls to take part", line: "Including when membership opens." },
    ],
    primary: { label: "Join the Digital Communities", href: "/join" },
  },
];

export const programmeBySlug = (slug: string) => PROGRAMMES.find((p) => p.slug === slug);
export const programmeByName = (name: string) => PROGRAMMES.find((p) => p.name === name);

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

export const JOIN_ROLES = ["Student", "Graduate", "Academic or staff", "Other"];

export const CONTACT_TOPICS = ["General", "Programmes", "Digital Communities", "Membership", "Research", "Partnerships", "Media", "Privacy"];

export const PARTNER_TYPES = [
  { name: "Tertiary institutions", line: "Campus engagement, research, student development, policy dialogue.", icon: "building" },
  { name: "Government and public institutions", line: "Policy dialogue, research, public programmes.", icon: "policy" },
  { name: "Private sector", line: "Internships, leadership development, enterprise, sponsorship.", icon: "briefcase" },
  { name: "Development partners", line: "Capacity building, youth and education initiatives.", icon: "handshake" },
  { name: "International institutions", line: "Exchanges, joint research, international dialogue.", icon: "globe" },
  { name: "Research and professional bodies", line: "Joint studies, conferences, expert contributions.", icon: "research" },
] as const;

export const PARTNER_AREAS = ["Programme delivery", "Research", "Events", "Institutional engagement", "Learning", "Opportunities", "Digital"];

export const OPP_ICONS: Record<string, IconName> = {
  Scholarships: "cap",
  Fellowships: "trophy",
  Internships: "briefcase",
  Grants: "coins",
  Training: "spark",
  Enterprise: "opportunities",
  Competitions: "mic",
};
