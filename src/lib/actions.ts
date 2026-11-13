"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { Activity, Enquiry, Event, EventRegistration, JoinRegistration, Opportunity, OPP_CATEGORIES, Upload } from "./models";
import { slugify } from "./format";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

const email = z.string().trim().toLowerCase().email("Enter an email address like name@example.com");
const req = (msg: string) => z.string().trim().min(1, msg);

const ALLOWED_FILES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

/** Save an optional uploaded file. Returns an id, null for no file, or an error message. */
async function saveUpload(fd: FormData, field = "file"): Promise<{ id?: unknown; error?: string }> {
  const f = fd.get(field);
  if (!f || typeof f === "string" || f.size === 0) return {};
  if (f.size > 10 * 1024 * 1024) return { error: "Choose a file smaller than 10 MB" };
  if (!ALLOWED_FILES.includes(f.type)) return { error: "Choose a PDF, Word document, JPG or PNG" };
  await db();
  const doc = await Upload.create({ name: f.name.slice(0, 200), type: f.type, size: f.size, data: Buffer.from(await f.arrayBuffer()) });
  return { id: doc._id };
}

function values(fd: FormData) {
  const out: Record<string, string | string[]> = {};
  for (const k of new Set(fd.keys())) {
    if (k.startsWith("$") || k === "hp_url") continue;
    const all = fd.getAll(k).filter((v) => typeof v === "string") as string[];
    if (!all.length) continue;
    out[k] = all.length > 1 ? all : all[0] ?? "";
  }
  return out;
}

function fail(err: z.ZodError, v: Record<string, string | string[]>): FormState {
  const errors: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0]);
    if (!errors[k]) errors[k] = i.message;
  }
  return { ok: false, errors, values: v, message: "Check the highlighted fields." };
}

/** Honeypot: real people leave the hidden "website" field empty. */
function isBot(fd: FormData) {
  return String(fd.get("hp_url") || "").length > 0;
}

/* ---------- Join the Digital Communities ---------- */

const JoinSchema = z.object({
  firstName: req("Enter your first name").max(60),
  email,
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/[\s-]/g, "") : ""))
    .refine((v) => !v || /^(\+?234|0)?[789][01]\d{8}$/.test(v), "Enter a Nigerian mobile number, like 0803 555 0142"),
  institution: z.string().trim().max(120).optional(),
  state: z.string().trim().optional(),
  role: req("Choose the option that fits you best"),
  channel: z.enum(["WhatsApp", "Telegram", "Both"], { message: "Choose a channel" }),
  emailUpdates: z.string().optional(),
  privacy: z.literal("on", { message: "Confirm you have read the privacy notice" }),
});

export async function joinAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (isBot(fd)) redirect("/join/done");
  const parsed = JoinSchema.safeParse(v);
  if (!parsed.success) return fail(parsed.error, v);
  const d = parsed.data;
  await db();
  let wa = d.whatsapp;
  if (wa) wa = wa.startsWith("+") ? wa : wa.startsWith("234") ? "+" + wa : "+234" + wa.replace(/^0/, "");
  const deleteToken = crypto.randomBytes(16).toString("hex");
  await JoinRegistration.create({
    firstName: d.firstName,
    email: d.email,
    whatsapp: wa,
    institution: d.institution,
    state: d.state,
    role: d.role,
    channels: d.channel === "Both" ? ["WhatsApp", "Telegram"] : [d.channel],
    emailUpdates: d.emailUpdates === "on",
    deleteToken,
  });
  redirect(`/join/done?n=${encodeURIComponent(d.firstName)}&t=${deleteToken}`);
}

export async function deleteJoinAction(fd: FormData) {
  const t = String(fd.get("t") || "");
  if (!/^[a-f0-9]{32}$/.test(t)) redirect("/join");
  await db();
  await JoinRegistration.deleteOne({ deleteToken: t });
  redirect("/join/deleted");
}

/* ---------- Contact and partnership enquiries ---------- */

const EnquirySchema = z.object({
  name: req("Enter your full name").max(100),
  email,
  organisation: z.string().trim().max(150).optional(),
  role: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  category: req("Choose what your message is about"),
  subject: req("Add a short subject").max(150),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  consent: z.literal("on", { message: "Tick this box so we can reply to you" }),
});

export async function enquiryAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (isBot(fd)) return { ok: true };
  const parsed = EnquirySchema.safeParse(v);
  if (!parsed.success) return fail(parsed.error, v);
  const d = parsed.data;
  await db();
  await Enquiry.create({
    kind: "contact",
    category: d.category,
    name: d.name,
    email: d.email,
    phone: d.phone,
    organisation: [d.organisation, d.role].filter(Boolean).join(", "),
    subject: d.subject,
    message: d.message,
  });
  await Activity.create({ who: d.name, what: `sent a ${d.category.toLowerCase()} enquiry`, href: "/admin/inbox" });
  revalidatePath("/admin");
  return { ok: true, message: d.name.split(" ")[0] };
}

