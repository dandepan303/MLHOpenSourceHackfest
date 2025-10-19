import axios from "axios";

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export function getRepoMetadata(link: string): {owner: string, repo: string, cleanRepo: string} | null {
  // Get the repository structure
  const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    console.log(`lib/dependency/dependency getGithubLicenese error: link is not valid format: ${link}`);
    return null;
  }
  
  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  return { owner: owner, repo: repo, cleanRepo: cleanRepo }
}

export async function getRepoFileTree(link: string): Promise<GitHubTreeItem[] | null> {
  // Get Github repo metadata
  const linkMetadata = getRepoMetadata(link);
  if (!linkMetadata) return null

  const { owner, repo, cleanRepo } = linkMetadata;
  
  // Get default branch name
  const repoInfo = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`, {validateStatus: () => true});
  const defaultBranch = repoInfo.data.default_branch;
  if (!defaultBranch) return null;
  
  // Fetch tree
  const response = await axios.get<GitHubTree>(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`);
  
  return response.data.tree;
}

export function parseRepoTree(tree: GitHubTreeItem[], maxDepth: number = 2): string {
  // Filter paths by depth
  const filteredTree = tree.filter(item => {
    const depth = item.path.split('/').length;
    return depth <= maxDepth;
  });
  
  // Sort by path
  filteredTree.sort((a, b) => a.path.localeCompare(b.path));
  
  // Build readable structure
  let output = 'Repository File Structure:\n\n';
  
  for (const item of filteredTree) {
    const depth = item.path.split('/').length - 1;
    const indent = '  '.repeat(depth);
    const name = item.path.split('/').pop();
    
    output += `${indent} ${name}\n`;
  }
  
  return output;
}

export async function getRepoFile(link: string, filePath: string): Promise<string | null> {
  // Get Github repo metadata
  const linkMetadata = getRepoMetadata(link);
  if (!linkMetadata) return null;
  const { owner, repo, cleanRepo } = linkMetadata;
  
  // Fetch file content from GitHub API
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${cleanRepo}/contents/${filePath}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3.raw' // Get raw content directly
      }
    }
  );
  
  return response.data;
}