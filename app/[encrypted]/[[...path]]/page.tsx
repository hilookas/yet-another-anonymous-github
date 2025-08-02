'use client';

import { useEffect, useState, useCallback } from 'react';
import { marked } from 'marked';
import { GitHubFileTreeItem } from '@/lib/types';

// Type definitions
interface FileData {
  filename: string;
  content: string;
  isMarkdown: boolean;
  isCode: boolean;
  originalPath: string;
  language: string | null;
}

interface TreeNode {
  name: string;
  path: string;
  type: string;
  children: Record<string, TreeNode>;
  size?: number;
}

interface ViewPageProps {
  params: { 
    encrypted: string; 
    path: string[] 
  };
}

// Custom Hook: File tree management
const useFileTree = (encrypted: string) => {
  const [fileTree, setFileTree] = useState<GitHubFileTreeItem[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFileTree = useCallback(async () => {
    try {
      const treeUrl = `/api/anonymize/${encrypted}`;
      const treeResponse = await fetch(treeUrl);
      
      if (treeResponse.ok) {
        const treeData = await treeResponse.json();
        setFileTree(treeData.files || []);
        setError(null);
      } else {
        console.error('Failed to fetch file tree:', treeResponse.status, treeResponse.statusText);
        setFileTree([]);
        setError('Failed to load file tree');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFileTree([]);
    } finally {
      setTreeLoaded(true);
    }
  }, [encrypted]);

  const toggleDirectory = useCallback((dirPath: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath);
      } else {
        newSet.add(dirPath);
      }
      return newSet;
    });
  }, []);

  const resetTree = useCallback(() => {
    setTreeLoaded(false);
    setFileTree([]);
    setExpandedDirs(new Set());
    setError(null);
  }, []);

  useEffect(() => {
    if (!treeLoaded) {
      fetchFileTree();
    }
  }, [treeLoaded, fetchFileTree]);

  useEffect(() => {
    resetTree();
  }, [encrypted, resetTree]);

  return {
    fileTree,
    expandedDirs,
    treeLoaded,
    error,
    toggleDirectory,
    resetTree
  };
};

// Custom Hook: File content management
const useFileContent = (encrypted: string, path: string[]) => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchFile = useCallback(async (filePath: string) => {
    try {
      const fileUrl = `/api/anonymize/${encrypted}/${filePath}`;
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch file');
      }
      
      const data = await response.json();
      setFileData(data);
      setCurrentPath(filePath);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFileData(null);
    }
  }, [encrypted]);

  const resetFile = useCallback(() => {
    setFileData(null);
    setCurrentPath('');
    setError(null);
  }, []);

  useEffect(() => {
    if (path && path.length > 0) {
      const filePath = path.join('/');
      fetchFile(filePath);
    } else {
      resetFile();
    }
  }, [path, fetchFile, resetFile]);

  useEffect(() => {
    resetFile();
  }, [encrypted, resetFile]);

  return {
    fileData,
    currentPath,
    error,
    fetchFile,
    resetFile
  };
};

// Utility function: Build file tree
const buildFileTree = (fileTree: GitHubFileTreeItem[]): Record<string, TreeNode> => {
  const tree: Record<string, TreeNode> = {};
  
  fileTree.forEach(file => {
    const pathParts = file.path.split('/');
    let currentLevel = tree;
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;
      
      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: pathParts.slice(0, i + 1).join('/'),
          type: isLast ? file.type : 'dir',
          children: {},
          size: isLast ? file.size : undefined
        };
      }
      
      if (!isLast) {
        currentLevel = currentLevel[part].children;
      }
    }
  });
  
  return tree;
};

// Component: Error display
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-600 text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
      <p className="text-gray-600">{error}</p>
    </div>
  </div>
);

