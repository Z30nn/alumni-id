const JSONP_TIMEOUT_MS = 15000

/**
 * Call Google Apps Script via JSONP (avoids CORS).
 * type: 'logo' → resolves with { fileId } for school logo
 * type: 'template' → resolves with { fileId, content } for school's .js template
 * Rejects or resolves with nulls after JSONP_TIMEOUT_MS if the script never responds.
 */
export function fetchFromScript(scriptUrl, school, type = 'logo') {
  return new Promise((resolve) => {
    const callbackName = 'scriptCallback_' + Date.now() + '_' + type
    const params = new URLSearchParams({
      school,
      callback: callbackName,
      ...(type !== 'logo' && { type }),
    })
    const url = scriptUrl + '?' + params.toString()

    let settled = false
    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      delete window[callbackName]
      scriptEl.remove()
      resolve(result)
    }

    window[callbackName] = (data) => {
      if (type === 'template') {
        settle({ fileId: data?.fileId ?? null, content: data?.content ?? null })
      } else {
        settle({ fileId: data?.fileId ?? null })
      }
    }

    const scriptEl = document.createElement('script')
    scriptEl.src = url
    scriptEl.onerror = () => {
      settle(type === 'template' ? { fileId: null, content: null } : { fileId: null })
    }
    document.body.appendChild(scriptEl)

    const timer = setTimeout(() => {
      settle(type === 'template' ? { fileId: null, content: null } : { fileId: null })
    }, JSONP_TIMEOUT_MS)
  })
}
