(() => {
  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

  function setFieldError(field, message) {
    clearFieldError(field)
    if (!message) return
    field.classList.add('is-invalid')
    field.setAttribute('aria-invalid', 'true')
    const tip = document.createElement('p')
    tip.className = 'field-error'
    tip.textContent = message
    field.insertAdjacentElement('afterend', tip)
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid')
    field.removeAttribute('aria-invalid')
    const next = field.nextElementSibling
    if (next?.classList.contains('field-error')) next.remove()
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach((el) => el.remove())
    form.querySelectorAll('.is-invalid').forEach((el) => {
      el.classList.remove('is-invalid')
      el.removeAttribute('aria-invalid')
    })
  }

  function validateRequired(form) {
    let valid = true
    clearFormErrors(form)
    form.querySelectorAll('input, textarea').forEach((field) => {
      if (field.type === 'submit' || field.type === 'button' || field.type === 'hidden' || field.type === 'checkbox') {
        if (field.type === 'checkbox' && field.required && !field.checked) {
          setFieldError(field, 'Please accept to continue.')
          valid = false
        }
        return
      }
      const value = String(field.value || '').trim()
      if (field.required && !value) {
        setFieldError(field, 'This field is required.')
        valid = false
        return
      }
      if ((field.type === 'email' || /email/i.test(field.name) || /email/i.test(field.id)) && value && !emailOk(value)) {
        setFieldError(field, 'Enter a valid email address.')
        valid = false
      }
      if (field.type === 'password' && value && value.length < 6) {
        setFieldError(field, 'Password must be at least 6 characters.')
        valid = false
      }
    })

    const password = form.querySelector('input[name="password"]')
    const confirm = form.querySelector('input[name="confirmPassword"]')
    if (password && confirm && password.value && confirm.value && password.value !== confirm.value) {
      setFieldError(confirm, 'Passwords do not match.')
      valid = false
    }
    return valid
  }

  function getWrap(form) {
    return form.closest('.w-form') || form.parentElement
  }

  function hideError(wrap) {
    if (!wrap) return
    wrap.querySelectorAll('.w-form-fail, .error-message, .form-error').forEach((error) => {
      error.style.setProperty('display', 'none', 'important')
      error.classList.remove('is-visible')
      error.setAttribute('hidden', '')
    })
    wrap.classList.remove('vpnteco-form-error')
  }

  function showSuccess(form, successText) {
    const wrap = getWrap(form)
    if (!wrap) return
    hideError(wrap)

    const success = wrap.querySelector('.w-form-done, .success-message, .form-success')
    if (successText && success) {
      const target = success.querySelector('div') || success
      target.textContent = successText
    }

    form.style.setProperty('display', 'none', 'important')
    if (success) {
      success.removeAttribute('hidden')
      success.style.setProperty('display', 'block', 'important')
      success.classList.add('is-visible')
    }
    wrap.classList.add('vpnteco-form-success')
    wrap.classList.remove('w-form-loading')
  }

  function unlockSubmit(submit, form) {
    if (!submit) return
    submit.disabled = false
    submit.readOnly = false
    submit.removeAttribute('disabled')
    submit.removeAttribute('readonly')
    submit.style.setProperty('pointer-events', 'auto', 'important')
    submit.style.setProperty('opacity', '1', 'important')
    submit.style.setProperty('visibility', 'visible', 'important')
    submit.classList.add('is-in')
    if (submit.tagName === 'INPUT' && /subscribe/i.test(submit.value) && form?.classList.contains('contact-form')) {
      submit.value = 'Send Message'
    }
  }

  function disableWebflowForm(form) {
    // Stop Webflow/Turnstile from owning submit (they show the Oops fail state).
    form.removeAttribute('data-turnstile-sitekey')
    form.setAttribute('data-wf-ignore-form', 'true')
    form.setAttribute('novalidate', '')
    const wrap = getWrap(form)
    if (wrap) {
      wrap.classList.add('vpnteco-local-form')
      hideError(wrap)
    }
  }

  function wireSubmit(form, { successText } = {}) {
    if (form.dataset.vpntecoWired === '1') return
    form.dataset.vpntecoWired = '1'

    disableWebflowForm(form)
    form.querySelectorAll('.scroll-fade-in').forEach((el) => el.classList.add('is-in'))

    const submit =
      form.querySelector('input[type="submit"]') ||
      form.querySelector('button[type="submit"]')
    unlockSubmit(submit, form)
    const unlockTimer = window.setInterval(() => unlockSubmit(submit, form), 400)
    window.setTimeout(() => window.clearInterval(unlockTimer), 4000)

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field))
      field.addEventListener('change', () => clearFieldError(field))
    })

    // Capture phase so this runs before Webflow's submit handler.
    form.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        hideError(getWrap(form))
        if (!validateRequired(form)) return

        const waitLabel = submit?.getAttribute('data-wait') || 'Please wait...'
        const original =
          submit?.tagName === 'INPUT' ? submit.value : submit?.textContent || 'Submit'

        if (submit) {
          submit.disabled = true
          if (submit.tagName === 'INPUT') submit.value = waitLabel
          else submit.textContent = waitLabel
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
        showSuccess(form, successText)
        form.reset()

        if (submit) {
          submit.disabled = false
          if (submit.tagName === 'INPUT') submit.value = original
          else submit.textContent = original
        }
      },
      true,
    )
  }

  function wirePasswordToggles(root = document) {
    root.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-password')
        const input = root.querySelector(`#${CSS.escape(id)}`)
        if (!input) return
        const show = input.type === 'password'
        input.type = show ? 'text' : 'password'
        btn.textContent = show ? 'Hide' : 'Show'
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password')
      })
    })
  }

  function init() {
    document.querySelectorAll('form.contact-form').forEach((form) => {
      wireSubmit(form, { successText: 'Thanks! Your message has been sent. We’ll get back to you soon.' })
    })
    document.querySelectorAll('form.newslatter-form, form.newsletter-form').forEach((form) => {
      wireSubmit(form, { successText: 'You’re subscribed. Welcome to Vpnteco updates.' })
    })
    document.querySelectorAll('form.auth-form').forEach((form) => {
      const kind = form.dataset.auth || 'signin'
      wireSubmit(form, {
        successText:
          kind === 'signup'
            ? 'Account created. You can now sign in and start browsing privately.'
            : 'Signed in successfully. Redirecting you to Vpnteco…',
      })
      form.addEventListener(
        'submit',
        () => {
          if (kind !== 'signin') return
          setTimeout(() => {
            if (form.style.display === 'none') window.location.href = '/vpnteco/'
          }, 1100)
        },
        true,
      )
    })
    wirePasswordToggles()

    // Keep Oops blocks hidden if Webflow tries to resurface them.
    document.querySelectorAll('.w-form-fail, .error-message, .form-error').forEach((error) => {
      error.setAttribute('hidden', '')
      error.style.setProperty('display', 'none', 'important')
      const observer = new MutationObserver(() => {
        if (error.closest('.vpnteco-form-success') || error.closest('.vpnteco-local-form')) {
          error.style.setProperty('display', 'none', 'important')
          error.setAttribute('hidden', '')
        }
      })
      observer.observe(error, { attributes: true, attributeFilter: ['style', 'class'] })
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
