import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { Reveal } from "@/components/reveal";
import { OrbitaMark } from "@/components/orbita-mark";

const languages = [
  {
    code: "EN",
    name: "English",
    tagline: "From everyday conversation to fluent, confident speaking.",
  },
  {
    code: "ES",
    name: "Spanish",
    tagline: "Español latinoamericano, taught by native speakers.",
  },
  {
    code: "KO",
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
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3M9 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10.5 6.75a2.5 2.5 0 0 0-2.24-2.49M16.5 12.5a2.5 2.5 0 1 0 0-5"
      />
    ),
  },
  {
    title: "Real teachers, live",
    body: "Every class is live with a real teacher, not a pre-recorded video.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5 20.03 8a1 1 0 0 1 1.47.88v6.24a1 1 0 0 1-1.47.88l-4.28-2.5M4.5 6.75h9a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Z"
      />
    ),
  },
  {
    title: "Flexible scheduling",
    body: "Multi-timezone calendar — book classes that fit your day, wherever you are.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5v5l3 1.5m6-1.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  {
    title: "Fair cancellations",
    body: "Cancel up to 24 hours before class and keep your hour, no questions asked.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12.75 2.25 2.25 4.5-4.5M12 3.75c2.53 1.53 4.94 1.79 6.75 1.5.4 4.83-.9 10.83-6.75 15-5.85-4.17-7.15-10.17-6.75-15 1.81.29 4.22.03 6.75-1.5Z"
      />
    ),
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const dashboardPath =
    user?.rol === "PROFESOR" ? "/teacher" : user?.rol === "ADMIN" ? "/admin" : "/student";

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-transparent bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <span className="flex flex-col items-center gap-1">
            <OrbitaMark size={26} />
            <span className="text-lg font-semibold leading-none">Lexa</span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="text-neutral-600 transition-colors hover:text-foreground hover:underline"
                >
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-neutral-600 transition-colors hover:text-foreground hover:underline"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded bg-indigo-600 px-3 py-1.5 text-white transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="animate-blob pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-[80%] rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
          />
          <div
            aria-hidden
            className="animate-blob pointer-events-none absolute top-0 left-1/2 h-72 w-72 translate-x-[20%] rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/10"
            style={{ animationDelay: "-7s" }}
          />
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
            <h1 className="animate-fade-in-up text-4xl font-semibold sm:text-5xl">
              Learn English, Spanish, or Korean — live.
            </h1>
            <p
              className="animate-fade-in-up max-w-xl text-lg text-neutral-600"
              style={{ animationDelay: "120ms" }}
            >
              Small-group video classes with real teachers, up to 5 students
              per class. Book what fits your schedule, in your own timezone.
            </p>
            <div
              className="animate-fade-in-up flex gap-3"
              style={{ animationDelay: "240ms" }}
            >
              {user ? (
                <Link
                  href={dashboardPath}
                  className="rounded bg-indigo-600 px-5 py-2.5 text-white transition-all hover:scale-105 hover:bg-indigo-500 hover:shadow-lg active:scale-95"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded bg-indigo-600 px-5 py-2.5 text-white transition-all hover:scale-105 hover:bg-indigo-500 hover:shadow-lg active:scale-95"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="rounded border px-5 py-2.5 transition-all hover:scale-105 hover:bg-neutral-50 active:scale-95 dark:hover:bg-neutral-900"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="mb-8 text-center text-2xl font-semibold">
              How it works
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <div className="group h-full rounded border px-5 py-6 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white transition-transform group-hover:scale-110">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="mb-8 text-center text-2xl font-semibold">
              Choose your language
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {languages.map((lang, i) => (
              <Reveal key={lang.name} delay={i * 100}>
                <div className="group h-full rounded border bg-neutral-50 px-5 py-6 transition-all hover:-translate-y-1 hover:shadow-md dark:bg-neutral-900">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white transition-transform group-hover:scale-110">
                    {lang.code}
                  </span>
                  <h3 className="mt-3 text-lg font-medium">{lang.name}</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    {lang.tagline}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <Reveal>
            <h2 className="mb-8 text-center text-2xl font-semibold">
              Why Lexa
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {reasons.map((reason, i) => (
              <Reveal key={reason.title} delay={i * 100}>
                <div className="group flex h-full gap-4 rounded border px-5 py-6 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="h-5 w-5"
                    >
                      {reason.icon}
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{reason.title}</h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      {reason.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
          <Reveal className="flex w-full flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Simple pricing</h2>
            <p className="max-w-xl text-neutral-600">
              Classes start at <span className="font-medium">$20/hour</span>,
              billed in your own currency. Purchased hours are valid for one
              month, and we&apos;ll remind you before they expire.
            </p>
            <Link
              href={user ? dashboardPath : "/register"}
              className="rounded bg-indigo-600 px-5 py-2.5 text-white transition-all hover:scale-105 hover:bg-indigo-500 hover:shadow-lg active:scale-95"
            >
              {user ? "Go to dashboard" : "Get started"}
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Lexa. Live classes in English, Spanish,
        and Korean.
      </footer>
    </div>
  );
}
