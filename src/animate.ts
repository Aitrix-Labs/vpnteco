type Cleanup = () => void

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initScrollReveals(root: ParentNode = document): Cleanup {
  const nodes = [...root.querySelectorAll<HTMLElement>('.scroll-fade-in, .hero-title, .section-title')].filter(
    (node) =>
      !node.classList.contains('brand-ticker-left') &&
      !node.classList.contains('brand-ticker-right') &&
      !node.classList.contains('hero-ticker-lp-01') &&
      !node.classList.contains('network-ticker-list') &&
      !node.classList.contains('highlights-lp-01-bottom') &&
      !node.classList.contains('testimonial-ticker'),
  )
  if (!nodes.length) return () => undefined

  // Trusted By rows should always stay visible/untransformed
  root.querySelectorAll<HTMLElement>('.brand-ticker-left, .brand-ticker-right').forEach((node) => {
    node.classList.add('is-visible', 'vpnteco-revealed')
    node.style.opacity = '1'
    node.style.transform = 'none'
  })

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible', 'vpnteco-revealed'))
    return () => undefined
  }

  nodes.forEach((node) => {
    if (!node.style.transition) node.style.transition = 'opacity .6s ease, transform .6s ease'
    if (!node.classList.contains('is-visible')) {
      node.style.opacity = node.style.opacity || '0'
      node.style.transform = node.style.transform || 'translateY(18px)'
    }
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        el.classList.add('is-visible', 'vpnteco-revealed')
        el.style.opacity = '1'
        el.style.transform = 'none'
        observer.unobserve(el)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )

  nodes.forEach((node) => observer.observe(node))
  return () => observer.disconnect()
}

export function initCounters(root: ParentNode = document): Cleanup {
  const gsap = window.gsap
  const ScrollTrigger = window.ScrollTrigger
  if (!gsap) return () => undefined

  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)

  const counters = [...root.querySelectorAll<HTMLElement>('[data-target]')]
  const triggers: Array<{ kill?: () => void }> = []

  counters.forEach((el, index) => {
    const target = Number.parseFloat(el.getAttribute('data-target') || '0')
    if (!Number.isFinite(target)) return
    const isDecimal = target % 1 !== 0

    gsap.set(el, { opacity: 0, y: 0 })

    if (!ScrollTrigger) {
      el.style.opacity = '1'
      el.textContent = isDecimal ? target.toFixed(1) : String(Math.floor(target))
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const entryDelay = index * 0.3
        gsap.to(el, { opacity: 1, duration: 0.3, delay: entryDelay })
        const baseSpeed = 40
        const duration = Math.min(3, Math.max(0.8, target / baseSpeed))
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration,
          delay: entryDelay,
          ease: 'power2.out',
          onUpdate: () => {
            el.innerText = isDecimal ? obj.val.toFixed(1) : String(Math.floor(obj.val))
          },
        })
      },
    })
    triggers.push(trigger)
  })

  return () => {
    triggers.forEach((trigger) => trigger.kill?.())
  }
}

export function initPricingToggle(root: ParentNode = document): Cleanup {
  const switches = [...root.querySelectorAll<HTMLElement>('.pricing-switch, .pricing-switch-block')]
  if (!switches.length) return () => undefined

  const setMode = (yearly: boolean) => {
    root.querySelectorAll<HTMLElement>('.pricing-card-price-text-wrap.monthly').forEach((node) => {
      node.style.display = yearly ? 'none' : ''
      node.style.visibility = yearly ? 'hidden' : 'visible'
    })
    root.querySelectorAll<HTMLElement>('.pricing-card-price-text-wrap.yearly').forEach((node) => {
      node.style.display = yearly ? '' : 'none'
      node.style.visibility = yearly ? 'visible' : 'hidden'
    })
    root.querySelectorAll('.pricing-switch').forEach((node) => {
      node.classList.toggle('is-yearly', yearly)
    })
  }

  // Default: show monthly
  setMode(false)

  const onClick = (event: Event) => {
    const target = event.currentTarget as HTMLElement
    const switchEl = target.classList.contains('pricing-switch')
      ? target
      : target.querySelector('.pricing-switch')
    const yearly = !switchEl?.classList.contains('is-yearly')
    setMode(Boolean(yearly))
  }

  switches.forEach((node) => {
    node.style.cursor = 'pointer'
    node.addEventListener('click', onClick)
  })

  return () => {
    switches.forEach((node) => node.removeEventListener('click', onClick))
  }
}

