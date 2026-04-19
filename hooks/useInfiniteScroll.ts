"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useInfiniteScroll(callback: () => Promise<void>) {
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching]
  );

  useEffect(() => {
    if (!isFetching) return;
    callback().then(() => setIsFetching(false));
  }, [isFetching, callback]);

  return { lastElementRef, isFetching };
}
