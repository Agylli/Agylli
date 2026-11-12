import { requestStatuses } from "@/config/reseller";
import {
  portalDate,
  requestReference,
  type PortalRequest,
} from "@/lib/reseller/types";
import { locations } from "@/config/locations";
import type { ReactNode } from "react";
export function RequestDetail({
  order,
  events,
  actions,
}: {
  order: PortalRequest;
  events: { status: keyof typeof requestStatuses; created_at: string }[];
  actions?: ReactNode;
}) {
  const unit = locations.find((unit) => unit.id === order.unit_id);
  return (
    <>
      <div className="portal-heading">
        <p className="eyebrow">ACOMPANHE CADA PRÓXIMO PASSO</p>
        <h1>{requestReference(order.id)}</h1>
        <p>
          {portalDate(order.created_at)} · {unit?.name}
        </p>
        <span className={`portal-badge status-${order.status}`}>
          {requestStatuses[order.status]}
        </span>
      </div>
      {actions}
      <section className="portal-detail-card">
        <h2>Produtos solicitados</h2>
        <ul className="portal-items-list">
          {order.reseller_request_items.map((item, index) => (
            <li key={item.id ?? index}>
              <div>
                <strong>{item.name}</strong>
                {item.sku && <span>Código: {item.sku}</span>}
              </div>
              <span>
                {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
              </span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <div className="portal-notes">
            <h3>Observações</h3>
            <p>{order.notes}</p>
          </div>
        )}
        <p className="portal-hint">
          Os valores, a disponibilidade e a entrega serão confirmados pela loja
          física. Uma solicitação registrada não representa pagamento ou compra
          concluída.
        </p>
      </section>
      <section className="portal-detail-card">
        <h2>Andamento do atendimento</h2>
        <ol className="portal-timeline">
          {events.map((event, index) => (
            <li key={index}>
              <strong>{requestStatuses[event.status]}</strong>
              <time dateTime={event.created_at}>
                {portalDate(event.created_at)}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
