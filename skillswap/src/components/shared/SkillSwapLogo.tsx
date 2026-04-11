import { useId } from "react"

interface LogoProps {
  size?: number
  className?: string
}

export function SkillSwapLogo({ size = 32, className }: LogoProps) {
  const id = useId().replace(/:/g, "")
  const bgGradientId = `${id}-bg`
  const borderGradientId = `${id}-border`
  const leftGradientId = `${id}-left`
  const rightGradientId = `${id}-right`
  const coreGradientId = `${id}-core`
  const glowGradientId = `${id}-glow`
  const shadowId = `${id}-shadow`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="BrainSwap logo"
    >
      <defs>
        <linearGradient
          id={bgGradientId}
          x1="4"
          y1="2"
          x2="35"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#09111f" />
          <stop offset="55%" stopColor="#10213b" />
          <stop offset="100%" stopColor="#0d1727" />
        </linearGradient>
        <linearGradient
          id={borderGradientId}
          x1="4"
          y1="4"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#71f0e0" />
          <stop offset="50%" stopColor="#ff8f70" />
          <stop offset="100%" stopColor="#ffd36c" />
        </linearGradient>
        <linearGradient
          id={leftGradientId}
          x1="7"
          y1="9"
          x2="22"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5df0dd" />
          <stop offset="100%" stopColor="#1d9ca3" />
        </linearGradient>
        <linearGradient
          id={rightGradientId}
          x1="18"
          y1="10"
          x2="34"
          y2="31"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffb16b" />
          <stop offset="100%" stopColor="#ff6e72" />
        </linearGradient>
        <linearGradient
          id={coreGradientId}
          x1="17"
          y1="14"
          x2="24"
          y2="26"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fff5bf" />
          <stop offset="100%" stopColor="#f4b942" />
        </linearGradient>
        <radialGradient
          id={glowGradientId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(20 12) rotate(90) scale(24)"
        >
          <stop offset="0%" stopColor="#7cf5ea" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7cf5ea" stopOpacity="0" />
        </radialGradient>
        <filter
          id={shadowId}
          x="4"
          y="5"
          width="32"
          height="31"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2.5"
            floodColor="#08111d"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      <rect x="1.5" y="1.5" width="37" height="37" rx="12" fill={`url(#${bgGradientId})`} />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="12"
        stroke={`url(#${borderGradientId})`}
        strokeOpacity="0.45"
      />
      <path
        d="M8 5.5H25.5C28.7 5.5 31.3 8.1 31.3 11.3V11.3C31.3 12.1 30.7 12.8 29.8 12.8H8C6.6 12.8 5.5 11.7 5.5 10.3V8C5.5 6.6 6.6 5.5 8 5.5Z"
        fill="white"
        fillOpacity="0.08"
      />
      <circle cx="20" cy="14" r="13" fill={`url(#${glowGradientId})`} />

      <g filter={`url(#${shadowId})`}>
        <path
          d="M14.1 8.8C10.6 8.8 7.9 11.5 7.9 14.9C7.9 17 8.9 18.8 10.5 20C9.7 20.9 9.3 22.1 9.3 23.4C9.3 26.9 12.2 29.7 15.7 29.7C18.9 29.7 21.2 27.7 21.2 24.8V14.4C21.2 10.9 18.6 8.8 14.1 8.8Z"
          fill={`url(#${leftGradientId})`}
        />
        <path
          d="M25.9 8.8C29.4 8.8 32.1 11.5 32.1 14.9C32.1 17 31.1 18.8 29.5 20C30.3 20.9 30.7 22.1 30.7 23.4C30.7 26.9 27.8 29.7 24.3 29.7C21.1 29.7 18.8 27.7 18.8 24.8V14.4C18.8 10.9 21.4 8.8 25.9 8.8Z"
          fill={`url(#${rightGradientId})`}
        />

        <path
          d="M13.1 14.3C12.1 14.9 11.5 15.9 11.5 17.1C11.5 18.4 12.2 19.5 13.4 20.1"
          stroke="#E8FFFB"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        <path
          d="M16.5 13.2C15.4 14 14.8 15.4 14.8 16.8C14.8 18.2 15.4 19.6 16.5 20.4"
          stroke="#E8FFFB"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        <path
          d="M26.9 14.3C27.9 14.9 28.5 15.9 28.5 17.1C28.5 18.4 27.8 19.5 26.6 20.1"
          stroke="#FFF2DD"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        <path
          d="M23.5 13.2C24.6 14 25.2 15.4 25.2 16.8C25.2 18.2 24.6 19.6 23.5 20.4"
          stroke="#FFF2DD"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        <path
          d="M20.1 14.1L23.2 18.4H21L22.2 21.1L17.3 26L18.4 21.5H16.3L20.1 14.1Z"
          fill={`url(#${coreGradientId})`}
        />

        <path
          d="M10.3 11.5C12.6 9.7 15.2 9 18 9"
          stroke="#7CF5EA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M29.7 28.5C27.4 30.3 24.8 31 22 31"
          stroke="#FF9A76"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M29.5 12.2L29.7 9.4L27 9.7"
          stroke="#FFB16B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 27.8L10.3 30.6L13 30.3"
          stroke="#65EBDD"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="12.4" cy="12.9" r="1.4" fill="#E9FFFC" />
        <circle cx="16.7" cy="11.3" r="1.2" fill="#E9FFFC" fillOpacity="0.9" />
        <circle cx="13.8" cy="24.6" r="1.4" fill="#E9FFFC" fillOpacity="0.95" />
        <circle cx="27.6" cy="12.9" r="1.4" fill="#FFF3E0" />
        <circle cx="23.3" cy="11.3" r="1.2" fill="#FFF3E0" fillOpacity="0.9" />
        <circle cx="26.2" cy="24.6" r="1.4" fill="#FFF3E0" fillOpacity="0.95" />
      </g>
    </svg>
  )
}
