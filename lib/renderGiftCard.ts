import { CANVAS_H, CANVAS_W } from "@/lib/templates";
import type { BoxRect, TemplateConfig } from "@/lib/templates";

const FONT_FAMILY = '"Segoe Script", "Segoe Print", "Comic Sans MS", cursive';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`no se pudo cargar ${src}`));
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function renderGiftCard({
  template,
  img,
  message,
  scale = 2,
  debug = false,
}: {
  template: TemplateConfig;
  img?: string;
  message: string;
  scale?: number;
  debug?: boolean;
}): Promise<string> {
  const transparentHole = Boolean(template.transparentHole);
  const W = Math.round((CANVAS_W * scale) / 2);
  const H = Math.round((CANVAS_H * scale) / 2);

  return new Promise(async (resolve, reject) => {
    try {
      const tpl = await loadImage(template.src);

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (!transparentHole) {
        ctx.drawImage(tpl, 0, 0, W, H);
      }

      if (template.photoBox && img) {
        const box = toCanvasSpace(template.photoBox, W, H);
        const drawBox = transparentHole ? growRect(box, 0.14) : box;
        const user = await loadImage(img);
        ctx.save();
        ctx.translate(box.x + box.width / 2, box.y + box.height / 2);
        if (box.rotation) ctx.rotate((box.rotation * Math.PI) / 180);
        if (transparentHole) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            -drawBox.width / 2,
            -drawBox.height / 2,
            drawBox.width,
            drawBox.height,
          );
          drawImageCover9(ctx, user, drawBox);
        } else {
          roundedRectPath(
            ctx,
            -box.width / 2,
            -box.height / 2,
            box.width,
            box.height,
            box.radius,
          );
          ctx.clip();
          drawImageCover9(ctx, user, drawBox);
        }
        ctx.restore();
        if (debug)
          drawDebugBox(
            ctx,
            box,
            "rgba(255,60,60,0.9)",
            `photoBox ${Math.round(box.width)}x${Math.round(box.height)}${box.rotation ? ` rot ${box.rotation}°` : ""}`,
          );
      }

      if (transparentHole) {
        ctx.drawImage(tpl, 0, 0, W, H);
      }

      const tBox = toCanvasSpace(template.textBox, W, H);

      eraseInk(ctx, Math.round(tBox.x), Math.round(tBox.y), Math.round(tBox.width), Math.round(tBox.height));

      const padX = tBox.width * 0.07;
      const padY = tBox.height * 0.1;
      const innerW = tBox.width - padX * 2;
      const innerH = tBox.height - padY * 2;
      const { size, lines, lineHeight } = fitMessage(ctx, message.trim() || "…", innerW, innerH);

      ctx.fillStyle = template.messageColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${size}px ${FONT_FAMILY}`;

      const blockH = Math.max(1, lines.length) * lineHeight;
      let ty = tBox.y + padY + (innerH - blockH) / 2 + lineHeight / 2;
      const centerX = tBox.x + tBox.width / 2;
      for (const line of lines) {
        if (line) ctx.fillText(line, centerX, ty);
        ty += lineHeight;
      }

      if (debug) {
        drawDebugBox(
          ctx,
          tBox,
          "rgba(40,120,255,0.9)",
          `textBox ${Math.round(tBox.width)}x${Math.round(tBox.height)}`,
        );
      }

      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(err);
    }
  });
}

function drawDebugBox(
  ctx: CanvasRenderingContext2D,
  box: BoxRect,
  color: string,
  label: string,
) {
  ctx.save();
  ctx.translate(box.x + box.width / 2, box.y + box.height / 2);
  if (box.rotation) ctx.rotate((box.rotation * Math.PI) / 180);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.setLineDash([20, 16]);
  roundedRectPath(
    ctx,
    -box.width / 2,
    -box.height / 2,
    box.width,
    box.height,
    box.radius,
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.font = "bold 44px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(label, -box.width / 2 + 16, -box.height / 2 + 16);
  ctx.restore();
}

function eraseInk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (w <= 1 || h <= 1) return;
  const imageData = ctx.getImageData(x, y, w, h);
  const d = imageData.data;
  const hist = new Map<string, number>();
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] + d[i + 1] + d[i + 2];
    if (lum > 320) {
      const key = `${d[i] >> 3},${d[i + 1] >> 3},${d[i + 2] >> 3}`;
      hist.set(key, (hist.get(key) ?? 0) + 1);
    }
  }
  let pk = "";
  let pc = 0;
  hist.forEach((count, key) => {
    if (count > pc) {
      pc = count;
      pk = key;
    }
  });
  if (!pk) return;
  const [pr, pg, pb] = pk.split(",").map((v) => Number(v) * 8 + 4);
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] + d[i + 1] + d[i + 2];
    if (lum <= 320) {
      d[i] = pr;
      d[i + 1] = pg;
      d[i + 2] = pb;
    }
  }
  ctx.putImageData(imageData, x, y);
}

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth || !line) {
      line = trial;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitMessage(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
): { size: number; lines: string[]; lineHeight: number } {
  const minSize = 12;
  const startSize = initialFontSize(text.length);
  let size = startSize;
  while (size >= minSize) {
    ctx.font = `${size}px ${FONT_FAMILY}`;
    const paragraphs = text
      .split("\n")
      .map((p) => p.trim().split(/\s+/))
      .filter((p) => p.some(Boolean));
    const lines: string[] = [];
    paragraphs.forEach((words, i) => {
      if (i > 0) lines.push("");
      lines.push(...wrapParagraph(ctx, words, maxWidth));
    });
    const lineHeight = size * 1.4;
    if (lines.length * lineHeight <= maxHeight || size === minSize) {
      return { size, lines, lineHeight };
    }
    size -= 2;
  }
  ctx.font = `${minSize}px ${FONT_FAMILY}`;
  const lineHeight = minSize * 1.4;
  return {
    size: minSize,
    lines: wrapParagraph(ctx, text.split(/\s+/), maxWidth),
    lineHeight,
  };
}

function toCanvasSpace(box: BoxRect, W: number, H: number): BoxRect {
  const kx = W / CANVAS_W;
  const ky = H / CANVAS_H;
  return {
    x: box.x * kx,
    y: box.y * ky,
    width: box.width * kx,
    height: box.height * ky,
    radius: box.radius * kx,
    rotation: box.rotation,
  };
}

function growRect(box: BoxRect, margin: number): BoxRect {
  return {
    x: box.x - box.width * margin,
    y: box.y - box.height * margin,
    width: box.width * (1 + margin * 2),
    height: box.height * (1 + margin * 2),
    radius: box.radius,
    rotation: box.rotation,
  };
}

function initialFontSize(len: number): number {
  if (len <= 60) return 80;
  if (len <= 110) return 66;
  if (len <= 160) return 56;
  return 48;
}

function drawImageCover9(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: BoxRect,
) {
  const w = box.width;
  const h = box.height;
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  let renderWidth: number;
  let renderHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > boxRatio) {
    renderHeight = img.naturalHeight;
    renderWidth = img.naturalHeight * boxRatio;
    offsetX = (img.naturalWidth - renderWidth) / 2;
  } else {
    renderWidth = img.naturalWidth;
    renderHeight = img.naturalWidth / boxRatio;
    offsetY = (img.naturalHeight - renderHeight) / 2;
  }

  ctx.drawImage(
    img,
    offsetX,
    offsetY,
    renderWidth,
    renderHeight,
    -w / 2,
    -h / 2,
    w,
    h,
  );
}