export function initFaq(root: ParentNode = document): Cleanup {
  const items = [...root.querySelectorAll<HTMLElement>('.faq-question, .faq-item, .w-dropdown')]
  // Prefer native Webflow dropdowns when present; otherwise toggle closest details-like blocks
  const questions = [...root.querySelectorAll<HTMLElement>('.faq-question-wrap, .faq-question, .accordion-item')]
  if (!questions.length) return () => undefined

  const onClick = (event: Event) => {
    const trigger = event.currentTarget as HTMLElement
    const item = trigger.closest('.faq-item, .accordion-item, .faq-question-wrap') ?? trigger.parentElement
    if (!item) return
    item.classList.toggle('is-open')
    const answer = item.querySelector<HTMLElement>('.faq-answer, .accordion-body, .w-dropdown-list')
    if (answer) {
      const open = item.classList.contains('is-open')
      answer.style.display = open ? 'block' : 'none'
    }
  }

  questions.forEach((node) => node.addEventListener('click', onClick))
  return () => {
    questions.forEach((node) => node.removeEventListener('click', onClick))
    void items
  }
}

export function reinitWebflow() {
  const w = window.Webflow
  try {
    w?.destroy?.()
  } catch {
    /* ignore */
  }
  try {
    w?.ready?.()
  } catch {
    /* ignore */
  }
  try {
    w?.require?.('ix2')?.init?.()
  } catch {
    /* ignore */
  }
  document.documentElement.classList.add('w-mod-ix3')
}

function ensureMarqueeTrack(container: HTMLElement, variant: string) {
  const existing = container.querySelector<HTMLElement>(':scope > .vpnteco-marquee-track')
  if (existing) {
    existing.className = `vpnteco-marquee-track ${variant}`
    return existing
  }

  const track = document.createElement('div')
  track.className = `vpnteco-marquee-track ${variant}`
  const children = [...container.children]
  children.forEach((child) => track.appendChild(child))
  // Duplicate children once if only a single group exists, for seamless loop
  if (track.children.length === 1) {
    track.appendChild(track.children[0].cloneNode(true))
  }
  container.appendChild(track)
  container.style.overflow = 'hidden'
  container.style.transform = 'none'
  return track
}

export function initMarquees(root: ParentNode = document): Cleanup {
  if (prefersReducedMotion()) return () => undefined

  // CSS animations drive motion (.vpnteco-marquee-track.*). Only wrap tracks here —
  // do not also tween transform with GSAP (fights CSS and empties reverse rows).
  const setups: Array<{ sel: string; variant: string }> = [
    { sel: '.hero-ticker-lp-01', variant: 'is-hero' },
    { sel: '.brand-ticker-left', variant: 'is-left' },
    { sel: '.brand-ticker-right', variant: 'is-right' },
    { sel: '.highlights-lp-01-bottom', variant: 'is-highlights' },
    { sel: '.testimonial-ticker', variant: 'is-testimonials' },
  ]

  const tracks: HTMLElement[] = []

  setups.forEach(({ sel, variant }) => {
    const container = root.querySelector<HTMLElement>(sel)
    if (!container) return

    container.style.removeProperty('transform')
    container.style.removeProperty('translate')
    container.classList.add('is-visible', 'vpnteco-revealed')
    container.style.opacity = '1'

    const track = ensureMarqueeTrack(container, variant)
    track.style.removeProperty('transform')
    track.style.removeProperty('translate')
    window.gsap?.killTweensOf?.(track)
    tracks.push(track)
  })

  return () => {
    tracks.forEach((track) => {
      window.gsap?.killTweensOf?.(track)
      track.style.removeProperty('transform')
    })
  }
}

