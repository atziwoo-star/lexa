import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const languages = [
  {
    name: "English",
    tagline: "From everyday conversation to fluent, confident speaking.",
  },
  {
    name: "Spanish",
    tagline: "Español latinoamericano, taught by native speakers.",
  },
  {
    name: "Korean",
    tagline: "Build real speaking practice from your very first class.",
  },
];

const steps = [
  {
    title: "Buy hours",
    body: "Purchase class hours in your own currency, starting at $20/hour.",
  },
  {
    title: "Book your class",
    body: "Pick a language and a time that works for you — every teacher's availability shows in your own timezone.",
  },
  {
    title: "Join live",
    body: "Hop into a small-group class on Google Meet — one click from your dashboard, no software to install.",
  },
];

const reasons = [
  {
    title: "Small groups",
    body: "Max 5 students per class, so you actually get to speak — not just listen.",
  },
  {
    title: "Real teachers, live",
    body: "Every class is live with a real teacher, not a pre-recorded video.",
  },
  {
    title: "Flexible scheduling",
    body: "Multi-timezone calendar — book classes that fit your day, wherever you are.",
  },
  {
    title: "Fair cancellations",
    body: "Cancel up to 24 hours before class and keep your hour, no questions asked.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const dashboardPath =
    user?.rol === "PROFESOR" ? "/teacher" : user?.rol === "ADMIN" ? "/admin" : "/student";

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold">Lexa</span>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href={dashboardPath} className="text-neutral-600 hover:underline">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:underline">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded bg-indigo-600 px-3 py-1.5 text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Learn English, Spanish, or Korean — live.
          </h1>
          <p className="max-w-xl text-lg text-neutral-600">
            Small-group video classes with real teachers, up to 5 students
            per class. Book what fits your schedule, in your own timezone.
          </p>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="rounded bg-indigo-600 px-5 py-2.5 text-white"
            >
              Get started
            </Link>
            <Link href="/login" className="rounded border px-5 py-2.5">
              Log in
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded border px-5 py-6">
                <span className="text-sm text-indigo-600">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Choose your language
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="rounded border bg-neutral-50 px-5 py-6 dark:bg-neutral-900"
              >
                <h3 className="text-lg font-medium">{lang.name}</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {lang.tagline}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            Why Lexa
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded border px-5 py-6">
                <h3 className="text-lg font-medium">{reason.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {reason.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold">Simple pricing</h2>
          <p className="max-w-xl text-neutral-600">
            Classes start at <span className="font-medium">$20/hour</span>,
            billed in your own currency. Purchased hours are valid for one
            month, and we&apos;ll remind you before they expire.
          </p>
          <Link
            href="/register"
            className="rounded bg-indigo-600 px-5 py-2.5 text-white"
          >
            Get started
          </Link>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Lexa. Live classes in English, Spanish,
        and Korean.
      </footer>
    </div>
  );
}
