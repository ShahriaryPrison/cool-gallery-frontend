"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-intro-done", "data-intro-fly-done"],
  });
  return () => observer.disconnect();
}

const getDoneSnapshot = () => document.documentElement.hasAttribute("data-intro-done");
const getLandedSnapshot = () =>
  document.documentElement.hasAttribute("data-intro-fly-done");
const getServerSnapshot = () => false;

/** True once the title sequence has finished, so the page can take its cue. */
export function useIntroDone() {
  return useSyncExternalStore(subscribe, getDoneSnapshot, getServerSnapshot);
}

/**
 * True once the flying logo has landed in the hero. Until then the hero's own
 * logo must stay hidden, or the two are on screen at the same time.
 */
export function useIntroLanded() {
  return useSyncExternalStore(subscribe, getLandedSnapshot, getServerSnapshot);
}
