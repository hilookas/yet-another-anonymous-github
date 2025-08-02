# Yet Another Anonymous GitHub

An anonymous GitHub repository tool based on Next.js and Cloudflare Worker that can automatically replace sensitive information for double-blind review process.

## Features

- 🎭 **Automatic Anonymization**: Automatically replaces specified sensitive terms with XXXX-1, XXXX-2, etc.
- 🔥 **Lightning Fast**: One click, no waiting
- 🚀 **ServerLess Deploy**: No database required, just deploy to Cloudflare Pages
- 🔒 **No User System**: No login required, use directly
- 📱 **Beautiful Interface**: Supports Markdown rendering and code highlighting

## How It Works?

1. User input the repository name, branch name, and terms to anonymize.
2. The system will encrypt the configuration using AES, and generate a link with the encrypted configuration.
3. The viewer can access the files in the repository using the generated link, but cannot see the sensitive terms. Only server knows whats behind encrypted configuration. 😈

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### 1. Configure Anonymous Link

On the main page, fill in:
- **Repository Name**: e.g., `username/repository`
- **Branch Name**: e.g., `main`, `master`, `develop`
- **Terms to Anonymize**: comma separated, e.g., `name`

### 2. Generate Link

Click the "Generate Anonymous Link" button, and the system will create an encrypted URL.

### 3. Access Files

Use the generated link to access files in the format:
```
https://your-domain.com/[encrypted-config]/[file-path]
```

For example:
```
https://yaag.w5.cx/U2FsdGVkX1_6bT-MRUj8bmfHSSQK6MQ_nZOjNgpXLqgkin2jn4vGv-6YwDQbhlJrZYdKxYtkWRMcpt11KvN_U7-qEUs3loVCx3BFLxVDOeNcJG9XuHohI1AkJ-mFqIGGsZVM1psDwb4d6yoKuxsWVuE0T8Ydr-57rgOy6wm03GiLrSXOtRRPziMRAuuhOGau/README.md
```

## Deploy to Cloudflare Workers

```bash
npm run deploy
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Encryption**: CryptoJS
- **Markdown**: React Markdown
- **Code Highlighting**: Prism.js
- **Deployment**: Cloudflare Workers

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── lib/                   # Utility libraries
│   ├── crypto.ts          # Encryption/decryption utilities
│   └── github.ts          # GitHub API utilities
├── package.json           # Project configuration
├── tailwind.config.ts     # Tailwind configuration
└── README.md             # Project documentation
```

## License

MIT License

## Contributing

Issues and Pull Requests are welcome! 

## Acknowledgments

Cursor, my coding partner.