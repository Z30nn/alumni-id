import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AlumniForm from './components/AlumniForm'
import PdfViewer from './components/PdfViewer'
import Loader from './components/Loader'
import { fetchFromScript } from './api/scriptApi'
import { savePdf, getPdf } from './storage/pdfStorage'

const STORAGE_KEY_DATA = 'alumniIdData'
const STORAGE_KEY_LIST = 'alumniIdList'

const DEFAULT_WEBHOOK_URL = 'https://infinityw.com/webhook/5d2d6a91-e43c-4187-be71-97af7b67dff8'

/** Strip pdfSource from items so the list stays small and fits in localStorage. */
function listWithoutPdf(list) {
  return list.map(({ pdfSource: _, ...rest }) => rest)
}

function loadIdList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIST)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveIdList(list) {
  try {
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(listWithoutPdf(list)))
  } catch {
    // ignore quota or parse errors
  }
}

function App() {
  const [view, setView] = useState('dashboard')
  const [idList, setIdList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pdfSource, setPdfSource] = useState(null)
  const [savedFormData, setSavedFormData] = useState(null)

  useEffect(() => {
    let list = loadIdList()
    const storedData = localStorage.getItem(STORAGE_KEY_DATA)
    if (list.length === 0 && storedData) {
      try {
        const data = JSON.parse(storedData)
        const id = crypto.randomUUID?.() ?? `id-${Date.now()}`
        const item = {
          id,
          fullName: data.fullName ?? '',
          school: data.school ?? '',
          studentNumber: data.studentNumber ?? '',
          program: data.program ?? '',
          graduationYear: data.graduationYear ?? '',
          formData: data,
          createdAt: new Date().toISOString(),
        }
        list = [item]
        saveIdList(list)
        // Migrate: if we had a PDF in localStorage before, it's gone now; no way to recover
      } catch {
        // ignore
      }
    }
    setIdList(list)
  }, [])

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

      let newPdfSource = null
      if (data.pdfUrl) {
        newPdfSource = data.pdfUrl
      } else if (data.pdfBase64) {
        newPdfSource = `data:application/pdf;base64,${data.pdfBase64}`
      } else {
        throw new Error('No PDF received from server.')
      }

      const newItem = {
        id: crypto.randomUUID?.() ?? `id-${Date.now()}`,
        fullName: formData.fullName,
        school: formData.school,
        studentNumber: formData.studentNumber,
        program: formData.program,
        graduationYear: formData.graduationYear,
        formData: {
          fullName: formData.fullName,
          school: formData.school,
          graduationYear: formData.graduationYear,
          program: formData.program,
          studentNumber: formData.studentNumber,
          mobile: formData.mobile,
          email: formData.email,
          photo: formData.photo,
          esig: formData.esig,
        },
        createdAt: new Date().toISOString(),
      }

      await savePdf(newItem.id, newPdfSource)
      const nextList = [newItem, ...loadIdList()]
      saveIdList(nextList)
      setIdList(nextList)

      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newItem.formData))

      setPdfSource(newPdfSource)
      setSavedFormData(null)
      setView('viewer')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DATA)
      setSavedFormData(stored ? JSON.parse(stored) : null)
    } catch {
      setSavedFormData(null)
    }
    setView('form')
    setError(null)
  }

  const handleGenerateNew = () => {
    localStorage.removeItem(STORAGE_KEY_DATA)
    setView('form')
    setError(null)
    setPdfSource(null)
    setSavedFormData(null)
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setPdfSource(null)
    setSavedFormData(null)
  }

  const handleViewId = async (item) => {
    const formDataToStore = item.formData || {
      fullName: item.fullName,
      school: item.school,
      graduationYear: item.graduationYear,
      program: item.program,
      studentNumber: item.studentNumber,
      mobile: item.formData?.mobile || '',
      email: item.formData?.email || '',
      photo: item.formData?.photo || null,
      esig: item.formData?.esig || null,
    }
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(formDataToStore))
    } catch {
      // ignore quota for form data
    }
    setError(null)
    let pdf = null
    try {
      pdf = await getPdf(item.id)
    } catch {
      // IndexedDB failed, fall back to legacy item.pdfSource
    }
    const source = pdf ?? item.pdfSource
    if (!source) {
      setError('This ID’s PDF is no longer available. You can generate a new one from the form.')
      return
    }
    setPdfSource(source)
    setView('viewer')
  }

  const handleGoToForm = () => {
    setView('form')
    setError(null)
    setSavedFormData(null)
  }

  const handleDownloadId = async (item) => {
    let src = null
    try {
      src = await getPdf(item.id)
    } catch {
      // ignore
    }
    src = src ?? item.pdfSource
    if (!src) return
    const filename = `alumni-id-${item.studentNumber || item.id}.pdf`
    if (src.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = src
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }
    try {
      const res = await fetch(src, { mode: 'cors' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }

  if (view === 'viewer' && pdfSource) {
    return (
      <PdfViewer
        src={pdfSource}
        onEdit={handleEdit}
        onGenerateNew={handleGenerateNew}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  if (view === 'form') {
    return (
      <div className="app">
        {loading && <Loader />}
        <AlumniForm
          onSubmit={handleSubmit}
          error={error}
          disabled={loading}
          initialData={savedFormData}
          onBackToDashboard={idList.length > 0 ? handleBackToDashboard : null}
        />
      </div>
    )
  }

  return (
    <Dashboard
      idList={idList}
      onGenerateNew={handleGoToForm}
      onViewId={handleViewId}
      onDownloadId={handleDownloadId}
    />
  )
}

export default App