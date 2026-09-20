"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PetalConfig {
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  tilt: number;
  color: number;
  durationVariation: number;
}

const COLORS = ["#FFD94D", "#FFC81A", "#F7B500", "#FFED8A", "#FFF3B0", "#FFE082"];

function makePetals(count: number): PetalConfig[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: 10 + Math.random() * 16,
    duration: 9 + Math.random() * 9,
    delay: Math.random() * 12,
    sway: 40 + Math.random() * 90,
    tilt: Math.random() * 360,
    color: Math.floor(Math.random() * COLORS.length),
    durationVariation: 0.6 + Math.random() * 0.8,
  }));
}

export default function PetalField({
  count = 18,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const [petals, setPetals] = useState<PetalConfig[]>([]);

  useEffect(() => {
    const small = typeof window !== "undefined" && window.innerWidth < 640;
    setPetals(makePetals(small ? 12 : count));
  }, [count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            top: -40,
          }}
          initial={{ y: -60, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: ["-8vh", "110vh"],
            x: [0, p.sway, -p.sway, 0],
            rotate: [p.tilt, p.tilt + 180, p.tilt + 360],
            opacity: [0, 1, 1, 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.55, 0.85, 1],
          }}
        >
          <svg
            viewBox="0 0 20 28"
            width="100%"
            height="100%"
            style={{ transform: `rotate(${p.tilt}deg)` }}
          >
            <path
              d="M10 2 C 17 10, 19 20, 10 26 C 1 20, 3 10, 10 2 Z"
              fill={COLORS[p.color]}
              stroke="rgba(180,127,0,0.25)"
              strokeWidth="0.6"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}