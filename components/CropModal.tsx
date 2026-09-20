"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { motion } from "framer-motion";
import { PHOTO_ASPECT } from "@/lib/templates";

const TARGET_W = 1000;
const TARGET_H = 900;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("no se pudo leer la imagen"));
    img.src = src;
  });
}

async function cropToDataUrl(src: string, px: Area): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_W;
  canvas.height = TARGET_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    px.x,
    px.y,
    px.width,
    px.height,
    0,
    0,
    TARGET_W,
    TARGET_H,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

interface CropModalProps {
  src: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}

export default function CropModal({ src, onCancel, onConfirm }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [px, setPx] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!px || busy) return;
    setBusy(true);
    try {
      onConfirm(await cropToDataUrl(src, px));
    } catch {
      alert("No se pudo recortar la foto. Volvé a intentar. 📷");
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-2xl"
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
      >
        <p className="font-display mb-3 text-2xl text-sunflower-500">
          Acomodá la foto 📸
        </p>
        <div className="relative h-[380px] overflow-hidden rounded-2xl bg-stone-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={PHOTO_ASPECT}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setPx(pixels)}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-lg">🔍</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-sunflower-500"
          />
        </div>
        <p className="mt-1 text-xs text-stone-400">
          Mové y achicá/acercá hasta que las caras queden dentro del marco.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full bg-stone-200 px-6 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-300 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!px || busy}
            className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-500 active:scale-95 disabled:opacity-60"
          >
            {busy ? "Recortando… ⏳" : "Usar esta foto ✅"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}