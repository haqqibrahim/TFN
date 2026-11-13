export type Policy = { slug: string; title: string; nav: string; updated: string; intro: string; sections: { id?: string; h: string; p?: string; list?: string[] }[] };

export const POLICIES: Policy[] = [
  {
    slug: "privacy",
    nav: "Privacy notice",
    title: "Privacy notice",
    updated: "13 November 2026",
    intro: "Tertiary Futures Network respects the privacy of visitors, members, applicants and everyone who uses its website and programmes. We handle personal information under the applicable data-protection law, including the Nigeria Data Protection Act 2023, and only for the purposes we explain when we collect it.",
    sections: [
      { h: "Who is responsible", p: "Tertiary Futures Network is responsible for the information you give us. You can reach our privacy team through the Contact page." },
      { h: "What we collect", list: ["Contact details, such as your name, email and WhatsApp number", "Your institution, state and role, if you choose to share them", "Messages and forms you send us, including any files you attach", "Event registrations and any access needs you tell us about"] },
      { h: "Why we use it", p: "To send you the updates you asked for, answer your enquiries, review submissions and run our programmes and events. We rely on your consent, which you can withdraw at any time." },
      { h: "Who we share it with", p: "We use trusted service providers to host the website, store data and send emails. We never sell your information or share it with the National Tertiary Students’ GOTV Project." },
      { id: "digital-communities", h: "Digital Communities registrations", p: "Registrations made on the join page (name, email, WhatsApp number, institution, state, role, preferred channel and whether you have a PVC) are kept separate from TFN membership records and are used only to send Digital Communities updates and understand which institutions and states the community reaches. You can delete your registration at any time." },
      { h: "How long we keep it", p: "We keep your registration while you remain part of the Digital Communities, and delete it when you ask. Enquiries are kept for two years, then deleted." },
      { h: "Your rights", p: "You can ask to see, correct or delete your information, or object to how we use it. Make a privacy enquiry and we’ll respond within 30 days." },
    ],
  },
  {
    slug: "cookies",
    nav: "Cookies",
    title: "Cookies",
    updated: "13 November 2026",
    intro: "This website uses only the cookies it needs to work. We don’t use advertising cookies, and we don’t track you across other websites.",
    sections: [
      { h: "Essential cookies", p: "The admin area uses one secure cookie to keep staff signed in. If you register for the Digital Communities, one secure cookie remembers your registration so you can see the channel links again. It holds no personal details. Nothing else on the public site sets cookies." },
      { h: "Analytics", p: "We don’t run analytics cookies. If that changes, we’ll ask for your consent first and update this page." },
      { h: "Managing cookies", p: "You can block or delete cookies in your browser settings. Public pages will still work." },
    ],
  },
  {
    slug: "terms",
    nav: "Terms of use",
    title: "Terms of use",
    updated: "13 November 2026",
    intro: "Website content is provided for general information about Tertiary Futures Network, its programmes and activities.",
    sections: [
      { h: "Using this website", p: "Don’t misuse the website, attempt unauthorised access, interfere with how it works or submit unlawful, misleading or infringing material." },
      { h: "External links", p: "Links to other websites are provided for convenience. TFN isn’t responsible for their content or practices." },
      { id: "community-standards", h: "Community standards", p: "Harassment, threats, impersonation, spam and misinformation are removed from TFN spaces under published rules. TFN corrects material errors in its own posts openly." },
      { h: "Changes", p: "We may update these terms. The date at the top shows when they last changed." },
    ],
  },
  {
    slug: "accessibility",
    nav: "Accessibility",
    title: "Accessibility statement",
    updated: "13 November 2026",
    intro: "TFN wants this website to be usable by as many people as possible.",
    sections: [
      { h: "What we’ve done", list: ["Readable text that can be zoomed to 200%", "Every page works with a keyboard, with a visible focus outline", "Labelled forms with clear error messages", "Colour contrast that meets WCAG 2.2 AA", "Alternative text for meaningful images", "Respect for reduced-motion settings"] },
      { h: "Events", p: "Tell us what you need when you register for an event, such as step-free access, captions or an interpreter." },
      { h: "Report a barrier", p: "If something on the site doesn’t work for you, contact us and we’ll fix it or give you the information another way." },
    ],
  },
  {
    slug: "opportunity-information",
    nav: "Opportunity information",
    title: "Opportunity information notice",
    updated: "13 November 2026",
    intro: "Opportunity information is provided to help you discover scholarships, fellowships, internships, grants and more.",
    sections: [
      { h: "Check with the provider", p: "Confirm all details, including eligibility and deadlines, with the original provider before you apply." },
      { h: "No guarantees", p: "Unless stated, TFN isn’t the provider, funder or administrator of listed opportunities, and can’t guarantee selection, funding or placement." },
      { h: "Never pay to apply", p: "A real opportunity never asks you to pay TFN. Report anything suspicious through the Contact page." },
    ],
  },
  {
    slug: "digital-communities-notice",
    nav: "Digital Communities notice",
    title: "Digital Communities notice",
    updated: "13 November 2026",
    intro: "Joining the Digital Communities is voluntary and free. You register on the join page, and the official channel links are shown to you once you have.",
    sections: [
      { h: "What we collect", p: "Your first name, email address, WhatsApp number, institution, state, which of the listed options describes you, which channel you want, and a yes or no answer to whether you have a Permanent Voter’s Card (PVC). We use these to keep the channels for real students and staff, send Digital Communities updates and understand which institutions and states the community reaches." },
      { h: "Your PVC answer", p: "We only ask whether you have a PVC, and we count the answers to understand the community. We never ask for your PVC number or a photo of the card, and you should never send them to anyone claiming to be TFN." },
      { h: "Remembering you", p: "After you register we set one cookie on this site so you can come back to your channel links. It holds no personal details and lasts up to a year. Deleting your registration removes it." },
      { h: "Channels", p: "WhatsApp and Telegram manage channel followers under their own terms. TFN doesn’t extract follower identities, buy contact lists, add people to groups without consent or send unsolicited mass messages." },
      { h: "Kept separate", p: "Registrations are kept separate from TFN membership records, aren’t shared with the National Tertiary Students’ GOTV Project and aren’t used for unrelated purposes." },
      { h: "Leaving", p: "Unfollow a channel any time. You can unsubscribe from email or ask us to delete your registration whenever you like." },
    ],
  },
];
