import { useState } from 'react'
import AlumniForm from './components/AlumniForm'
import PdfViewer from './components/PdfViewer'
import Loader from './components/Loader'

function fetchFromScript(scriptUrl, school, type = 'logo') {
  return new Promise((resolve) => {
    const callbackName = 'scriptCallback_' + Date.now() + '_' + type
    const params = new URLSearchParams({
      school,
      callback: callbackName,
      ...(type !== 'logo' && { type }),
    })
    const url = scriptUrl + '?' + params.toString()

    window[callbackName] = (data) => {
      delete window[callbackName]
      scriptEl.remove()
      if (type === 'template') {
        resolve({ fileId: data?.fileId ?? null, content: data?.content ?? null })
      } else {
        resolve({ fileId: data?.fileId ?? null })
      }
    }

    const scriptEl = document.createElement('script')
    scriptEl.src = url
    scriptEl.onerror = () => {
      delete window[callbackName]
      scriptEl.remove()
      resolve(type === 'template' ? { fileId: null, content: null } : { fileId: null })
    }
    document.body.appendChild(scriptEl)
  })
}

function App() {
  const [showForm, setShowForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setPdfSource(null)

    try {
      let logoFileId = null
      let templateFileId = null
      let templateContent = null

      const scriptUrl = import.meta.env.VITE_LOGO_SCRIPT_URL
      if (scriptUrl && formData.school) {
        const [logoResult, templateResult] = await Promise.all([
          fetchFromScript(scriptUrl, formData.school, 'logo'),
          fetchFromScript(scriptUrl, formData.school, 'template'),
        ])
        logoFileId = logoResult.fileId
        templateFileId = templateResult.fileId
        templateContent = templateResult.content
      }

      const payload = {
        ...formData,
        logoFileId,
        templateFileId,
        templateContent,
      }

      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to generate Alumni ID. Please try again.')
      }

      const data = await response.json()

      if (data.pdfUrl) {
        setPdfSource(data.pdfUrl)
      } else if (data.pdfBase64) {
        setPdfSource(`data:application/pdf;base64,${data.pdfBase64}`)
      } else {
        throw new Error('No PDF received from server.')
      }

      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAnother = () => {
    setShowForm(true)
    setError(null)
    setPdfSource(null)
  }

  if (!showForm && pdfSource) {
    return (
      <PdfViewer
        src={pdfSource}
        onGenerateAnother={handleGenerateAnother}
      />
    )
  }

  return (
    <div className="app">
      {loading && <Loader />}
      {!loading && (
        <AlumniForm onSubmit={handleSubmit} error={error} />
      )}
    </div>
  )
}

export default App
