"use client";

import { motion } from "motion/react";

const HEART =
  "M100 175 C40 130 15 95 15 62 C15 36 35 20 58 20 C75 20 90 29 100 45 C110 29 125 20 142 20 C165 20 185 36 185 62 C185 95 160 130 100 175 Z";
const ECG = "M0 200 L110 200 L124 186 L138 200 L166 200 L178 212 L196 118 L216 266 L228 200 L262 200 L278 178 L296 200 L400 200";

const DOTS = [
  { x: 52, y: 96, d: 0 }, { x: 348, y: 120, d: 0.8 }, { x: 72, y: 296, d: 1.6 },
  { x: 332, y: 292, d: 0.4 }, { x: 200, y: 38, d: 1.2 }, { x: 372, y: 214, d: 2 },
  { x: 28, y: 204, d: 1.4 },
];

/** A running pulse along the ECG path (pathLength normalised to 1). */
function EcgPulse({ stroke, width, clip }: { stroke: string; width: number; clip?: string }) {
  return (
    <g clipPath={clip ? `url(#${clip})` : undefined}>
      <path d={ECG} fill="none" stroke={stroke} strokeOpacity={0.28} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path
        d={ECG}
        pathLength={1}
        fill="none"
        stroke={stroke}
        strokeWidth={width + 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.22 1.1"
        initial={{ strokeDashoffset: 0.22 }}
        animate={{ strokeDashoffset: -1.1 }}
        transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
      />
    </g>
  );
}

export function HeartVisual() {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label="Stylised heart with an animated ECG waveform" className="size-full overflow-visible">
      <defs>
        <radialGradient id="hv-body" cx="34%" cy="26%" r="95%">
          <stop offset="0" stopColor="#b8627a" />
          <stop offset="0.32" stopColor="#8b3a50" />
          <stop offset="0.7" stopColor="#641c32" />
          <stop offset="1" stopColor="#421020" />
        </radialGradient>
        <radialGradient id="hv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#8b3a50" stopOpacity="0.30" />
          <stop offset="0.6" stopColor="#ecd5d9" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ecd5d9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hv-vessel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8b3a50" />
          <stop offset="1" stopColor="#421020" />
        </linearGradient>
        <filter id="hv-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="hv-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <clipPath id="hv-clip">
          <path d={HEART} transform="translate(60 52) scale(1.4)" />
        </clipPath>
      </defs>

      {/* ambient glow + orbit rings */}
      <circle cx="200" cy="190" r="190" fill="url(#hv-glow)" />
      <motion.circle
        cx="200" cy="190" r="168" fill="none" stroke="#641c32" strokeOpacity="0.18" strokeDasharray="2 9" strokeLinecap="round"
        style={{ transformOrigin: "200px 190px" }}
        animate={{ rotate: 360 }} transition={{ duration: 90, ease: "linear", repeat: Infinity }}
      />
      <circle cx="200" cy="190" r="132" fill="none" stroke="#e5ded7" />

      {/* data points */}
      {DOTS.map((d, i) => (
        <motion.circle
          key={i} cx={d.x} cy={d.y} r="3" fill="#8b3a50"
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.3, 0.8] }}
          style={{ transformOrigin: `${d.x}px ${d.y}px` }}
          transition={{ duration: 3.4, delay: d.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ECG underneath the heart (burgundy, outside the body) */}
      <EcgPulse stroke="#641c32" width={2} />

      {/* the heart itself, beating */}
      <motion.g
        style={{ transformOrigin: "200px 190px" }}
        animate={{ scale: [1, 1.045, 1, 1.03, 1], y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.14, 0.3, 0.42, 1] }}
      >
        {/* contact shadow */}
        <ellipse cx="200" cy="318" rx="92" ry="12" fill="#421020" opacity="0.22" filter="url(#hv-blur)" />
        {/* great vessels */}
        <g transform="translate(60 52) scale(1.4)">
          <path d="M84 30 C80 6 68 -2 56 4 L62 14 C70 12 74 20 76 34 Z" fill="url(#hv-vessel)" />
          <path d="M108 32 C112 4 128 -4 142 6 L134 16 C124 12 118 22 116 34 Z" fill="url(#hv-vessel)" />
          <path d={HEART} fill="url(#hv-body)" />
          {/* ventricular groove */}
          <path d="M96 48 C104 80 100 120 100 170" fill="none" stroke="#2e0b16" strokeOpacity="0.35" strokeWidth="2.400" strokeLinecap="round" />
          {/* specular highlights */}
          <ellipse cx="62" cy="52" rx="22" ry="12" transform="rotate(-32 62 52)" fill="#fff" opacity="0.20" filter="url(#hv-soft)" />
          <ellipse cx="54" cy="46" rx="6" ry="3" transform="rotate(-32 54 46)" fill="#fff" opacity="0.5" filter="url(#hv-soft)" />
        </g>
        {/* ECG over the heart (light, clipped to the body) */}
        <EcgPulse stroke="#f8f6f2" width={2.200} clip="hv-clip" />
      </motion.g>
    </svg>
  );
}
