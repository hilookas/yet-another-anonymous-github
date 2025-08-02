'use client';

import { useState } from 'react';

export default function Home() {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [anonymizeTerms, setAnonymizeTerms] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationWarning, setValidationWarning] = useState('');

  const generateUrl = async () => {
    if (!repo.trim()) {
      setValidationError('Please enter a repository name');
      return;
    }

    setIsLoading(true);
    setValidationError('');
    setValidationWarning('');

    try {
      const response = await fetch('/api/validate-and-encrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: repo.trim(),
          branch: branch.trim(),
          anonymizeTerms: anonymizeTerms
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setValidationError(result.error || 'Validation failed');
        setIsLoading(false);
        return;
      }

      console.dir(result);

      if (result.info) {
        // Check for README warning
        if (!result.info.hasReadme) {
          setValidationWarning(`⚠️ Warning: Repository ${repo} does not have a README file in branch ${branch}`);
        }
        
        // If branch is not default branch, give a hint
        if (result.info.default_branch !== branch.trim()) {
          setValidationWarning(prev => 
            prev + `\n💡 Tip: Current branch is ${branch}, default branch is ${result.info!.default_branch}`
          );
        }
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const url = `${baseUrl}/${result.encrypted}/${result.info && result.info.hasReadme ? result.info.readmePath : ''}`;
      
      setGeneratedUrl(url);
    } catch (error) {
      console.error('Failed to generate URL:', error);
      setValidationError('Error generating URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      alert('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yet Another Anonymous GitHub
          </h1>
          <p className="text-lg text-gray-600">
            Create anonymous GitHub links with terms replacement
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 mt-0">Configure Anonymous Link</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository Name
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="e.g., username/repository"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g., main, master, develop"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms to Anonymize
              </label>
              <textarea
                value={anonymizeTerms}
                onChange={(e) => setAnonymizeTerms(e.target.value)}
                placeholder="One term per line"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Each line will be replaced with XXXX-1, XXXX-2, ...
              </p>
            </div>

            <button
              onClick={generateUrl}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Anonymous Link'}
            </button>
          </div>

          {/* Validation Results */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Validation Failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {validationError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {validationWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Validation Warning</h3>
                  <div className="mt-2 text-sm text-yellow-700 whitespace-pre-line">
                    {validationWarning}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* repoInfo state was removed, so this block is no longer relevant */}
        </div>

        {generatedUrl && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Generated Link</h3>
            <div className="bg-gray-100 p-4 rounded-md mb-4">
              <code className="text-sm break-all">{generatedUrl}</code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Copy Link
              </button>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Test Link
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 