import { cn } from "cn"
import type { Look } from "@/lib/types"

function Hair({ look }: { look: Look }) {
  const fill = look.hair
  switch (look.hairStyle) {
    case "bob":
      return (
        <path
          fill={fill}
          d="M22 40c1-16 8-24 18-24s17 8 18 24c-2 8-4 16-6 22-3-8-8-12-12-12s-9 4-12 12c-2-6-4-14-6-22z"
        />
      )
    case "bun":
      return (
        <g fill={fill}>
          <circle cx="40" cy="14" r="7" />
          <path d="M24 36c1-14 7-20 16-20s15 6 16 20c-1 4-2 8-3 10-4-7-8-9-13-9s-9 2-13 9c-1-2-2-6-3-10z" />
        </g>
      )
    case "curls":
      return (
        <g fill={fill}>
          <circle cx="28" cy="28" r="8" />
          <circle cx="40" cy="18" r="9" />
          <circle cx="52" cy="28" r="8" />
          <circle cx="24" cy="40" r="6" />
          <circle cx="56" cy="40" r="6" />
          <path d="M30 24h20v10H30z" />
        </g>
      )
    case "long":
      return (
        <path
          fill={fill}
          d="M23 38c0-16 8-24 17-24s17 8 17 24v28c-4-10-9-14-17-14s-13 4-17 14V38z"
        />
      )
    case "fade":
      return <path fill={fill} d="M26 34c1-10 6-16 14-16s13 6 14 16c-2 2-8 4-14 4s-12-2-14-4z" />
    case "wavy":
      return (
        <path
          fill={fill}
          d="M24 36c1-16 8-22 16-22s15 6 16 22c2 6 1 14-1 22-2-2-4-8-6-8s-3 6-6 8-4-8-7-8-4 6-6 8c-2-8-4-16-6-22z"
        />
      )
    case "short":
      return <path fill={fill} d="M25 36c1-12 7-18 15-18s14 6 15 18c-3 3-8 5-15 5s-12-2-15-5z" />
    case "crop":
    default:
      return <path fill={fill} d="M24 34c2-14 8-20 16-20s14 6 16 20c-4 3-9 5-16 5s-12-2-16-5z" />
  }
}

export function Portrait({
  look,
  photo,
  className,
  label,
}: {
  look: Look
  photo?: string
  className?: string
  label?: string
}) {
  const named = Boolean(label)
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 overflow-hidden rounded-full bg-[#f3ecdf] ring-2 ring-white",
        className,
      )}
      role={named ? "img" : undefined}
      aria-label={label}
      aria-hidden={named ? undefined : true}
    >
      {photo ? (
        // User-supplied demo portrait. The name sits beside it when this is decorative.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <svg viewBox="0 0 80 80" className="size-full">
          <rect width="80" height="80" fill="#f4efe6" />
          <path d="M0 58c14-10 26-12 40-12s26 2 40 12v22H0V58z" fill={look.shirt} />
          <rect x="33" y="46" width="14" height="14" rx="6" fill={look.skin} />
          <circle cx="23" cy="40" r="4.2" fill={look.skin} />
          <circle cx="57" cy="40" r="4.2" fill={look.skin} />
          <ellipse cx="40" cy="38" rx="16" ry="17" fill={look.skin} />
          <Hair look={look} />
          <ellipse cx="34" cy="38" rx="1.5" ry="1.8" fill="#241c16" />
          <ellipse cx="46" cy="38" rx="1.5" ry="1.8" fill="#241c16" />
          <path
            d="M34.5 46.5c1.8 1.8 3.6 2.4 5.5 2.4s3.7-.6 5.5-2.4"
            fill="none"
            stroke="#7a4b3a"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {look.beard ? (
            <path
              d="M30 46c1 8 5 12 10 12s9-4 10-12c-3 2-6 3-10 3s-7-1-10-3z"
              fill={look.hair}
              opacity="0.9"
            />
          ) : null}
          {look.glasses ? (
            <g fill="none" stroke="#243038" strokeWidth="1.5">
              <rect x="27" y="34" width="10" height="8" rx="2" />
              <rect x="43" y="34" width="10" height="8" rx="2" />
              <path d="M37 38h6" />
            </g>
          ) : null}
        </svg>
      )}
    </span>
  )
}
