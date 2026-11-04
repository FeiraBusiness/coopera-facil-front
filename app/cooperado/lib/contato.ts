// Contatos de WhatsApp da área do cooperado, configuráveis por variável de ambiente (Netlify / .env.local).
// NEXT_PUBLIC_WHATSAPP_TECNICO: técnico da cooperativa, para dúvidas e renovação.
// NEXT_PUBLIC_WHATSAPP_ENVIO: número que recebe os PDFs (o mesmo do webhook). Sem ele, o botão de envio some.

const TECNICO = process.env.NEXT_PUBLIC_WHATSAPP_TECNICO ?? '5545991351089';
const ENVIO = process.env.NEXT_PUBLIC_WHATSAPP_ENVIO ?? '';

function whatsappLink(numero: string, mensagem?: string) {
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
  return `https://wa.me/${numero.replace(/\D/g, '')}${texto}`;
}

export function linkTecnico(mensagem?: string) {
  return whatsappLink(TECNICO, mensagem);
}

export function linkEnvio(): string | null {
  return ENVIO ? whatsappLink(ENVIO) : null;
}