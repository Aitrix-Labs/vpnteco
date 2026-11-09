import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteDir = path.join(root, 'site')
const base = '/vpnteco'

function page(kind) {
  const isSignIn = kind === 'signin'
  const title = isSignIn ? 'Sign In' : 'Sign Up'
  const otherHref = isSignIn ? `${base}/signup.html` : `${base}/signin.html`
  const otherLabel = isSignIn ? 'Sign Up' : 'Sign In'
  const submit = isSignIn ? 'Sign In' : 'Create Account'

  const nameField = isSignIn
    ? ''
    : `<div class="auth-field">
        <label class="auth-label" for="name">Full Name</label>
        <input class="auth-input" id="name" name="name" type="text" placeholder="Your name" autocomplete="name" required />
      </div>`

  const confirmField = isSignIn
    ? ''
    : `<div class="auth-field">
        <label class="auth-label" for="confirmPassword">Confirm Password</label>
        <div class="auth-input-wrap">
          <input class="auth-input" id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password" required />
          <button type="button" class="auth-eye" data-toggle-password="confirmPassword" aria-label="Show password">Show</button>
        </div>
      </div>`

  const extras = isSignIn
    ? `<div class="auth-row">
        <label class="auth-check"><input type="checkbox" name="remember" /> Remember me</label>
        <a class="auth-link" href="${base}/contact.html">Forgot password?</a>
      </div>`
    : `<label class="auth-check auth-check-block">
        <input type="checkbox" name="terms" required />
        <span>I agree to the <a class="auth-link" href="${base}/licenses.html">Terms</a> and Privacy Policy</span>
      </label>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vpnteco — ${title}</title>
  <link href="${base}/assets/styles.css" rel="stylesheet" type="text/css"/>
  <link href="https://fonts.googleapis.com/css?family=Inter+Tight:400,500,600,700" rel="stylesheet"/>
  <style>
    body{min-height:100vh;margin:0;background:#0b0b0b;color:#cfcfcf;font-family:"Inter Tight",sans-serif}
    .auth-shell{min-height:100vh;display:flex;flex-direction:column;background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234,100,42,.18), transparent 55%),
      #0b0b0b}
    .auth-nav{display:flex;align-items:center;justify-content:space-between;padding:22px 40px;border-bottom:1px solid #313131}
    .auth-nav a{color:#fff;text-decoration:none;font-weight:500}
    .auth-nav-cta{padding:10px 16px;border-radius:999px;border:1px solid #313131}
    .auth-nav-cta:hover{border-color:#ea642a;color:#ea642a}
    .auth-main{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 20px}
    .auth-panel{width:100%;max-width:460px}
    .auth-card{background:#151515;border:1px solid #313131;border-radius:20px;padding:36px 32px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .auth-card h1{margin:0 0 8px;color:#fff;font-family:"Clash display",Arial,sans-serif;font-size:40px;font-weight:500;line-height:1.1}
    .auth-lead{margin:0 0 28px;color:#cfcfcf;font-size:16px;line-height:1.5}
    .auth-field{margin:0 0 16px}
    .auth-label{display:block;margin:0 0 8px;color:#fff;font-size:14px;font-weight:500}
    .auth-input-wrap{position:relative}
    .auth-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #313131;border-radius:12px;background:#0b0b0b;color:#fff;font:inherit;transition:border-color .2s ease, box-shadow .2s ease}
    .auth-input-wrap .auth-input{padding-right:72px}
    .auth-input:focus{outline:none;border-color:#ea642a;box-shadow:0 0 0 3px rgba(234,100,42,.2)}
    .auth-input.is-invalid{border-color:#ff5c5c}
    .auth-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#cfcfcf;font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 8px}
    .auth-eye:hover{color:#fff}
    .field-error{margin:8px 0 0;color:#ff8d8d;font-size:13px}
    .auth-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 18px;font-size:14px}
    .auth-check{display:inline-flex;align-items:center;gap:8px;color:#cfcfcf;cursor:pointer}
    .auth-check-block{display:flex;align-items:flex-start;margin:4px 0 18px;font-size:14px;line-height:1.4}
    .auth-check input{accent-color:#ea642a}
    .auth-link{color:#ea642a;text-decoration:none;font-weight:600}
    .auth-link:hover{text-decoration:underline}
    .auth-submit{width:100%;padding:14px 18px;border:0;border-radius:999px;background:#ea642a;color:#fff;font:inherit;font-weight:600;cursor:pointer;transition:background .2s ease, transform .15s ease}
    .auth-submit:hover{background:#ff7a3d}
    .auth-submit:disabled{opacity:.7;cursor:wait}
    .auth-switch{margin:18px 0 0;text-align:center;font-size:14px}
    .form-success,.form-error{display:none;border-radius:16px;padding:22px 20px;margin-top:16px;line-height:1.5}
    .form-success{background:rgba(46,204,113,.12);border:1px solid rgba(46,204,113,.35);color:#b8f5d0}
    .form-error{background:rgba(255,92,92,.1);border:1px solid rgba(255,92,92,.35);color:#ffb4b4}
    @media (max-width:640px){
      .auth-nav{padding:14px 16px}
      .auth-main{padding:28px 14px}
      .auth-card{padding:24px 18px;border-radius:16px}
      .auth-card h1{font-size:30px}
      .auth-lead{font-size:15px;margin-bottom:22px}
      .auth-row{flex-direction:column;align-items:flex-start}
      .auth-nav img{height:28px;width:auto}
    }
    @media (max-width:380px){
      .auth-card{padding:20px 14px}
      .auth-card h1{font-size:26px}
    }
  </style>
</head>
<body>
  <div class="auth-shell">
    <div class="auth-nav">
      <a href="${base}/"><img src="${base}/assets/logo.svg" alt="Vpnteco" height="34" /></a>
      <a class="auth-nav-cta" href="${otherHref}">${otherLabel}</a>
    </div>
    <main class="auth-main">
      <div class="auth-panel w-form">
        <form class="auth-card auth-form" data-auth="${kind}" action="#" method="post" novalidate>
          <h1>${title}</h1>
          <p class="auth-lead">${isSignIn ? 'Welcome back. Access your Vpnteco account.' : 'Create your Vpnteco account and start browsing privately.'}</p>
          ${nameField}
          <div class="auth-field">
            <label class="auth-label" for="email">Email</label>
            <input class="auth-input" id="email" name="email" type="email" placeholder="you@email.com" autocomplete="email" required />
          </div>
          <div class="auth-field">
            <label class="auth-label" for="password">Password</label>
            <div class="auth-input-wrap">
              <input class="auth-input" id="password" name="password" type="password" placeholder="••••••••" autocomplete="${isSignIn ? 'current-password' : 'new-password'}" required />
              <button type="button" class="auth-eye" data-toggle-password="password" aria-label="Show password">Show</button>
            </div>
          </div>
          ${confirmField}
          ${extras}
          <button class="auth-submit" type="submit" data-wait="Please wait...">${submit}</button>
          <p class="auth-switch">${isSignIn ? "Don't have an account?" : 'Already have an account?'} <a class="auth-link" href="${otherHref}">${otherLabel}</a></p>
        </form>
        <div class="form-success success-message w-form-done"><div></div></div>
        <div class="form-error error-message w-form-fail"><div>Something went wrong. Please try again.</div></div>
      </div>
    </main>
  </div>
  <script src="${base}/assets/forms.js"></script>
</body>
</html>`
}

fs.mkdirSync(siteDir, { recursive: true })
fs.writeFileSync(path.join(siteDir, 'signin.html'), page('signin'))
fs.writeFileSync(path.join(siteDir, 'signup.html'), page('signup'))
console.log('wrote signin.html, signup.html')
