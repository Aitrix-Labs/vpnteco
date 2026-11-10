export function applyPageMeta(wfPage: string, wfSite: string, title: string) {
  document.title = title
  const root = document.documentElement
  root.setAttribute('data-wf-domain', 'vpnteco')
  if (wfPage) root.setAttribute('data-wf-page', wfPage)
  if (wfSite) root.setAttribute('data-wf-site', wfSite)
}

export function toAppPath(href: string): string | null {
  try {
    const url = new URL(href, window.location.origin)
    if (url.origin !== window.location.origin) return null
    let path = url.pathname
    if (!path.startsWith('/vpnteco')) return null
    path = path.replace(/^\/vpnteco/, '') || '/'
    path = path.replace(/\.html$/, '')
    if (path === '/index') path = '/'
    return path + url.search + url.hash
  } catch {
    return null
  }
}

export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-vpnteco-src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === '1') resolve()
      else existing.addEventListener('load', () => resolve(), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.dataset.vpntecoSrc = src
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}

export async function ensureVendorScripts() {
  if (!window.jQuery) {
    await loadScript('https://code.jquery.com/jquery-3.5.1.min.js')
  }
  if (!window.Webflow) {
    const chunks = [
      'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/js/webflow.schunk.36b8fb49256177c8.js',
      'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/js/webflow.schunk.d9adabe6f0fbbb30.js',
      'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/js/webflow.schunk.9dfb96661114d3db.js',
      'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/js/webflow.77ca5ab0.71b9f3aa560f21e7.js',
    ]
    for (const src of chunks) {
      try {
        await loadScript(src)
      } catch {
        /* continue — CSS/GSAP fallbacks still run */
      }
    }
  }
  if (!window.gsap) {
    await loadScript('https://cdn.prod.website-files.com/gsap/3.15.0/gsap.min.js')
  }
  if (!window.ScrollTrigger) {
    await loadScript('https://cdn.prod.website-files.com/gsap/3.15.0/ScrollTrigger.min.js')
  }
}
