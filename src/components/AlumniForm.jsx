import React, { useState, useEffect, useMemo } from "react";

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'
const MAX_PHOTO_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB
const MAX_ESIG_SIZE_BYTES = 500 * 1024 // 500 KB

const SCHOOL_OPTIONS = [
  'Ateneo de Manila University',
  'Adamson University',
  'Angeles University Foundation',
  'Central Luzon State University',
  'Central Philippine University',
  'De La Salle University',
  'Far Eastern University',
  'Lyceum of the Philippines University',
  'Mapúa University',
  'Polytechnic University of the Philippines',
  'San Beda University',
  'Silliman University',
  'Technological Institute of the Philippines',
  'University of the Assumption',
  'University of Asia and the Pacific',
  'University of Baguio',
  'University of Cebu',
  'University of the Cordilleras',
  'University of the East',
  'University of the Immaculate Conception',
  'University of Negros Occidental – Recoletos',
  'University of the Philippines',
  'University of San Agustin',
  'University of San Carlos',
  'University of San Jose-Recoletos',
  'University of St. La Salle',
  'University of Santo Tomas',
  'Visayas State University',
  'Western Mindanao State University',
  'West Visayas State University',
]

const PROGRAM_OPTIONS = [
  'Bachelor of Science in Architecture',
  'Bachelor of Science in Chemical Engineering',
  'Bachelor of Science in Civil Engineering',
  'Bachelor of Science in Computer Engineering',
  'Bachelor of Science in Electrical Engineering',
  'Bachelor of Science in Electronics Engineering',
  'Bachelor of Science in Environmental and Sanitary Engineering',
  'Bachelor of Science in Industrial Engineering',
  'Bachelor of Science in Mechanical Engineering',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Data Science and Analytics',
  'Bachelor of Science in Entertainment and Multimedia Computing - Digital Animation Technology',
  'Bachelor of Science in Entertainment and Multimedia Computing - Game Development',
  'Bachelor of Science in Information Systems',
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Accountancy',
  'Bachelor of Science in Accounting Information System',
  'Bachelor of Science in Business Administration - Financial Management',
  'Bachelor of Science in Business Administration - Human Resource Management',
  'Bachelor of Science in Business Administration - Logistics and Supply Chain Management',
  'Bachelor of Science in Business Administration - Marketing Management',
  'Bachelor of Secondary Education Major in English',
  'Bachelor of Secondary Education Major in Mathematics',
  'Bachelor of Secondary Education Major in Sciences',
  'Bachelor of Special Needs Education',
  'Bachelor of Arts in English',
  'Bachelor of Arts in Political Science',
]

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// very light PH mobile formatting: accepts 09XXXXXXXXX or 9XXXXXXXXX; stores as 9XXXXXXXXX
function normalizePHMobile(input) {
  const digits = (input || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('63') && digits.length >= 12) return digits.slice(2) // 63 + 9XXXXXXXXX
  if (digits.startsWith('0') && digits.length >= 11) return digits.slice(1)  // 09XXXXXXXXX
  return digits // likely 9XXXXXXXXX
}

function isValidPHMobile(nineDigits) {
  // expects 10 digits starting with 9
  return /^9\d{9}$/.test(nineDigits)
}

const getInitialFormState = (initialData) => {
  if (!initialData) {
    return {
      fullName: '',
      studentNumber: '',
      graduationYear: '',
      school: '',
      program: '',
      mobile: '',
      email: '',
      photo: null,
      esig: null,
    }
  }
  // Extract mobile from +63 format if present
  let mobile = ''
  if (initialData.mobile) {
    const mobileStr = String(initialData.mobile)
    if (mobileStr.startsWith('+63')) {
      mobile = mobileStr.slice(3)
    } else {
      mobile = mobileStr.replace(/^63/, '').replace(/^0/, '')
    }
  }
  
  return {
    fullName: initialData.fullName ?? '',
    studentNumber: initialData.studentNumber ?? '',
    graduationYear: initialData.graduationYear != null ? String(initialData.graduationYear) : '',
    school: initialData.school ?? '',
    program: initialData.program ?? '',
    mobile: mobile,
    email: initialData.email ?? '',
    photo: null,
    esig: initialData.esig ? null : null, // Don't restore esig from initialData
  }
}

