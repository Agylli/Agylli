import Link from "next/link";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { requirePortal } from "@/lib/reseller/session";
import {
  PortalShell,
  PortalUnavailable,
  EmptyState,
  RequestList,
  Pagination,
  pageNumber,
} from "@/components/reseller/shell";
import { ActionForm } from "@/components/reseller/action-form";
import {
  updateProfileStatus,
  publishMaterial,
  toggleMaterial,
} from "./actions";
import { profileStatuses, materialCategories } from "@/config/reseller";
import { locations } from "@/config/locations";
import type {
  PortalRequest,
  PortalProfile,
  PortalResource,
} from "@/lib/reseller/types";
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; pagina?: string }>;
}) {
  if (!supabaseSettings()) return <PortalUnavailable />;
  const session = await requirePortal(true),
    query = await searchParams,
    tab = ["cadastros", "materiais"].includes(query.aba ?? "")
      ? query.aba!
      : "pedidos";
  const page = pageNumber(query.pagina),
    offset = (page - 1) * 20;
  let content;
  if (tab === "cadastros") {
    const result = await session.db
      .from("reseller_profiles")
      .select("id,name,email,phone,unit_id,status")
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);
    const profiles = (result.data ?? []) as PortalProfile[];
    content = (
      <>
        <div className="portal-heading">
          <h1>Cadastros de revendedores.</h1>
          <p>
            Confira os dados e a confirmação de e-mail antes de liberar o acesso
            comercial.
          </p>
        </div>
        {result.error ? (
          <TeamLoadError />
        ) : !profiles.length ? (
          <EmptyState title="Nenhum cadastro recebido.">
            <p>Os novos cadastros aparecerão aqui para análise.</p>
          </EmptyState>
        ) : (
          <>
            <div className="portal-order-list">
              {profiles.slice(0, 20).map((profile) => (
                <article key={profile.id} className="portal-order-card">
                  <span className="portal-badge">
                    {profileStatuses[profile.status]}
                  </span>
                  <h2>{profile.name}</h2>
                  <p>
                    {profile.email}
                    <br />
                    {profile.phone}
                    <br />
                    {
                      locations.find((unit) => unit.id === profile.unit_id)
                        ?.name
                    }
                  </p>
                  <ActionForm
                    action={updateProfileStatus}
                    label="Atualizar cadastro"
                    className="portal-inline-form"
                  >
                    <input name="id" type="hidden" value={profile.id} />
                    <label htmlFor={`profile-${profile.id}`}>
                      Status do cadastro
                      <select
                        id={`profile-${profile.id}`}
                        name="status"
                        defaultValue={profile.status}
                      >
                        {Object.entries(profileStatuses).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  </ActionForm>
                </article>
              ))}
            </div>
            <Pagination
              page={page}
              hasNext={profiles.length > 20}
              base="/equipe?aba=cadastros"
            />
          </>
        )}
      </>
    );
  } else if (tab === "materiais") {
    const result = await session.db
      .from("reseller_resources")
      .select("id,title,description,category,file_path,active,created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);
    const resources = (result.data ?? []) as PortalResource[];
    content = (
      <>
        <div className="portal-heading">
          <h1>Materiais da parceria.</h1>
          <p>Publique somente conteúdo e condições aprovados pela Agylli.</p>
        </div>
        <section className="portal-detail-card">
          <h2>Disponibilizar conteúdo</h2>
          <ActionForm
            action={publishMaterial}
            label="Publicar para revendedores"
          >
            <label htmlFor="material-title">
              Título
              <input
                id="material-title"
                name="title"
                minLength={3}
                maxLength={120}
                required
              />
            </label>
            <label htmlFor="material-category">
              Tipo de conteúdo
              <select
                id="material-category"
                name="category"
                defaultValue="catalogo"
              >
                {Object.entries(materialCategories).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="material-description">
              Descrição e condições
              <textarea
                id="material-description"
                name="description"
                rows={3}
                maxLength={1000}
                required
              />
            </label>
            <label htmlFor="material-file">
              Arquivo
              <input
                id="material-file"
                name="file"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
              />
              <span className="portal-hint">
                PDF, JPG, PNG ou WebP de até 3 MB. Para benefício sem anexo,
                deixe o arquivo vazio.
              </span>
            </label>
            <label className="portal-checkbox">
              <input name="authorized" type="checkbox" required />
              <span>
                Confirmo que o conteúdo, as condições comerciais e o uso do
                arquivo estão autorizados pela Agylli.
              </span>
            </label>
          </ActionForm>
        </section>
        {result.error ? (
          <TeamLoadError />
        ) : (
          <>
            <div className="portal-resource-grid">
              {resources.slice(0, 20).map((resource) => (
                <article key={resource.id} className="portal-resource">
                  <span className="portal-badge">
                    {materialCategories[resource.category]} ·{" "}
                    {resource.active ? "Disponível" : "Retirado"}
                  </span>
                  <h2>{resource.title}</h2>
                  <p>{resource.description}</p>
                  <ActionForm
                    action={toggleMaterial}
                    label={
                      resource.active
                        ? "Retirar da área"
                        : "Disponibilizar novamente"
                    }
                  >
                    <input type="hidden" name="id" value={resource.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={String(!resource.active)}
                    />
                  </ActionForm>
                </article>
              ))}
            </div>
            {!resources.length && (
              <EmptyState title="A biblioteca está pronta para receber conteúdo.">
                <p>
                  Os materiais publicados ficam disponíveis apenas para os
                  revendedores aprovados.
                </p>
              </EmptyState>
            )}
            <Pagination
              page={page}
              hasNext={resources.length > 20}
              base="/equipe?aba=materiais"
            />
          </>
        )}
      </>
    );
  } else {
    const result = await session.db
      .from("reseller_requests")
      .select(
        "id,user_id,unit_id,status,notes,created_at,updated_at,reseller_request_items(name,sku,quantity)",
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + 20);
    const orders = (result.data ?? []) as PortalRequest[];
    content = (
      <>
        <div className="portal-heading">
          <p className="eyebrow">DA SOLICITAÇÃO À ENTREGA</p>
          <h1>Atendimento da loja.</h1>
          <p>
            Confira os produtos, combine as condições com o revendedor e
            atualize cada etapa do atendimento.
          </p>
          <Link href="/equipe?aba=cadastros" className="inline-link">
            Analisar novos cadastros
          </Link>
        </div>
        {result.error ? (
          <TeamLoadError />
        ) : (
          <>
            <RequestList orders={orders.slice(0, 20)} staff />
            <Pagination
              page={page}
              hasNext={orders.length > 20}
              base="/equipe?aba=pedidos"
            />
          </>
        )}
      </>
    );
  }
  return (
    <PortalShell
      name={session.profile?.name ?? "equipe Agylli"}
      staff
      tab={tab}
    >
      {content}
    </PortalShell>
  );
}
function TeamLoadError() {
  return (
    <p className="portal-message error" role="alert">
      Não foi possível carregar os dados. Confira a ativação da área e tente
      novamente.
    </p>
  );
}
