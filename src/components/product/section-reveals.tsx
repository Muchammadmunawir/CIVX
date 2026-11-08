"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./section-reveals.module.css";

type SectionRevealsProps = {
  children: ReactNode;
  className: string;
  selector?: string;
};

const interactiveSelector = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable='true']";

/** Adds entrances to existing server-rendered content without a hidden waiting state. */
export function SectionReveals({ children, className, selector = "[data-reveal]" }: SectionRevealsProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window) || !("matchMedia" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        if (!target.dataset.revealState) target.dataset.revealState = "revealed";
        observer.unobserve(target);
      }
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    for (const target of targets) {
      // Actions stay opaque, including during the small stagger before an entrance.
      if (target.matches(interactiveSelector) || target.querySelector(interactiveSelector)) {
        target.dataset.revealInteractive = "true";
      }
      if (target.contains(document.activeElement)) target.dataset.revealState = "done";
      else if (!target.dataset.revealState) observer.observe(target);
    }

    function settleInteraction(event: Event) {
      if (!(event.target instanceof Node)) return;
      for (const target of targets) {
        if (!target.contains(event.target)) continue;
        target.dataset.revealState = "done";
        observer.unobserve(target);
      }
    }

    function settleReducedMotion() {
      if (!motion.matches) return;
      observer.disconnect();
      for (const target of targets) target.dataset.revealState = "done";
    }

    root.addEventListener("focusin", settleInteraction);
    root.addEventListener("pointerdown", settleInteraction, true);
    motion.addEventListener("change", settleReducedMotion);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", settleInteraction);
      root.removeEventListener("pointerdown", settleInteraction, true);
      motion.removeEventListener("change", settleReducedMotion);
    };
  }, [selector]);

  return <main ref={rootRef} className={`${className} ${styles.root}`}>{children}</main>;
}
