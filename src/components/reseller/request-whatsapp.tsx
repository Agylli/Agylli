"use client";
import { useState } from "react";
import { MessageCircle, Copy } from "lucide-react";
import type { PortalRequest } from "@/lib/reseller/types";
import { requestWhatsApp } from "@/lib/reseller/whatsapp";
export function RequestWhatsApp({ order, name, siteUrl, approved }: { order: PortalRequest; name: string; siteUrl?: string; approved: boolean }) {
  const [copied,setCopied] = useState(false), [copyFailed,setCopyFailed] = useState(false);
  const prepared = requestWhatsApp(order,name,siteUrl);
  if (!prepared || !approved || order.status === "cancelado" || order.status === "entregue") return null;
  return <section className="portal-detail-card portal-whatsapp" aria-labelledby="whatsapp-order-heading">
    <p className="eyebrow">SEU PRÓXIMO PASSO</p><h2 id="whatsapp-order-heading">Combine seu desconto com a loja.</h2>
    <p>Seu pedido já está registrado no portal. Abra o WhatsApp e toque em Enviar para compartilhar a seleção e combinar desconto, valor final e entrega.</p>
    {prepared.shortened && <p className="portal-hint">Como a lista é extensa, o WhatsApp receberá um resumo com o link do pedido. Você também pode copiar a lista completa abaixo.</p>}
    <div className="portal-actions">
      <a className="button button-primary" href={prepared.url} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Enviar pedido pelo WhatsApp</a>
      <button className="button button-secondary" type="button" onClick={async () => { try { await navigator.clipboard.writeText(prepared.message);setCopied(true);setCopyFailed(false); } catch {setCopyFailed(true);} }}><Copy size={17} aria-hidden="true" />Copiar resumo</button>
    </div>
    {copied && <p className="portal-hint" role="status">Resumo copiado. Cole na conversa com a loja.</p>}
    {copyFailed && <p className="portal-hint" role="status">Selecione e copie o texto em “Ver mensagem do pedido”.</p>}
    <details className="portal-whatsapp-message"><summary>Ver mensagem do pedido</summary><label htmlFor="whatsapp-message" className="portal-sr-only">Mensagem para a loja</label><textarea id="whatsapp-message" readOnly value={prepared.message} rows={8} /></details>
    <p className="portal-hint">Abrir o WhatsApp não confirma o envio da mensagem nem conclui a compra. Você continua acompanhando o atendimento por aqui.</p>
  </section>;
}
