import { cn } from "@/lib/utils"

interface BrandWordmarkProps {
  className?: string
  compact?: boolean
  tone?: "light" | "adaptive"
}

export function BrandWordmark({
  className,
  compact = false,
  tone = "light",
}: BrandWordmarkProps) {
  const eyebrowClass =
    tone === "adaptive"
      ? "text-sidebar-foreground/50 dark:text-white/50"
      : "text-white/55"
  const subtitleClass =
    tone === "adaptive"
      ? "text-sidebar-foreground/60 dark:text-white/60"
      : "text-white/68"

  return (
    <div className={cn("flex flex-col leading-none", className)}>
      {!compact && (
        <span
          className={cn(
            "mb-1 text-[9px] font-semibold tracking-[0.42em] uppercase",
            eyebrowClass
          )}
        >
          Learn . Teach . Grow
        </span>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className="bg-[linear-gradient(135deg,#dffff8_0%,#73f2e2_36%,#2ac7b6_100%)] bg-clip-text text-[1.15rem] font-black tracking-[0.28em] text-transparent drop-shadow-[0_4px_18px_rgba(42,199,182,0.28)] sm:text-[1.2rem]">
          BRAIN
        </span>
        <span className="relative">
          <span className="bg-[linear-gradient(135deg,#fff1de_0%,#ffbb71_45%,#ff7a59_100%)] bg-clip-text text-[1.15rem] font-black tracking-[0.24em] text-transparent drop-shadow-[0_4px_18px_rgba(255,122,89,0.22)] sm:text-[1.2rem]">
            SWAP
          </span>
          <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[linear-gradient(90deg,rgba(115,242,226,0),rgba(115,242,226,0.95),rgba(255,122,89,0.95),rgba(255,122,89,0))]" />
        </span>
      </div>
      {!compact && (
        <span className={cn("mt-2 text-[11px] font-medium", subtitleClass)}>
          India&apos;s skill-sharing community
        </span>
      )}
    </div>
  )
}
