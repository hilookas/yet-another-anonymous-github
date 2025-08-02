# Deployment Guide

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `env.example` file to `.env.local`:

```bash
cp env.example .env.local
```

Then edit the `.env.local` file and set your configuration:

```env
# Encryption key - please use a strong key
CRYPTO_SECRET_KEY=your-super-secret-key-change-this-in-production

# GitHub API Token (optional)
GITHUB_TOKEN=your-github-token-here

# Application environment
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

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

Edit the `wrangler.toml` file:

```toml
name = "yet-another-anonymous-github"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { 
  CRYPTO_SECRET_KEY = "your-production-secret-key-change-this",
  GITHUB_TOKEN = "your-github-token-here"
}

# Optional: Configure KV storage for caching
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

### 4. Deploy

Use the deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Or deploy manually:

```bash
npm run build
wrangler deploy
```

### 5. Configure Custom Domain (Optional)

Configure custom domain in Cloudflare Dashboard.

## Deploy to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Set environment variables in Vercel Dashboard:

- `CRYPTO_SECRET_KEY`: Your encryption key
- `GITHUB_TOKEN`: GitHub API Token (optional)

### 4. Deploy

```bash
vercel --prod
```

## Deploy to Other Platforms

### Netlify

1. Build project: `npm run build`
2. Upload `out` directory to Netlify
3. Configure environment variables

### Self-hosted

1. Build project: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (like Nginx)

## Security Considerations

1. **Encryption Key**: Use a strong key, at least 32 characters
2. **Environment Variables**: Don't hardcode sensitive information in code
3. **HTTPS**: Ensure HTTPS is used in production
4. **API Limits**: Consider using GitHub Token to increase API limits
5. **Input Validation**: All user inputs are validated

## Troubleshooting

### Common Issues

1. **Encryption/Decryption Failure**
   - Check if `CRYPTO_SECRET_KEY` is set correctly
   - Ensure the key is consistent across all environments

2. **GitHub API Rate Limits**
   - Set `GITHUB_TOKEN` environment variable
   - Check if Token permissions are correct

3. **Deployment Failure**
   - Check `wrangler.toml` configuration
   - Ensure you're logged into Cloudflare

4. **File Access Failure**
   - Check if repository name and branch are correct
   - Confirm file path exists

### Debugging

Enable detailed logging:

```bash
DEBUG=* npm run dev
```

Check network requests:

```bash
curl -v "https://your-domain.com/[encrypted-config]/[file-path]"
``` 