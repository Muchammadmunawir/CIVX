export type ThemePreference = "light" | "dark" | "system";

const storageKey = "civx-theme";
const eventName = "civx-theme-change";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = preference === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : preference;
}

export function setThemePreference(preference: ThemePreference) {
  applyTheme(preference);
  try { localStorage.setItem(storageKey, preference); } catch { /* Theme still works when storage is unavailable. */ }
  window.dispatchEvent(new Event(eventName));
}

export function getThemePreference(): ThemePreference {
  const value = document.documentElement.dataset.themePreference ?? null;
  return isThemePreference(value) ? value : "system";
}

export function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (getThemePreference() === "system") applyTheme("system");
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    applyTheme(isThemePreference(event.newValue) ? event.newValue : "system");
    onChange();
  };
  window.addEventListener(eventName, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(eventName, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}

// Runs synchronously before visible content. Only html attributes change before hydration.
export const themeBootScript = `(()=>{let p="system";try{const s=localStorage.getItem("${storageKey}");if(s==="light"||s==="dark"||s==="system")p=s}catch{}const r=document.documentElement;r.dataset.themePreference=p;r.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p})()`;
