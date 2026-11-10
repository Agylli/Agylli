"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content remains visible without JS or with reduced motion. */
export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.getElementById("conteudo");
    if (!root || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tracked = new Set<HTMLElement>();
    const active = new Map<HTMLElement, Animation>();
    const directions = ["up", "left", "right"] as const;
    function show(element: HTMLElement, animate: boolean) {
      delete element.dataset.revealPending;
      observer.unobserve(element);
      active.get(element)?.cancel();
      if (!animate || preference.matches) return;
      const direction = element.dataset.revealDirection;
      const from = direction === "left" ? "translate3d(-28px,0,0)" : direction === "right" ? "translate3d(28px,0,0)" : "translate3d(0,28px,0)";
      const animation = element.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: "none" }], { duration: 620, easing: "cubic-bezier(.2,.65,.3,1)" });
      active.set(element, animation);
      animation.finished.then(() => active.delete(element)).catch(() => {});
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) show(entry.target as HTMLElement, true);
    }, { threshold: 0.04, rootMargin: "0px 0px -24px 0px" });
    function register() {
      root!.querySelectorAll<HTMLElement>(":scope > section").forEach(element => {
        if (tracked.has(element)) return;
        element.dataset.revealDirection = directions[tracked.size % directions.length];
        tracked.add(element);
        if (preference.matches) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom <= 0) return;
        if (bounds.top < window.innerHeight - 24) show(element, true);
        else { element.dataset.revealPending = "true"; observer.observe(element); }
      });
    }
    function revealAll() {
      if (preference.matches) for (const element of tracked) show(element, false);
    }
    function revealFocused(event: FocusEvent) {
      const section = (event.target as HTMLElement).closest<HTMLElement>("main > section");
      if (section?.hasAttribute("data-reveal-pending")) show(section, false);
    }
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(root, { childList: true });
    root.addEventListener("focusin", revealFocused);
    preference.addEventListener("change", revealAll);
    return () => {
      observer.disconnect(); mutations.disconnect();
      root.removeEventListener("focusin", revealFocused);
      preference.removeEventListener("change", revealAll);
      for (const animation of active.values()) animation.cancel();
      for (const element of tracked) { delete element.dataset.revealPending; delete element.dataset.revealDirection; }
    };
  }, [pathname]);
  return null;
}
