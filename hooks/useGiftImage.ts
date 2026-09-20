"use client";

import { useEffect, useState } from "react";
import { renderGiftCard } from "@/lib/renderGiftCard";
import type { TemplateConfig } from "@/lib/templates";

export function useGiftImage(
  template: TemplateConfig,
  img: string | undefined,
  message: string,
  debug = false,
) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const url = await renderGiftCard({ template, img, message, debug });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) {
          setDataUrl(null);
          console.error("No se pudo componer el regalo");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [template, img, message, debug]);

  return { dataUrl, busy };
}