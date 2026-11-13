import "server-only";
import { db, plain } from "./db";
import { Event, EventRegistration, Opportunity, Post, Publication } from "./models";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type EventItem = {
  _id: string; slug: string; title: string; programme?: string; theme?: string; summary?: string; about?: string;
  objectives?: string[]; startsAt: string; endsAt?: string; venue?: string; city?: string; online?: boolean; free?: boolean;
  capacity?: number; image?: string; imageAlt?: string; agenda?: { time: string; item: string }[];
  speakers?: { name: string; role: string }[]; accessibility?: string; placesLeft: number | null; status: string;
};

async function withPlaces(events: any[]): Promise<EventItem[]> {
  if (!events.length) return [];
  const counts = await EventRegistration.aggregate([
    { $match: { event: { $in: events.map((e) => e._id) } } },
    { $group: { _id: "$event", n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n as number]));
  return plain(events).map((e: any) => ({
    ...e,
    placesLeft: e.capacity ? Math.max(0, e.capacity - (map.get(String(e._id)) || 0)) : null,
  }));
}

export async function upcomingEvents(limit = 6) {
  await db();
  const evs = await Event.find({ status: "published", startsAt: { $gte: new Date(Date.now() - 86400000) } })
    .sort({ startsAt: 1 }).limit(limit).lean();
  return withPlaces(evs);
}

export async function eventBySlug(slug: string) {
  await db();
  const e = await Event.findOne({ slug, status: { $ne: "draft" } }).lean();
  if (!e) return null;
  return (await withPlaces([e]))[0];
}

export type OppItem = {
  _id: string; slug: string; title: string; provider: string; category: string; location: string; level?: string;
  value?: string; summary?: string; description?: string; offers?: string[]; eligibility?: string[]; howToApply?: string[];
  opensAt?: string; closesAt?: string; applyUrl?: string; status: string; publishedAt?: string;
};

export async function openOpportunities(filter: { category?: string; location?: string; closing?: string; sort?: string; q?: string } = {}, limit = 60) {
  await db();
  const q: any = { status: "published", closesAt: { $gte: new Date() } };
  if (filter.category) q.category = filter.category;
  if (filter.location) {
    if (filter.location === "Nigeria") q.location = { $nin: ["Abroad", "Online"] };
    else q.location = filter.location;
  }
  if (filter.closing === "month") q.closesAt.$lte = new Date(Date.now() + 31 * 86400000);
  if (filter.closing === "quarter") q.closesAt.$lte = new Date(Date.now() + 92 * 86400000);
  if (filter.q) q.$or = [{ title: new RegExp(escapeRe(filter.q), "i") }, { provider: new RegExp(escapeRe(filter.q), "i") }];
  const sort: any = filter.sort === "newest" ? { publishedAt: -1 } : { closesAt: 1 };
  return plain(await Opportunity.find(q).sort(sort).limit(limit).lean()) as unknown as OppItem[];
}

export async function opportunityBySlug(slug: string) {
  await db();
  return plain(await Opportunity.findOne({ slug, status: { $in: ["published", "closed"] } }).lean()) as unknown as OppItem | null;
}

export type PostItem = {
  _id: string; slug: string; title: string; category: string; summary?: string; body?: string; image?: string; imageAlt?: string;
  caption?: string; author?: string; programme?: string; publishedAt?: string; seoTitle?: string; seoDescription?: string;
};

export async function latestPosts(opts: { category?: string; limit?: number; exclude?: string } = {}) {
  await db();
  const q: any = { status: "published" };
  if (opts.category) q.category = opts.category;
  if (opts.exclude) q.slug = { $ne: opts.exclude };
  return plain(await Post.find(q).sort({ publishedAt: -1 }).limit(opts.limit ?? 12).lean()) as unknown as PostItem[];
}

export async function postBySlug(slug: string) {
  await db();
  return plain(await Post.findOne({ slug, status: "published" }).lean()) as unknown as PostItem | null;
}

export type PubItem = {
  _id: string; slug: string; title: string; type: string; topic?: string; summary?: string; body?: string;
  authors: { name: string; role?: string; affiliation?: string }[]; programme?: string; pages?: number; readMinutes?: number;
  pdfUrl?: string; pdfSize?: string; findings?: { figure: string; line: string }[]; tags?: string[]; image?: string;
  featured?: boolean; publishedAt?: string;
};

export async function publications(filter: { type?: string; topic?: string; year?: string; q?: string; sort?: string } = {}, limit = 60) {
  await db();
  const q: any = { status: "published" };
  if (filter.type) q.type = filter.type;
  if (filter.topic) q.topic = filter.topic;
  if (filter.year) {
    const y = Number(filter.year);
    q.publishedAt = { $gte: new Date(Date.UTC(y, 0, 1)), $lt: new Date(Date.UTC(y + 1, 0, 1)) };
  }
  if (filter.q) {
    const re = new RegExp(escapeRe(filter.q), "i");
    q.$or = [{ title: re }, { summary: re }, { topic: re }, { "authors.name": re }];
  }
  const sort: any = filter.sort === "oldest" ? { publishedAt: 1 } : { publishedAt: -1 };
  return plain(await Publication.find(q).sort(sort).limit(limit).lean()) as unknown as PubItem[];
}

export async function publicationTypeCounts() {
  await db();
  const rows = await Publication.aggregate([{ $match: { status: "published" } }, { $group: { _id: "$type", n: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n])) as Record<string, number>;
}

export async function publicationBySlug(slug: string) {
  await db();
  return plain(await Publication.findOne({ slug, status: "published" }).lean()) as unknown as PubItem | null;
}

export async function featuredPublication() {
  await db();
  return plain(await Publication.findOne({ status: "published", featured: true }).sort({ publishedAt: -1 }).lean()) as unknown as PubItem | null;
}

export function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
