import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
      />
      <div className="animate-fade-in-up relative flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-background/80 p-8 shadow-sm backdrop-blur-sm">
        <Link href="/" className="text-lg font-semibold">
          Lexa
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
