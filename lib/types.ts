export interface GitHubFileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
} 