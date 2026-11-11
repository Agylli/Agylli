import Link from "next/link";
import { ActionLink } from "@/components/ui/action-link";
import { supabaseSettings } from "@/integrations/supabase/settings";
import { resellerPortal } from "@/config/reseller";
import { brand } from "@/config/brand";
import { wholesaleContent } from "@/config/content";

/** Campaign entry and discoverable access to the authenticated reseller portal. */
export function WholesaleAccess() {
  const portalReady = !!supabaseSettings();
  const online = portalReady || brand.links.wholesale.startsWith("https://");
  const registrationHref = portalReady
    ? resellerPortal.signup
    : brand.links.wholesale;
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
            : online
              ? content.available
              : content.preparing}
        </p>
      </div>
      <div className="wholesale-access-actions">
        <ActionLink href={registrationHref}>{brand.labels.request}</ActionLink>
        <p className="small-note">
          {online ? content.availableNote : content.preparingNote}
        </p>
        <Link href="/revendedor/entrar" className="inline-link">
          Já sou revendedor: acessar minha área
        </Link>
        <Link href="/revendedor/cadastro" className="inline-link">
          Conhecer o cadastro online
        </Link>
        <Link href="/onde-atuamos" className="inline-link">
          {content.locationAction}
        </Link>
      </div>
    </section>
  );
}
