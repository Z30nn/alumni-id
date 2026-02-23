function formatDate(isoString) {
  try {
    const d = new Date(isoString)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return '—'
  }
}

function downloadPdf(src, filename = 'alumni-id.pdf') {
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
    fetch(src, { mode: 'cors' })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
      .catch(() => window.open(src, '_blank'))
  } catch {
    window.open(src, '_blank')
  }
}

function Dashboard({ idList, onGenerateNew, onViewId }) {
  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        <h1 className="dashboard-title">Alumni ID</h1>
        <p className="dashboard-subtitle">Generate and manage your digital alumni IDs</p>

        <a
          href="#form"
          className="btn btn-primary dashboard-cta"
          onClick={(e) => {
            e.preventDefault()
            onGenerateNew()
          }}
        >
          Generate Alumni ID
        </a>

        <section className="dashboard-list-section">
          <h2 className="dashboard-list-title">Generated IDs</h2>
          {!idList || idList.length === 0 ? (
            <p className="dashboard-empty">No alumni IDs yet. Generate your first one above.</p>
          ) : (
            <ul className="dashboard-list">
              {idList.map((item) => (
                <li key={item.id} className="dashboard-list-item">
                  <div className="dashboard-list-item-info">
                    <span className="dashboard-list-item-name">{item.fullName}</span>
                    <span className="dashboard-list-item-meta">
                      {item.school} · {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="dashboard-list-item-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewId(item)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadPdf(item.pdfSource, `alumni-id-${item.studentNumber || item.id}.pdf`)}
                    >
                      Download
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
