"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PetalField from "@/components/PetalField";
import { decodeGift, decodeStoredGift, type GiftState } from "@/lib/gift";
import { TEMPLATES } from "@/lib/templates";
import { useGiftImage } from "@/hooks/useGiftImage";

const BURST_COLORS = ["#FFD94D", "#FFC81A", "#F7B500", "#FFED8A", "#FFB98A", "#FF79A6"];
const BURST_COUNT = 16;

function makeBurst() {
  return Array.from({ length: BURST_COUNT }, (_, i) => {
    const angle = (i / BURST_COUNT) * Math.PI * 2 + (i % 2) * 0.32;
    const dist = 85 + Math.random() * 115;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist * 0.8,
      rotate: (Math.random() - 0.5) * 300,
      delay: Math.random() * 0.15,
      size: 11 + Math.random() * 11,
      color: BURST_COLORS[i % BURST_COLORS.length],
    };
  });
}

export default function GiftPage() {
  const params = useParams<{ id: string }>();
  const segment = params.id ?? "";
  const [gift, setGift] = useState<GiftState | null>(null);
  const [ready, setReady] = useState(false);
  const [debugCalib] = useState(() =>
    typeof window !== "undefined" && window.location.search.includes("calib=1"),
  );
  const [opened, setOpened] = useState(false);
  const burst = useMemo(makeBurst, []);

  useEffect(() => {
    setGift(decodeGift(segment) ?? decodeStoredGift(segment));
    setReady(true);
  }, [segment]);

  const template = gift
    ? gift.img
      ? TEMPLATES.conFoto
      : TEMPLATES.sinFoto
    : TEMPLATES.sinFoto;
  const { dataUrl, busy } = useGiftImage(
    template,
    gift?.img,
    gift?.m ?? "",
    debugCalib,
  );

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "regalo-de-primavera.png";
    link.href = dataUrl;
    link.click();
  };

  if (!ready) {
    return (
      <main className="relative flex min-h-[100svh] items-center justify-center px-6">
        <p className="font-display text-3xl text-sunflower-500">
          Preparando tu sorpresa… 🌼
        </p>
      </main>
    );
  }

  if (!gift) {
    return (
      <main className="relative flex min-h-[100svh] items-center justify-center px-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="mx-auto text-6xl"
          >
            🥀
          </motion.div>
          <h1 className="font-display mt-6 text-5xl font-bold text-stone-600">
            Este enlace no es válido
          </h1>
          <p className="mt-3 text-stone-500">
            Parece que las flores se perdieron en el camino.
            <br />
            Pedile a quien te las envió que recompile el link 🌼
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      <PetalField />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center px-5 py-14">
        <motion.p
          className="font-display mb-5 text-center text-3xl text-sunflower-500"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Alguien te regaló una sorpresa 🌼
        </motion.p>

        <motion.div
          className="relative flex aspect-[848/1264] w-full max-w-sm shrink-0 items-center justify-center"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {!dataUrl ? (
            <div className="flex aspect-[848/1264] w-full max-w-sm items-center justify-center rounded-3xl bg-white/70 shadow-soft">
              <span className="text-sunflower-500">
                {busy ? "Armando tu regalo… 🌼" : "Hubo un problema 🥀"}
              </span>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {!opened && (
                  <motion.button
                    key="sobre"
                    type="button"
                    onClick={() => setOpened(true)}
                    aria-label="Abrir el sobre y ver el regalo"
                    className="relative z-30 w-full max-w-[340px] outline-none"
                    initial={{ scale: 0.86, rotate: -3, y: 10 }}
                    animate={{ scale: 1, rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14 }}
                    whileHover={{ scale: 1.05, rotate: 1.2 }}
                    whileTap={{ scale: 0.96 }}
                    exit={{
                      scale: 0.86,
                      rotate: 4,
                      y: 80,
                      opacity: 0,
                      transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute -inset-6 animate-breathe rounded-[2.5rem] bg-sunflower-300/50 blur-2xl"
                    />
                    <span className="relative block h-56 overflow-hidden rounded-[1.25rem] bg-rose-500 shadow-polaroid ring-4 ring-white/70">
                      <span className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600" />
                      <span className="absolute inset-x-0 bottom-0 z-10 h-40 bg-rose-600/70 [clip-path:polygon(0_15%,50%_70%,100%_15%,100%_100%,0_100%)]" />
                      <motion.span
                        aria-hidden
                        className="absolute inset-x-0 top-0 z-20 h-32 origin-top bg-rose-300 [clip-path:polygon(0_0,100%_0,50%_100%)]"
                        style={{ transformPerspective: 700 }}
                        exit={{
                          rotateX: -150,
                          transition: { duration: 0.45, ease: "easeIn" },
                        }}
                      />
                      <span
                        className="absolute left-1/2 top-1/2 z-30 text-4xl drop-shadow"
                        style={{ transform: "translate(-50%,-50%)" }}
                      >
                        💛
                      </span>
                      <span className="absolute bottom-4 left-0 right-0 z-30 text-center text-sm font-extrabold text-white drop-shadow">
                        Tocá para abrir ✨
                      </span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center"
                initial={false}
                animate={
                  opened ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 24 }
                }
                transition={
                  opened
                    ? { type: "spring", stiffness: 110, damping: 16 }
                    : { duration: 0.001 }
                }
                style={{ pointerEvents: opened ? "auto" : "none" }}
              >
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sunflower-300/50 blur-3xl"
                />
                <motion.img
                  src={dataUrl}
                  alt="Regalo de flores"
                  className="relative max-h-full w-full max-w-sm rounded-3xl object-contain shadow-polaroid"
                  initial={false}
                  animate={
                    opened ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -50, scale: 0.8 }
                  }
                  transition={
                    opened
                      ? { type: "spring", stiffness: 120, damping: 15, delay: 0.15 }
                      : { duration: 0.001 }
                  }
                />
                {opened &&
                  burst.map((b) => (
                    <motion.span
                      key={b.id}
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2"
                      style={{ width: b.size, height: b.size * 1.35 }}
                      initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                      animate={{ x: b.x, y: b.y, scale: 1, rotate: b.rotate, opacity: 0 }}
                      transition={{ duration: 1.05, delay: b.delay, ease: "easeOut" }}
                    >
                      <svg viewBox="0 0 20 28" width="100%" height="100%">
                        <path
                          d="M10 2 C 17 10, 19 20, 10 26 C 1 20, 3 10, 10 2 Z"
                          fill={b.color}
                        />
                      </svg>
                    </motion.span>
                  ))}
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.button
          type="button"
          onClick={handleDownload}
          disabled={!dataUrl || !opened}
          className="mt-8 w-full rounded-full bg-emerald-400 px-8 py-4 text-base font-extrabold text-white shadow-soft transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {opened ? "Descargar imagen ⬇️" : "Abrí el regalo primero"}
        </motion.button>

        <motion.p
          className="mt-5 text-xs text-stone-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Hecho con 💛 para que florezcas
        </motion.p>
      </div>
    </main>
  );
}