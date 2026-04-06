# Alumni ID Generator

A web application for generating personalized alumni ID cards. The application consists of a React frontend and an n8n webhook workflow that handles PDF generation.

## Features

- Generate personalized Alumni ID cards with customizable templates
- Support for school-specific logos and branding themes
- Photo and electronic signature capture
- PDF preview and download
- Local storage persistence for generated IDs
- Responsive web interface

## Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Vite** 5.0.0 - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite

### Backend (n8n Workflow)
- **n8n** - Workflow automation
- **Google Drive** - Logo and template file storage (see below)
- **PDFShift API** - HTML to PDF conversion

### Google Apps Script
- **`apps-scipt.gs`** - Deployed as a web app; looks up each school’s logo and HTML/CSS template in Drive and returns file IDs (and template text) to the frontend via JSON/JSONP

## Project Structure

```
alumni-id/
├── src/
│   ├── components/
│   │   ├── AlumniForm.jsx    # Alumni ID input form
│   │   ├── Dashboard.jsx     # Main dashboard view
│   │   ├── Loader.jsx        # Loading indicator
│   │   └── PdfViewer.jsx     # PDF preview component
│   ├── api/
│   │   └── scriptApi.js     # External script API client
│   ├── storage/
│   │   └── pdfStorage.js    # IndexedDB PDF storage
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── styles.css            # Global styles
├── apps-scipt.gs            # Google Apps Script: Drive lookup for logos & templates (deploy separately)
├── Alumni ID School Logo/   # Local reference copy; mirror this folder in Google Drive (see below)
├── Alumni ID Templates/     # Local reference copy; mirror this folder in Google Drive (see below)
├── Alumni ID Webhook.json   # n8n workflow for PDF generation
├── index.html              # HTML entry point
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## Installation / Setup

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- Google account with Google Drive (for logos and templates)
- Google Apps Script (deploy `apps-scipt.gs` as a web app if you use `VITE_LOGO_SCRIPT_URL` to load logos and templates from Drive)
- PDFShift API account

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Z30nn/alumni-id.git
   cd alumni-id
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_WEBHOOK_URL=https://your-n8n-instance/webhook/your-webhook-id
   VITE_LOGO_SCRIPT_URL=https://your-script-url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

### n8n Workflow Setup

1. Import `Alumni ID Webhook.json` into your n8n instance
2. Configure credentials:
   - **Google Drive**: Connect your Google Drive account
   - **PDFShift**: Add your PDFShift API credentials (HTTP Basic Auth)
3. Activate the workflow
4. Note the webhook URL and configure it in the frontend `.env`

### Google Apps Script & Google Drive

The frontend can call a deployed Apps Script URL (`VITE_LOGO_SCRIPT_URL`) to resolve each school’s **logo** and **template** from Drive. The script in `apps-scipt.gs` implements that lookup.

**What the script does**

- Reads query parameters: `school` (required), optional `type` (`logo` default, or `template`), and optional `callback` for JSONP.
- For **`type=logo`** (or omitted): finds the logo file in Drive and returns JSON like `{ "fileId": "...", "error": null }`.
- For **`type=template`**: finds the template file, reads its contents as text, and returns `{ "fileId": "...", "content": "...", "error": null }`.
- School names must match the keys in `SCHOOL_TO_FILENAME` inside `apps-scipt.gs`; each school maps to a **file base name** (e.g. `University of Santo Tomas` → `ust`).

**Drive folders (required)**

Create these two folders in **Google Drive** and keep their names **exactly** as below. The script resolves them from **My Drive** (top-level folders):

| Folder name in Drive | Purpose |
|----------------------|---------|
| `Alumni ID School Logo` | One logo file per school; **file base name** must match the script map (e.g. `ust.svg`, `admu.png`). |
| `Alumni ID Templates` | One template file per school; same **base name** (e.g. `ust.js`, `admu.js`). |

The directories `Alumni ID School Logo/` and `Alumni ID Templates/` in this repository are the **reference layouts** you should mirror in Drive (upload the same files or keep naming consistent with `SCHOOL_TO_FILENAME`).

**Deploy the script**

1. Open [script.google.com](https://script.google.com), create a project, and paste the contents of `apps-scipt.gs`.
2. Authorize **Drive** access when prompted.
3. Deploy → **New deployment** → type **Web app**; set “Execute as” and “Who has access” as appropriate for your use case.
4. Copy the web app URL into `.env` as `VITE_LOGO_SCRIPT_URL`.

The React app calls this URL with JSONP (see `src/api/scriptApi.js`) to avoid browser CORS issues.

## Usage

1. Open the application in your browser
2. Fill in the alumni information form:
   - Full Name
   - School
   - Student Number
   - Program
   - Graduation Year
   - Mobile Number
   - Email
   - Photo (upload)
   - Electronic Signature (draw or upload)
3. Click "Generate ID"
4. Preview the generated PDF
5. Download the ID card or save it to your dashboard

## API Reference

### Webhook Input

The n8n webhook expects a POST request with the following JSON payload:

```json
{
  "fullName": "John Doe",
  "school": "School Name",
  "studentNumber": "STU001",
  "program": "Computer Science",
  "graduationYear": "2024",
  "mobile": "+1234567890",
  "email": "john@example.com",
  "photo": "base64-encoded-photo",
  "esig": "base64-encoded-signature",
  "logoFileId": "google-drive-file-id (optional)",
  "templateContent": "css-custom-properties (optional)"
}
```

### Webhook Response

The webhook returns a JSON object with the PDF:

```json
{
  "pdfBase64": "base64-encoded-pdf"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_WEBHOOK_URL` | n8n webhook URL | Yes |
| `VITE_LOGO_SCRIPT_URL` | Deployed `apps-scipt.gs` web app URL; used to fetch school logo file IDs and template content from Drive | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a Pull Request

## License

MIT License