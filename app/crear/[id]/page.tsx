"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import PetalField from "@/components/PetalField";
import CropModal from "@/components/CropModal";
import { clipMessage, MESSAGE_MAX_LENGTH, randomMessage } from "@/lib/messages";
import { compressImageFile } from "@/lib/compressImage";
import { giftUrlFor } from "@/lib/gift";
import { TEMPLATES } from "@/lib/templates";
import { useGiftImage } from "@/hooks/useGiftImage";

const DRAFT_PREFIX = "regalo-flores-draft-";

interface Draft {
  m: string;
  img?: string;
}

function draftKey(id: string) {
  return `${DRAFT_PREFIX}${id}`;
}

export default function CreatePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [message, setMessage] = useState("");
  const [img, setImg] = useState<string | undefined>();
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [downloadingPrev, setDownloadingPrev] = useState(false);
  const [debugCalib, setDebugCalib] = useState(false);

  const template = img ? TEMPLATES.conFoto : TEMPLATES.sinFoto;
  const { dataUrl: previewUrl } = useGiftImage(template, img, message, debugCalib);

  const handlePreviewDownload = () => {
    if (!previewUrl || downloadingPrev) return;
    setDownloadingPrev(true);
    try {
      const link = document.createElement("a");
      link.download = "regalo-de-primavera.png";
      link.href = previewUrl;
      link.click();
    } finally {
      setDownloadingPrev(false);
    }
  };

  useEffect(() => {
    const raw = window.localStorage.getItem(draftKey(id));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Draft;
        setMessage(parsed.m ?? "");
        setImg(parsed.img);
      } catch {
        window.localStorage.removeItem(draftKey(id));
      }
    }
  }, [id]);

  useEffect(() => {
    setDebugCalib(window.location.search.includes("calib=1"));
  }, []);

  const saveDraft = useCallback(
    (m: string, image?: string) => {
      try {
        window.localStorage.setItem(draftKey(id), JSON.stringify({ m, img: image }));
        setSaved(true);
      } catch {
        setSaved(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const t = setTimeout(() => saveDraft(message, img), 400);
    return () => clearTimeout(t);
  }, [message, img, saveDraft]);

  const handlePhoto = async (file: File) => {
    setBusyPhoto(true);
    try {
      const dataUrl = await compressImageFile(file);
      setCropSrc(dataUrl);
    } catch {
      alert("No se pudo leer esa imagen. Probá con otra. 📷");
    } finally {
      setBusyPhoto(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleGenerate = useCallback(() => {
    const safeMessage = clipMessage(message.trim() || randomMessage());
    const gift = { m: safeMessage, ...(img ? { img } : {}) };
    const url = giftUrlFor(gift);
    setFinalUrl(url);
    navigator.clipboard?.writeText(url).catch(() => {});
  }, [message, img]);

  const handleCopy = async () => {
    if (!finalUrl) return;
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiá este link:", finalUrl);
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden pb-16">
      <PetalField count={14} />

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={(dataUrl) => {
            setImg(dataUrl);
            setCropSrc(null);
          }}
        />
      )}

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-12 px-5 pt-12 md:flex-row md:items-start md:pt-20">

        <motion.section
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-8">
            <p className="font-display text-3xl text-sunflower-500">
              Paso 1 · tu mensaje
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-stone-800">
              Armá tus flores amarillas
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Se guarda automáticamente en este dispositivo. Podés volver cuando
              quieras con este mismo link.
            </p>
          </header>

          <div className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur">
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-bold text-stone-600"
            >
              Mensaje * (o generá uno aleatorio)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              rows={5}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder="Escribí algo lindo para esa persona especial…"
              className="w-full resize-none rounded-2xl border-2 border-sunflower-200 bg-pastel-yellow/40 p-4 text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-sunflower-400 focus:bg-white"
            />
            <div className="mt-1 text-right text-xs font-medium text-stone-400">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMessage(randomMessage())}
                className="rounded-full bg-sunflower-100 px-5 py-2.5 text-sm font-bold text-sunflower-700 transition hover:bg-sunflower-200 active:scale-95"
              >
                🎲 Generar mensaje aleatorio
              </button>
            </div>
          </div>

          <p className="font-display mb-4 mt-8 text-3xl text-sunflower-500">
            Paso 2 · tu imagen (opcional)
          </p>
          <div className="rounded-3xl bg-white/80 p-6 shadow-soft backdrop-blur">
            <label className="mb-2 block text-sm font-bold text-stone-600">
              Foto (opcional)
            </label>
            <p className="mb-4 text-xs text-stone-400">
              Va a aparecer en el regalo como una foto polaroid. Se comprime
              sola, así el link queda cortito.
            </p>

            {img ? (
              <div className="relative inline-block">
                <img
                  src={img}
                  alt="Tu foto elegida"
                  className="h-44 w-44 rounded-2xl object-cover shadow-soft ring-4 ring-white"
                />
                <button
                  type="button"
                  onClick={() => setImg(undefined)}
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-400 text-white shadow transition hover:bg-rose-500"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busyPhoto}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sunflower-300 bg-pastel-yellow/30 px-6 py-10 text-sunflower-600 transition hover:border-sunflower-400 hover:bg-pastel-yellow/50 disabled:opacity-50"
              >
                {busyPhoto ? (
                  <span className="text-sm">Procesando… ✨</span>
                ) : (
                  <>
                    <span className="text-3xl">📸</span>
                    <span className="text-sm font-bold">
                      Tocar para subir una foto
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhoto(file);
              }}
            />
          </div>

          <div className="hidden md:block">
            <motion.button
              type="button"
              onClick={handleGenerate}
              className="mt-8 w-full rounded-full bg-gradient-to-br from-sunflower-400 to-sunflower-600 px-8 py-5 text-lg font-extrabold text-white shadow-polaroid transition hover:scale-[1.02] hover:brightness-105 active:scale-95"
              whileTap={{ scale: 0.96 }}
            >
              Generar link para regalar 🌼
            </motion.button>
            {saved && (
              <p className="mt-3 text-center text-xs text-emerald-500">
                ✓ Borrador guardado en este dispositivo
              </p>
            )}

            {finalUrl && (
              <>
                <p className="font-display mb-4 mt-10 text-3xl text-sunflower-500">
                  Paso 3 · compartí el regalo
                </p>
                <motion.div
                  className="rounded-3xl border-2 border-sunflower-300 bg-white p-6 shadow-soft"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-700">
                    🎁 Tu regalo está listo
                  </p>
                  <input
                    readOnly
                    value={finalUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-xl bg-pastel-cream px-3 py-2.5 text-xs text-stone-600 outline-none"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-95"
                    >
                      {copied ? "✓ Copiado" : "Copiar link"}
                    </button>
                    <a
                      href={finalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center rounded-full bg-sunflower-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sunflower-600 active:scale-95"
                    >
                      Ver el regalo ✨
                    </a>
                  </div>
                  <p className="mt-3 text-center text-xs text-stone-400">
                    Mandale este link por WhatsApp, Instagram o lo que prefieras.
                  </p>
                </motion.div>
              </>
            )}
          </div>

        </motion.section>

        <motion.aside
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p className="font-display mb-4 text-3xl text-sunflower-500">
            Así se ve tu regalo
          </p>
          <div className="mx-auto w-full max-w-sm">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa del regalo"
                className="w-full rounded-3xl shadow-polaroid"
              />
            ) : (
              <div className="flex aspect-[848/1264] w-full items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                <span className="text-sunflower-500">
                  Armando tu regalo… 🌼
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handlePreviewDownload}
            disabled={!previewUrl || downloadingPrev}
            className="mx-auto mt-5 block w-full max-w-sm rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-extrabold text-white shadow-soft transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60"
          >
            {downloadingPrev ? "Generando imagen… ⏳" : "Descargar imagen ⬇️"}
          </button>
        </motion.aside>

        <div className="w-full md:hidden">
          <motion.button
            type="button"
            onClick={handleGenerate}
            className="mt-8 w-full rounded-full bg-gradient-to-br from-sunflower-400 to-sunflower-600 px-8 py-5 text-lg font-extrabold text-white shadow-polaroid transition hover:scale-[1.02] hover:brightness-105 active:scale-95"
            whileTap={{ scale: 0.96 }}
          >
            Generar link para regalar 🌼
          </motion.button>
          {saved && (
            <p className="mt-3 text-center text-xs text-emerald-500">
              ✓ Borrador guardado en este dispositivo
            </p>
          )}

          {finalUrl && (
            <>
              <p className="font-display mb-4 mt-10 text-3xl text-sunflower-500">
                Paso 3 · compartí el regalo
              </p>
              <motion.div
                className="rounded-3xl border-2 border-sunflower-300 bg-white p-6 shadow-soft"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-700">
                  🎁 Tu regalo está listo
                </p>
                <input
                  readOnly
                  value={finalUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full rounded-xl bg-pastel-cream px-3 py-2.5 text-xs text-stone-600 outline-none"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 rounded-full bg-emerald-400 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 active:scale-95"
                  >
                    {copied ? "✓ Copiado" : "Copiar link"}
                  </button>
                  <a
                    href={finalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center rounded-full bg-sunflower-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sunflower-600 active:scale-95"
                  >
                    Ver el regalo ✨
                  </a>
                </div>
                <p className="mt-3 text-center text-xs text-stone-400">
                  Mandale este link por WhatsApp, Instagram o lo que prefieras.
                </p>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}