"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PetalField from "@/components/PetalField";
import AnimatedFlower from "@/components/AnimatedFlower";

const STEPS = [
  {
    emoji: "💛",
    title: "Elegí tu mensaje",
    text: "Escribí algo lindo a mano o dejame que la sorpresa lo arme por vos. Siempre sale bien.",
  },
  {
    emoji: "📸",
    title: "Sumá una foto (opcional)",
    text: "Si querés llegar más lejos, adjuntá una foto y va a aparecer en el regalo final.",
  },
  {
    emoji: "🔗",
    title: "Compartí el regalo",
    text: "Se genera un link único y listo. Solo queda esperar la sonrisa al abrirlo.",
  },
];

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/crear/${createSessionId()}`);
  };

  return (
    <main className="relative overflow-x-hidden">
      <PetalField />

      <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="animate-breathe"
        >
          <AnimatedFlower size={130} className="mx-auto drop-shadow-xl" />
        </motion.div>

        <motion.h1
          className="font-display mt-6 max-w-3xl text-balance text-6xl font-bold leading-[0.95] text-sunflower-600 sm:text-7xl md:text-8xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Te regalo
          <br />
          <span className="text-sunflower-400 drop-shadow-sm">flores</span>
          <span className="text-pastel-green"> 🌼</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-stone-500"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Este día de la primavera, armá unas{" "}
          <strong className="text-sunflower-600">flores amarillas virtuales</strong>{" "}
          con un mensaje y una foto, y mandáselas a la persona que se la merece.
          Sorprenderla nunca fue tan fácil.
        </motion.p>

        <motion.div
          className="mt-10 animate-blink-soft text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          ↓
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col gap-24 px-6 pb-16">
        {STEPS.map((step, i) => (
          <motion.article
            key={step.title}
            className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pastel-yellow to-pastel-sky text-5xl shadow-soft"
              whileHover={{ scale: 1.08, rotate: -4 }}
            >
              {step.emoji}
            </motion.div>
            <div>
              <p className="font-display text-3xl text-sunflower-500">
                Paso {i + 1}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-stone-700">
                {step.title}
              </h2>
              <p className="mt-2 leading-relaxed text-stone-500">{step.text}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="relative z-10 flex flex-col items-center gap-5 px-6 pb-24 pt-6 text-center">
        <motion.h2
          className="font-display max-w-2xl text-balance text-5xl font-bold text-sunflower-600"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          ¿Listo para hacer florecer su día?
        </motion.h2>

        <motion.button
          onClick={handleStart}
          className="group relative mt-2 rounded-full bg-gradient-to-br from-sunflower-300 to-sunflower-500 px-10 py-5 text-xl font-extrabold text-white shadow-polaroid transition-transform hover:scale-105 active:scale-95"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="absolute inset-0 rounded-full bg-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
          Enviar flores 🌼
        </motion.button>

        <p className="text-sm text-stone-400">
          Es gratis, no pide datos y no necesitás cuenta.
        </p>
      </section>
    </main>
  );
}