import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { deleteContent, saveContent, saveContentAs } from "@/lib/admin-actions";
import { allowed, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NEWS_CATEGORIES, Post, PUB_TYPES, Publication } from "@/lib/models";
import { PROGRAMMES } from "@/lib/site";
import { Back, Flash, Panel, Status, ago } from "../../../ui";

export const metadata = { title: { absolute: "Edit content | TFN Admin" } };

const STEPS = [["draft", "Draft"], ["review", "In review"], ["approved", "Approved"], ["published", "Published"]];
const DONE: Record<string, string> = { save: "Saved.", submit: "Sent for review.", approve: "Approved. It can now be published.", publish: "Published on the website.", back: "Sent back to draft.", unpublish: "Taken off the website and moved to draft." };
const ERR: Record<string, string> = { title: "Add a title before saving.", publish: "Your role can’t approve or publish. Send it for review instead." };

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default async function Editor({ params, searchParams }: { params: Promise<{ kind: string; id: string }>; searchParams: Promise<{ done?: string; err?: string }> }) {
  const me = await requireAdmin();
  const { kind, id } = await params;
  const sp = await searchParams;
  if (kind !== "post" && kind !== "publication") notFound();
  await db();
  const isNew = id === "new";
  if (!isNew && !/^[a-f0-9]{24}$/.test(id)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = isNew ? { status: "draft" } : kind === "post" ? await Post.findById(id).lean() : await Publication.findById(id).lean();
  if (!d) notFound();
  const canPublish = allowed(me.role, "publish");
  const canEdit = allowed(me.role, "edit");
  const step = STEPS.findIndex(([s]) => s === d.status);
  const isPost = kind === "post";
  const day = (x?: Date) => (x ? new Date(x).toISOString().slice(0, 10) : "");
  const publicHref = d.slug ? (isPost ? `/news/${d.slug}` : `/research/${d.slug}`) : "";

  return (
    <>
      <Back href={`/admin/content?tab=${isPost ? "news" : "publications"}`}>All content</Back>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-[26px] sm:text-[30px] flex-1 min-w-[240px]">{isNew ? (isPost ? "New story" : "New publication") : d.title}</h1>
        {d.status === "published" && publicHref && <Link href={publicHref} target="_blank" className="btn btn-sm btn-line"><Icon name="eye" size={17} /> View on site</Link>}
      </div>
      {!isNew && <p className="text-muted mb-5">{d.updatedBy ? `Last edited by ${d.updatedBy}, ${ago(d.updatedAt)}` : `Updated ${ago(d.updatedAt)}`}</p>}

      <ol className="flex flex-wrap gap-2 mb-6" aria-label="Approval progress">
        {STEPS.map(([s, l], i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={`inline-flex items-center gap-2 rounded-full px-3.5 min-h-9 text-[14px] font-semibold ${i < step ? "bg-ok-tint text-ok" : i === step ? "bg-navy text-cream" : "bg-white border border-adminline text-muted"}`}>
            {i < step ? <Icon name="check" size={15} /> : <span>{i + 1}</span>} {l}
          </li>
        ))}
      </ol>

      <Flash ok={sp.done ? DONE[sp.done] : null} err={sp.err ? ERR[sp.err] : null} />

      <form action={saveContent} className="grid xl:grid-cols-[1fr_340px] gap-5 items-start">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={isNew ? "" : id} />
        <fieldset disabled={!canEdit} className="grid gap-5 min-w-0">
          <Panel>
            <div className="grid gap-5">
              <Field id="title" label="Title"><input id="title" name="title" required defaultValue={d.title} className="field text-[18px] font-semibold" /></Field>
              <Field id="summary" label="Summary" hint="One or two sentences. Shown on cards and in search results.">
                <textarea id="summary" name="summary" defaultValue={d.summary} className="field !min-h-[90px]" maxLength={320} />
              </Field>
              <Field id="body" label="Body" hint="Use ## for headings, **bold**, - for lists and [text](link) for links.">
                <textarea id="body" name="body" defaultValue={d.body} className="field !min-h-[420px] font-mono text-[15px] leading-relaxed" />
              </Field>
            </div>
          </Panel>
          {isPost && (
            <Panel title="Photo and search">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field id="image" label="Photo" hint="A path from the photo library, such as /photos/lecture-hall.jpg"><input id="image" name="image" defaultValue={d.image} className="field" /></Field>
                <Field id="imageAlt" label="Describe the photo" hint="For people using screen readers."><input id="imageAlt" name="imageAlt" defaultValue={d.imageAlt} className="field" /></Field>
                <Field id="caption" label="Caption"><input id="caption" name="caption" defaultValue={d.caption} className="field" /></Field>
                <Field id="seoTitle" label="Search title"><input id="seoTitle" name="seoTitle" defaultValue={d.seoTitle} className="field" maxLength={70} /></Field>
                <div className="sm:col-span-2"><Field id="seoDescription" label="Search description"><input id="seoDescription" name="seoDescription" defaultValue={d.seoDescription} className="field" maxLength={160} /></Field></div>
              </div>
            </Panel>
          )}
        </fieldset>

        <div className="grid gap-5 xl:sticky xl:top-6">
          <Panel title="Status">
            <div className="flex items-center gap-2 mb-4"><Status s={d.status} /></div>
            {canEdit ? (
              <div className="grid gap-2">
                <button formAction={saveContentAs.bind(null, "save")} className="btn btn-sm btn-line w-full">{d.status === "published" ? "Save changes" : "Save draft"}</button>
                {d.status === "draft" && <button formAction={saveContentAs.bind(null, "submit")} className="btn btn-sm btn-navy w-full">Send for review</button>}
                {canPublish && d.status === "review" && <button formAction={saveContentAs.bind(null, "approve")} className="btn btn-sm btn-navy w-full">Approve</button>}
                {canPublish && (d.status === "review" || d.status === "approved") && <button formAction={saveContentAs.bind(null, "publish")} className="btn btn-sm btn-coral w-full">Publish now</button>}
                {canPublish && (d.status === "review" || d.status === "approved") && <button formAction={saveContentAs.bind(null, "back")} className="btn btn-sm btn-line w-full">Send back to draft</button>}
                {canPublish && d.status === "published" && <button formAction={saveContentAs.bind(null, "unpublish")} className="btn btn-sm btn-line w-full">Unpublish</button>}
                {!canPublish && d.status !== "draft" && <p className="hint">A reviewer will approve and publish this.</p>}
              </div>
            ) : (
              <p className="hint">Your role can view content but not change it.</p>
            )}
          </Panel>

          <Panel title="Details">
            <fieldset disabled={!canEdit} className="grid gap-4">
              {isPost ? (
                <>
                  <Field id="category" label="Section">
                    <select id="category" name="category" defaultValue={d.category} className="field">{NEWS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                  </Field>
                  <Field id="author" label="Byline"><input id="author" name="author" defaultValue={d.author || me.name} className="field" /></Field>
                </>
              ) : (
                <>
                  <Field id="type" label="Type">
                    <select id="type" name="type" defaultValue={d.type} className="field">{PUB_TYPES.map((c) => <option key={c}>{c}</option>)}</select>
                  </Field>
                  <Field id="topic" label="Topic"><input id="topic" name="topic" defaultValue={d.topic} className="field" /></Field>
                  <Field id="authors" label="Authors" hint="Separate names with commas. The first is the lead author."><input id="authors" name="authors" defaultValue={(d.authors || []).map((a: { name: string }) => a.name).join(", ")} className="field" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="pages" label="Pages"><input id="pages" name="pages" inputMode="numeric" defaultValue={d.pages} className="field" /></Field>
                    <Field id="readMinutes" label="Minutes to read"><input id="readMinutes" name="readMinutes" inputMode="numeric" defaultValue={d.readMinutes} className="field" /></Field>
                  </div>
                  <Field id="pdfUrl" label="PDF link"><input id="pdfUrl" name="pdfUrl" defaultValue={d.pdfUrl} className="field" /></Field>
                  <Field id="tags" label="Tags" hint="Separate with commas."><input id="tags" name="tags" defaultValue={(d.tags || []).join(", ")} className="field" /></Field>
                </>
              )}
              <Field id="programme" label="Programme">
                <select id="programme" name="programme" defaultValue={d.programme || ""} className="field">
                  <option value="">None</option>
                  {PROGRAMMES.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
                </select>
              </Field>
              <Field id="publishedAt" label="Publish date" hint="Leave empty to use the day it goes live."><input id="publishedAt" name="publishedAt" type="date" defaultValue={day(d.publishedAt)} className="field" /></Field>
            </fieldset>
          </Panel>
        </div>
      </form>

      {!isNew && canPublish && (
        <form action={deleteContent} className="mt-8">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <details className="group">
            <summary className="cursor-pointer text-[15px] font-medium text-[#A1271B] inline-flex items-center gap-2"><Icon name="trash" size={16} /> Delete this {isPost ? "story" : "publication"}</summary>
            <div className="mt-3 rounded-[14px] bg-white border border-adminline p-4 max-w-[480px]">
              <p className="text-[15px]">This removes it from the website and the admin for good.</p>
              <button className="mt-3 btn btn-sm bg-[#A1271B] text-white">Delete for good</button>
            </div>
          </details>
        </form>
      )}
    </>
  );
}
