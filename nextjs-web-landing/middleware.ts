import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isArPath } from "@/lib/i18n/locale";

const AR_REWRITE_ROOTS = new Set([
  "privacy-policy",
  "terms-of-use",
  "child-safeguarding-policy",
  "parent-guides",
  "exam-preparation",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = isArPath(pathname) ? "ar" : "en";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  if (locale === "ar" && pathname.startsWith("/ar/")) {
    const rest = pathname.slice(3);
    const first = rest.split("/").filter(Boolean)[0];
    if (first && AR_REWRITE_ROOTS.has(first)) {
      const url = request.nextUrl.clone();
      url.pathname = rest.startsWith("/") ? rest : `/${rest}`;
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next|assets|favicon.ico|.*\\..*).*)"],
};
