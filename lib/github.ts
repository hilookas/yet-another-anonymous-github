export interface GitHubFile {
  content: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  type: string;
}

export interface RepositoryInfo {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  branches: string[];
  hasReadme: boolean;
  readmePath?: string;
}

export async function validateRepository(
  repo: string,
  branch: string,
  token?: string
): Promise<{ valid: boolean; info?: RepositoryInfo; error?: string }> {
  try {
    console.log(`Validating repository: ${repo}`);
    
    // 1. Check if repository exists and is accessible
    const repoUrl = `https://api.github.com/repos/${repo}`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Yet-Another-Anonymous-GitHub'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const repoResponse = await fetch(repoUrl, { headers });
    
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return { valid: false, error: `Repository ${repo} does not exist or is not accessible` };
      } else if (repoResponse.status === 403) {
        return { valid: false, error: `Repository ${repo} access denied, may be a private repository requiring authentication` };
      } else {
        return { valid: false, error: `Repository ${repo} validation failed: ${repoResponse.status} ${repoResponse.statusText}` };
      }
    }
    
    const repoData = await repoResponse.json();
    console.log(`✅ Repository validation successful: ${repoData.full_name}`);
    
    // 2. Get default branch
    const defaultBranch = repoData.default_branch;
    console.log(`Default branch: ${defaultBranch}`);
    
    // 3. Check if specified branch exists
    const branchesUrl = `https://api.github.com/repos/${repo}/branches`;
    const branchesResponse = await fetch(branchesUrl, { headers });
    
    if (!branchesResponse.ok) {
      return { valid: false, error: `Unable to get repository branch information` };
    }
    
    const branchesData = await branchesResponse.json();
    const branchs = branchesData.map((b: any) => b.name);
    console.log(`Available branches: ${branchs.join(', ')}`);
    
    if (!branchs.includes(branch)) {
      return { 
        valid: false, 
        error: `Branch ${branch} does not exist. Available branches: ${branchs.join(', ')}` 
      };
    }
    
    // 4. Check for README file
    const readmeFiles = ['README.md', 'README.txt', 'README.rst', 'readme.md', 'readme.txt'];
    let hasReadme = false;
    let readmePath = '';
    
    for (const readmeFile of readmeFiles) {
      try {
        const readmeUrl = `https://api.github.com/repos/${repo}/contents/${readmeFile}?ref=${branch}`;
        const readmeResponse = await fetch(readmeUrl, { headers });
        
        if (readmeResponse.ok) {
          hasReadme = true;
          readmePath = readmeFile;
          break;
        }
      } catch (error) {
        // Continue checking next README file
        continue;
      }
    }
    
    if (!hasReadme) {
      console.warn(`⚠️  Warning: Repository ${repo} does not have a README file in branch ${branch}`);
    } else {
      console.log(`✅ Found README file: ${readmePath}`);
    }
    
    const info: RepositoryInfo = {
      name: repoData.name,
      full_name: repoData.full_name,
      private: repoData.private,
      default_branch: defaultBranch,
      branches: branchs,
      hasReadme,
      readmePath
    };
    
    return { valid: true, info };
    
  } catch (error) {
    console.error('Error validating repository:', error);
    return { valid: false, error: `Error validating repository: ${error}` };
  }
}

export async function fetchGitHubFile(
  repo: string,
  path: string,
  branch: string,
  token?: string
): Promise<GitHubFile | null> {
  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    
    console.log(`Requesting GitHub file: ${url}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Yet-Another-Anonymous-GitHub'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      console.error(`Request URL: ${url}`);
      console.error(`Error details: ${errorText}`);
      
      // Provide more specific error information
      if (response.status === 404) {
        console.error(`File not found: Cannot find file ${path} in repository ${repo} (branch: ${branch})`);
        console.error(`Please check:`);
        console.error(`1. Repository name is correct: ${repo}`);
        console.error(`2. File path is correct: ${path}`);
        console.error(`3. Branch name is correct: ${branch}`);
        console.error(`4. Repository is not private (requires GitHub Token)`);
      } else if (response.status === 403) {
        console.error(`Access denied: May be API rate limit or requires authentication`);
        console.error(`Suggestion: Set GitHub Token to increase API limits`);
      }
      
      return null;
    }
    
    const data = await response.json();
    
    if (data.type !== 'file') {
      console.error(`Requested path is not a file: ${data.type}`);
      console.error(`Path: ${path}`);
      return null;
    }
    
    console.log(`Successfully retrieved file: ${data.name} (size: ${data.size} bytes)`);
    return data;
  } catch (error) {
    console.error('Failed to fetch GitHub file:', error);
    console.error(`Request parameters: repo=${repo}, path=${path}, branch=${branch}`);
    return null;
  }
}

export function decodeBase64Content(content: string): string {
  try {
    return Buffer.from(content, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Failed to decode Base64 content:', error);
    return content;
  }
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function isMarkdownFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['md', 'markdown'].includes(ext);
}

export function isCodeFile(filename: string): boolean {
  const codeExtensions = [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt',
    'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'sh', 'bash',
    'sql', 'r', 'm', 'mm', 'pl', 'lua', 'dart', 'elm', 'hs', 'fs', 'clj', 'scala', 'groovy', 'v', 'vhdl'
  ];
  return codeExtensions.includes(getFileExtension(filename));
}

import { GitHubFileTreeItem } from './types';

export async function fetchGitHubFiles(
  repo: string,
  branch: string,
  token?: string
): Promise<GitHubFileTreeItem[] | null> {
  try {
    const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    
    console.log(`Requesting GitHub file tree: ${url}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Yet-Another-Anonymous-GitHub'
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.tree) {
      console.error('No tree data in response');
      return null;
    }
    
    // Convert tree items to our format and add directory entries
    const files: GitHubFileTreeItem[] = [];
    const seenPaths = new Set<string>();
    
    data.tree.forEach((item: any) => {
      // Add the file/directory itself
      files.push({
        name: item.path.split('/').pop() || item.path,
        path: item.path,
        type: item.type,
        size: item.size
      });
      seenPaths.add(item.path);
      
      // Add parent directories if they don't exist
      const pathParts = item.path.split('/');
      for (let i = 1; i < pathParts.length; i++) {
        const parentPath = pathParts.slice(0, i).join('/');
        if (!seenPaths.has(parentPath)) {
          files.push({
            name: pathParts[i - 1],
            path: parentPath,
            type: 'dir'
          });
          seenPaths.add(parentPath);
        }
      }
    });
    
    // Sort files to ensure directories come before their contents
    files.sort((a, b) => {
      if (a.path === b.path) return 0;
      if (a.path.startsWith(b.path + '/')) return 1;
      if (b.path.startsWith(a.path + '/')) return -1;
      return a.path.localeCompare(b.path);
    });
    
    console.log(`Successfully retrieved ${files.length} files/directories`);
    return files;
  } catch (error) {
    console.error('Failed to fetch GitHub files:', error);
    return null;
  }
} 