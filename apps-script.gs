const LOGO_FOLDER_NAME = 'Alumni ID School Logo'
const TEMPLATE_FOLDER_NAME = 'Alumni ID Templates'

const SCHOOL_TO_FILENAME = {
  'Ateneo de Manila University': 'admu',
  'Adamson University': 'adu',
  'Angeles University Foundation': 'auf',
  'Central Luzon State University': 'clsu',
  'Central Philippine University': 'cpu',
  'De La Salle University': 'dlsu',
  'Far Eastern University': 'feu',
  'Lyceum of the Philippines University': 'lpu',
  'Mapúa University': 'mapua',
  'Polytechnic University of the Philippines': 'pup',
  'San Beda University': 'sbu',
  'Silliman University': 'su',
  'Technological Institute of the Philippines': 'tip',
  'University of the Assumption': 'ua',
  'University of Asia and the Pacific': 'uanp',
  'University of Baguio': 'ub',
  'University of Cebu': 'uceb',
  'University of the Cordilleras': 'ucor',
  'University of the East': 'ue',
  'University of the Immaculate Conception': 'uic',
  'University of Negros Occidental – Recoletos': 'uno-r',
  'University of the Philippines': 'up',
  'University of San Agustin': 'usa',
  'University of San Carlos': 'usc',
  'University of San Jose-Recoletos': 'usjr',
  'University of St. La Salle': 'usls',
  'University of Santo Tomas': 'ust',
  'Visayas State University': 'vsu',
  'Western Mindanao State University': 'wmsu',
  'West Visayas State University': 'wvsu',
}

function doGet(e) {
  const params = e?.parameter || {}
  const school = params.school ? decodeURIComponent(params.school) : ''
  const callback = params.callback || ''
  const type = (params.type || 'logo').toLowerCase()

  let result = { fileId: null, error: null }
  if (type === 'template') {
    result.content = null
    try {
      const info = getTemplateFileInfo(school)
      result.fileId = info.fileId
      result.content = info.content
    } catch (err) {
      result.error = err.message || 'Unknown error'
    }
  } else {
    try {
      result.fileId = getLogoFileId(school)
    } catch (err) {
      result.error = err.message || 'Unknown error'
    }
  }

  const output = JSON.stringify(result)

  if (callback) {
    return ContentService.createTextOutput(callback + '(' + output + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
  }
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON)
}

function getLogoFileId(school) {
  if (!school) throw new Error('Missing school parameter')

  const fileName = SCHOOL_TO_FILENAME[school]
  if (!fileName) throw new Error('Unknown school: ' + school)

  const folder = getFolderByName(LOGO_FOLDER_NAME)
  if (!folder) throw new Error('Folder not found: ' + LOGO_FOLDER_NAME)

  const file = findFileByBaseName(folder, fileName)
  if (!file) throw new Error('Logo file not found for: ' + school)
  return file.getId()
}

function findFileByBaseName(folder, baseName) {
  const files = folder.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    const name = file.getName()
    const base = name.replace(/\.[^.]+$/, '')
    if (base === baseName || name === baseName) return file
  }
  return null
}

function getTemplateFileInfo(school) {
  if (!school) throw new Error('Missing school parameter')

  const baseName = SCHOOL_TO_FILENAME[school]
  if (!baseName) throw new Error('Unknown school: ' + school)

  const folder = getFolderByName(TEMPLATE_FOLDER_NAME)
  if (!folder) throw new Error('Folder not found: ' + TEMPLATE_FOLDER_NAME)

  const file = findFileByBaseName(folder, baseName)
  if (!file) throw new Error('Template file not found for: ' + school)

  const content = file.getBlob().getDataAsString()
  return { fileId: file.getId(), content: content }
}

function getFolderByName(name) {
  const it = DriveApp.getRootFolder().getFoldersByName(name)
  return it.hasNext() ? it.next() : null
}
