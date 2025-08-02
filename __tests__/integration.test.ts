import { encryptConfig, decryptConfig, anonymizeContent, GitHubConfig } from '@/lib/crypto';
import { isMarkdownFile, isCodeFile } from '@/lib/github';

describe('Integration Tests', () => {
  describe('Complete Workflow', () => {
    it('should handle the complete anonymization workflow', async () => {
      // 1. Create configuration
      const config: GitHubConfig = {
        type: 'gh',
        repo: 'hilookas/Helper3D',
        branch: 'master',
        anonymizeTerms: ['name1', 'name2', 'name3']
      };

      // 2. Encrypt configuration
      const encrypted = encryptConfig(config);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);

      // 3. Decrypt configuration
      const decrypted = decryptConfig(encrypted);
      expect(decrypted).toEqual(config);

      // 4. Mock GitHub file content
      const mockFileContent = `name1\nname2\nname3`;
      // 5. Anonymize content
      const anonymizedContent = anonymizeContent(mockFileContent, config.anonymizeTerms);
      expect(anonymizedContent).toBe('XXXX-1\nXXXX-2\nXXXX-3');
    });
  });

  describe('URL Generation and Parsing', () => {
    it('should handle URL generation and parsing', () => {
      const config: GitHubConfig = {
        type: 'gh',
        repo: 'test/repo',
        branch: 'main',
        anonymizeTerms: ['password', 'secret']
      };

      // Generate encrypted config
      const encrypted = encryptConfig(config);
      expect(encrypted).toBeDefined();

      // Create URL
      const baseUrl = 'https://example.com';
      const filePath = 'src/utils.py';
      const url = `${baseUrl}/${encodeURIComponent(encrypted)}/${filePath}`;
      
      expect(url).toContain(baseUrl);
      expect(url).toContain(encrypted);
      expect(url).toContain(filePath);

      // Extract encrypted config from URL
      const urlParts = url.split('/');
      const encryptedFromUrl = decodeURIComponent(urlParts[3]); // Fixed index
      expect(encryptedFromUrl).toBe(encrypted);

      // Verify decryption
      const decrypted = decryptConfig(encryptedFromUrl);
      expect(decrypted).toEqual(config);
    });
  });

  describe('File Type Detection', () => {
    it('should correctly identify different file types', () => {
      const testCases = [
        { filename: 'README.md', isMarkdown: true, isCode: false },
        { filename: 'script.py', isMarkdown: false, isCode: true },
        { filename: 'app.js', isMarkdown: false, isCode: true },
        { filename: 'style.css', isMarkdown: false, isCode: true },
        { filename: 'data.json', isMarkdown: false, isCode: true },
        { filename: 'image.png', isMarkdown: false, isCode: false },
        { filename: 'document.pdf', isMarkdown: false, isCode: false }
      ];

      testCases.forEach(({ filename, isMarkdown, isCode }) => {
        expect(isMarkdownFile(filename)).toBe(isMarkdown);
        expect(isCodeFile(filename)).toBe(isCode);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid encrypted strings gracefully', () => {
      const invalidEncrypted = 'invalid-encrypted-string';
      const result = decryptConfig(invalidEncrypted);
      expect(result).toBeNull();
    });

    it('should handle empty encrypted strings', () => {
      const result = decryptConfig('');
      expect(result).toBeNull();
    });

    it('should handle malformed encrypted strings', () => {
      const malformed = 'not-a-valid-encrypted-string!@#';
      const result = decryptConfig(malformed);
      expect(result).toBeNull();
    });
  });

  describe('Content Anonymization Edge Cases', () => {
    it('should handle empty content', () => {
      const content = '';
      const terms = ['password', 'secret'];
      const result = anonymizeContent(content, terms);
      expect(result).toBe('');
    });

    it('should handle empty terms array', () => {
      const content = 'Hello password and secret';
      const terms: string[] = [];
      const result = anonymizeContent(content, terms);
      expect(result).toBe(content);
    });

    it('should handle terms with special regex characters', () => {
      const content = 'user.name\napi-key';
      const terms = ['user.name', 'api-key'];
      const result = anonymizeContent(content, terms);
      expect(result).toBe('XXXX-1\nXXXX-2');
    });

    it('should handle case insensitive matching', () => {
      const content = 'PASSWORD\nSecret';
      const terms = ['password', 'secret'];
      const result = anonymizeContent(content, terms);
      expect(result).toBe('XXXX-1\nXXXX-2');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle Python code with sensitive variable names', () => {
      const pythonCode = 'API_KEY\nSECRET_TOKEN\napi_key\nsecret_token';
      const terms = ['API_KEY', 'SECRET_TOKEN', 'api_key', 'secret_token'];
      const anonymized = anonymizeContent(pythonCode, terms);
      expect(anonymized).toBe('XXXX-1\nXXXX-2\nXXXX-1\nXXXX-2');
    });

    it('should handle JavaScript code with sensitive data', () => {
      const jsCode = 'apiKey\nsecretToken\ndatabaseUrl';
      const terms = ['apiKey', 'secretToken', 'databaseUrl'];
      const anonymized = anonymizeContent(jsCode, terms);
      expect(anonymized).toBe('XXXX-1\nXXXX-2\nXXXX-3');
    });
  });
}); 