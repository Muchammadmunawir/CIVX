"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./region-overlay.module.css";

export function RegionOverlay({ id, children }: { id: string; children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const backdropPress = useRef(false);
  const activationRef = useRef(0);

  useEffect(() => {
    const dialog = dialogRef.current!;
    activationRef.current += 1;
    closingRef.current = false;
    delete dialog.dataset.closing;
    const origin = document.activeElement;
    const rootOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      activationRef.current += 1;
      dialog.close();
      document.documentElement.style.overflow = rootOverflow;
      document.body.style.overflow = bodyOverflow;
      if (origin instanceof HTMLElement || origin instanceof SVGElement) {
        requestAnimationFrame(() => { if (origin.isConnected) origin.focus({ preventScroll: true }); });
      }
    };
  }, []);


  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    const dialog = dialogRef.current!;
    const activation = activationRef.current;
    dialog.dataset.closing = "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.back();
      return;
    }
    void Promise.all(dialog.getAnimations().map((animation) => animation.finished.catch(() => undefined))).then(() => {
      if (activationRef.current === activation && dialog.open) router.back();
    });
  }

  function outside(event: { clientX: number; clientY: number }) {
    const bounds = dialogRef.current!.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={`region-${id}-context-title`}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          "a[href], button, input, select, textarea, summary, [tabindex]",
        )).filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onPointerDown={(event) => { backdropPress.current = event.target === event.currentTarget && outside(event); }}
      onClick={(event) => {
        if (backdropPress.current && event.target === event.currentTarget && outside(event)) close();
        backdropPress.current = false;
      }}
    >
      <div className={styles.toolbar}>
        <span>Explore <span aria-hidden="true">/</span> Regional record</span>
        <div>
          <a className={styles.fullPage} href={`/regions/${id}`}>Full page <span aria-hidden="true">↗</span></a>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close regional detail">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>
      {children}
    </dialog>
  );
}
