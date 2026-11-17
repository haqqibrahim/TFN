import { redirect } from "next/navigation";

/** Only the Students section is switched on for now. */
export default function AdminHome() {
  redirect("/admin/students");
}