// Component: File tree item
const FileTreeItem = ({ 
  item, 
  level = 0, 
  currentPath, 
  expandedDirs, 
  onFileClick, 
  onToggleDirectory 
}: {
  item: TreeNode;
  level?: number;
  currentPath: string;
  expandedDirs: Set<string>;
  onFileClick: (path: string) => void;
  onToggleDirectory: (path: string) => void;
}) => {
  const isExpanded = expandedDirs.has(item.path);
  const hasChildren = Object.keys(item.children).length > 0;
  const isDirectory = item.type === 'dir' || hasChildren;
  
  return (
    <div className="tree-item">
      <div 
        className={`tree-item-content flex items-center py-1 px-2 cursor-pointer rounded hover:bg-gray-100 ${
          currentPath === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (isDirectory) {
            onToggleDirectory(item.path);
          } else {
            onFileClick(item.path);
          }
        }}
      >
        {isDirectory ? (
          <span className="mr-1">
            {isExpanded ? '📂' : '📁'}
          </span>
        ) : (
          <span className="mr-1">📄</span>
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      
      {isDirectory && isExpanded && (
        <div className="tree-children">
          {Object.values(item.children).map((child: TreeNode) => 
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              expandedDirs={expandedDirs}
              onFileClick={onFileClick}
              onToggleDirectory={onToggleDirectory}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Component: File tree
const FileTree = ({ 
  fileTree, 
  expandedDirs, 
  currentPath, 
  onFileClick, 
  onToggleDirectory 
}: {
  fileTree: GitHubFileTreeItem[];
  expandedDirs: Set<string>;
  currentPath: string;
  onFileClick: (path: string) => void;
  onToggleDirectory: (path: string) => void;
}) => {
  const tree = buildFileTree(fileTree);
  
  return (
    <div className="file-tree">
      <div className="file-tree-content">
        {Object.keys(tree).length > 0 ? (
          Object.values(tree).map((item: TreeNode) => (
            <FileTreeItem
              key={item.path}
              item={item}
              currentPath={currentPath}
              expandedDirs={expandedDirs}
              onFileClick={onFileClick}
              onToggleDirectory={onToggleDirectory}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📁</div>
            <p>No files found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component: File content renderer
const FileContentRenderer = ({ fileData }: { fileData: FileData }) => {
  useEffect(() => {
    // 简化的 Prism.js 加载
    const loadPrism = async () => {
      try {
        const Prism = await import('prismjs');
        
        // 动态加载常用语言支持（使用 any 类型避免 TypeScript 错误）
        const imports = [
          () => import('prismjs/components/prism-javascript' as any),
          () => import('prismjs/components/prism-typescript' as any),
          () => import('prismjs/components/prism-python' as any),
          () => import('prismjs/components/prism-java' as any),
          () => import('prismjs/components/prism-css' as any),
          () => import('prismjs/components/prism-markup' as any),
          () => import('prismjs/components/prism-json' as any),
          () => import('prismjs/components/prism-yaml' as any),
          () => import('prismjs/components/prism-bash' as any),
          () => import('prismjs/components/prism-sql' as any),
          () => import('prismjs/plugins/line-numbers/prism-line-numbers' as any)
        ];
        
        await Promise.all(imports.map(importFn => importFn().catch(() => null)));
        
        Prism.default.highlightAll();
      } catch (error) {
        console.error('Failed to load Prism.js:', error);
      }
    };
    
    loadPrism();
  }, [fileData]);

  if (fileData.isMarkdown) {
    return (
      <div 
        className="markdown-body bg-white rounded-lg shadow-md overflow-hidden p-6"
        dangerouslySetInnerHTML={{ __html: marked(fileData.content) }}
      />
    );
  } else if (fileData.isCode) {
    return (
      <div className="code-container">
        <pre className="line-numbers">
          <code className={`language-${fileData.language}`}>
            {fileData.content}
          </code>
        </pre>
      </div>
    );
  } else {
    return (
      <div className="code-container">
        <pre className="line-numbers">
          <code>{fileData.content}</code>
        </pre>
      </div>
    );
  }
};

// Component: File header
const FileHeader = ({ fileData }: { fileData: FileData }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-gray-400 mr-2" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75Zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06ZM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75Z"/>
          </svg>
          <span className="font-semibold text-gray-900">{fileData.originalPath}</span>
        </div>
      </div>
    </div>
  </div>
);

// Component: Empty state
const EmptyState = () => (
  <div className="bg-white rounded-lg shadow-md p-12">
    <div className="text-center">
      <div className="text-6xl mb-4">📄</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Select a file to view
      </h3>
      <p className="text-gray-600">
        Choose a file from the left sidebar to view its content
      </p>
    </div>
  </div>
);

// Main component
export default function ViewPage({ params }: ViewPageProps) {
  const { encrypted, path } = params;
  
  // Use custom hooks
  const {
    fileTree,
    expandedDirs,
    treeLoaded,
    error: treeError,
    toggleDirectory
  } = useFileTree(encrypted);

  const {
    fileData,
    currentPath,
    error: fileError,
    fetchFile
  } = useFileContent(encrypted, path);

  // Handle file click
  const handleFileClick = useCallback((filePath: string) => {
    const newUrl = `/${encrypted}/${filePath}`;
    window.history.pushState({}, '', newUrl);
    fetchFile(filePath);
  }, [encrypted, fetchFile]);

  // Display error
  if (treeError || fileError) {
    return <ErrorDisplay error={treeError || fileError || 'Unknown error'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Left sidebar - File tree */}
          <div className="col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-md">
                <FileTree
                  fileTree={fileTree}
                  expandedDirs={expandedDirs}
                  currentPath={currentPath}
                  onFileClick={handleFileClick}
                  onToggleDirectory={toggleDirectory}
                />
              </div>

              <div className="mt-4">
                <a 
                  href="/" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-white rounded-lg px-3 py-2 shadow-sm hover:shadow-md"
                >
                  <span className="text-xl mr-2">✏️</span>
                  <span className="font-medium">Create New Link</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Right content */}
          <div className="col-span-3">
            {fileData ? (
              <>
                <FileHeader fileData={fileData} />
                <FileContentRenderer fileData={fileData} />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 