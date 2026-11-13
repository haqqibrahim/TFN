import { Marked } from "marked";

const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Raw HTML in content is dropped: editors write Markdown only.
    html() {
      return "";
    },
    link({ href, text }) {
      const safe = /^(https?:|mailto:|\/|#)/i.test(href) ? href : "#";
      const ext = /^https?:/i.test(safe);
      return `<a href="${safe.replace(/"/g, "&quot;")}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    },
    image() {
      return "";
    },
  },
});

export function renderMarkdown(src: string) {
  return md.parse(src || "", { async: false }) as string;
}

/** Headings (## only) for an "On this page" list. */
export function headings(src: string) {
  return [...(src || "").matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
}
