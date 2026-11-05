import type { Metadata, Viewport } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  metadataBase: brand.links.site ? new URL(brand.links.site) : undefined,
  title: { default: "Agylli Cosméticos | Beleza para você e seu negócio", template: "%s | Agylli Cosméticos" },
  description: brand.description,
  applicationName: brand.name,
  openGraph: { type: "website", locale: "pt_BR", siteName: brand.name, title: brand.name, description: brand.description },
  twitter: { card: "summary_large_image" },
  robots: { index: !!brand.links.site, follow: !!brand.links.site },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fcf9f6" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><Header /><main id="conteudo" tabIndex={-1}>{children}</main><Footer /></body></html>;
}