function AlumniForm({ onSubmit, error, disabled = false, initialData = null, onBackToDashboard = null }) {
  const [formData, setFormData] = useState(() => getInitialFormState(initialData))
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({})
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null)
  const [esigPreviewUrl, setEsigPreviewUrl] = useState(null)
  const storedPhotoDataUrl = initialData?.photo && typeof initialData.photo === 'string' ? initialData.photo : null

  useEffect(() => {
    if (formData.photo) {
      const url = URL.createObjectURL(formData.photo)
      setPhotoPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    if (storedPhotoDataUrl) {
      setPhotoPreviewUrl(storedPhotoDataUrl)
      return
    }
    setPhotoPreviewUrl(null)
  }, [formData.photo, storedPhotoDataUrl])

  useEffect(() => {
    if (!formData.esig) {
      setEsigPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(formData.esig)
    setEsigPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [formData.esig])

  const photoName = useMemo(() => formData.photo?.name || 'No file chosen', [formData.photo])
  const esigName = useMemo(() => formData.esig?.name || 'No file chosen', [formData.esig])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      const nextFile = files?.[0] ?? null
      setFormData((prev) => ({ ...prev, [name]: nextFile }))
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errors = {}

    // Full Name
    if (!formData.fullName?.trim()) errors.fullName = 'Full name is required.'
    else if (/\d/.test(formData.fullName)) errors.fullName = 'Full name must not contain numbers.'

    // Student Number (your rule: numbers only)
    if (!formData.studentNumber?.trim()) errors.studentNumber = 'Student number is required.'
    else if (/[a-zA-Z]/.test(formData.studentNumber)) errors.studentNumber = 'Student number must not contain letters.'

    // Grad Year
    if (!formData.graduationYear?.toString().trim()) errors.graduationYear = 'Graduation year is required.'
    else if (isNaN(Number(formData.graduationYear))) errors.graduationYear = 'Graduation year must be a number.'
    else {
      const y = Number(formData.graduationYear)
      if (y < 1900 || y > 2100) errors.graduationYear = 'Graduation year must be between 1900 and 2100.'
    }

    // School & Program
    if (!formData.school?.trim()) errors.school = 'School is required.'
    if (!formData.program?.trim()) errors.program = 'Program is required.'

    // Mobile
    const normalized = normalizePHMobile(formData.mobile)
    if (!normalized) errors.mobile = 'Mobile number is required.'
    else if (!isValidPHMobile(normalized)) errors.mobile = 'Enter a valid PH number (e.g., 9XX XXX XXXX).'

    // Email
    if (!formData.email?.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address.'

    // Photo - allow stored photo for edit mode
    const hasStoredPhoto = !!storedPhotoDataUrl
    if (!formData.photo && !hasStoredPhoto) {
      errors.photo = 'Photo is required.'
    } else if (formData.photo) {
      if (!formData.photo.type.startsWith('image/')) {
        errors.photo = 'Only image files are allowed (e.g. JPEG, PNG, GIF, WebP).'
      } else if (formData.photo.size > MAX_PHOTO_SIZE_BYTES) {
        errors.photo = `Photo must be 1 MB or smaller (current size: ${(formData.photo.size / 1024).toFixed(0)} KB).`
      }
    }

    // E-signature
    if (!formData.esig) errors.esig = 'E-signature is required.'
    else if (!formData.esig.type.startsWith('image/')) errors.esig = 'Only image files are allowed.'
    else if (formData.esig.size > MAX_ESIG_SIZE_BYTES) {
      errors.esig = `E-signature must be 1 MB or smaller (current size: ${(formData.esig.size / 1024).toFixed(0)} KB).`
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const clearAll = () => {
    setFormData({
      fullName: '',
      studentNumber: '',
      graduationYear: '',
      school: '',
      program: '',
      mobile: '',
      email: '',
      photo: null,
      esig: null,
    })
    setFieldErrors({})
  }

  const handleReset = () => {
    if (!confirm('Clear all fields and start over?')) return
    clearAll()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      let photoDataUrl
      if (formData.photo) {
        photoDataUrl = await fileToBase64(formData.photo)
      } else if (storedPhotoDataUrl) {
        photoDataUrl = storedPhotoDataUrl
      } else {
        photoDataUrl = ''
      }
      
      const esigDataUrl = await fileToBase64(formData.esig)
      const mobileNormalized = normalizePHMobile(formData.mobile)

      await onSubmit({
        fullName: formData.fullName.trim(),
        studentNumber: formData.studentNumber.trim(),
        graduationYear: Number(formData.graduationYear),
        school: formData.school.trim(),
        program: formData.program.trim(),
        mobile: `+63${mobileNormalized}`, // store final canonical value
        email: formData.email.trim(),
        photo: photoDataUrl,
        esig: esigDataUrl,
      })
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, submit: err?.message || 'Submit failed.' }))
    }
  }

  const SidebarContent = () => (
    <>
      <div className="brand">
        <div className="brand-seal" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="brand-name">
          Alumni ID Maker
          <span>Digital Verification</span>
        </div>
      </div>

      <hr className="divider" />

      <p className="panel-body">
        Fill in all required information and upload a valid 1×1 photo and e-signature. Ensure that all entries are
        correct and match your academic records.
      </p>

      <div className="steps">
        <div className="step">
          <div className="step-num">01</div>
          <div className="step-text">
            <strong>Fill in your details</strong> — name, school, and program.
          </div>
        </div>
        <div className="step">
          <div className="step-num">02</div>
          <div className="step-text">
            <strong>Upload your 1×1 photo</strong> and e-signature on a clean background.
          </div>
        </div>
        <div className="step">
          <div className="step-num">03</div>
          <div className="step-text">
            <strong>Generate and download</strong> your Alumni ID as a PDF.
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="layout">
      {/* MOBILE/TABLET HEADER */}
      <header className="mobile-header">
        {onBackToDashboard && (
          <button
            type="button"
            className="hamburger-btn"
            aria-label="Back to dashboard"
            onClick={onBackToDashboard}
            style={{ marginRight: 'auto' }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="brand-seal" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="mobile-brand">
          <span className="mobile-brand-title">Alumni ID Maker</span>
        </div>

        <button
          type="button"
          className="hamburger-btn"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* OVERLAY — ONLY RENDER WHEN OPEN (prevents “blank screen”) */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* DRAWER — ONLY INTERACTIVE WHEN OPEN */}
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-inner">
          <div className="drawer-top">
            <button
              type="button"
              className="hamburger-btn"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="drawer-panel">
            <SidebarContent />
          </div>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR (hidden by CSS on <=768) */}
      <aside className="panel">
        <SidebarContent />
      </aside>



      {/* ── MAIN ── */}
      <main className="main">
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              {onBackToDashboard && (
                <button
                  type="button"
                  className="btn-back-to-dashboard"
                  onClick={onBackToDashboard}
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to Dashboard
                </button>
              )}
              <h1>Alumni ID Request</h1>
              <p>Complete all fields to generate your verified ID</p>
            </div>
            <div className="card-badge">Official Form</div>
          </div>

          <div className="card-body">
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            {fieldErrors.submit && (
              <div className="form-error" role="alert">
                {fieldErrors.submit}
              </div>
            )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="form-sections">
              {/* ── PERSONAL INFORMATION ── */}
              <div className="section-box">
                <div className="section-label">
                  <span className="section-label-text">Personal Information</span>
                  <span className="section-label-line" />
                </div>

                <div className="section-fields">
                  <div className="form-group span-2">
                    <label className="label" htmlFor="fullName">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Juan dela Cruz"
                      autoComplete="name"
                      className={fieldErrors.fullName ? 'input-error' : ''}
                    />
                    {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="studentNumber">
                      Student Number <span className="req">*</span>
                    </label>
                    <input
                      id="studentNumber"
                      name="studentNumber"
                      type="text"
                      value={formData.studentNumber}
                      onChange={handleChange}
                      placeholder="e.g. 2123456"
                      className={fieldErrors.studentNumber ? 'input-error' : ''}
                      disabled={!!initialData}
                      readOnly={!!initialData}
                      aria-readonly={!!initialData}
                    />
                    {fieldErrors.studentNumber && <span className="field-error">{fieldErrors.studentNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="graduationYear">
                      Graduation Year <span className="req">*</span>
                    </label>
                    <input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="2024"
                      min="1900"
                      max="2100"
                      className={fieldErrors.graduationYear ? 'input-error' : ''}
                    />
                    {fieldErrors.graduationYear && <span className="field-error">{fieldErrors.graduationYear}</span>}
                  </div>
                </div>
              </div>

              {/* ── CONTACT INFORMATION ── */}
              <div className="section-box">
                <div className="section-label">
                  <span className="section-label-text">Contact Information</span>
                  <span className="section-label-line" />
                </div>

                <div className="section-fields contact">
                  <div className="form-group">
                    <label className="label" htmlFor="mobile">
                      Mobile Number <span className="req">*</span>
                    </label>
                    <div className={`phone-wrap ${fieldErrors.mobile ? 'input-error' : ''}`}>
                      <div className="phone-prefix">🇵🇭 +63</div>
                      <input
                        id="mobile"
                        name="mobile"
                        type="text"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9XX XXX XXXX"
                        maxLength={14}
                        inputMode="numeric"
                        autoComplete="tel-national"
                      />
                    </div>
                    {fieldErrors.mobile && <span className="field-error">{fieldErrors.mobile}</span>}
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="email">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="yourname@email.com"
                      autoComplete="email"
                      className={fieldErrors.email ? 'input-error' : ''}
                    />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>
                </div>
              </div>

              {/* ── ACADEMIC INFORMATION ── */}
              <div className="section-box">
                <div className="section-label">
                  <span className="section-label-text">Academic Information</span>
                  <span className="section-label-line" />
                </div>

                <div className="section-fields contact">
                  <div className="form-group">
                    <label className="label" htmlFor="school">
                      School / University <span className="req">*</span>
                    </label>
                    <select
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      className={fieldErrors.school ? 'input-error' : ''}
                    >
                      <option value="">Select your school</option>
                      {SCHOOL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.school && <span className="field-error">{fieldErrors.school}</span>}
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="program">
                      Degree Program <span className="req">*</span>
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className={fieldErrors.program ? 'input-error' : ''}
                    >
                      <option value="">Select your program</option>
                      {PROGRAM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.program && <span className="field-error">{fieldErrors.program}</span>}
                  </div>
                </div>
              </div>

              {/* ── ATTACHMENTS ── */}
              <div className="section-box">
                <div className="section-label">
                  <span className="section-label-text">Attachments</span>
                  <span className="section-label-line" />
                </div>

                <div className="section-fields attachments">
                  {/* 1×1 Photo */}
                  <div className="attachment-box">
                    <div className="form-group">
                      <label className="label">
                        1×1 Photo <span className="req">*</span>
                      </label>

                      <div className="file-zone">
                        <div className="photo-preview-wrap">
                          <img
                            src={photoPreviewUrl || 'https://placehold.co/76x76/edf0f6/c4cdd8?text=Photo'}
                            alt="Photo preview"
                          />
                        </div>

                        <div className="file-stack">
                          <label className="file-trigger" htmlFor="photo">
                            <svg viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Photo
                          </label>
                          <span className="file-name">{photoName}</span>
                        </div>
                      </div>

                      <p className="hint">JPG or PNG · white background · formal attire</p>
                      {fieldErrors.photo && <span className="field-error">{fieldErrors.photo}</span>}
                    </div>

                    <input id="photo" name="photo" type="file" accept={IMAGE_ACCEPT} onChange={handleChange} />
                  </div>

                  {/* E-Signature */}
                  <div className="attachment-box">
                    <div className="form-group">
                      <label className="label">
                        E-Signature <span className="req">*</span>
                      </label>

                      <div className="file-zone column">
                        <div className="file-stack">
                          <label className="file-trigger" htmlFor="esig">
                            <svg viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Signature
                          </label>
                          <span className="file-name">{esigName}</span>
                        </div>

                        {esigPreviewUrl && (
                          <div className="esig-preview-wrap">
                            <img src={esigPreviewUrl} alt="Signature preview" />
                          </div>
                        )}
                      </div>

                      <p className="hint">PNG · transparent or white background</p>
                      {fieldErrors.esig && <span className="field-error">{fieldErrors.esig}</span>}
                    </div>

                    <input id="esig" name="esig" type="file" accept="image/*" onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons (single divider line comes from .form-actions) */}
            <div className="form-actions">
              <div className="btn-row">
                <button type="button" className="btn-reset" onClick={handleReset} disabled={disabled}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                  </svg>
                  Clear Form
                </button>

                <button type="submit" className="btn-generate" disabled={disabled}>
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                    <line x1="9" y1="15" x2="13" y2="15" />
                  </svg>
                  <span>Generate ID</span>
                </button>
              </div>
            </div>
          </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AlumniForm