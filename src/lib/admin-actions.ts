"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { allowed, requireAdmin } from "./auth";
import { db } from "./db";
import { slugify } from "./format";
import {
  Activity, AdminUser, ChannelPost, CHANNEL_STATUSES, Enquiry, ENQUIRY_STATUSES, Event, EventRegistration, Incident,
  JoinRegistration, NEWS_CATEGORIES, Opportunity, OPP_CATEGORIES, Post, POST_STATUSES, Publication, PUB_TYPES, ROLES, type Role,
} from "./models";

type K = Parameters<typeof allowed>[1];
async function gate(what: K) {
  const me = await requireAdmin();
  if (!allowed(me.role, what)) redirect("/admin?denied=1");
  await db();
  return me;
}
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const lines = (s: string) => s.split(/\n+/).map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
async function log(who: string, what: string, href: string) {
  await Activity.create({ who, what, href });
}
function refresh(...paths: string[]) {
  for (const p of ["/admin", ...paths]) revalidatePath(p);
}

/* ---------------- Opportunities ---------------- */

export async function reviewOpportunity(fd: FormData) {
  const me = await gate("opportunities");
  const id = str(fd, "id");
  const decision = str(fd, "decision");
  const o = await Opportunity.findById(id);
  if (!o) return;
  o.checks = { provider: fd.get("c_provider") === "on", link: fd.get("c_link") === "on", free: fd.get("c_free") === "on", deadline: fd.get("c_deadline") === "on" };
  o.reviewNote = str(fd, "note");
  if (decision === "approve") {
    if (!allowed(me.role, "publish")) redirect(`/admin/opportunities?id=${id}&err=publish`);
    if (!o.checks.provider || !o.checks.link || !o.checks.free || !o.checks.deadline) {
      await o.save();
      redirect(`/admin/opportunities?id=${id}&err=checks`);
    }
    o.status = "published";
    o.publishedAt = new Date();
  } else if (decision === "decline") {
    o.status = "declined";
  } else if (decision === "close") {
    o.status = "closed";
  }
  o.updatedBy = me.name;
  await o.save();
  await log(me.name, `${decision === "approve" ? "published" : decision === "decline" ? "declined" : decision === "close" ? "closed" : "requested changes to"} “${o.title}”`, `/admin/opportunities?id=${id}`);
  refresh("/admin/opportunities", "/opportunities", "/");
  redirect(`/admin/opportunities?id=${id}&done=${decision}`);
}

export async function createOpportunity(fd: FormData) {
  const me = await gate("opportunities");
  const title = str(fd, "title");
  if (!title || !str(fd, "provider") || !str(fd, "closesAt")) redirect("/admin/opportunities?new=1&err=missing");
  const category = (OPP_CATEGORIES as readonly string[]).includes(str(fd, "category")) ? str(fd, "category") : "Scholarships";
  let slug = slugify(title);
  if (await Opportunity.exists({ slug })) slug += "-" + crypto.randomBytes(2).toString("hex");
  const o = await Opportunity.create({
    slug, title, provider: str(fd, "provider"), category, location: str(fd, "location") || "Nigeria", level: str(fd, "level"), value: str(fd, "value"),
    summary: str(fd, "description").slice(0, 140), description: str(fd, "description"), eligibility: lines(str(fd, "eligibility")),
    howToApply: lines(str(fd, "howToApply")), closesAt: new Date(str(fd, "closesAt") + "T22:59:00Z"), applyUrl: str(fd, "applyUrl"),
    submitterName: me.name, submitterEmail: me.email, status: "pending", updatedBy: me.name,
  });
  await log(me.name, `added “${title}” for review`, `/admin/opportunities?id=${o._id}`);
  refresh("/admin/opportunities");
  redirect(`/admin/opportunities?id=${o._id}`);
}

/* ---------------- Content: news and publications ---------------- */

const NEXT_STATUS: Record<string, string> = { submit: "review", approve: "approved", publish: "published", back: "draft", unpublish: "draft" };

