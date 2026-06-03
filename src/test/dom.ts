import { JSDOM } from "jsdom";

const DOM_GLOBALS = ["window", "document", "navigator", "HTMLElement", "Node"] as const;
type DomGlobalKey = (typeof DOM_GLOBALS)[number];

let savedGlobals: Partial<Record<DomGlobalKey, unknown>> | null = null;
let activeDom: JSDOM | null = null;

export function setupDom(): HTMLElement {
  teardownDom();

  const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>");
  activeDom = dom;
  savedGlobals = {};

  for (const key of DOM_GLOBALS) {
    savedGlobals[key] = globalThis[key as keyof typeof globalThis];
    (globalThis as Record<string, unknown>)[key] = dom.window[key as keyof Window];
  }

  return dom.window.document.getElementById("root")!;
}

export function teardownDom(): void {
  if (savedGlobals) {
    for (const key of DOM_GLOBALS) {
      if (key in savedGlobals) {
        (globalThis as Record<string, unknown>)[key] = savedGlobals[key];
      }
    }
    savedGlobals = null;
  }

  activeDom?.window.close();
  activeDom = null;
}
