import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Package, BookOpen, ShoppingBag } from "lucide-react";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import {
  PortalShell,
  PortalUnavailable,
  ApprovalNotice,
  EmptyState,
  RequestList,
  Pagination,
  pageNumber,
} from "@/components/reseller/shell";
import { resellerPortal, materialCategories } from "@/config/reseller";
import { locations } from "@/config/locations";
import {
  portalDate,
  type PortalRequest,
  type PortalResource,
  type PurchaseRecord,
} from "@/lib/reseller/types";

export default async function ResellerHome({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; pagina?: string; notice?: string }>;
}) {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal(),
    query = await searchParams;
  if (session.staff && !query.aba && query.notice !== "password-updated") redirect("/equipe");
  const tab = ["pedidos", "compras", "materiais", "beneficios", "conta"].includes(
      query.aba ?? "",
    )
      ? query.aba!
      : "inicio";
  const page = pageNumber(query.pagina),
    offset = (page - 1) * 20,
    approved = session.profile?.status === "approved";
  const unit = locations.find((unit) => unit.id === session.profile?.unit_id);
  let content;
  if (tab === "pedidos") {
    const result = await session.db
      .from("reseller_requests")
      .select(
        "id,user_id,unit_id,status,notes,created_at,updated_at,reseller_request_items(name,sku,quantity)",
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);
    const orders = (result.data ?? []) as PortalRequest[];
    content = (
      <>
        <div className="portal-heading">
          <h1>Meus pedidos.</h1>
          <p>
            Acompanhe cada solicitação, do recebimento ao atendimento pela sua
            unidade.
          </p>
          {approved && (
            <Link
              className="button button-primary"
              href="/revendedor/produtos"
            >
              Montar pedido <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
        {result.error ? (
          <LoadError />
        ) : (
          <>
            <RequestList orders={orders.slice(0, 20)} />
            <Pagination
              page={page}
              hasNext={orders.length > 20}
              base="/revendedor?aba=pedidos"
            />
          </>
        )}
      </>
    );
  } else if (tab === "compras") {
    const result = await session.db
      .from("reseller_purchase_records")
      .select("id,purchased_at,source_reference,unit_id,total_brl,summary")
      .eq("user_id", session.user.id)
      .order("purchased_at", { ascending: false })
      .range(offset, offset + 20);
    const purchases = (result.data ?? []) as PurchaseRecord[];
    content = (
      <>
        <div className="portal-heading">
          <h1>Compras confirmadas.</h1>
          <p>
            Registros da loja física vinculados ao seu cadastro. Você acompanha
            as solicitações em “Meus pedidos”.
          </p>
        </div>
        {result.error ? (
          <LoadError />
        ) : !purchases.length ? (
          <EmptyState title="Seu histórico começa com dados confirmados.">
            <p>
              As compras anteriores aparecerão quando forem conferidas e
              vinculadas pela equipe da sua unidade.
            </p>
          </EmptyState>
        ) : (
          <>
            <div className="portal-order-list">
              {purchases.slice(0, 20).map((purchase) => (
                <article className="portal-order-card" key={purchase.id}>
                  <span className="portal-badge">Compra confirmada</span>
                  <h2>{purchase.source_reference}</h2>
                  <p>
                    {portalDate(purchase.purchased_at)} ·{" "}
                    {
                      locations.find((unit) => unit.id === purchase.unit_id)
                        ?.city
                    }
                  </p>
                  <p>{purchase.summary}</p>
                  <strong>
                    {purchase.total_brl === null
                      ? "Consulte o comprovante da loja"
                      : new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(purchase.total_brl))}
                  </strong>
                </article>
              ))}
            </div>
            <Pagination
              page={page}
              hasNext={purchases.length > 20}
              base="/revendedor?aba=compras"
            />
          </>
        )}
      </>
    );
  } else if (tab === "materiais" || tab === "beneficios") {
    const result = approved
      ? await session.db
          .from("reseller_resources")
          .select("id,title,description,category,file_path,active,created_at")
          .eq("active", true)
          .in(
            "category",
            tab === "beneficios" ? ["beneficio"] : ["catalogo", "divulgacao"],
          )
          .order("created_at", { ascending: false })
          .range(offset, offset + 20)
      : { data: [], error: null };
    const resources = (result.data ?? []) as PortalResource[];
    content = (
      <>
        <div className="portal-heading">
          <h1>
            {tab === "beneficios"
              ? "Sua parceria tem apoio."
              : "Conteúdo para a sua revenda."}
          </h1>
          <p>
            {tab === "beneficios"
              ? "Conheça as oportunidades e as condições disponibilizadas pela equipe para seu cadastro."
              : "Catálogos e materiais autorizados, prontos para consultar e divulgar."}
          </p>
        </div>
        {tab === "beneficios" && (
          <div className="portal-feature-grid">
            {resellerPortal.benefits.map((benefit) => (
              <article className="portal-feature" key={benefit.title}>
                <h2>{benefit.title}</h2>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        )}
        {result.error ? (
          <LoadError />
        ) : resources.length ? (
          <>
            <div className="portal-resource-grid">
              {resources.slice(0, 20).map((resource) => (
                <article key={resource.id} className="portal-resource">
                  <span className="portal-badge">
                    {materialCategories[resource.category]}
                  </span>
                  <h2>{resource.title}</h2>
                  <p>{resource.description}</p>
                  {resource.file_path && (
                    <a
                      className="inline-link"
                      href={`/revendedor/materiais/${resource.id}`}
                    >
                      Baixar material{" "}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
                </article>
              ))}
            </div>
            <Pagination
              page={page}
              hasNext={resources.length > 20}
              base={`/revendedor?aba=${tab}`}
            />
          </>
        ) : (
          <EmptyState
            title={
              tab === "beneficios"
                ? "Novidades da parceria, por aqui."
                : "Os materiais serão disponibilizados aqui."
            }
          >
            <p>
              {approved
                ? "A equipe ainda não publicou conteúdo nesta seção. Você pode falar com sua unidade para consultar a disponibilidade."
                : "O conteúdo comercial fica disponível depois da aprovação do cadastro."}
            </p>
          </EmptyState>
        )}
      </>
    );
  } else if (tab === "conta") {
    content = (
      <>
        <div className="portal-heading">
          <h1>Minha conta.</h1>
          <p>Seus dados de acesso e sua unidade de atendimento.</p>
        </div>
        <dl className="portal-account">
          <div>
            <dt>Nome</dt>
            <dd>{session.profile?.name ?? "Aguardando conferência"}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{session.profile?.phone ?? "Aguardando conferência"}</dd>
          </div>
          <div>
            <dt>Unidade</dt>
            <dd>{unit?.name ?? "Aguardando conferência"}</dd>
          </div>
        </dl>
        <div className="portal-actions">
          <Link
            className="button button-secondary"
            href="/revendedor/recuperar-senha"
          >
            Alterar minha senha
          </Link>
          <Link className="inline-link" href="/contato?assunto=revenda">
            Corrigir dados ou encerrar cadastro
          </Link>
          {session.staff && (
            <Link className="inline-link" href="/equipe">
              Abrir painel da equipe
            </Link>
          )}
        </div>
      </>
    );
  } else {
    const [requests, purchases] = await Promise.all([
      session.db
        .from("reseller_requests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .not("status", "in", "(entregue,cancelado)"),
      session.db
        .from("reseller_purchase_records")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id),
    ]);
    content = (
      <>
        <div className="portal-heading">
          <p className="eyebrow">A GENTE CAMINHA COM VOCÊ</p>
          <h1>
            Seu negócio.
            <br />
            <em>Nossa conexão.</em>
          </h1>
          <p>
            Pedidos, materiais e atendimento: acompanhe sua parceria com a
            Agylli em um só lugar.
          </p>
          {approved && (
            <Link
              className="button button-primary"
              href="/revendedor/produtos"
            >
              Escolher produtos <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="portal-feature-grid">
          <Link className="portal-feature" href="/revendedor?aba=pedidos">
            <Package aria-hidden="true" />
            <strong className="portal-metric">
              {requests.error ? "—" : (requests.count ?? 0)}
            </strong>
            <h2>Pedidos em atendimento</h2>
            <p>Consulte o andamento das solicitações.</p>
          </Link>
          <Link className="portal-feature" href="/revendedor?aba=compras">
            <ShoppingBag aria-hidden="true" />
            <strong className="portal-metric">
              {purchases.error ? "—" : (purchases.count ?? 0)}
            </strong>
            <h2>Compras confirmadas</h2>
            <p>Seu histórico vinculado pela loja física.</p>
          </Link>
          <Link className="portal-feature" href="/revendedor?aba=materiais">
            <BookOpen aria-hidden="true" />
            <h2>Inspiração para revender</h2>
            <p>Encontre catálogos e materiais de divulgação.</p>
          </Link>
        </div>
        <div className="portal-unit-card">
          <div>
            <p className="eyebrow">SUA UNIDADE DE ATENDIMENTO</p>
            <h2>{unit?.name ?? "Agylli, perto de você."}</h2>
            <p>
              Depois de enviar, acompanhe a solicitação por aqui. A loja
              confirma os valores, a disponibilidade e a entrega.
            </p>
          </div>
          <Link
            href={unit?.whatsapp.href ?? "/contato"}
            className="button button-secondary"
          >
            Conversar com a equipe
          </Link>
        </div>
      </>
    );
  }
  return (
    <PortalShell name={session.profile?.name ?? "revendedor"} tab={tab}>
      {session.staff && <aside className="portal-message" role="status"><strong>Área pessoal da sua conta.</strong><p>Para administrar cadastros, produtos e solicitações, abra o painel da equipe.</p><Link href="/equipe">Abrir painel da equipe</Link></aside>}
      <ApprovalNotice status={session.profile?.status} />
      {session.staffError && <p className="portal-message error" role="alert">Não foi possível verificar sua permissão de equipe agora. Tente abrir o painel novamente em instantes.</p>}
      {query.notice === "password-updated" && (
        <p className="portal-message" role="status">
          Sua senha foi atualizada.
        </p>
      )}
      {query.notice === "restricted" && !session.staff && (
        <p className="portal-message" role="status">
          O painel da equipe é reservado aos funcionários autorizados.
        </p>
      )}
      {session.profileError ? <LoadError /> : content}
    </PortalShell>
  );
}
function LoadError() {
  return (
    <p className="portal-message error" role="alert">
      Não foi possível carregar esta seção. Tente novamente em instantes ou fale
      com sua unidade.
    </p>
  );
}
