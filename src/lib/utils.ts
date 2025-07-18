import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { type TreeItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a record of files to a tree structure
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: {"src/Button.tsx": "...",README.md": "..."}
 * Output: [["src", ["Button.tsx"]], "README.md"]
 */
export function convertFilesToTreeItems(
  files: Record<string, string>,
): TreeItem[] {
  // Internal recursive tree structure for intermediate processing
  interface TreeNode {
    [key: string]: TreeNode | null; // null represents a file, object represents a folder
  }

  const tree: TreeNode = {};

  // Sort file paths for consistent output
  const sortedPaths = Object.keys(files).sort();

  // Build a nested tree structure from the sorted paths
  for (const filePath of sortedPaths) {
    const parts = filePath.split('/'); // Split path into folders/files
    let current = tree;

    // Traverse or create folder levels in the tree
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as TreeNode;
    }

    // Add the file as a leaf node (represented by null)
    const fileName = parts[parts.length - 1];
    current[fileName] = null;
  }

  // Recursive helper to convert TreeNode into TreeItem format
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);

    // Base case: empty folder or file
    if (entries.length === 0) {
      return name || '';
    }

    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // It's a file
        children.push(key);
      } else {
        // It's a folder; recurse into it
        const subTree = convertNode(value, key);

        // If the subtree is an array, spread it; else, just attach as is
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  }

  // Convert the built tree into final TreeItem structure
  const result = convertNode(tree);

  // Ensure return type is always an array of TreeItems
  return Array.isArray(result) ? result : [result];
}
