import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

export function getPreferredStoreUrl(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent
): string {
  return /Android/i.test(userAgent) ? PLAY_STORE_URL : APP_STORE_URL;
}
