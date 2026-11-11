"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./section-reveals.module.css";

type SectionRevealsProps = {
  children: ReactNode;
  className: string;
  selector?: string;
  as?: "main" | "div" | "article";
};

const interactiveSelector = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable='true']";

/** Adds entrances to existing server-rendered content without a hidden waiting state. */
export function SectionReveals({ children, className, selector = "[data-reveal]", as: Element = "main" }: SectionRevealsProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window) || !("matchMedia" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const targets = new Set<HTMLElement>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        if (!target.dataset.revealState) target.dataset.revealState = "revealed";
        observer.unobserve(target);
      }
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    function registerTarget(target: HTMLElement) {
      if (targets.has(target)) return;
      targets.add(target);
      // Actions stay opaque, including during the small stagger before an entrance.
      if (target.matches(interactiveSelector) || target.querySelector(interactiveSelector)) {
        target.dataset.revealInteractive = "true";
      }
      if (motion.matches || target.contains(document.activeElement)) target.dataset.revealState = "done";
      else if (!target.dataset.revealState) observer.observe(target);
    }

    function registerSubtree(node: Node) {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(selector)) registerTarget(node);
      node.querySelectorAll<HTMLElement>(selector).forEach(registerTarget);
    }

    root.querySelectorAll<HTMLElement>(selector).forEach(registerTarget);
    // Filters can mount new content groups without remounting the page wrapper.
    const mutations = new MutationObserver(records => {
      for (const target of targets) {
        if (!root.contains(target)) {
          observer.unobserve(target);
          targets.delete(target);
        }
      }
      for (const record of records) record.addedNodes.forEach(registerSubtree);
    });
    mutations.observe(root, { childList: true, subtree: true });

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

    function finishEntrance(event: AnimationEvent) {
      if (event.target instanceof HTMLElement && targets.has(event.target)) {
        event.target.dataset.revealState = "done";
      }
    }

    root.addEventListener("animationend", finishEntrance);
    root.addEventListener("focusin", settleInteraction);
    root.addEventListener("pointerdown", settleInteraction, true);
    motion.addEventListener("change", settleReducedMotion);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.removeEventListener("animationend", finishEntrance);
      root.removeEventListener("focusin", settleInteraction);
      root.removeEventListener("pointerdown", settleInteraction, true);
      motion.removeEventListener("change", settleReducedMotion);
    };
  }, [selector]);

  return <Element ref={(node) => { rootRef.current = node; }} className={`${className} ${styles.root}`}>{children}</Element>;
}
