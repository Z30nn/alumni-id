function Loader() {
  return (
    <div className="loader-overlay" aria-live="polite" aria-busy="true">
      <div className="loader-spinner" />
      <p className="loader-text">Generating your Alumni ID...</p>
    </div>
  )
}

export default Loader
