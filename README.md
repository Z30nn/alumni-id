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
- **Google Drive** - Logo file storage
- **PDFShift API** - HTML to PDF conversion

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
├── Alumni ID Webhook.json   # n8n workflow for PDF generation
├── index.html              # HTML entry point
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## Installation / Setup

### Prerequisites

- Node.js 18+
- n8n instance (self-hosted or cloud)
- Google Drive account (for logo storage)
- PDFShift API account

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
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
| `VITE_LOGO_SCRIPT_URL` | URL for fetching school logos and templates | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a Pull Request

## License

MIT License