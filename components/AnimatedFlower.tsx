"use client";

import { motion, type Variants } from "framer-motion";

const PETAL_COUNT = 12;
const PETAL_OUTER = 92;
const PETAL_INNER = 58;

const petalContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const petal: Variants = {
  hidden: { scale: 0, rotate: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 140, damping: 14 },
  },
};

export default function AnimatedFlower({
  size = 240,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const petals = Array.from(
    { length: PETAL_COUNT },
    (_, i) => i * (360 / PETAL_COUNT),
  );

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="-150 -150 300 300"
      className={className}
      initial="hidden"
      animate="show"
      aria-label="Flor amarilla"
      role="img"
    >
      <motion.g
        animate={{
          rotate: [0, 4, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "0px 0px" }}
      >
        <motion.g variants={petalContainer}>
          {petals.map((angle, i) => (
            <motion.g key={i} variants={petal} style={{ transformOrigin: "0px 0px" }}>
              <ellipse
                cx="0"
                cy={-PETAL_OUTER}
                rx="20"
                ry="42"
                transform={`rotate(${angle} 0 0)`}
                fill="url(#petalGrad)"
                stroke="rgba(217,155,0,0.55)"
                strokeWidth="1.5"
              />
            </motion.g>
          ))}
        </motion.g>

        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 160, damping: 12 }}
          style={{ transformOrigin: "0px 0px" }}
        >
          {petals.map((angle, i) => (
            <circle
              key={`inner-${i}`}
              cy={-PETAL_INNER}
              r="14"
              transform={`rotate(${angle} 0 0)`}
              fill="url(#petalGrad)"
              opacity="0.75"
            />
          ))}
        </motion.g>

        <circle cx="0" cy="0" r="34" fill="url(#centerGrad)" stroke="#8a5a00" strokeWidth="2" />
        <circle cx="0" cy="0" r="26" fill="none" stroke="#7c4d00" strokeWidth="1.4" strokeDasharray="2 4" opacity="0.6" />
        {[0, 60, 120].map((a, i) => (
          <circle
            key={`dot-${i}`}
            cx={10 * Math.cos((a * Math.PI) / 180)}
            cy={10 * Math.sin((a * Math.PI) / 180)}
            r="3"
            fill="#7c4d00"
            opacity="0.8"
          />
        ))}
      </motion.g>

      <defs>
        <radialGradient id="petalGrad" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFF7CC" />
          <stop offset="55%" stopColor="#FFD94D" />
          <stop offset="100%" stopColor="#F7B500" />
        </radialGradient>
        <radialGradient id="centerGrad" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#E8A50C" />
          <stop offset="100%" stopColor="#8a5a00" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}