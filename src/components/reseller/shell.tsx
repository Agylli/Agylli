import Link from "next/link";
import { ArrowUpRight, PackageOpen, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { signOut } from "@/app/revendedor/actions";
import { profileStatuses, requestStatuses } from "@/config/reseller";
import type { PortalProfile, PortalRequest } from "@/lib/reseller/types";
import { portalDate, requestReference } from "@/lib/reseller/types";
import { locations } from "@/config/locations";

export function PortalUnavailable() {
  return (
    <section className="container portal-unavailable">
      <span className="eyebrow">ÁREA DO REVENDEDOR</span>
      <h1>
        Sua parceria,
        <br />
        <em>em um só lugar.</em>
      </h1>
      <p>
        Estamos preparando seu acesso a pedidos, histórico e materiais para
        revenda. Enquanto isso, nossa equipe continua disponível em Cândido Sales.
      </p>
      <Link className="button button-primary" href="/contato?assunto=revenda">
        Falar com minha unidade <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <Link href="/revendedor/entrar" className="inline-link">
        Conhecer a área de acesso
      </Link>
    </section>
  );
}
export function PortalShell({
  children,
  name,
  tab = "inicio",
  staff = false,
}: {
  children: ReactNode;
  name: string;
  tab?: string;
  staff?: boolean;
}) {
  const tabs = staff
    ? [
        ["pedidos", "Solicitações"],
        ["cadastros", "Cadastros"],
        ["produtos", "Produtos"],
        ["materiais", "Materiais"],
      ]
    : [
        ["inicio", "Visão geral"],
        ["produtos", "Produtos para revenda"],
        ["pedidos", "Meus pedidos"],
        ["compras", "Compras confirmadas"],
        ["materiais", "Catálogos e materiais"],
        ["beneficios", "Benefícios"],
        ["conta", "Minha conta"],
      ];
  const base = staff ? "/equipe" : "/revendedor";
  return (
    <div className="container portal-app">
      <div className="portal-topline">
        <div>
          <p className="eyebrow">
            {staff ? "PAINEL DA EQUIPE AGYLLI" : "MEU ESPAÇO AGYLLI"}
          </p>
          <p className="portal-welcome">
            Olá, <strong>{name}</strong>.
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="portal-signout">
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
        </form>
      </div>
      <div className="portal-grid">
        <aside className="portal-sidebar">
          <nav
            aria-label={staff ? "Painel da equipe" : "Minha área de revendedor"}
          >
            {tabs.map(([id, label]) => (
              <Link
                key={id}
                href={id === "produtos" ? `${base}/produtos` : `${base}?aba=${id}`}
                aria-current={tab === id ? "page" : undefined}
              >
                {label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="portal-sidebar-note">
            <span>Uma parceria de perto.</span>
            <p>Sua unidade acompanha cada próximo passo.</p>
            <Link href="/onde-atuamos">Fale com a Agylli</Link>
          </div>
          {staff && (
            <Link href="/revendedor" className="inline-link">
              Minha área pessoal
            </Link>
          )}
        </aside>
        <section className="portal-content">{children}</section>
      </div>
    </div>
  );
}
export function ApprovalNotice({
  status,
}: {
  status: PortalProfile["status"] | undefined;
}) {
  if (status === "approved") return null;
  return (
    <aside className="portal-message" role="status">
      <strong>
        {status ? profileStatuses[status] : "Seu acesso precisa ser conferido"}
      </strong>
      <p>
        {status === "suspended"
          ? "Fale com sua unidade para revisar seu acesso."
          : "Após confirmar seu e-mail, aguarde a análise da equipe. Os pedidos e materiais comerciais serão liberados com a aprovação."}
      </p>
      <Link href="/contato?assunto=revenda">Conversar com minha unidade</Link>
    </aside>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="portal-empty">
      <PackageOpen size={32} aria-hidden="true" />
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
export function RequestList({
  orders,
  staff = false,
}: {
  orders: PortalRequest[];
  staff?: boolean;
}) {
  if (!orders.length)
    return (
      <EmptyState title="Nenhum pedido por aqui ainda.">
        <p>
          As solicitações registradas aparecerão aqui com o andamento do
          atendimento.
        </p>
      </EmptyState>
    );
  return (
    <div className="portal-order-list">
      {orders.map((order) => (
        <article key={order.id} className="portal-order-card">
          <div>
            <span className={`portal-badge status-${order.status}`}>
              {requestStatuses[order.status]}
            </span>
            <h2>
              <Link
                href={`${staff ? "/equipe" : "/revendedor"}/pedidos/${order.id}`}
              >
                {requestReference(order.id)}{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </h2>
            <p>
              {portalDate(order.created_at)} ·{" "}
              {locations.find((unit) => unit.id === order.unit_id)?.city}
            </p>
          </div>
          <p>
            {order.reseller_request_items
              .map((item) => `${item.quantity} × ${item.name}`)
              .join(" · ")}
          </p>
          <Link
            className="inline-link"
            href={`${staff ? "/equipe" : "/revendedor"}/pedidos/${order.id}`}
          >
            Acompanhar solicitação
          </Link>
        </article>
      ))}
    </div>
  );
}
export function Pagination({
  page,
  hasNext,
  base,
}: {
  page: number;
  hasNext: boolean;
  base: string;
}) {
  return (
    <nav className="portal-pagination" aria-label="Paginação">
      {page > 1 && <Link href={`${base}&pagina=${page - 1}`}>Anterior</Link>}
      <span>Página {page}</span>
      {hasNext && <Link href={`${base}&pagina=${page + 1}`}>Próxima</Link>}
    </nav>
  );
}
export function pageNumber(value: string | undefined) {
  return value && /^\d{1,4}$/.test(value) ? Math.max(1, Number(value)) : 1;
}
