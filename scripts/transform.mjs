import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const outDir = path.join(root, 'site')
const base = '/vpnteco'

const pages = [
  { raw: '_raw.html', out: 'index.html', title: 'Vpnteco — Your Online Privacy, Fully Protected' },
  { raw: '_raw-features.html', out: 'features.html', title: 'Vpnteco — Features' },
  { raw: '_raw-about.html', out: 'about.html', title: 'Vpnteco — About Us' },
  { raw: '_raw-contact.html', out: 'contact.html', title: 'Vpnteco — Contact Us' },
  { raw: '_raw-pricing.html', out: 'pricing.html', title: 'Vpnteco — Pricing' },
  { raw: '_raw-blog.html', out: 'blog.html', title: 'Vpnteco — Blog' },
  { raw: '_raw-licenses.html', out: 'licenses.html', title: 'Vpnteco — Licenses' },
  { raw: '_raw-changelog.html', out: 'changelog.html', title: 'Vpnteco — Changelog' },
  { raw: '_raw-style-guide.html', out: 'style-guide.html', title: 'Vpnteco — Style Guide' },
  { raw: '_raw-401.html', out: '401.html', title: 'Vpnteco — Password Protected' },
  { raw: '_raw-404.html', out: '404.html', title: 'Vpnteco — Page Not Found' },
]

const routeMap = [
  ['/features', `${base}/features.html`],
  ['/about', `${base}/about.html`],
  ['/contact', `${base}/contact.html`],
  ['/pricing', `${base}/pricing.html`],
  ['/blog', `${base}/blog.html`],
  ['/licenses', `${base}/licenses.html`],
  ['/changelog', `${base}/changelog.html`],
  ['/style-guide', `${base}/style-guide.html`],
  ['/signin', `${base}/signin.html`],
  ['/signup', `${base}/signup.html`],
  ['/401', `${base}/401.html`],
  ['/404', `${base}/404.html`],
  ['/', `${base}/`],
]

const authHeader = `<div class="header-auth-wrap"><a href="${base}/signin.html" class="header-auth-link">Sign In</a><a href="${base}/signup.html" class="header-auth-link header-auth-signup">Sign Up</a></div>`

const authOverrideCss = `
<style id="vpnteco-overrides">
.remove-this-button{display:none!important}
.header-auth-wrap{display:flex;align-items:center;justify-content:center;gap:12px;padding:0 24px;min-height:80px;min-width:220px;box-sizing:border-box;border-left:1px solid rgba(211,222,230,.4);white-space:nowrap}
.header-auth-link{display:inline-flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-family:"Inter Tight",sans-serif;font-size:16px;font-weight:500;line-height:1;padding:10px 16px;border-radius:999px;white-space:nowrap;transition:opacity .2s ease,background-color .2s ease}
.header-auth-link:hover{opacity:.85}
.header-auth-signup{background:#ea642a;color:#fff}
.header-auth-signup:hover{opacity:1;background:#ff7a3d}
@media screen and (max-width:991px){.header-auth-wrap{padding:0 10px;min-height:56px;min-width:0;gap:6px;border-left:0}.header-auth-link{font-size:13px;padding:8px 10px}}
@media screen and (max-width:767px){.header-auth-wrap{display:none!important}.nav-brand-logo{max-width:118px;height:auto}}
.text-field.is-invalid,.newslatter-form-input.is-invalid{border-color:#ff5c5c!important;box-shadow:0 0 0 3px rgba(255,92,92,.15)}
img,video,svg{max-width:100%;height:auto}
body{overflow-x:hidden}
.field-error{margin:8px 0 0;color:#ff8d8d;font-size:13px;line-height:1.4}
.contact-form .submit-button:disabled,.newslatter-button:disabled{opacity:.7;cursor:wait}
.w-form-done,.success-message,.form-success{display:none;padding:18px 16px;border-radius:14px;background:rgba(46,204,113,.12);border:1px solid rgba(46,204,113,.35);color:#b8f5d0}
.w-form-fail,.error-message,.form-error{display:none;padding:18px 16px;border-radius:14px;background:rgba(255,92,92,.1);border:1px solid rgba(255,92,92,.35);color:#ffb4b4}
.vpnteco-form-success .w-form-done,.vpnteco-form-success .success-message,.vpnteco-form-success .form-success,.w-form-done.is-visible,.success-message.is-visible,.form-success.is-visible{display:block!important}
.vpnteco-local-form .w-form-fail,.vpnteco-local-form .error-message,.vpnteco-local-form .form-error,.vpnteco-form-success .w-form-fail,.vpnteco-form-success .error-message,.vpnteco-form-success .form-error{display:none!important}
.contact-form .submit-button,.contact-form input[type=submit],.newslatter-button{pointer-events:auto!important;opacity:1!important;visibility:visible!important}
.contact-form .scroll-fade-in,.contact-form-block .scroll-fade-in{opacity:1!important;visibility:visible!important;transform:none!important}
</style>`

const logoOrig =
  'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/6acd15838d5076bb3ea68ac6_Group%2026.svg'
const footerOrig =
  'https://cdn.prod.website-files.com/6ab7f78a9781541f26e39f0f/6aba588c777e7c9c91324818_Heading%201%20%E2%86%92%20BEYOND_LOGIC%20%26_REASON..svg'

