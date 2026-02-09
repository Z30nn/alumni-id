import { useState } from 'react'
import AlumniForm from './components/AlumniForm'
import PdfViewer from './components/PdfViewer'
import Loader from './components/Loader'
import { fetchFromScript } from './api/scriptApi'

const DEFAULT_WEBHOOK_URL = 'https://infinityw.com/webhook/5d2d6a91-e43c-4187-be71-97af7b67dff8'

function App() {
  const [showForm, setShowForm] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setPdfSource(null)

    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL
    if (!webhookUrl) {
      setError('Webhook URL is not configured. Please set VITE_WEBHOOK_URL in .env.')
      setLoading(false)
      return
    }

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

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('Invalid response from server. Please try again.')
      }

      if (!response.ok) {
        const status = response.status
        let message = data?.message || data?.error || 'Failed to generate Alumni ID. Please try again.'
        if (status >= 500 && !data?.message && !data?.error) message = 'Server error. Please try again later.'
        else if (status >= 400 && !data?.message && !data?.error) message = 'Request failed. Please check your data and try again.'
        throw new Error(message)
      }

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
      <AlumniForm
        onSubmit={handleSubmit}
        error={error}
        disabled={loading}
      />
    </div>
  )
}

export default App
