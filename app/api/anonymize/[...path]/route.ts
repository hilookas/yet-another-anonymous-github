import { NextRequest, NextResponse } from 'next/server';
import { decryptConfig, anonymizeContent } from '@/lib/crypto';
import { fetchGitHubFile, fetchGitHubFiles, decodeBase64Content, isMarkdownFile, isCodeFile } from '@/lib/github';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path;
    
    if (pathSegments.length < 1) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    
    const encryptedConfig = decodeURIComponent(pathSegments[0]);
    
    // Decrypt configuration
    const config = decryptConfig(encryptedConfig);
    if (!config) {
      return NextResponse.json({ error: 'Invalid encrypted configuration' }, { status: 400 });
    }
    
    // If only one path segment, return file tree
    if (pathSegments.length === 1) {
      const githubToken = process.env.GITHUB_TOKEN;
      const files = await fetchGitHubFiles(config.repo, config.branch, githubToken);
      
      if (!files) {
        return NextResponse.json({ error: 'Unable to fetch repository files' }, { status: 404 });
      }
      
      return NextResponse.json({
        files: files,
        repo: config.repo,
        branch: config.branch
      });
    }
    
    // If multiple path segments, fetch specific file
    const filePath = pathSegments.slice(1).join('/');
    
    // Fetch GitHub file
    const githubToken = process.env.GITHUB_TOKEN;
    const file = await fetchGitHubFile(config.repo, filePath, config.branch, githubToken);
    
    if (!file) {
      return NextResponse.json({ error: 'Unable to fetch file' }, { status: 404 });
    }
    
    // Decode file content
    let content = decodeBase64Content(file.content);
    
    // Anonymize content
    const anonymizedContent = anonymizeContent(content, config.anonymizeTerms);
    
    // Determine content type
    const isMarkdown = isMarkdownFile(file.name);
    const isCode = isCodeFile(file.name);
    
    // Return JSON response with file data
    return NextResponse.json({
      filename: file.name,
      content: anonymizedContent,
      isMarkdown,
      isCode,
      originalPath: filePath,
      language: isCode ? getLanguageClass(file.name) : null
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getLanguageClass(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'sh': 'bash',
    'bash': 'bash',
    'sql': 'sql',
    'r': 'r',
    'm': 'matlab',
    'mm': 'objc',
    'pl': 'perl',
    'lua': 'lua',
    'dart': 'dart',
    'elm': 'elm',
    'hs': 'haskell',
    'fs': 'fsharp',
    'clj': 'clojure',
    'scala': 'scala',
    'groovy': 'groovy',
    'v': 'verilog',
    'vhdl': 'vhdl'
  };
  return languageMap[ext || ''] || 'text';
} 