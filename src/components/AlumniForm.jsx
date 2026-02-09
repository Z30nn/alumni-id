import { useState, useEffect } from 'react'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'
const MAX_PHOTO_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB

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

/** Convert an image File to a full data URL (e.g. data:image/jpeg;base64,...). */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function AlumniForm({ onSubmit, error, disabled = false }) {
  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    graduationYear: '',
    program: '',
    studentNumber: '',
    photo: null,
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null)

  useEffect(() => {
    if (!formData.photo) {
      setPhotoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(formData.photo)
    setPhotoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [formData.photo])

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] ?? null }))
      setFieldErrors((prev) => ({ ...prev, photo: '' }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.fullName?.trim()) errors.fullName = 'Full name is required.'
    if (!formData.school?.trim()) errors.school = 'School is required.'
    if (!formData.graduationYear?.toString().trim()) {
      errors.graduationYear = 'Graduation year is required.'
    } else if (isNaN(Number(formData.graduationYear))) {
      errors.graduationYear = 'Graduation year must be a number.'
    }
    if (!formData.program?.trim()) errors.program = 'Program is required.'
    if (!formData.studentNumber?.trim()) errors.studentNumber = 'Student number is required.'
    if (!formData.photo) {
      errors.photo = 'Photo is required.'
    } else if (!formData.photo.type.startsWith('image/')) {
      errors.photo = 'Only image files are allowed (e.g. JPEG, PNG, GIF, WebP).'
    } else if (formData.photo.size > MAX_PHOTO_SIZE_BYTES) {
      errors.photo = `Photo must be 1 MB or smaller (current size: ${(formData.photo.size / 1024).toFixed(0)} KB).`
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      // Transform the 1x1 uploaded photo to base64 (full data URL for webhook)
      const photoDataUrl = await fileToBase64(formData.photo)

      await onSubmit({
        fullName: formData.fullName.trim(),
        school: formData.school.trim(),
        graduationYear: Number(formData.graduationYear),
        program: formData.program.trim(),
        studentNumber: formData.studentNumber.trim(),
        photo: photoDataUrl,
      })
    } catch (err) {
      setFieldErrors((prev) => ({ ...prev, submit: err.message }))
    }
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">Alumni ID Generator</h1>
        <p className="form-subtitle">Enter your details to generate your digital alumni ID</p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="alumni-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              className={fieldErrors.fullName ? 'input-error' : ''}
            />
            {fieldErrors.fullName && (
              <span className="field-error">{fieldErrors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="school">School</label>
            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className={fieldErrors.school ? 'input-error' : ''}
            >
              <option value="">Select school</option>
              {SCHOOL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.school && (
              <span className="field-error">{fieldErrors.school}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year</label>
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
            {fieldErrors.graduationYear && (
              <span className="field-error">{fieldErrors.graduationYear}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="program">Program</label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className={fieldErrors.program ? 'input-error' : ''}
            >
              <option value="">Select program</option>
              {PROGRAM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.program && (
              <span className="field-error">{fieldErrors.program}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="studentNumber">Student Number</label>
            <input
              id="studentNumber"
              name="studentNumber"
              type="text"
              value={formData.studentNumber}
              onChange={handleChange}
              placeholder="Student ID"
              className={fieldErrors.studentNumber ? 'input-error' : ''}
            />
            {fieldErrors.studentNumber && (
              <span className="field-error">{fieldErrors.studentNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="photo">1×1 Photo</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={handleChange}
              className={`file-input ${fieldErrors.photo ? 'input-error' : ''}`}
            />
            {photoPreviewUrl && (
              <div className="photo-preview-wrap">
                <img
                  src={photoPreviewUrl}
                  alt="Preview of your 1×1 photo"
                  className="photo-preview"
                />
                {formData.photo && (
                  <span className="file-name">{formData.photo.name}</span>
                )}
              </div>
            )}
            {fieldErrors.photo && (
              <span className="field-error">{fieldErrors.photo}</span>
            )}
          </div>

          <button type="submit" className="btn btn-submit" disabled={disabled}>
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default AlumniForm
