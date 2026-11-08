"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { getThemePreference, setThemePreference, subscribeToTheme, type ThemePreference } from "./theme";
import styles from "./theme-toggle.module.css";

const options: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
  { value: "system", label: "Sistem" },
];

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribeToTheme, getThemePreference, () => "system");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const isOpen = activeIndex !== null;
  const selectedIndex = options.findIndex((option) => option.value === preference);

  useEffect(() => {
    if (activeIndex !== null) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [isOpen]);

  function closeAndFocusTrigger() {
    setActiveIndex(null);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "ArrowUp" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocusTrigger();
    } else if (event.key === "Tab") {
      // Let native Tab navigation continue from the trigger, without trapping focus.
      closeAndFocusTrigger();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => ((index ?? selectedIndex) + step + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const index = options.findIndex((option) => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
      if (index !== -1) {
        event.preventDefault();
        setActiveIndex(index);
      }
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Tema tampilan"
        aria-describedby={`${id}-value`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-menu` : undefined}
        onClick={() => setActiveIndex(isOpen ? null : selectedIndex)}
        onKeyDown={handleTriggerKeyDown}
      >
        <svg className={styles.themeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {preference === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
            : preference === "dark" ? <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
              : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
        </svg>
        <span id={`${id}-value`} className={styles.value}>{options[selectedIndex].label}</span>
        <svg className={styles.chevron} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {isOpen && (
        <div id={`${id}-menu`} className={styles.menu} role="menu" aria-label="Tema tampilan" onKeyDown={handleMenuKeyDown}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="menuitemradio"
              aria-checked={preference === option.value}
              tabIndex={-1}
              className={styles.option}
              onClick={() => {
                setThemePreference(option.value);
                closeAndFocusTrigger();
              }}
            >
              <span>{option.label}</span>
              <svg className={styles.check} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m3 8 3 3 7-7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
