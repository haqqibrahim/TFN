import Link from "next/link";
import { Icon } from "@/components/icons";
import { updateUser, updateUserAs } from "@/lib/admin-actions";
import { CAN, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminUser, ROLES } from "@/lib/models";
import { ConfirmButton } from "../confirm";
import { Flash, PageHead, Panel, Table, Who, ago } from "../ui";
import { Invite } from "./invite";
import { ResetPassword } from "./reset";

export const metadata = { title: { absolute: "Users and roles | TFN Admin" } };

const DONE: Record<string, string> = { role: "Role changed.", deactivate: "Account switched off. They can no longer sign in.", activate: "Account switched back on."};
const AREAS: { k: keyof typeof CAN; label: string }[] = [
  { k: "edit", label: "Write and edit content" },
  { k: "publish", label: "Approve and publish" },
  { k: "opportunities", label: "Review opportunities" },
  { k: "channels", label: "Plan channel posts" },
  { k: "events", label: "Run events and check-in" },
  { k: "inbox", label: "Answer the inbox" },
  { k: "registrations", label: "See and export registrations" },
  { k: "users", label: "Manage users" },
];

export default async function Users({ searchParams }: { searchParams: Promise<{ done?: string; err?: string }> }) {
  const me = await requireAdmin(["Super admin"]);
  const sp = await searchParams;
  await db();
  const users = await AdminUser.find().select("name email role active mustChangePassword lastSignIn").sort({ active: -1, name: 1 }).lean();

  return (
    <>
      <PageHead title="Users and roles" sub="Who can sign in to TFN Admin and what they can do." />
      <Flash ok={sp.done ? DONE[sp.done] : null} err={sp.err === "self" ? "You can’t switch off or demote your own account. Ask another super administrator." : null} />

      <Panel title="Add someone" className="mb-5"><Invite roles={ROLES} /></Panel>

      <Table head={["Name", "Role", "Password", "Last signed in", ""]}>
        {users.map((u) => {
          const id = String(u._id);
          const self = id === me.id;
          return (
            <tr key={id} className={u.active ? "" : "opacity-60"}>
              <td><Who name={u.name} /><span className="block text-[13px] text-muted pl-9">{u.email}</span></td>
              <td>
                <form action={updateUserAs.bind(null, "role")} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={id} />
                  <label htmlFor={`r-${id}`} className="sr-only">Role for {u.name}</label>
                  <select id={`r-${id}`} name="role" defaultValue={u.role || "Viewer"} disabled={self} className="field !min-h-10 !py-1.5 !text-[15px] min-w-[160px]">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  {!self && <button className="btn btn-sm btn-line !min-h-10">Change</button>}
                </form>
              </td>
              <td className="whitespace-nowrap">{u.mustChangePassword ? <span className="text-[#8A5A00] font-medium">Temporary</span> : <span className="inline-flex items-center gap-1.5 text-ok font-medium"><Icon name="check" size={16} /> Set</span>}</td>
              <td className="text-muted whitespace-nowrap">{u.lastSignIn ? ago(u.lastSignIn) : "Never"}</td>
              <td>
                {!self && (
                  <div className="flex gap-2 justify-end items-center">
                  <ResetPassword id={id} name={u.name} />
                    <form action={updateUser} className="flex gap-2 justify-end">
                    <input type="hidden" name="id" value={id} />
                    {u.active
                      ? <ConfirmButton message={`Switch off ${u.name}’s account? They won’t be able to sign in.`} formAction={updateUserAs.bind(null, "deactivate")} className="btn btn-sm btn-line whitespace-nowrap">Switch off</ConfirmButton>
                      : <button formAction={updateUserAs.bind(null, "activate")} className="btn btn-sm btn-navy whitespace-nowrap">Switch on</button>}
                  </form>
                  </div>
                )}
                {self && <Link href="/admin/password" className="btn btn-sm btn-line whitespace-nowrap">Change your password</Link>}
              </td>
            </tr>
          );
        })}
      </Table>

      <Panel title="What each role can do" className="mt-5">
        <div className="relative overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
          <table className="w-full min-w-[720px] text-[15px]">
            <thead>
              <tr className="text-left text-[13px] text-muted border-b border-adminline">
                <th scope="col" className="font-semibold py-2.5 pr-4"><span className="sr-only">Task</span></th>
                {ROLES.map((r) => <th key={r} scope="col" className="font-semibold py-2.5 px-2 text-center whitespace-nowrap">{r}</th>)}
              </tr>
            </thead>
            <tbody className="[&>tr]:border-b [&>tr]:border-adminline [&>tr:last-child]:border-0">
              {AREAS.map((a) => (
                <tr key={a.k}>
                  <th scope="row" className="text-left font-medium py-2.5 pr-4">{a.label}</th>
                  {ROLES.map((r) => {
                    const yes = r === "Super admin" || CAN[a.k].includes(r);
                    return (
                      <td key={r} className="text-center py-2.5 px-2">
                        {yes ? <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-ok-tint text-ok"><Icon name="check" size={15} /><span className="sr-only">Yes</span></span> : <span className="text-muted/50" aria-label="No">–</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint mt-3">Viewers can look around but can’t change anything. Registrations hold personal details, so only the roles ticked above can see them.</p>
      </Panel>
    </>
  );
}
