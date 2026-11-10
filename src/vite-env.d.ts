/// <reference types="vite/client" />

interface Window {
  jQuery?: unknown
  $?: unknown
  initVpntecoForms?: (root?: ParentNode | Document | Element) => void
  Webflow?: {
    destroy?: () => void
    ready?: () => void
    require?: (name: string) => { init?: () => void } | undefined
  }
  gsap?: {
    registerPlugin: (...args: unknown[]) => void
    set: (target: Element, vars: Record<string, unknown>) => void
    to: (
      target: Element | Record<string, unknown>,
      vars: Record<string, unknown>,
    ) => { kill?: () => void }
    fromTo: (
      target: Element,
      from: Record<string, unknown>,
      to: Record<string, unknown>,
    ) => void
    killTweensOf?: (target: Element) => void
  }
  ScrollTrigger?: {
    create: (vars: Record<string, unknown>) => { kill?: () => void }
    refresh?: () => void
  }
}
