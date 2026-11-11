import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import { UUID_PATTERN } from "@/lib/reseller/validation";
import { PortalShell, PortalUnavailable } from "@/components/reseller/shell";
import { RequestDetail } from "@/components/reseller/request-detail";
import { ActionForm } from "@/components/reseller/action-form";
import { updateRequestStatus, retryNotification } from "@/app/equipe/actions";
import {
  requestStatuses,
  statusTransitions,
  type RequestStatus,
} from "@/config/reseller";
import type { PortalRequest } from "@/lib/reseller/types";
export default async function TeamRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal(true),
    { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const result = await session.db
    .from("reseller_requests")
    .select(
      "id,user_id,unit_id,status,notes,created_at,updated_at,reseller_request_items(id,name,sku,quantity)",
    )
    .eq("id", id)
    .maybeSingle();
  if (result.error || !result.data) notFound();
  const order = result.data as PortalRequest;
  const [profile, events, notification] = await Promise.all([
    session.db
      .from("reseller_profiles")
      .select("name,email,phone")
      .eq("id", order.user_id)
      .maybeSingle(),
    session.db
      .from("reseller_request_events")
      .select("status,created_at")
      .eq("request_id", id)
      .order("created_at"),
    session.db
      .from("reseller_email_notifications")
      .select("status,attempts")
      .eq("request_id", id)
      .maybeSingle(),
  ]);
  const next = statusTransitions[order.status as RequestStatus];
  return (
    <PortalShell name={session.profile?.name ?? "equipe Agylli"} staff>
      <Link className="inline-link" href="/equipe">
        Voltar para solicitações
      </Link>
      <RequestDetail order={order} events={events.data ?? []} />
      <section className="portal-detail-card">
        <h2>Revendedor</h2>
        <p>
          {profile.data?.name}
          <br />
          {profile.data?.email}
          <br />
          {profile.data?.phone}
        </p>
      </section>
      <section className="portal-detail-card">
        <h2>Próximo passo do atendimento</h2>
        {next.length ? (
          <ActionForm action={updateRequestStatus} label="Atualizar andamento">
            <input type="hidden" name="id" value={id} />
            <label htmlFor="request-status">
              Novo andamento
              <select
                id="request-status"
                name="status"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecione a próxima etapa
                </option>
                {next.map((status) => (
                  <option value={status} key={status}>
                    {requestStatuses[status]}
                  </option>
                ))}
              </select>
            </label>
          </ActionForm>
        ) : (
          <p>
            O atendimento foi encerrado. Cancelamentos, devoluções e ajustes
            comerciais devem ser conferidos pela equipe no sistema da loja.
          </p>
        )}
      </section>
      <section className="portal-detail-card">
        <h2>Aviso por e-mail</h2>
        <p>
          {notification.data?.status === "sent"
            ? "O aviso foi enviado à loja."
            : "O aviso ainda não tem envio confirmado. A solicitação permanece disponível neste painel."}
        </p>
        {(notification.data?.attempts ?? 0) >= 5 && (
          <p className="portal-hint">
            O limite de tentativas foi atingido. Confira a configuração e o
            histórico de envios antes de solicitar a liberação de novas
            tentativas ao administrador.
          </p>
        )}
        {notification.data?.status !== "sent" && (
          <ActionForm
            action={retryNotification}
            label="Tentar enviar aviso"
            enabled={(notification.data?.attempts ?? 0) < 5}
          >
            <input type="hidden" name="id" value={id} />
          </ActionForm>
        )}
      </section>
    </PortalShell>
  );
}
