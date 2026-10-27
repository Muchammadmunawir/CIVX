"use client";

import { useSyncExternalStore } from "react";
import { getThemePreference, isThemePreference, setThemePreference, subscribeToTheme } from "./theme";

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribeToTheme, getThemePreference, () => "system");
  return (
    <label className="civx-theme">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {preference === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
          : preference === "dark" ? <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
            : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>}
      </svg>
      <span className="civx-sr-only">Color theme</span>
      <select value={preference} onChange={(event) => {
        if (isThemePreference(event.target.value)) setThemePreference(event.target.value);
      }}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
