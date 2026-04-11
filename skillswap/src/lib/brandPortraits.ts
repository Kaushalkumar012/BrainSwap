type PortraitConfig = {
  key: string
  name: string
  role: string
  skin: string
  hair: string
  shirt: string
  shirtAccent: string
  backgroundA: string
  backgroundB: string
  highlight: string
  brow?: string
  accessory?: "bindi" | "glasses" | "beard"
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createPortrait({
  key,
  skin,
  hair,
  shirt,
  shirtAccent,
  backgroundA,
  backgroundB,
  highlight,
  brow = "#1c2433",
  accessory,
}: PortraitConfig) {
  const accentShapes =
    accessory === "bindi"
      ? `<circle cx="44" cy="34.5" r="1.7" fill="#ad2036" />`
      : accessory === "glasses"
        ? `
          <rect x="32" y="34" width="8" height="5.8" rx="2.2" fill="none" stroke="#182334" stroke-width="1.3"/>
          <rect x="48" y="34" width="8" height="5.8" rx="2.2" fill="none" stroke="#182334" stroke-width="1.3"/>
          <path d="M40 36.7h8" stroke="#182334" stroke-width="1.2" stroke-linecap="round"/>
        `
        : accessory === "beard"
          ? `<path d="M34 42c1.2 6.5 6.2 10.5 10 10.5s8.8-4 10-10.5c-2.4 2.7-6.3 4.2-10 4.2S36.4 44.7 34 42Z" fill="#1f2430" opacity="0.95" />`
          : ""

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" fill="none">
      <defs>
        <linearGradient id="${key}-bg" x1="10" y1="6" x2="78" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${backgroundA}" />
          <stop offset="100%" stop-color="${backgroundB}" />
        </linearGradient>
      </defs>
      <rect width="88" height="88" rx="44" fill="url(#${key}-bg)" />
      <circle cx="44" cy="44" r="40" fill="${highlight}" fill-opacity="0.14" />
      <path d="M15 76c4-13.2 15.8-21.6 29-21.6S69 62.8 73 76v6H15v-6Z" fill="${shirt}" />
      <path d="M24 79c4.6-7.8 11.7-12 20-12s15.4 4.2 20 12" stroke="${shirtAccent}" stroke-width="3.2" stroke-linecap="round" opacity="0.9" />
      <path d="M36 53h16v8.5c0 2.2-1.8 4-4 4h-8c-2.2 0-4-1.8-4-4V53Z" fill="${skin}" />
      <ellipse cx="44" cy="35" rx="16.5" ry="18.5" fill="${skin}" />
      <path d="M27.5 33.8C27.5 22.7 35 14 44.2 14c10.4 0 16.7 7.8 16.7 18.6v3.6c-2.3-1.8-5.7-2.8-9.1-2.8-6.9 0-13.8-1.9-18.7-6-1.9 3.1-4.1 5.1-5.6 6.4v-.1Z" fill="${hair}" />
      <path d="M30 31.2c2.7-9.9 9.3-14.6 18.2-14.6 6.5 0 10.8 2.1 13.8 6.1-2.1-6-8.7-10.7-17.8-10.7-8.4 0-15.5 4.5-18.2 11.5-.8 2.1-1.2 4.4-1.2 7 1.5-.7 3-1.8 5.2-4.3Z" fill="${hair}" fill-opacity="0.9" />
      <path d="M36 36h4.5" stroke="${brow}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M47.5 36H52" stroke="${brow}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M37.2 39.8c.8.7 1.7 1.1 2.8 1.1 1.1 0 2-.4 2.8-1.1" stroke="${brow}" stroke-width="1.25" stroke-linecap="round" />
      <path d="M48.7 39.8c.8.7 1.7 1.1 2.8 1.1 1.1 0 2-.4 2.8-1.1" stroke="${brow}" stroke-width="1.25" stroke-linecap="round" />
      <path d="M44 41.2v4.3" stroke="#915f46" stroke-width="1.1" stroke-linecap="round" opacity="0.55" />
      <path d="M39.2 48.8c1.2 1.4 2.9 2.2 4.8 2.2s3.6-.8 4.8-2.2" stroke="#8c4d4b" stroke-width="1.35" stroke-linecap="round" />
      ${accentShapes}
      <circle cx="21" cy="21" r="4" fill="white" fill-opacity="0.14" />
      <circle cx="66" cy="18" r="2.7" fill="white" fill-opacity="0.16" />
      <circle cx="70" cy="63" r="3.5" fill="white" fill-opacity="0.1" />
    </svg>
  `

  return toDataUri(svg)
}

const portraitConfigs: PortraitConfig[] = [
  {
    key: "aarav",
    name: "Aarav Patel",
    role: "React Mentor",
    skin: "#c98962",
    hair: "#171b25",
    shirt: "#0d8e8e",
    shirtAccent: "#77f4e3",
    backgroundA: "#0f2745",
    backgroundB: "#1d9ca3",
    highlight: "#8cf7ee",
    accessory: "beard",
  },
  {
    key: "priya",
    name: "Priya Sharma",
    role: "UI/UX Designer",
    skin: "#d59a75",
    hair: "#231427",
    shirt: "#ff7a59",
    shirtAccent: "#ffd4c8",
    backgroundA: "#351530",
    backgroundB: "#c94f76",
    highlight: "#ffd6a6",
    accessory: "bindi",
  },
  {
    key: "rahul",
    name: "Rahul Singh",
    role: "Backend Engineer",
    skin: "#b97d58",
    hair: "#17191d",
    shirt: "#355fda",
    shirtAccent: "#d3ddff",
    backgroundA: "#101727",
    backgroundB: "#335eb4",
    highlight: "#92b7ff",
    accessory: "glasses",
  },
  {
    key: "ananya",
    name: "Ananya Bose",
    role: "ML Specialist",
    skin: "#d49b74",
    hair: "#272030",
    shirt: "#7d56f4",
    shirtAccent: "#e3d7ff",
    backgroundA: "#231842",
    backgroundB: "#7e56d9",
    highlight: "#f9d2ff",
    accessory: "bindi",
  },
  {
    key: "vikram",
    name: "Vikram Desai",
    role: "Cloud Coach",
    skin: "#b97d5f",
    hair: "#1c1d21",
    shirt: "#f39c34",
    shirtAccent: "#fff0cb",
    backgroundA: "#39210c",
    backgroundB: "#d78129",
    highlight: "#ffe29c",
    accessory: "beard",
  },
  {
    key: "neha",
    name: "Neha Reddy",
    role: "Frontend Engineer",
    skin: "#cd936f",
    hair: "#201822",
    shirt: "#19a87e",
    shirtAccent: "#cff8ea",
    backgroundA: "#112b29",
    backgroundB: "#1e9f8f",
    highlight: "#b8fff1",
    accessory: "bindi",
  },
  {
    key: "arjun",
    name: "Arjun Mehta",
    role: "AWS Architect",
    skin: "#bf835c",
    hair: "#151820",
    shirt: "#d95763",
    shirtAccent: "#ffd0d5",
    backgroundA: "#331521",
    backgroundB: "#b74254",
    highlight: "#ffc6d2",
    accessory: "glasses",
  },
]

export const brainSwapPortraits = Object.fromEntries(
  portraitConfigs.map((config) => [config.key, createPortrait(config)])
) as Record<string, string>

export const brainSwapCommunityMembers = portraitConfigs.map((config) => ({
  name: config.name,
  role: config.role,
  avatar: brainSwapPortraits[config.key],
}))