export async function saveContent(fd: FormData) {
  const me = await gate("edit");
  const kind = str(fd, "kind") === "publication" ? "publication" : "post";
  const id = str(fd, "id");
  const intent = str(fd, "intent") || "save";
  const title = str(fd, "title");
  if (!title) redirect(`/admin/content/${kind}/${id || "new"}?err=title`);

  const M = kind === "post" ? Post : Publication;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = id && id !== "new" ? await (M as any).findById(id) : new (M as any)({ slug: slugify(title), status: "draft" });
  if (!doc) redirect("/admin/content");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!doc.slug || (doc.isNew && (await (M as any).exists({ slug: doc.slug })))) doc.slug = slugify(title) + "-" + crypto.randomBytes(2).toString("hex");

  doc.title = title;
  doc.summary = str(fd, "summary");
  doc.body = str(fd, "body");
  doc.programme = str(fd, "programme");
  if (kind === "post") {
    doc.category = (NEWS_CATEGORIES as readonly string[]).includes(str(fd, "category")) ? str(fd, "category") : "TFN news";
    doc.author = str(fd, "author") || me.name;
    doc.image = str(fd, "image");
    doc.imageAlt = str(fd, "imageAlt");
    doc.caption = str(fd, "caption");
    doc.seoTitle = str(fd, "seoTitle");
    doc.seoDescription = str(fd, "seoDescription");
  } else {
    doc.type = (PUB_TYPES as readonly string[]).includes(str(fd, "type")) ? str(fd, "type") : "Policy brief";
    doc.topic = str(fd, "topic");
    doc.authors = str(fd, "authors").split(",").map((n) => n.trim()).filter(Boolean).map((name, i) => ({ name, role: i === 0 ? "Lead author" : "Co-author", affiliation: doc.authors?.find((a: { name: string }) => a.name === name)?.affiliation || "" }));
    doc.pdfUrl = str(fd, "pdfUrl");
    doc.readMinutes = Number(str(fd, "readMinutes")) || undefined;
    doc.pages = Number(str(fd, "pages")) || undefined;
    doc.tags = str(fd, "tags").split(",").map((t) => t.trim()).filter(Boolean);
  }
  const date = str(fd, "publishedAt");
  if (date) doc.publishedAt = new Date(date + "T09:00:00Z");

  if (intent !== "save") {
    if ((intent === "approve" || intent === "publish" || intent === "unpublish") && !allowed(me.role, "publish")) {
      redirect(`/admin/content/${kind}/${doc._id}?err=publish`);
    }
    doc.status = NEXT_STATUS[intent] || doc.status;
    if (intent === "publish" && !doc.publishedAt) doc.publishedAt = new Date();
  }
  doc.updatedBy = me.name;
  await doc.save();
  const verb = intent === "save" ? "saved" : intent === "submit" ? "sent for review" : intent === "approve" ? "approved" : intent === "publish" ? "published" : intent === "back" ? "sent back" : "unpublished";
  await log(me.name, `${verb} “${title}”`, `/admin/content/${kind}/${doc._id}`);
  refresh("/admin/content", "/news", "/research", "/", kind === "post" ? `/news/${doc.slug}` : `/research/${doc.slug}`);
  redirect(`/admin/content/${kind}/${doc._id}?done=${intent}`);
}

export async function deleteContent(fd: FormData) {
  const me = await gate("publish");
  const kind = str(fd, "kind");
  const M = kind === "publication" ? Publication : Post;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await (M as any).findByIdAndDelete(str(fd, "id"));
  if (d) await log(me.name, `deleted “${d.title}”`, "/admin/content");
  refresh("/admin/content", "/news", "/research");
  redirect("/admin/content?done=deleted");
}

/* ---------------- Registrations ---------------- */

export async function deleteRegistration(fd: FormData) {
  const me = await gate("registrations");
  const r = await JoinRegistration.findByIdAndDelete(str(fd, "id"));
  if (r) await log(me.name, `deleted a registration from ${r.state || "an unknown state"} on request`, "/admin/registrations");
  refresh("/admin/registrations");
  redirect("/admin/registrations?done=deleted");
}

/* ---------------- Channels ---------------- */

