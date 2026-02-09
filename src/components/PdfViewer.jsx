function PdfViewer({ src, onGenerateAnother }) {
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
      <iframe
        src={src}
        title="Alumni ID"
        className="pdf-iframe"
      />
      <div className="pdf-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onGenerateAnother}
        >
          Generate Another ID
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownload}
        >
          Download ID
        </button>
      </div>
    </div>
  )
}

export default PdfViewer
