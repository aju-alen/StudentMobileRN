export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export function isArPath(pathname: string): boolean {
  return pathname === "/ar" || pathname.startsWith("/ar/");
}

export function getLocaleFromPath(pathname: string): Locale {
  return isArPath(pathname) ? "ar" : "en";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/ar") return "/";
  if (pathname.startsWith("/ar/")) {
    const rest = pathname.slice(3);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}

export function withLocale(path: string, locale: Locale): string {
  if (
    path.startsWith("http") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  let base = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  if (!base) base = "/";
  if (!base.startsWith("/")) base = `/${base}`;

  if (locale === "en") return `${base}${hash}`;
  if (base === "/") return `/ar${hash}`;
  return `/ar${base}${hash}`;
}

export function switchLocalePath(pathname: string, next: Locale): string {
  return withLocale(stripLocalePrefix(pathname), next);
}
