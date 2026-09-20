const MAX_DIM = 1400;
const QUALITY = 0.9;

const FIT_CAPS = [640, 480, 360, 288, 224, 176, 132];
const FIT_QUALITIES = [0.7, 0.62, 0.55, 0.48, 0.42];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("no se pudo leer la imagen"));
    img.src = src;
  });
}

function drawJpeg(
  img: HTMLImageElement,
  maxDim: number,
  quality: number,
): string {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    loadImage(objectUrl)
      .then((img) => {
        URL.revokeObjectURL(objectUrl);
        const dataUrl = drawJpeg(img, MAX_DIM, QUALITY);
        resolve(dataUrl);
      })
      .catch((err: unknown) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      });
  });
}

export async function fitDataUrlToBudget(
  src: string,
  maxChars: number,
): Promise<string> {
  const img = await loadImage(src);
  let fallback = src;
  for (const cap of FIT_CAPS) {
    for (const quality of FIT_QUALITIES) {
      const dataUrl = drawJpeg(img, cap, quality);
      if (!dataUrl) continue;
      fallback = dataUrl;
      if (dataUrl.length <= maxChars) return dataUrl;
    }
  }
  return fallback;
}