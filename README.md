# Yet Another Anonymous GitHub

An anonymous GitHub repository tool based on Next.js and Cloudflare Worker that can automatically replace sensitive information and generate beautiful file display pages.

## Features

- 🔐 **Encrypted Configuration**: Uses AES encryption to store GitHub repository configuration information
- 🎭 **Automatic Anonymization**: Automatically replaces specified sensitive terms with XXXX-1, XXXX-2, etc.
- 📱 **Beautiful Interface**: Supports Markdown rendering and code highlighting
- 🚀 **No Database**: No database required, completely file system based
- 🔒 **No User System**: No login required, use directly

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
# Encryption key - please use a strong key in production
CRYPTO_SECRET_KEY=your-super-secret-key-change-this-in-production

# GitHub API Token (optional, for higher API limits)
GITHUB_TOKEN=your-github-token-here
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### 1. Configure Anonymous Link

On the main page, fill in:
- **Repository Name**: e.g., `username/repository`
- **Branch Name**: e.g., `main`, `master`, `develop`
- **Terms to Anonymize**: comma separated, e.g., `password,api_key,secret`

### 2. Generate Link

Click the "Generate Anonymous Link" button, and the system will create an encrypted URL.

### 3. Access Files

Use the generated link to access files in the format:
```
https://your-domain.com/[encrypted-config]/[file-path]
```

For example:
```
https://your-domain.com/[encrypted-config]/src/utils.py
```

## Deploy to Cloudflare Workers

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Configure wrangler.toml

```toml
name = "yet-another-anonymous-github"
main = "src/index.ts"
compatibility_date = "2023-01-01"

[env.production]
vars = { CRYPTO_SECRET_KEY = "your-production-secret-key" }
```

### 4. Deploy

```bash
wrangler deploy
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

## Security Notes

1. **Encryption Key**: Please use a strong key in production and keep it secure
2. **GitHub Token**: It's recommended to use a GitHub Personal Access Token to increase API limits
3. **HTTPS**: Ensure HTTPS is used in production
4. **Input Validation**: All user inputs are validated and sanitized

## License

MIT License

## Contributing

Issues and Pull Requests are welcome! 