function transform(html, title) {
  let out = html

  // Drop Webflow marketplace / review chrome
  out = out.replace(
    /<script>\s*window\.__WF_REVIEW_BRIDGE[\s\S]*?<\/script>\s*<script src="https:\/\/validation-worker\.createsomething\.workers\.dev\/app-validator\/snippet\/review\.js"><\/script>/,
    '',
  )
  out = out.replace(
    /<div class="remove-this-button">[\s\S]*?<div data-w-id="[^"]*" class="all-button-open-close">[\s\S]*?<\/div><\/div>/g,
    '',
  )

  // Local CSS / logos BEFORE brand string rewrite (URLs contain "viresta")
  out = out.replace(
    /<link href="https:\/\/cdn\.prod\.website-files\.com\/6ab7f78a9781541f26e39f0f\/css\/viresta\.webflow\.shared\.[^"]+\.min\.css"[^>]*>/,
    `<link href="${base}/assets/styles.css" rel="stylesheet" type="text/css"/><link href="${base}/assets/responsive.css" rel="stylesheet" type="text/css"/>`,
  )
  out = out.replaceAll(logoOrig, `${base}/assets/logo.svg`)
  out = out.replaceAll(footerOrig, `${base}/assets/footer-brand.svg`)

  // Branding
  out = out.replace(/Viresta/g, 'Vpnteco')
  out = out.replace(/viresta/g, 'vpnteco')
  out = out.replace(/SecureVPN/g, 'Vpnteco')
  out = out.replace(/Webflow HTML Website Template/g, 'VPN')
  out = out.replace(/data-wf-domain="[^"]*"/g, 'data-wf-domain="vpnteco"')
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  out = out.replace(/property="og:title" content="[^"]*"/g, `property="og:title" content="${title}"`)
  out = out.replace(/name="twitter:title" content="[^"]*"/g, `name="twitter:title" content="${title}"`)
  out = out.replaceAll(
    'Vpnteco is a modern VPN Webflow template built to showcase VPN services, highlight privacy features, and deliver a secure, fast, and responsive user experience.',
    'Vpnteco protects your online privacy with fast, secure, and private internet access worldwide.',
  )
  out = out.replaceAll(
    'Vpnteco is a modern VPN VPN built to showcase VPN services, highlight privacy features, and deliver a secure, fast, and responsive user experience.',
    'Vpnteco protects your online privacy with fast, secure, and private internet access worldwide.',
  )

  // Replace Download VPN with Sign In / Sign Up
  out = out.replace(
    /<a href="https:\/\/play\.google\.com\/store\/games" class="header-button-block(?: secondary)? w-inline-block"><div>Download VPN<\/div><\/a>/g,
    authHeader,
  )

  // Menu: restore original list, drop Home V2, rename Home V1 -> Home, append auth
  out = out.replace(
    /<a href="\/home-v2" class="menu-item-link w-inline-block"><p class="menu-text">Home V2<\/p><p class="menu-text">Home V2<\/p><\/a>/g,
    '',
  )
  out = out.replaceAll('>Home V1</p>', '>Home</p>')

  const menuAuthItems = `<a href="${base}/signin.html" class="menu-item-link w-inline-block"><p class="menu-text">Sign In</p><p class="menu-text">Sign In</p></a><a href="${base}/signup.html" class="menu-item-link w-inline-block"><p class="menu-text">Sign Up</p><p class="menu-text">Sign Up</p></a>`
  out = out.replace(
    /(<div class="menu-item-wrap">[\s\S]*?<p class="menu-text">Blog<\/p><p class="menu-text">Blog<\/p><\/a>)(<\/div>)/g,
    `$1${menuAuthItems}$2`,
  )

  // Route rewrites (longest first already ordered)
  for (const [from, to] of routeMap) {
    out = out.replaceAll(`href="${from}"`, `href="${to}"`)
    out = out.replaceAll(`href='${from}'`, `href='${to}'`)
  }

  // Contact form: correct CTA label; strip Turnstile so Webflow doesn't fail-submit
  out = out.replace(
    /(class="submit-button[^"]*"[^>]*value=")Subscribe(")/,
    '$1Send Message$2',
  )
  out = out.replace(
    /(value=")Subscribe("[^>]*class="submit-button)/,
    '$1Send Message$2',
  )
  out = out.replace(/\s*data-turnstile-sitekey="[^"]*"/g, '')
  out = out.replaceAll('hello@.example', 'hello@vpnteco.com')
  out = out.replaceAll('mailto:hello@.example', 'mailto:hello@vpnteco.com')

  // Hide leftover marketplace UI + auth header styles
  if (!out.includes('vpnteco-overrides')) {
    out = out.replace('</head>', `${authOverrideCss}</head>`)
  }

  // Functional forms script
  if (!out.includes('assets/forms.js')) {
    out = out.replace('</body>', `<script src="${base}/assets/forms.js"></script></body>`)
  }

  return out
}

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true })

for (const file of fs.readdirSync(path.join(publicDir, 'assets'))) {
  fs.copyFileSync(path.join(publicDir, 'assets', file), path.join(outDir, 'assets', file))
}

for (const page of pages) {
  const src = path.join(publicDir, page.raw)
  if (!fs.existsSync(src)) {
    console.warn('missing', page.raw)
    continue
  }
  const html = fs.readFileSync(src, 'utf8')
  const transformed = transform(html, page.title)
  fs.writeFileSync(path.join(outDir, page.out), transformed)
  console.log('wrote', page.out)
}

await import('./auth-pages.mjs')

console.log('done')
