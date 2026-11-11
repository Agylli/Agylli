import Link from "next/link";
import { ActionLink } from "@/components/ui/action-link";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { resellerPortal } from "@/config/reseller";
import { brand } from "@/config/brand";
import { wholesaleContent } from "@/config/content";

/** Campaign entry and discoverable access to the authenticated reseller portal. */
export function WholesaleAccess() {
  const portalReady = !!supabaseSettings();
  const content = wholesaleContent.access;

  return (
    <section
      id="cadastro-atacado"
      className="container wholesale-access"
      aria-labelledby="wholesale-access-heading"
    >
      <div>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="wholesale-access-heading">{content.title}</h2>
        <p>
          {portalReady
            ? "Crie seu acesso e acompanhe pedidos, compras confirmadas e materiais da sua parceria. Os cadastros são analisados pela equipe Agylli."
            : content.preparing}
        </p>
      </div>
      <div className="wholesale-access-actions">
        <ActionLink href={resellerPortal.signup}>{brand.labels.request}</ActionLink>
        <p className="small-note">
          {portalReady ? content.availableNote : content.preparingNote}
        </p>
        <Link href={resellerPortal.login} className="button button-secondary">
          Já sou revendedor: acessar minha área
        </Link>
        <Link href="/contato?assunto=revenda" className="inline-link">
          Preciso de ajuda com meu cadastro
        </Link>
        {brand.links.wholesale.startsWith("https://") && (
          <ActionLink href={brand.links.wholesale} variant="text">
            Acessar atacado na Nuvemshop
          </ActionLink>
        )}
        <Link href="/onde-atuamos" className="inline-link">
          {content.locationAction}
        </Link>
      </div>
    </section>
  );
}