export async function saveChannelPost(fd: FormData) {
  const me = await gate("channels");
  const id = str(fd, "id");
  const intent = str(fd, "intent");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p: any = id ? await ChannelPost.findById(id) : new ChannelPost({ owner: me.name, status: "draft" });
  if (!p) redirect("/admin/channels");
  if (fd.has("title")) {
    p.title = str(fd, "title") || p.title || "Untitled post";
    p.body = str(fd, "body");
    p.link = str(fd, "link");
    p.channels = fd.getAll("channels").map(String);
    const when = str(fd, "scheduledFor");
    if (when) p.scheduledFor = new Date(when + ":00+01:00"); // entered in Lagos time
  }
  if (intent === "submit") p.status = "review";
  if (intent === "approve") {
    if (me.role !== "Super admin" && me.role !== "Reviewer") redirect(`/admin/channels?id=${p._id}&err=approve`);
    if (p.owner === me.name && me.role !== "Super admin") redirect(`/admin/channels?id=${p._id}&err=own`);
    p.status = "approved";
    p.approvedBy = me.name;
  }
  if (intent === "back") p.status = "draft";
  if (intent === "posted") p.status = "published";
  await p.save();
  if (intent) await log(me.name, `${intent === "approve" ? "approved" : intent === "submit" ? "sent for approval" : intent === "back" ? "sent back" : intent === "posted" ? "marked as posted" : "updated"} “${p.title}”`, `/admin/channels?id=${p._id}`);
  refresh("/admin/channels");
  redirect(`/admin/channels?id=${p._id}&done=${intent || "saved"}`);
}

export async function saveIncident(fd: FormData) {
  const me = await gate("inbox");
  const id = str(fd, "id");
  if (id) {
    await Incident.findByIdAndUpdate(id, { status: str(fd, "status") === "resolved" ? "resolved" : "open" });
    await log(me.name, `marked an incident ${str(fd, "status")}`, "/admin/channels#incidents");
  } else {
    const title = str(fd, "title");
    if (!title) redirect("/admin/channels#incidents");
    await Incident.create({ title, detail: str(fd, "detail"), severity: ["low", "medium", "high"].includes(str(fd, "severity")) ? str(fd, "severity") : "medium", reportedBy: me.name });
    await log(me.name, `logged an incident: ${title}`, "/admin/channels#incidents");
  }
  refresh("/admin/channels");
  const back = str(fd, "back");
  redirect(back && back.startsWith("/admin") ? back : "/admin/channels#incidents");
}

/* ---------------- Inbox ---------------- */

export async function updateEnquiry(fd: FormData) {
  const me = await gate("inbox");
  const id = str(fd, "id");
  const e = await Enquiry.findById(id);
  if (!e) redirect("/admin/inbox");
  const status = str(fd, "status");
  if ((ENQUIRY_STATUSES as readonly string[]).includes(status)) e.status = status as (typeof ENQUIRY_STATUSES)[number];
  if (fd.has("assignee")) e.assignee = str(fd, "assignee");
  const reply = str(fd, "reply");
  if (reply) {
    e.notes.push({ by: me.name, text: reply, at: new Date() });
    if (e.status === "new" || e.status === "open") e.status = "replied";
  }
  await e.save();
  await log(me.name, reply ? `replied to ${e.name}` : `updated “${e.subject}”`, `/admin/inbox?id=${id}`);
  refresh("/admin/inbox");
  redirect(`/admin/inbox?id=${id}&done=${reply ? "replied" : "saved"}`);
}

export async function enquiryToIncident(fd: FormData) {
  const me = await gate("inbox");
  const e = await Enquiry.findById(str(fd, "id"));
  if (!e) redirect("/admin/inbox");
  await Incident.create({ title: e.subject || "Reported channel", detail: `${e.message.slice(0, 280)} (reported by ${e.name})`, severity: "high", reportedBy: me.name });
  e.status = e.status === "new" ? "open" : e.status;
  await e.save();
  await log(me.name, `logged an incident from ${e.name}’s message`, "/admin/channels#incidents");
  refresh("/admin/inbox", "/admin/channels");
  redirect(`/admin/inbox?id=${e._id}&done=incident`);
}

/* ---------------- Events ---------------- */

export async function toggleCheckIn(fd: FormData) {
  const me = await gate("events");
  const r = await EventRegistration.findById(str(fd, "id"));
  if (r) {
    r.checkedIn = !r.checkedIn;
    await r.save();
    await log(me.name, `${r.checkedIn ? "checked in" : "undid check-in for"} ${r.name}`, "/admin/events");
  }
  refresh("/admin/events");
  const back = str(fd, "back");
  redirect(back.startsWith("/admin/") ? back : "/admin/events");
}

