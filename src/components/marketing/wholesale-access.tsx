import Link from "next/link";
import { ActionLink } from "@/components/ui/action-link";
import { brand } from "@/config/brand";
import { wholesaleContent } from "@/config/content";

/** Stable destination for future B2B campaigns, without collecting registration data. */
export function WholesaleAccess() {
  const online = brand.links.wholesale.startsWith("https://");
  const content = wholesaleContent.access;

  return <section id="cadastro-atacado" className="container wholesale-access" aria-labelledby="wholesale-access-heading">
    <div>
      <p className="eyebrow">{content.eyebrow}</p>
      <h2 id="wholesale-access-heading">{content.title}</h2>
      <p>{online ? content.available : content.preparing}</p>
    </div>
    <div className="wholesale-access-actions">
      <ActionLink href={brand.links.wholesale}>{brand.labels.request}</ActionLink>
      <p className="small-note">{online ? content.availableNote : content.preparingNote}</p>
      <Link href="/onde-atuamos" className="inline-link">{content.locationAction}</Link>
    </div>
  </section>;
}
