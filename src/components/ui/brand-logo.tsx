import Image from "next/image";
import { brand } from "@/config/brand";

/** Original logo, preserved without recoloring or redrawing. */
export function BrandLogo() {
  return <Image src={brand.logo.src} alt="" width={brand.logo.width} height={brand.logo.height} className="brand-logo-image" />;
}
