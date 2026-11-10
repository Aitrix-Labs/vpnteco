(() => {
  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

  function setFieldError(field, message) {
    clearFieldError(field)
    if (!message) return
    field.classList.add('is-invalid')
    field.setAttribute('aria-invalid', 'true')
    const tip = document.createElement('p')
    tip.className = 'field-error'
    tip.setAttribute('role', 'alert')
    tip.textContent = message
    const host = field.closest('.form-field, .auth-field, .auth-input-wrap') || field
    host.insertAdjacentElement('afterend', tip)
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid')
    field.removeAttribute('aria-invalid')
    const wrap = field.closest('.form-field, .auth-field') || field.parentElement
    wrap?.querySelectorAll?.('.field-error')?.forEach((el) => el.remove())
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
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (field.type === 'submit' || field.type === 'button' || field.type === 'hidden') return
      if (field.type === 'checkbox') {
        if (field.required && !field.checked) {
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
    return form.closest('.w-form, .auth-panel, .contact-form-block, .newslatter-form-block') || form.parentElement
  }

  function ensureStatusBoxes(wrap, form) {
    if (!wrap) return { success: null, error: null }
    let success = wrap.querySelector('.w-form-done, .success-message, .form-success')
    let error = wrap.querySelector('.w-form-fail, .error-message, .form-error')

    if (!success) {
      success = document.createElement('div')
      success.className = 'form-success success-message w-form-done vpnteco-status'
      success.innerHTML =
        '<div class="vpnteco-status-inner"><span class="vpnteco-status-icon" aria-hidden="true">✓</span><div class="vpnteco-status-copy"><strong>Success</strong><p></p></div></div>'
      form.insertAdjacentElement('afterend', success)
    } else if (!success.querySelector('.vpnteco-status-inner')) {
      const text = success.textContent?.trim() || ''
      success.classList.add('vpnteco-status')
      success.innerHTML = `<div class="vpnteco-status-inner"><span class="vpnteco-status-icon" aria-hidden="true">✓</span><div class="vpnteco-status-copy"><strong>Success</strong><p>${text}</p></div></div>`
    }

    if (!error) {
      error = document.createElement('div')
      error.className = 'form-error error-message w-form-fail vpnteco-status is-error'
      error.innerHTML =
        '<div class="vpnteco-status-inner"><span class="vpnteco-status-icon" aria-hidden="true">!</span><div class="vpnteco-status-copy"><strong>Something went wrong</strong><p>Please try again.</p></div></div>'
      success.insertAdjacentElement('afterend', error)
    }

    return { success, error }
  }

  function hideError(wrap) {
    if (!wrap) return
    wrap.querySelectorAll('.w-form-fail, .error-message, .form-error').forEach((node) => {
      node.style.setProperty('display', 'none', 'important')
      node.classList.remove('is-visible')
      node.setAttribute('hidden', '')
    })
    wrap.classList.remove('vpnteco-form-error')
  }

  function showError(form, message) {
    const wrap = getWrap(form)
    const { error } = ensureStatusBoxes(wrap, form)
    hideError(wrap)
    if (error) {
      const copy = error.querySelector('.vpnteco-status-copy p') || error.querySelector('div') || error
      if (copy) copy.textContent = message || 'Something went wrong. Please try again.'
      error.removeAttribute('hidden')
      error.style.setProperty('display', 'block', 'important')
      error.classList.add('is-visible')
    }
    wrap?.classList.add('vpnteco-form-error')
  }

  function showSuccess(form, successText) {
    const wrap = getWrap(form)
    if (!wrap) return
    const { success } = ensureStatusBoxes(wrap, form)
    hideError(wrap)

    if (success && successText) {
      const copy = success.querySelector('.vpnteco-status-copy p') || success.querySelector('p') || success.querySelector('div') || success
      if (copy) copy.textContent = successText
      const title = success.querySelector('.vpnteco-status-copy strong')
      if (title) title.textContent = 'Success'
    }

    form.style.setProperty('display', 'none', 'important')
    form.setAttribute('aria-hidden', 'true')
    if (success) {
      success.removeAttribute('hidden')
      success.style.setProperty('display', 'block', 'important')
      success.classList.add('is-visible')
      success.setAttribute('tabindex', '-1')
      success.focus?.({ preventScroll: true })
    }
    wrap.classList.add('vpnteco-form-success')
    wrap.classList.remove('w-form-loading', 'vpnteco-form-error')
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
    submit.classList.remove('is-loading')
    if (submit.tagName === 'INPUT' && /subscribe/i.test(submit.value) && form?.classList.contains('contact-form')) {
      submit.value = 'Send Message'
    }
  }

  function setLoading(submit, loading, original) {
    if (!submit) return
    if (loading) {
      submit.disabled = true
      submit.classList.add('is-loading')
      if (submit.tagName === 'INPUT') submit.value = submit.getAttribute('data-wait') || 'Please wait...'
      else submit.textContent = submit.getAttribute('data-wait') || 'Please wait...'
      return
    }
    submit.disabled = false
    submit.classList.remove('is-loading')
    if (submit.tagName === 'INPUT') submit.value = original
    else submit.textContent = original
  }

  function disableWebflowForm(form) {
    form.removeAttribute('data-turnstile-sitekey')
    form.setAttribute('data-wf-ignore-form', 'true')
    form.setAttribute('novalidate', '')
    const wrap = getWrap(form)
    if (wrap) {
      wrap.classList.add('vpnteco-local-form')
      hideError(wrap)
    }
  }

  function wireSubmit(form, { successText, onSuccess } = {}) {
    if (form.dataset.vpntecoWired === '1') return
    form.dataset.vpntecoWired = '1'

    disableWebflowForm(form)
    ensureStatusBoxes(getWrap(form), form)
    form.querySelectorAll('.scroll-fade-in').forEach((el) => el.classList.add('is-in'))

    const submit =
      form.querySelector('input[type="submit"]') ||
      form.querySelector('button[type="submit"]')
    unlockSubmit(submit, form)

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field))
      field.addEventListener('change', () => clearFieldError(field))
    })

    form.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        hideError(getWrap(form))
        if (!validateRequired(form)) {
          const firstInvalid = form.querySelector('.is-invalid')
          firstInvalid?.focus?.()
          return
        }

        const original =
          submit?.tagName === 'INPUT' ? submit.value : submit?.textContent || 'Submit'
        setLoading(submit, true, original)

        try {
          await new Promise((resolve) => setTimeout(resolve, 650))
          showSuccess(form, successText)
          form.reset()
          onSuccess?.(form)
        } catch {
          setLoading(submit, false, original)
          showError(form, 'Something went wrong. Please try again.')
        }
      },
      true,
    )
  }

  function wirePasswordToggles(root = document) {
    root.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      if (btn.dataset.vpntecoEye === '1') return
      btn.dataset.vpntecoEye = '1'
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

  function initVpntecoForms(root = document) {
    const scope = root.querySelectorAll ? root : document

    scope.querySelectorAll('form.contact-form').forEach((form) => {
      wireSubmit(form, {
        successText: 'Thanks! Your message has been sent. We’ll get back to you soon.',
      })
    })

    scope.querySelectorAll('form.newslatter-form, form.newsletter-form').forEach((form) => {
      wireSubmit(form, {
        successText: 'You’re subscribed. Welcome to Vpnteco updates.',
      })
    })

    scope.querySelectorAll('form.auth-form').forEach((form) => {
      const kind = form.dataset.auth || 'signin'
      wireSubmit(form, {
        successText:
          kind === 'signup'
            ? 'Account created. You can now sign in and start browsing privately.'
            : 'Signed in successfully. Taking you to Vpnteco…',
        onSuccess: () => {
          if (kind !== 'signin') return
          window.setTimeout(() => {
            window.location.assign('/vpnteco/')
          }, 900)
        },
      })
    })

    wirePasswordToggles(scope)

    scope.querySelectorAll('.w-form-fail, .error-message, .form-error').forEach((error) => {
      if (error.dataset.vpntecoObserved === '1') return
      error.dataset.vpntecoObserved = '1'
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

  window.initVpntecoForms = initVpntecoForms

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initVpntecoForms(document))
  } else {
    initVpntecoForms(document)
  }
})()
