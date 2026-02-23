function PdfViewer({ src, onEdit, onGenerateNew, onBackToDashboard }) {
  const handleDownload = async () => {
    const filename = 'alumni-id.pdf'
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

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-inner">
        <div className="pdf-embed-card">
          <embed
            src={src}
            type="application/pdf"
            className="pdf-embed"
            title="Alumni ID"
          />
        </div>
        <p className="pdf-storage-notice">
          This Alumni ID is saved on this device only.
        </p>
        <div className="pdf-actions">
          {onBackToDashboard && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={onBackToDashboard}
            >
              Back to dashboard
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onEdit}
          >
            Edit ID
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
          >
            Download ID
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onGenerateNew}
          >
            Generate New ID
          </button>
        </div>
      </div>
    </div>
  )
}

export default PdfViewer
