const DB_NAME = 'alumni-id-db'
const DB_VERSION = 1
const STORE_NAME = 'pdfs'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Save a PDF (data URL or base64) for an alumni ID. Uses IndexedDB to avoid localStorage quota.
 * @param {string} id - Item id (e.g. from newItem.id)
 * @param {string} pdfDataUrl - Full data URL (e.g. data:application/pdf;base64,...)
 */
export function savePdf(id, pdfDataUrl) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put({ id, pdf: pdfDataUrl })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}

/**
 * Get stored PDF for an alumni ID. Returns null if not found.
 * @param {string} id - Item id
 * @returns {Promise<string|null>} Data URL or null
 */
export function getPdf(id) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result?.pdf ?? null)
      req.onerror = () => reject(req.error)
    })
  })
}

/**
 * Remove stored PDF for an ID (optional cleanup).
 */
export function removePdf(id) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}