const PartnerSchema = z.object({
  organisation: req("Enter your organisation’s name").max(150),
  orgType: req("Choose the type of organisation"),
  website: z.string().trim().optional().refine((v) => !v || v === "https://" || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v), "Enter the full web address, starting with https://"),
  name: req("Enter the name of the contact person").max(100),
  email,
  area: req("Choose an area of collaboration"),
  message: z.string().trim().min(20, "Describe your proposal in a few sentences (at least 20 characters)").max(5000),
  consent: z.literal("on", { message: "Tick this box so we can reply to you" }),
});

export async function partnershipAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (isBot(fd)) return { ok: true };
  const parsed = PartnerSchema.safeParse(v);
  if (!parsed.success) return fail(parsed.error, v);
  const up = await saveUpload(fd);
  if (up.error) return { ok: false, errors: { file: up.error }, values: v, message: "Check the highlighted fields." };
  const d = parsed.data;
  await db();
  await Enquiry.create({
    kind: "partnership",
    category: "Partnerships",
    name: d.name,
    email: d.email,
    organisation: d.organisation,
    orgType: d.orgType,
    website: d.website === "https://" ? "" : d.website,
    subject: `${d.area}: ${d.organisation}`,
    message: d.message,
    attachment: up.id,
  });
  await Activity.create({ who: d.name, what: `sent a partnership enquiry from ${d.organisation}`, href: "/admin/inbox" });
  revalidatePath("/admin");
  return { ok: true, message: d.name.split(" ")[0] };
}

/* ---------- Submit an opportunity ---------- */

const OppSchema = z
  .object({
    provider: req("Enter the organisation offering this").max(150),
    title: req("Enter the name of the opportunity").max(150),
    category: z.enum(OPP_CATEGORIES, { message: "Choose a category" }),
    location: req("Choose where it takes place"),
    description: z.string().trim().min(30, "Describe it in a few sentences (at least 30 characters)").max(5000),
    eligibility: z.string().trim().min(5, "Say who can apply").max(3000),
    opensAt: z.string().optional(),
    closesAt: req("Enter the closing date"),
    applyUrl: z.string().trim().url("Enter the full link, starting with https://"),
    submitterEmail: email,
    consent: z.literal("on", { message: "Tick this box so we can review your submission" }),
  })
  .refine((d) => new Date(d.closesAt) > new Date(), { path: ["closesAt"], message: "The closing date must be in the future" });

export async function submitOpportunityAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (isBot(fd)) return { ok: true };
  const parsed = OppSchema.safeParse(v);
  if (!parsed.success) return fail(parsed.error, v);
  const up = await saveUpload(fd);
  if (up.error) return { ok: false, errors: { file: up.error }, values: v, message: "Check the highlighted fields." };
  const d = parsed.data;
  await db();
  let slug = slugify(d.title);
  if (await Opportunity.exists({ slug })) slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  await Opportunity.create({
    slug,
    title: d.title,
    provider: d.provider,
    category: d.category,
    location: d.location,
    description: d.description,
    summary: d.description.slice(0, 140),
    eligibility: d.eligibility.split(/\n+/).map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean),
    opensAt: d.opensAt ? new Date(d.opensAt) : undefined,
    closesAt: new Date(d.closesAt + "T22:59:00Z"),
    applyUrl: d.applyUrl,
    submitterName: d.provider,
    submitterEmail: d.submitterEmail,
    attachment: up.id,
    status: "pending",
  });
  await Activity.create({ who: d.provider, what: `submitted “${d.title}” for review`, href: "/admin/opportunities" });
  revalidatePath("/admin");
  return { ok: true };
}

/* ---------- Event registration ---------- */

const RegSchema = z.object({
  name: req("Enter your full name").max(100),
  email,
  institution: z.string().trim().max(150).optional(),
  role: z.string().trim().optional(),
  attendance: z.enum(["In person", "Online"], { message: "Choose how you’ll attend" }),
  access: z.string().trim().max(1000).optional(),
  privacy: z.literal("on", { message: "Confirm you have read the privacy notice" }),
});

export async function registerEventAction(_: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (isBot(fd)) return { ok: true };
  const parsed = RegSchema.safeParse(v);
  if (!parsed.success) return fail(parsed.error, v);
  const d = parsed.data;
  await db();
  const ev = await Event.findOne({ slug: String(v.event), status: "published" });
  if (!ev) return { ok: false, message: "Registration for this event has closed.", values: v };
  if (await EventRegistration.exists({ event: ev._id, email: d.email })) {
    return { ok: true, message: "already" };
  }
  if (ev.capacity && d.attendance === "In person") {
    const n = await EventRegistration.countDocuments({ event: ev._id });
    if (n >= ev.capacity) return { ok: false, values: v, errors: { attendance: "In-person places are full. Choose Online instead." } };
  }
  await EventRegistration.create({ ...d, event: ev._id });
  revalidatePath(`/events/${ev.slug}`);
  revalidatePath("/");
  return { ok: true, message: d.name.split(" ")[0] };
}
