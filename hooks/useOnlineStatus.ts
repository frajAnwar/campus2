"use client";

export function useOnlineStatus() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
