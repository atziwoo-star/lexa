import type { Metadata } from "next";
import { AcceptInviteForm } from "@/components/accept-invite-form";

export const metadata: Metadata = {
  title: "Accept your invite",
  robots: { index: false, follow: false },
};

export default function InvitePage() {
  return <AcceptInviteForm />;
}
