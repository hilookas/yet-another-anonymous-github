require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
  },
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock crypto-js for consistent testing
jest.mock('crypto-js', () => {
  const originalCryptoJS = jest.requireActual('crypto-js');
  return {
    ...originalCryptoJS,
    AES: {
      encrypt: jest.fn((text, key) => {
        // Simple base64 encoding as mock encryption
        const encoded = Buffer.from(text).toString('base64');
        return {
          toString: () => encoded
        };
      }),
      decrypt: jest.fn((encrypted, key) => {
        // Simple base64 decoding as mock decryption
        try {
          const decoded = Buffer.from(encrypted, 'base64').toString('utf8');
          return {
            toString: jest.fn(() => decoded)
          };
        } catch (error) {
          return {
            toString: jest.fn(() => '')
          };
        }
      })
    },
    enc: {
      Utf8: 'utf8'
    }
  };
}); 