"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let keys: string[] = [];
    let keyTimer: ReturnType<typeof setTimeout>;

    const isInputActive = () => {
      const el = document.activeElement;
      return (
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        (el as HTMLElement)?.contentEditable === "true"
      );
    };

    const handler = (e: KeyboardEvent) => {
      if (isInputActive()) return;

      if (e.key === "/") {
        e.preventDefault();
        (
          document.querySelector(
            "[data-search-input]"
          ) as HTMLInputElement
        )?.focus();
        return;
      }

      if (e.key === "Escape") {
        document.dispatchEvent(new CustomEvent("closeAllModals"));
        return;
      }

      keys.push(e.key.toLowerCase());
      clearTimeout(keyTimer);
      keyTimer = setTimeout(() => (keys = []), 1000);

      const combo = keys.join("");
      if (combo === "gh") {
        router.push("/dashboard");
        keys = [];
      }
      if (combo === "gf") {
        router.push("/forum");
        keys = [];
      }
      if (combo === "gp") {
        router.push("/projects");
        keys = [];
      }
      if (combo === "gc") {
        router.push("/classes");
        keys = [];
      }
      if (combo === "gl") {
        router.push("/leaderboard");
        keys = [];
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
}
