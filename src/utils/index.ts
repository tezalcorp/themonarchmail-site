// Keep Base44-style page routes (case-sensitive) so routes match Pages.jsx
export function createPageUrl(pageName) {
  return "/" + String(pageName || "").replace(/\s+/g, "");
}
