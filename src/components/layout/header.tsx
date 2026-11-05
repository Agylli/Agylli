"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { marketing } from "@/config/marketing";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return <>
    <div className="announcement"><span>{marketing.announcement}</span><Link href="/atacado">{marketing.announcementLink} <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="wordmark" aria-label="Agylli Cosméticos — início" onClick={() => setOpen(false)}>{brand.wordmark}<span>COSMÉTICOS</span></Link>
        <nav aria-label="Navegação principal" className="desktop-nav">
          {brand.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <Link className="header-shop" href={brand.links.retail}>Conheça a loja <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
      <nav id="mobile-navigation" className="mobile-nav" aria-label="Navegação móvel" hidden={!open}>
        {brand.navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}<ArrowUpRight size={18} aria-hidden="true" /></Link>)}
        <Link href={brand.links.retail} className="mobile-shop" onClick={() => setOpen(false)}>Comprar no varejo<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </nav>
    </header>
  </>;
}