export async function saveEvent(fd: FormData) {
  const me = await gate("events");
  const id = str(fd, "id");
  const title = str(fd, "title");
  const start = str(fd, "startsAt");
  if (!title || !start) redirect(`/admin/events?${id ? `edit=${id}` : "new=1"}&err=missing`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e: any = id ? await Event.findById(id) : new Event({ slug: slugify(title) + "-" + crypto.randomBytes(2).toString("hex") });
  e.title = title;
  e.programme = str(fd, "programme");
  e.theme = str(fd, "theme");
  e.summary = str(fd, "summary");
  e.about = str(fd, "about");
  e.venue = str(fd, "venue") || "Online";
  e.city = str(fd, "city") || (e.venue === "Online" ? "Online" : "");
  e.online = fd.get("online") === "on";
  e.capacity = Number(str(fd, "capacity")) || 0;
  e.startsAt = new Date(start + ":00+01:00");
  const end = str(fd, "endsAt");
  e.endsAt = end ? new Date(end + ":00+01:00") : undefined;
  e.status = ["draft", "published", "closed"].includes(str(fd, "status")) ? str(fd, "status") : "draft";
  e.image = e.image || "/photos/auditorium-full.jpg";
  e.imageAlt = e.imageAlt || "A packed conference hall during a session";
  await e.save();
  await log(me.name, `${id ? "updated" : "created"} the event “${title}”`, `/admin/events?event=${e._id}`);
  refresh("/admin/events", "/news", "/", `/events/${e.slug}`);
  redirect(`/admin/events?event=${e._id}&done=saved`);
}

/* ---------------- Users ---------------- */

export type InviteState = { ok?: boolean; error?: string; email?: string; password?: string };

export async function inviteUser(_: InviteState, fd: FormData): Promise<InviteState> {
  const me = await gate("users");
  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const role = str(fd, "role") as Role;
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a name and a valid email address." };
  if (!(ROLES as readonly string[]).includes(role)) return { error: "Choose a role." };
  if (await AdminUser.exists({ email })) return { error: "Someone with that email already has an account." };
  const password = crypto.randomBytes(9).toString("base64url");
  await AdminUser.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true });
  await log(me.name, `invited ${name} as ${role}`, "/admin/users");
  refresh("/admin/users");
  return { ok: true, email, password };
}

export async function updateUser(fd: FormData) {
  const me = await gate("users");
  const u = await AdminUser.findById(str(fd, "id"));
  if (!u) redirect("/admin/users");
  const intent = str(fd, "intent");
  if (String(u._id) === me.id && intent !== "role") redirect("/admin/users?err=self");
  if (intent === "role") {
    const role = str(fd, "role");
    if (String(u._id) === me.id && role !== "Super admin") redirect("/admin/users?err=self");
    if ((ROLES as readonly string[]).includes(role)) u.role = role as Role;
  }
  if (intent === "deactivate") u.active = false;
  if (intent === "activate") u.active = true;
  await u.save();
  await log(me.name, intent === "role" ? `changed ${u.name}’s role to ${u.role}` : `${intent}d ${u.name}`, "/admin/users");
  refresh("/admin/users");
  redirect("/admin/users?done=" + intent);
}

/* Unused-import guards for statuses kept for type narrowing */
void CHANNEL_STATUSES;
void POST_STATUSES;

/* Buttons bind their choice here (React does not always send the pressed button's name). */
export async function saveContentAs(intent: string, fd: FormData) { fd.set("intent", intent); return saveContent(fd); }
export async function reviewOpportunityAs(decision: string, fd: FormData) { fd.set("decision", decision); return reviewOpportunity(fd); }
export async function saveChannelPostAs(intent: string, fd: FormData) { fd.set("intent", intent); return saveChannelPost(fd); }
export async function updateUserAs(intent: string, fd: FormData) { fd.set("intent", intent); return updateUser(fd); }

export type ResetState = { password?: string; error?: string };

/** Gives someone a new temporary password. They must choose their own when they next sign in. */
export async function resetPassword(_: ResetState, fd: FormData): Promise<ResetState> {
  const me = await gate("users");
  const u = await AdminUser.findById(str(fd, "id"));
  if (!u) return { error: "That account no longer exists." };
  if (String(u._id) === me.id) return { error: "Change your own password from the menu instead." };
  const password = crypto.randomBytes(9).toString("base64url");
  u.passwordHash = await bcrypt.hash(password, 12);
  u.mustChangePassword = true;
  await u.save();
  await log(me.name, `reset the password for ${u.name}`, "/admin/users");
  return { password };
}
