import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    "mailto:clases@lexalab.net",
    process.env.WEB_PUSH_PUBLIC_KEY ?? "",
    process.env.WEB_PUSH_PRIVATE_KEY ?? "",
  );
  configured = true;
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Sends to every subscription (device/browser) a user has registered.
// A subscription that's gone stale (expired or the user revoked
// permission) comes back as 404/410 from the push service — prune those
// instead of leaving dead rows that fail on every future send.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  ensureConfigured();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }),
  );
}
