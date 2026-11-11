import type { RequestedItem } from "@/lib/reseller/validation";
import { locations } from "@/config/locations";
import { requestReference } from "@/lib/reseller/types";
export type RequestMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  items: RequestedItem[];
  notes: string;
  origin: string;
};
export function requestEmail(message: RequestMessage) {
  const unit = locations.find((unit) => unit.id === message.unit);
  return {
    subject: `Nova solicitação de revenda ${requestReference(message.id)}`,
    text: [
      "NOVA SOLICITAÇÃO DE REVENDEDOR",
      `Referência: ${message.id}`,
      `Unidade: ${unit?.name ?? message.unit}`,
      `Revendedor: ${message.name}`,
      `E-mail: ${message.email}`,
      `Telefone: ${message.phone}`,
      "",
      ...message.items.map(
        (item) =>
          `${item.quantity} x ${item.name}${item.sku ? ` (código ${item.sku})` : ""}`,
      ),
      "",
      `Observações: ${message.notes || "Nenhuma"}`,
      "",
      "Confira o cadastro e atualize o atendimento no painel:",
      `${message.origin}/equipe/pedidos/${message.id}`,
      "",
      "Esta é uma solicitação. Valores, disponibilidade e entrega serão confirmados pela loja. Nenhum pagamento foi realizado pelo portal.",
    ].join("\n"),
  };
}
