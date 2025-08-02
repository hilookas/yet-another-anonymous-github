# Contributing Guide

Thank you for your interest in the Yet Another Anonymous GitHub project! We welcome all forms of contributions.

## How to Contribute

### 1. Report Issues

If you find a bug or have a feature suggestion, please create an Issue:

- Use a clear title to describe the problem
- Provide detailed reproduction steps
- Include error messages and screenshots (if applicable)
- Describe your environment and version information

### 2. Submit Code

#### Preparation

1. Fork this repository
2. Clone your fork to local:
   ```bash
   git clone https://github.com/your-username/yet-another-anonymous-github.git
   cd yet-another-anonymous-github
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Process

1. Run tests to ensure everything is working:
   ```bash
   npm test
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Make your changes

4. Add tests (if applicable):
   ```bash
   npm test
   ```

5. Check code style:
   ```bash
   npm run lint
   ```

#### Submit Code

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create Pull Request

### 3. Code Standards

#### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation update
- `style:` code formatting adjustment
- `refactor:` code refactoring
- `test:` test related
- `chore:` build process or auxiliary tool changes

#### Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier to format code
- Add appropriate comments and documentation

#### Testing Requirements

- New features need corresponding tests
- Bug fixes need regression tests
- Ensure all tests pass

### 4. Documentation Contributions

We welcome documentation improvements:

- Fix spelling errors
- Improve documentation
- Add example code
- Translate documentation

### 5. Feature Suggestions

If you have feature suggestions:

1. First check if there are related Issues
2. Create a new Issue describing your idea
3. Discuss implementation plan
4. If approved, you can start implementing

## Development Environment Setup

### Required Tools

- Node.js 18+
- npm or yarn
- Git

### Environment Variables

Create `.env.local` file:

```env
CRYPTO_SECRET_KEY=your-test-secret-key
GITHUB_TOKEN=your-github-token
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build production version
npm run start        # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Auto-fix code style issues
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── demo/              # Demo page
│   ├── test/              # Test page
│   └── page.tsx           # Main page
├── lib/                   # Utility libraries
│   ├── crypto.ts          # Encryption/decryption utilities
│   └── github.ts          # GitHub API utilities
├── __tests__/             # Test files
├── scripts/               # Script files
└── docs/                  # Documentation
```

## Release Process

1. Update version number (follow semantic versioning)
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production

## Code of Conduct

- Respect all contributors
- Maintain professional and friendly communication
- Accept constructive criticism
- Help new contributors

## License

By submitting code, you agree that your contribution will be released under the MIT License.

## Contact

If you have any questions, please:

1. Check [README.md](README.md)
2. Search existing Issues
3. Create a new Issue

Thank you for your contribution! 