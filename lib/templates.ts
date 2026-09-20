// Coordenadas de calibrado. Se expresan en PÍXELES del canvas exportado
// (1696 x 2528 = plantilla 848 x 1264 a escala 2x).
//
// Para calibrarlas: entrá a /crear/<id>?calib=1 (o /regalo/<id>?calib=1).
// Se dibujan dos cajas punteadas encima de la plantilla con sus valores:
//   - roja   = photoBox (recuadro interior de la polaroid, al aire libre)
//   - azul   = textBox  (recuadro amarillo ondulado del mensaje)
// Ajustá los 4 números de cada caja, refrescá y fijate dónde caen los bordes.

export const CANVAS_W = 1696;
export const CANVAS_H = 2528;

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation?: number;
}

export interface TemplateConfig {
  src: string;
  photoBox: BoxRect | null;
  textBox: BoxRect;
  messageColor: string;
  transparentHole?: boolean;
}

const CON_FOTO_PHOTO_BOX: BoxRect = {
  x: 340,
  y: 575,
  width: 1000,
  height: 915,
  radius: 40,
  rotation: -3.5,
};

const CON_FOTO_TEXT_BOX: BoxRect = {
  x: 660,
  y: 1720,
  width: 820,
  height: 600,
  radius: 32,
};

const SIN_FOTO_TEXT_BOX: BoxRect = {
  x: 660,
  y: 1720,
  width: 820,
  height: 600,
  radius: 32,
};

export const PHOTO_ASPECT = CON_FOTO_PHOTO_BOX.width / CON_FOTO_PHOTO_BOX.height;

export const TEMPLATES: Record<"conFoto" | "sinFoto", TemplateConfig> = {
  conFoto: {
    src: "/plantillas/plantilla-sin-fondo.png",
    photoBox: CON_FOTO_PHOTO_BOX,
    textBox: CON_FOTO_TEXT_BOX,
    messageColor: "#6B4523",
    transparentHole: true,
  },
  sinFoto: {
    src: "/plantillas/formato_sin_foto.jpeg",
    photoBox: null,
    textBox: SIN_FOTO_TEXT_BOX,
    messageColor: "#6B4523",
  },
};