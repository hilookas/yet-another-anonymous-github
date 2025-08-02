# Changelog

This project follows [Semantic Versioning](https://semver.org/lang/en/) specification.

## [0.1.0] - 2024-01-01

### New Features

- ✨ Initial version release
- 🔐 Support for AES encrypted GitHub repository configuration
- 🎭 Automatic anonymization of sensitive terms (replaced with XXXX-1, XXXX-2, etc.)
- 📱 Beautiful file display interface with Markdown rendering and code highlighting
- 🚀 No database design, completely file system based
- 🔒 No user system, use directly
- 📋 Repository validation functionality, checking repository existence and branch validity
- 🔗 Generate encrypted anonymous links
- 📄 Support for multiple file types (code files, Markdown, plain text)
- 🎨 Responsive design, mobile-friendly

### Technical Features

- Based on Next.js 14 and React 18
- TypeScript for type-safe development
- Tailwind CSS for styling
- Cloudflare Workers deployment support
- Complete test coverage
- ESLint and Prettier code standards

### Page Features

- **Main Page** (`/`): Main interface for configuring anonymous links
- **Demo Page** (`/demo`): Feature demonstration and examples
- **Test Page** (`/test`): Encryption/decryption functionality testing
- **API Route** (`/api/anonymize/[...path]`): Handle file requests and anonymization

### Security Features

- AES encrypted configuration storage
- Input validation and sanitization
- Secure URL generation
- Environment variable configuration

### Deployment Support

- Cloudflare Workers deployment
- Vercel deployment
- Self-hosted deployment
- Detailed deployment documentation

### Development Tools

- Complete test suite
- Development scripts and tools
- Deployment scripts
- Code quality checks

---

## Planned Features

### v0.2.0

- [ ] Support for more file formats
- [ ] Add file caching functionality
- [ ] Support for batch file processing
- [ ] Improved error handling and user feedback

### v0.3.0

- [ ] Add access statistics
- [ ] Support for custom themes
- [ ] Add file search functionality
- [ ] Support for directory browsing

### v1.0.0

- [ ] Production environment optimization
- [ ] Performance monitoring
- [ ] Complete API documentation
- [ ] Internationalization support

---

## Contributors

Thank you to all developers who have contributed to this project!

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 