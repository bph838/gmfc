export function initCopyrightYear() {
  const el = document.getElementById("copyright-year");
  if (!el) return;

  el.textContent = String(new Date().getFullYear());
}

export function initMenuName(name:string) {
  const el = document.getElementById("navbar-brand-site-name");
  if (!el) return;

  el.textContent = name;
}
