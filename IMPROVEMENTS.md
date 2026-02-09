# Project improvement suggestions

Prioritized list of improvements for the Alumni ID Generator app.

---

## High priority

### 1. **Guard against missing env (avoid 404 on submit)**

If `VITE_WEBHOOK_URL` is unset, `fetch(undefined)` sends a request to the current origin and can cause a 404.

**Fix:** In `App.jsx`, use a fallback before calling `fetch`:

```js
const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://infinityw.com/webhook/5d2d6a91-e43c-4187-be71-97af7b67dff8'
if (!webhookUrl) {
  setError('Webhook URL is not configured.')
  setLoading(false)
  return
}
const response = await fetch(webhookUrl, { ... })
```

### 2. **Add a `.gitignore`**

Avoid committing build output and secrets.

**Add:** `.gitignore` with at least:

```
node_modules
dist
.env
.env.local
*.log
.DS_Store
```

### 3. **Photo size / type limits**

Large photos can make the payload huge and slow. No client-side limit exists.

**Improvements:**

- Restrict file size (e.g. max 2–5 MB) and show a clear error.
- Optionally validate dimensions (e.g. recommend square) and show a warning.

---

## Medium priority

### 4. **Single source of truth for school list**

`SCHOOL_OPTIONS` in `AlumniForm.jsx` and `SCHOOL_TO_FILENAME` in the Apps Script must stay in sync. If you add a school in one place and forget the other, logo/template lookup can fail.

**Improvement:** Export the school list from one place (e.g. `src/constants/schools.js`) and document that the Apps Script mapping must match. Optionally, generate a static JSON that the script or docs consume.

### 5. **Accessibility**

- **Focus management:** When showing the PDF view or returning to the form, move focus to the main heading or the first control so keyboard/screen-reader users land in the right place.
- **Error visibility:** Ensure the form error (`role="alert"`) is announced (it already has `role="alert"`; keeping it in the DOM when it appears is good).
- **Loader:** Consider `aria-live="polite"` and a short “Loading…” label so screen readers announce the state (you already have `aria-busy` and text).

### 6. **JSONP timeout**

If the Apps Script never calls the callback (slow or broken), the Promise never resolves and the user stays on the loading spinner.

**Improvement:** Wrap the JSONP call in a timeout (e.g. 15 s), reject or resolve with null, and remove the script/callback so the user gets an error or a “logo/template unavailable” path and the webhook still runs.

### 7. **Webhook / network error handling**

Non-JSON or non-2xx responses are handled with a generic message. 4xx/5xx or invalid JSON can throw and show “Something went wrong.”

**Improvement:** Check `response.ok`, parse JSON in a try/catch, and show a clearer message (e.g. “Server error. Please try again later.” or “Invalid response from server.”). Optionally surface a short server message if the API returns one.

---

## Lower priority / polish

### 8. **Extract `fetchFromScript`**

`fetchFromScript` in `App.jsx` is reusable and testable on its own. Moving it to e.g. `src/api/scriptApi.js` (or `src/utils/jsonp.js`) would keep `App.jsx` simpler and make it easier to unit test or reuse.

### 9. **Loading state on Submit button**

While the overlay covers the form, the Submit button doesn’t show a disabled/loading state. If the overlay is slow to appear or is removed for any reason, double-submit is possible.

**Improvement:** Disable the submit button when `loading` is true (e.g. pass `loading` into the form and set `disabled={loading}` on the button).

### 10. **Meta and PWA basics**

- **`index.html`:** Add a meta description and optionally Open Graph tags for sharing.
- **Favicon:** Replace `/vite.svg` with an alumni/app favicon.
- **PWA (optional):** Add a simple `manifest.json` and service worker if you want “Add to home screen” and offline shell.

### 11. **Graduation year range**

You already use `min="1900"` and `max="2100"`. Consider also validating in `validate()` so values outside that range get a clear message (e.g. “Graduation year must be between 1900 and 2100”).

### 12. **PDF viewer fallback**

On some mobile browsers, the iframe may not show the PDF well. You could detect support or add a fallback like “If the ID doesn’t show, use the Download button,” or a link that opens the PDF in a new tab.

---

## Summary table

| Area           | Suggestion                          | Effort |
|----------------|-------------------------------------|--------|
| Reliability    | Env fallback / check for webhook URL | Low    |
| Security       | .gitignore (keep .env out of repo)  | Low    |
| UX             | Photo size limit + clear error       | Low    |
| Maintainability| Single source for school list        | Medium |
| A11y           | Focus management, loader label       | Low    |
| Reliability    | JSONP timeout                        | Low    |
| UX             | Clearer webhook/network errors       | Low    |
| Code structure | Extract fetchFromScript              | Low    |
| UX             | Disable submit while loading         | Low    |
| Polish         | Meta, favicon, optional PWA          | Low–Med |
| Validation     | Graduation year range in validate()  | Low    |
| UX             | PDF fallback hint on mobile          | Optional |

Implementing the high-priority items first will make the app more reliable and safer to deploy; the rest can be done incrementally.
