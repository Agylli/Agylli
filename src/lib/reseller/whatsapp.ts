import { locations } from "@/config/locations";
import { publicHttpsUrl } from "@/lib/urls";
import { UUID_PATTERN } from "./validation";
import { requestReference, type PortalRequest } from "./types";
const line = (text: string) => text.replace(/\s+/g, " ").trim();
export function requestWhatsApp(order: PortalRequest, name: string, siteUrl?: string) {
  const unit = locations.find(unit => unit.id === order.unit_id);
  if (!unit || !UUID_PATTERN.test(order.id) || !order.reseller_request_items.length) return null;
  const site = publicHttpsUrl(siteUrl);
  const teamUrl = site ? new URL(`/equipe/pedidos/${order.id}`, new URL(site).origin).href : null;
  const introduction = `Olá! Sou ${line(name)}. Gostaria de atendimento para o pedido ${requestReference(order.id)} da Agylli.`;
  const closing = "Por favor, confirmem a disponibilidade, apliquem o desconto de revendedor vigente e informem o valor final e as condições de entrega antes de concluir a compra.";
  const message = [introduction, "", ...order.reseller_request_items.map(item =>
    `${item.quantity}x ${line(item.name)}${item.sku ? ` — código ${line(item.sku)}` : ""}`),
    "", closing, ...(teamUrl ? ["", `Pedido no painel da equipe (acesso restrito): ${teamUrl}`] : []),
  ].join("\n");
  const fullUrl = `${unit.whatsapp.href}?text=${encodeURIComponent(message)}`;
  const shortened = fullUrl.length > 7500;
  const shortMessage = [introduction, `O pedido tem ${order.reseller_request_items.length} produtos.`, closing,
    ...(teamUrl ? [`Lista completa no painel da equipe: ${teamUrl}`] : ["Enviarei a lista completa nesta conversa."]),
  ].join("\n\n");
  return { message, shortened, url: shortened ? `${unit.whatsapp.href}?text=${encodeURIComponent(shortMessage)}` : fullUrl };
}
