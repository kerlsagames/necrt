import Link from "next/link"
import { cn } from "cn"

export function Wordmark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "cream" }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 place-items-center rounded-full font-display text-sm",
          tone === "cream" ? "bg-cream text-teal-deep" : "bg-teal-deep text-cream",
        )}
      >
        NE
      </span>
      <span className="font-display text-xl tracking-tight">NECRT</span>
    </Link>
  )
}
