import Link from "next/link"
import { Wordmark } from "@/components/brand"

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <a href="#schools" className="skip-link">
        Skip to Schools and CRTs
      </a>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Wordmark />
        <p className="text-sm text-muted-foreground">North East Victoria · Casual relief</p>
      </header>
      <main className="relative grid flex-1 md:grid-cols-2">
        <section id="schools" aria-labelledby="schools-heading" className="relative overflow-hidden bg-teal-deep text-cream">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent, transparent 14px, rgba(255,255,255,0.08) 14px, rgba(255,255,255,0.08) 15px)",
            }}
          />
          <div className="relative flex h-full min-h-[70vh] flex-col justify-between p-6 sm:p-10 md:min-h-0 md:pr-24">
            <p className="text-sm tracking-[0.22em] text-wattle uppercase">For schools</p>
            <div>
              <h1 id="schools-heading" className="font-display text-6xl leading-none sm:text-8xl">
                Schools
              </h1>
              <p className="mt-4 max-w-sm text-lg text-cream/85">
                Put a day out. The CRTs who have chosen your school can take it, and you confirm.
              </p>
              <Link
                href="/school"
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-cream px-6 text-base font-semibold text-teal-deep outline-none focus-visible:ring-3 focus-visible:ring-wattle"
              >
                Open the school desk
              </Link>
            </div>
            <p className="mt-10 text-sm text-cream/70">Appin Park PS · Cathedral College · Milawa PS</p>
          </div>
        </section>
        <section id="crts" aria-labelledby="crts-heading" className="relative overflow-hidden bg-[#f0d7c4] text-ink">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(196,84,44,0.18), transparent 42%), radial-gradient(circle at 80% 70%, rgba(36,32,24,0.08), transparent 40%)",
            }}
          />
          <div className="relative flex h-full min-h-[70vh] flex-col justify-between p-6 sm:p-10 md:min-h-0 md:pl-24">
            <p className="text-sm tracking-[0.22em] text-clay-deep uppercase">For CRTs</p>
            <div>
              <h2 id="crts-heading" className="font-display text-6xl leading-none sm:text-8xl">
                CRTs
              </h2>
              <p className="mt-4 max-w-sm text-lg">
                See days at the schools you’ve chosen. Take one. They’ll confirm before it’s yours.
              </p>
              <Link
                href="/crt"
                className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-base font-semibold text-cream outline-none focus-visible:ring-3 focus-visible:ring-clay"
              >
                Open the CRT desk
              </Link>
            </div>
            <p className="mt-10 text-sm text-ink/70">VIT, resume and photo live on your profile.</p>
          </div>
        </section>
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-paper bg-wattle text-ink shadow-xl md:grid"
        >
          <span className="text-center leading-none">
            <span className="block font-display text-3xl">NE</span>
            <span className="text-[10px] tracking-[0.18em]">CRT</span>
          </span>
        </div>
      </main>
      <footer className="border-t border-border px-5 py-4 text-sm text-muted-foreground sm:px-8">
        Demo for North East schools. Login comes later. People, VIT numbers and bookings are samples so a school can
        click through both sides.
      </footer>
    </div>
  )
}
