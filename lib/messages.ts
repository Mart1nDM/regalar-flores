export const MESSAGE_MAX_LENGTH = 200;

export const MESSAGES: string[] = [
  "Para la persona que hace que mi primavera dure todo el año. 🌼",
  "Cada día a tu lado es un día de primavera.",
  "Te mando estas flores como un rayito de sol para tu corazón.",
  "Que estas flores te recuerden lo mucho que te quiero.",
  "Feliz primavera, mi persona favorita del planeta.",
  "Sos mi razón para sonreír cada mañana.",
  "Si las flores pudieran hablar, te dirían todo lo que no me animo.",
  "Gracias por florecer a mi lado, siempre.",
  "La primavera me trajo un regalo: conocerte.",
  "Estas flores son como vos: únicas y llenas de luz.",
  "Para que tengas un pedacito de sol en tu día.",
  "Me gusta la primavera, pero me gustás más vos.",
  "Te regalo flores para que nunca te falte un motivo para sonreír.",
  "De todas las flores del jardín, elijo quedarme con vos.",
  "Que hoy sea tan brillante como la sonrisa que me regalás.",
];

export function randomMessage(): string {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function clipMessage(text: string): string {
  return text.length > MESSAGE_MAX_LENGTH
    ? text.slice(0, MESSAGE_MAX_LENGTH)
    : text;
}