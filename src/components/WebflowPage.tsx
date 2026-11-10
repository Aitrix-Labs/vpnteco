import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { bootPageAnimations } from '../animate'
import type { VpntecoPage } from '../generated/pages'
import { applyPageMeta, ensureVendorScripts, toAppPath } from '../webflow'

export default function WebflowPage({ page }: { page: VpntecoPage }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    applyPageMeta(page.wfPage, page.wfSite, page.title)

    const styleNodes: HTMLElement[] = []
    if (page.styles) {
      const wrap = document.createElement('div')
      wrap.innerHTML = page.styles
      ;[...wrap.querySelectorAll('style')].forEach((node) => {
        const style = document.createElement('style')
        style.setAttribute('data-vpnteco-page', page.route)
        style.textContent = node.textContent
        document.head.appendChild(style)
        styleNodes.push(style)
      })
    }

    const host = hostRef.current
    if (!host) {
      return () => styleNodes.forEach((node) => node.remove())
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const anchor = target?.closest?.('a')
      if (!anchor) return
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      const next = toAppPath(href)
      if (!next) return
      event.preventDefault()
      navigate(next)
    }

    host.addEventListener('click', onClick)

    let stopAnimations: (() => void) | undefined
    let cancelled = false

    const timer = window.setTimeout(() => {
      void ensureVendorScripts()
        .catch(() => undefined)
        .finally(() => {
          if (cancelled || !hostRef.current) return
          stopAnimations = bootPageAnimations(hostRef.current)
        })
    }, 40)

    return () => {
      cancelled = true
      host.removeEventListener('click', onClick)
      window.clearTimeout(timer)
      stopAnimations?.()
      styleNodes.forEach((node) => node.remove())
    }
  }, [page, navigate])

  return <div ref={hostRef} className="vpnteco-page" dangerouslySetInnerHTML={{ __html: page.body }} />
}
