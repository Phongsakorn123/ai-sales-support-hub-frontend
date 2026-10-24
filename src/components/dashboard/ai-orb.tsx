import type { CSSProperties } from "react";

const particles = [
  { x: "8%", y: "30%", size: "3px", delay: "-2s", duration: "7s" },
  { x: "16%", y: "73%", size: "2px", delay: "-5s", duration: "9s" },
  { x: "24%", y: "12%", size: "2px", delay: "-1s", duration: "8s" },
  { x: "31%", y: "88%", size: "3px", delay: "-6s", duration: "10s" },
  { x: "40%", y: "4%", size: "2px", delay: "-3s", duration: "8s" },
  { x: "48%", y: "94%", size: "2px", delay: "-7s", duration: "9s" },
  { x: "58%", y: "9%", size: "3px", delay: "-4s", duration: "11s" },
  { x: "68%", y: "89%", size: "2px", delay: "-2s", duration: "8s" },
  { x: "77%", y: "18%", size: "2px", delay: "-6s", duration: "10s" },
  { x: "87%", y: "70%", size: "3px", delay: "-3s", duration: "9s" },
  { x: "95%", y: "38%", size: "2px", delay: "-8s", duration: "11s" },
  { x: "5%", y: "58%", size: "2px", delay: "-4s", duration: "8s" },
  { x: "12%", y: "46%", size: "2px", delay: "-7s", duration: "12s" },
  { x: "19%", y: "25%", size: "3px", delay: "-9s", duration: "10s" },
  { x: "22%", y: "62%", size: "2px", delay: "-3s", duration: "13s" },
  { x: "29%", y: "36%", size: "2px", delay: "-11s", duration: "9s" },
  { x: "35%", y: "18%", size: "3px", delay: "-5s", duration: "12s" },
  { x: "39%", y: "76%", size: "2px", delay: "-8s", duration: "10s" },
  { x: "46%", y: "27%", size: "2px", delay: "-10s", duration: "14s" },
  { x: "53%", y: "67%", size: "3px", delay: "-4s", duration: "11s" },
  { x: "61%", y: "38%", size: "2px", delay: "-12s", duration: "10s" },
  { x: "66%", y: "19%", size: "2px", delay: "-6s", duration: "13s" },
  { x: "72%", y: "55%", size: "3px", delay: "-9s", duration: "12s" },
  { x: "79%", y: "82%", size: "2px", delay: "-2s", duration: "14s" },
  { x: "84%", y: "30%", size: "2px", delay: "-13s", duration: "11s" },
  { x: "91%", y: "52%", size: "3px", delay: "-7s", duration: "13s" },
  { x: "97%", y: "87%", size: "2px", delay: "-5s", duration: "9s" },
];

export default function AiOrb() {
  return (
    <div
      aria-label="AI core, softly pulsing with floating light particles"
      className="ai-orb-stage"
      role="img"
    >
      <div aria-hidden="true" className="ai-orb-ambient" />
      <div aria-hidden="true" className="ai-orb-rays">
        <svg fill="none" viewBox="0 0 480 340">
          <defs>
            <radialGradient
              cx="0"
              cy="0"
              gradientTransform="rotate(90 0 240) scale(155 220)"
              gradientUnits="userSpaceOnUse"
              id="orb-ray-fade"
              r="1"
            >
              <stop offset=".38" stopColor="#6FEAFF" stopOpacity=".3" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M240 170 41 15M240 170 12 100M240 170 5 170M240 170 34 251M240 170 83 320M240 170 440 15M240 170 468 100M240 170 475 170M240 170 446 251M240 170 397 320"
            stroke="url(#orb-ray-fade)"
            strokeWidth="1"
          />
        </svg>
      </div>
      <div aria-hidden="true" className="ai-orb-orbit ai-orb-orbit-one" />
      <div aria-hidden="true" className="ai-orb-orbit ai-orb-orbit-two" />
      <div aria-hidden="true" className="ai-orb-orbit ai-orb-orbit-three" />
      <div aria-hidden="true" className="ai-orb-particle-field">
        {particles.map((particle, index) => (
          <span
            className={`ai-orb-particle ai-orb-particle-${index % 3}`}
            key={`${particle.x}-${particle.y}`}
            style={
              {
                "--particle-x": particle.x,
                "--particle-y": particle.y,
                "--particle-size": particle.size,
                "--particle-delay": particle.delay,
                "--particle-duration": particle.duration,
                "--particle-index": index,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div aria-hidden="true" className="ai-orb-shell">
        <div className="ai-orb-shell-highlight" />
        <div className="ai-orb-core">
          <div className="ai-orb-core-light" />
          <div className="ai-orb-core-shimmer" />
        </div>
      </div>
      <div aria-hidden="true" className="ai-orb-floor-glow" />
    </div>
  );
}