export function initMobileMenu(root: ParentNode = document): Cleanup {
  const hamburger = root.querySelector<HTMLElement>('.menu-hamburger')
  const menuIn = root.querySelector<HTMLElement>('.menu-in')
  // Only the actual open controls — never .hamburger-wrap (contains the panel;
  // bubbling from close/links would immediately re-open the menu).
  const openTriggers = [...root.querySelectorAll<HTMLElement>('.menu-open-button, .hamburger-item')]

  if (!hamburger || !menuIn || !openTriggers.length) return () => undefined

  const setOpen = (open: boolean) => {
    hamburger.classList.toggle('is-open', open)
    document.body.classList.toggle('vpnteco-menu-open', open)
    // backdrop-filter on header traps position:fixed — strip while open
    document.querySelectorAll<HTMLElement>('.header-primary, .header-secondary').forEach((header) => {
      if (open) {
        header.style.setProperty('backdrop-filter', 'none', 'important')
        header.style.setProperty('-webkit-backdrop-filter', 'none', 'important')
      } else {
        header.style.removeProperty('backdrop-filter')
        header.style.removeProperty('-webkit-backdrop-filter')
      }
    })
    // Kill Webflow/GSAP tweens that set translate/rotate/scale and fight transform
    window.gsap?.killTweensOf?.(menuIn)
    menuIn.style.removeProperty('translate')
    menuIn.style.removeProperty('rotate')
    menuIn.style.removeProperty('scale')
    // Disable transition while applying — % translate + containing-block change
    // (backdrop-filter cleared) can leave the panel stuck at translateY(-125%).
    menuIn.style.setProperty('transition', 'none', 'important')
    if (open) {
      hamburger.style.pointerEvents = 'auto'
      hamburger.style.setProperty('position', 'fixed', 'important')
      hamburger.style.setProperty('inset', '0', 'important')
      hamburger.style.setProperty('width', '100%', 'important')
      hamburger.style.setProperty('height', '100%', 'important')
      menuIn.style.setProperty('transform', 'translate3d(0,0,0)', 'important')
    } else {
      hamburger.style.pointerEvents = 'none'
      hamburger.style.removeProperty('position')
      hamburger.style.removeProperty('inset')
      hamburger.style.removeProperty('width')
      hamburger.style.removeProperty('height')
      menuIn.style.setProperty('transform', 'translate3d(0,-125%,0)', 'important')
    }
    void menuIn.offsetHeight
    menuIn.style.removeProperty('transition')
  }

  const openMenu = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(true)
  }

  const closeMenu = (event?: Event) => {
    event?.preventDefault()
    event?.stopPropagation()
    setOpen(false)
  }

  openTriggers.forEach((node) => {
    node.style.cursor = 'pointer'
    node.addEventListener('click', openMenu)
  })

  const closeButton = root.querySelector<HTMLElement>('.menu-close-button')
  closeButton?.addEventListener('click', closeMenu)

  // Close when choosing a menu link
  const linkHandler = (event: Event) => {
    const target = event.target as Element | null
    if (target?.closest?.('.menu-item-link, .menu-text')) closeMenu(event)
  }
  menuIn.addEventListener('click', linkHandler)

  // Backdrop click (outside menu panel content)
  const backdropHandler = (event: MouseEvent) => {
    if (!hamburger.classList.contains('is-open')) return
    const target = event.target as Node
    if (menuIn.contains(target)) return
    if (openTriggers.some((node) => node.contains(target as Node))) return
    closeMenu(event)
  }
  hamburger.addEventListener('click', backdropHandler)

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeMenu()
  }
  window.addEventListener('keydown', onKey)

  setOpen(false)

  return () => {
    openTriggers.forEach((node) => node.removeEventListener('click', openMenu))
    closeButton?.removeEventListener('click', closeMenu)
    menuIn.removeEventListener('click', linkHandler)
    hamburger.removeEventListener('click', backdropHandler)
    window.removeEventListener('keydown', onKey)
    setOpen(false)
  }
}

export function initForms(root: ParentNode = document): Cleanup {
  try {
    window.initVpntecoForms?.(root instanceof Element ? root : document)
  } catch {
    /* ignore */
  }
  return () => undefined
}

export function bootPageAnimations(root: HTMLElement): Cleanup {
  reinitWebflow()
  const cleanups: Cleanup[] = [
    initForms(root),
    initMobileMenu(root),
    initScrollReveals(root),
    initCounters(root),
    initPricingToggle(root),
    initFaq(root),
  ]

  // Start marquees after IX2 settles so it cannot freeze transforms
  const marqueeTimer = window.setTimeout(() => {
    cleanups.push(initMarquees(root))
    try {
      window.ScrollTrigger?.refresh?.()
    } catch {
      /* ignore */
    }
  }, 180)

  return () => {
    window.clearTimeout(marqueeTimer)
    cleanups.forEach((fn) => fn())
  }
}
