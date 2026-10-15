import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Sends a signed-in user to the dashboard for their role. Used after accepting
// an invite, which can be for either a teacher or an admin.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.rol === "ADMIN") redirect("/admin");
  if (user.rol === "PROFESOR") redirect("/teacher");
  redirect("/student");
}
