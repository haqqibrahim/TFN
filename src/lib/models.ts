import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

const opts = { timestamps: true } as const;

/* ---------- Content ---------- */

export const POST_STATUSES = ["draft", "review", "approved", "published"] as const;
export const NEWS_CATEGORIES = ["TFN news", "Programme updates", "Events", "Announcements", "Media"] as const;

const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, enum: NEWS_CATEGORIES, default: "TFN news" },
    summary: { type: String, default: "" },
    body: { type: String, default: "" }, // markdown
    image: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    caption: { type: String, default: "" },
    author: { type: String, default: "TFN Communications" },
    programme: { type: String, default: "" },
    status: { type: String, enum: POST_STATUSES, default: "draft" },
    publishedAt: Date,
    seoTitle: String,
    seoDescription: String,
    updatedBy: String,
  },
  opts,
);
export type PostDoc = InferSchemaType<typeof PostSchema> & { _id: string };
export const Post = model("Post", PostSchema);

export const PUB_TYPES = ["Policy brief", "Research paper", "Report", "Working paper", "Opinion", "Conference paper"] as const;

const PublicationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, enum: PUB_TYPES, default: "Policy brief" },
    topic: { type: String, default: "" },
    summary: { type: String, default: "" },
    body: { type: String, default: "" },
    authors: [{ name: String, role: String, affiliation: String }],
    programme: { type: String, default: "" },
    pages: Number,
    readMinutes: Number,
    pdfUrl: String,
    pdfSize: String,
    findings: [{ figure: String, line: String }],
    tags: [String],
    image: String,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: POST_STATUSES, default: "draft" },
    publishedAt: Date,
    updatedBy: String,
  },
  opts,
);
export type PublicationDoc = InferSchemaType<typeof PublicationSchema> & { _id: string };
export const Publication = model("Publication", PublicationSchema);

export const OPP_CATEGORIES = ["Scholarships", "Fellowships", "Internships", "Grants", "Training", "Enterprise", "Competitions"] as const;
export const OPP_STATUSES = ["pending", "published", "declined", "closed"] as const;

const OpportunitySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    provider: { type: String, required: true },
    category: { type: String, enum: OPP_CATEGORIES, required: true },
    location: { type: String, default: "Nigeria" }, // Nigeria, Abroad, Online, or a city
    level: { type: String, default: "" },
    value: { type: String, default: "" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    offers: [String],
    eligibility: [String],
    howToApply: [String],
    opensAt: Date,
    closesAt: Date,
    applyUrl: String,
    contactEmail: String,
    submitterName: String,
    submitterEmail: String,
    attachment: { type: Schema.Types.ObjectId, ref: "Upload" },
    checks: {
      provider: { type: Boolean, default: false },
      link: { type: Boolean, default: false },
      free: { type: Boolean, default: false },
      deadline: { type: Boolean, default: false },
    },
    reviewNote: String,
    status: { type: String, enum: OPP_STATUSES, default: "pending" },
    publishedAt: Date,
    updatedBy: String,
  },
  opts,
);
export type OpportunityDoc = InferSchemaType<typeof OpportunitySchema> & { _id: string };
export const Opportunity = model("Opportunity", OpportunitySchema);

const EventSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    programme: { type: String, default: "" },
    theme: String,
    summary: String,
    about: String,
    objectives: [String],
    startsAt: { type: Date, required: true },
    endsAt: Date,
    venue: String,
    city: String,
    online: { type: Boolean, default: false },
    free: { type: Boolean, default: true },
    capacity: { type: Number, default: 0 },
    image: String,
    imageAlt: String,
    agenda: [{ time: String, item: String }],
    speakers: [{ name: String, role: String }],
    accessibility: String,
    status: { type: String, enum: ["draft", "published", "closed"], default: "published" },
  },
  opts,
);
export type EventDoc = InferSchemaType<typeof EventSchema> & { _id: string };
export const Event = model("Event", EventSchema);

const EventRegistrationSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    institution: String,
    role: String,
    attendance: { type: String, enum: ["In person", "Online"], default: "In person" },
    access: String,
    checkedIn: { type: Boolean, default: false },
  },
  opts,
);
export const EventRegistration = model("EventRegistration", EventRegistrationSchema);

/* ---------- People who reach out ---------- */

const JoinRegistrationSchema = new Schema(
  {
    firstName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    whatsapp: String,
    institution: String,
    state: String,
    role: String,
    pvc: { type: String, enum: ["Yes", "No"] },
    channels: [String],
    emailUpdates: { type: Boolean, default: false },
    deleteToken: { type: String, index: true },
  },
  opts,
);
export const JoinRegistration = model("JoinRegistration", JoinRegistrationSchema);

export const ENQUIRY_STATUSES = ["new", "open", "replied", "closed"] as const;
const EnquirySchema = new Schema(
  {
    kind: { type: String, enum: ["contact", "partnership"], default: "contact" },
    category: String,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    organisation: String,
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new" },
    assignee: String,
    orgType: String,
    website: String,
    attachment: { type: Schema.Types.ObjectId, ref: "Upload" },
    notes: [{ by: String, text: String, at: Date }],
  },
  opts,
);
export const Enquiry = model("Enquiry", EnquirySchema);

/* ---------- Channels ---------- */

export const CHANNEL_STATUSES = ["brief", "draft", "review", "approved", "published"] as const;
const ChannelPostSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    channels: [String], // WhatsApp, Telegram, X, LinkedIn, Instagram
    scheduledFor: Date,
    status: { type: String, enum: CHANNEL_STATUSES, default: "brief" },
    link: String,
    owner: String,
    approvedBy: String,
  },
  opts,
);
export const ChannelPost = model("ChannelPost", ChannelPostSchema);

const ChannelSchema = new Schema(
  {
    name: { type: String, required: true },
    platform: { type: String, required: true },
    handle: String,
    url: String,
    members: Number,
    official: { type: Boolean, default: true },
    owner: String,
  },
  opts,
);
export const Channel = model("Channel", ChannelSchema);

const IncidentSchema = new Schema(
  {
    title: { type: String, required: true },
    detail: String,
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    reportedBy: String,
  },
  opts,
);
export const Incident = model("Incident", IncidentSchema);

/* ---------- Admin ---------- */

export const ROLES = ["Super admin", "Editor", "Reviewer", "Channels lead", "Events lead", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

const AdminUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ROLES, default: "Viewer" },
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    lastSignIn: Date,
  },
  opts,
);
export const AdminUser = model("AdminUser", AdminUserSchema);

const ActivitySchema = new Schema(
  {
    who: String,
    what: String,
    href: String,
  },
  opts,
);
export const Activity = model("Activity", ActivitySchema);

export type Plain<T> = T & { _id: string; createdAt: string; updatedAt: string };

/* ---------- Uploaded files (attachments from public forms) ---------- */
const UploadSchema = new Schema(
  {
    name: String,
    type: String,
    size: Number,
    data: Buffer,
  },
  opts,
);
export const Upload = model("Upload", UploadSchema);
