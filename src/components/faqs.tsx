import { Icon } from "./icons";

export function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-2.5 max-w-3xl">
      {items.map((f) => (
        <details key={f.q} className="group card px-5 open:pb-5">
          <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-[17px] [&::-webkit-details-marker]:hidden">
            {f.q}
            <Icon name="chevronDown" size={20} className="flex-none transition-transform group-open:rotate-180" />
          </summary>
          <p className="text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
