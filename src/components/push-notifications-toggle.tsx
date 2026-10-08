"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push-client";

type Status = "unsupported" | "loading" | "denied" | "subscribed" | "unsubscribed";

export function PushNotificationsToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "subscribed" : "unsubscribed");
    }

    checkStatus();
  }, []);

  async function handleEnable() {
    setError(null);
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "unsubscribed");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
        ),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("Could not save subscription");

      setStatus("subscribed");
    } catch {
      setError("Couldn't enable notifications — try again.");
      setStatus("unsubscribed");
    }
  }

  async function handleDisable() {
    setError(null);
    setStatus("loading");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setStatus("unsubscribed");
    } catch {
      setError("Couldn't disable notifications — try again.");
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-neutral-600">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-sm text-neutral-600">
        Notifications are blocked for this site in your browser settings — enable them there to turn this on.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-neutral-600">
        Get a reminder before your class starts, and a heads-up before your hours expire.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === "subscribed" ? (
        <button
          onClick={handleDisable}
          className="self-start rounded border px-3 py-2 text-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95"
        >
          Disable notifications
        </button>
      ) : (
        <button
          onClick={handleEnable}
          disabled={status === "loading"}
          className="self-start rounded bg-indigo-600 px-3 py-2 text-sm text-white transition-all hover:scale-[1.02] hover:bg-indigo-500 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {status === "loading" ? "Loading..." : "Enable notifications"}
        </button>
      )}
    </div>
  );
}
