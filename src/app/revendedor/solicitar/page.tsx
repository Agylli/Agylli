import Link from "next/link";
import { randomUUID } from "node:crypto";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import {
  PortalShell,
  PortalUnavailable,
  ApprovalNotice,
} from "@/components/reseller/shell";
import { RequestForm } from "@/components/reseller/request-form";
export default async function NewRequestPage() {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal();
  return (
    <PortalShell name={session.profile?.name ?? "revendedor"} tab="pedidos">
      <Link href="/revendedor?aba=pedidos" className="inline-link">
        Voltar para meus pedidos
      </Link>
      <div className="portal-heading">
        <p className="eyebrow">ESCOLHA SEU PRÓXIMO PASSO</p>
        <h1>Uma nova solicitação.</h1>
        <p>
          Informe um produto pelo nome ou código. A loja física confere a
          disponibilidade, o desconto e a entrega no atendimento.
        </p>
        <Link href="/revendedor/produtos" className="inline-link">Prefiro escolher pelo catálogo de produtos</Link>
      </div>
      <ApprovalNotice status={session.profile?.status} />
      {session.profile?.status === "approved" && (
        <RequestForm token={randomUUID()} unit={session.profile.unit_id} />
      )}
    </PortalShell>
  );
}
