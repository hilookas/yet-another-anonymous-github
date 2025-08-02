import { encryptConfig, decryptConfig, anonymizeContent, GitHubConfig } from '@/lib/crypto';

describe('Crypto Functions', () => {
  const testConfig: GitHubConfig = {
    type: 'gh',
    repo: 'hilookas/Helper3D',
    branch: 'master',
    anonymizeTerms: ['name1', 'name2', 'name3']
  };

  describe('encryptConfig', () => {
    it('should encrypt a valid config', () => {
      const encrypted = encryptConfig(testConfig);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should handle different configs', () => {
      const config1 = { ...testConfig, repo: 'user/repo1' };
      const config2 = { ...testConfig, repo: 'user/repo2' };
      
      const encrypted1 = encryptConfig(config1);
      const encrypted2 = encryptConfig(config2);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptConfig', () => {
    it('should decrypt a valid encrypted config', () => {
      const encrypted = encryptConfig(testConfig);
      const decrypted = decryptConfig(encrypted);
      
      expect(decrypted).toEqual(testConfig);
    });

    it('should return null for invalid encrypted string', () => {
      const result = decryptConfig('invalid-encrypted-string');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = decryptConfig('');
      expect(result).toBeNull();
    });

    it('should validate config structure', () => {
      const invalidConfig = {
        type: 'gh',
        repo: 'test/repo',
        // Missing required fields
      };
      
      const encrypted = encryptConfig(invalidConfig as any);
      const decrypted = decryptConfig(encrypted);
      
      expect(decrypted).toBeNull();
    });
  });

  describe('anonymizeContent', () => {
    it('should replace terms with XXXX-1, XXXX-2, etc.', () => {
      const content = 'Hello name1, this is name2 and name3';
      const terms = ['name1', 'name2', 'name3'];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toBe('Hello XXXX-1, this is XXXX-2 and XXXX-3');
    });

    it('should handle case insensitive replacement', () => {
      const content = 'Hello NAME1, this is Name2 and name3';
      const terms = ['name1', 'name2', 'name3'];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toBe('Hello XXXX-1, this is XXXX-2 and XXXX-3');
    });

    it('should handle empty terms array', () => {
      const content = 'Hello name1, this is name2';
      const terms: string[] = [];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toBe(content);
    });

    it('should handle empty content', () => {
      const content = '';
      const terms = ['name1', 'name2'];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toBe('');
    });

    it('should handle terms with special characters', () => {
      const content = 'Hello user-name, this is api_key';
      const terms = ['user-name', 'api_key'];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toBe('Hello XXXX-1, this is XXXX-2');
    });

    it('should handle Python code with function names', () => {
      const content = `
def process_data(name1, name2, name3):
    result = name1 + name2 + name3
    return result

class DataProcessor:
    def __init__(self, name1, name2):
        self.name1 = name1
        self.name2 = name2
`;
      const terms = ['name1', 'name2', 'name3'];
      
      const result = anonymizeContent(content, terms);
      
      expect(result).toContain('XXXX-1');
      expect(result).toContain('XXXX-2');
      expect(result).toContain('XXXX-3');
      expect(result).not.toContain('name1');
      expect(result).not.toContain('name2');
      expect(result).not.toContain('name3');
    });
  });

  describe('Integration Tests', () => {
    it('should encrypt, decrypt, and anonymize correctly', () => {
      const config: GitHubConfig = {
        type: 'gh',
        repo: 'test/repo',
        branch: 'main',
        anonymizeTerms: ['password', 'secret', 'token']
      };

      const content = 'const password = "secret123"; const token = "abc123";';
      
      // Encrypt config
      const encrypted = encryptConfig(config);
      expect(encrypted).toBeDefined();
      
      // Decrypt config
      const decrypted = decryptConfig(encrypted);
      expect(decrypted).toEqual(config);
      
      // Anonymize content
      const anonymized = anonymizeContent(content, config.anonymizeTerms);
      expect(anonymized).toBe('const XXXX-1 = "secret123"; const XXXX-3 = "abc123";');
    });
  });
}); 