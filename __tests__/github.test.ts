import { 
  fetchGitHubFile, 
  decodeBase64Content, 
  getFileExtension, 
  isMarkdownFile, 
  isCodeFile,
  GitHubFile 
} from '@/lib/github';

describe('GitHub API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGitHubFile', () => {
    it('should fetch a file successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: 'SGVsbG8gV29ybGQ=', // Base64 encoded "Hello World"
          encoding: 'base64',
          size: 11,
          name: 'test.py',
          path: 'src/test.py',
          type: 'file'
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchGitHubFile('test/repo', 'src/test.py', 'main');

      expect(result).toEqual({
        content: 'SGVsbG8gV29ybGQ=',
        encoding: 'base64',
        size: 11,
        name: 'test.py',
        path: 'src/test.py',
        type: 'file'
      });
    });

    it('should return null for non-file responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          type: 'dir',
          path: 'src'
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchGitHubFile('test/repo', 'src', 'main');

      expect(result).toBeNull();
    });

    it('should return null for API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchGitHubFile('test/repo', 'nonexistent.py', 'main');

      expect(result).toBeNull();
    });

    it('should include authorization header when token is provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          content: 'SGVsbG8=',
          encoding: 'base64',
          size: 5,
          name: 'test.py',
          path: 'test.py',
          type: 'file'
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await fetchGitHubFile('test/repo', 'test.py', 'main', 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test/repo/contents/test.py?ref=main',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'token test-token'
          })
        })
      );
    });
  });

  describe('decodeBase64Content', () => {
    it('should decode base64 content correctly', () => {
      const base64Content = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const result = decodeBase64Content(base64Content);
      expect(result).toBe('Hello World');
    });

    it('should handle empty content', () => {
      const result = decodeBase64Content('');
      expect(result).toBe('');
    });

    it('should handle invalid base64 gracefully', () => {
      const result = decodeBase64Content('invalid-base64!@#');
      expect(result).not.toBe('invalid-base64!@#');
      expect(typeof result).toBe('string');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('test.py')).toBe('py');
      expect(getFileExtension('file.js')).toBe('js');
      expect(getFileExtension('README.md')).toBe('md');
    });

    it('should handle files without extension', () => {
      expect(getFileExtension('Dockerfile')).toBe('');
      expect(getFileExtension('Makefile')).toBe('');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileExtension('test.min.js')).toBe('js');
      expect(getFileExtension('config.prod.json')).toBe('json');
    });

    it('should handle empty filename', () => {
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('isMarkdownFile', () => {
    it('should identify markdown files correctly', () => {
      expect(isMarkdownFile('README.md')).toBe(true);
      expect(isMarkdownFile('documentation.markdown')).toBe(true);
      expect(isMarkdownFile('guide.MD')).toBe(true);
    });

    it('should return false for non-markdown files', () => {
      expect(isMarkdownFile('test.py')).toBe(false);
      expect(isMarkdownFile('script.js')).toBe(false);
      expect(isMarkdownFile('data.json')).toBe(false);
    });
  });

  describe('isCodeFile', () => {
    it('should identify code files correctly', () => {
      expect(isCodeFile('script.py')).toBe(true);
      expect(isCodeFile('app.js')).toBe(true);
      expect(isCodeFile('component.tsx')).toBe(true);
      expect(isCodeFile('style.css')).toBe(true);
      expect(isCodeFile('data.json')).toBe(true);
    });

    it('should return false for non-code files', () => {
      expect(isCodeFile('README.md')).toBe(false);
      expect(isCodeFile('image.png')).toBe(false);
      expect(isCodeFile('document.pdf')).toBe(false);
    });

    it('should handle various programming languages', () => {
      expect(isCodeFile('main.cpp')).toBe(true);
      expect(isCodeFile('app.java')).toBe(true);
      expect(isCodeFile('script.php')).toBe(true);
      expect(isCodeFile('module.go')).toBe(true);
      expect(isCodeFile('lib.rs')).toBe(true);
    });
  });
}); 