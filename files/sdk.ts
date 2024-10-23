export type FileSystemNode = FileEntry | DirectoryEntry;

/**
 * @title {{{name}}}
 */
export interface FileEntry {
  name: string;
  /**
   * @format textarea
   */
  content: string;
}

/**
 * @title {{{name}}}
 */
export interface DirectoryEntry {
  name: string;
  nodes: FileSystemNode[];
}

export const isDir = (n: FileSystemNode): n is DirectoryEntry => {
  return Array.isArray((n as DirectoryEntry)?.nodes);
};

export const create = (): DirectoryEntry => ({ nodes: [], name: "" });

const join = (first: string, second: string) =>
  !first.endsWith("/") && !second.startsWith("/")
    ? `${first}/${second}`
    : first.endsWith("/") && second.startsWith("/")
    ? `${first}${second.slice(1)}`
    : `${first}${second}`;

export function* walk(
  fs: FileSystemNode,
  path = "",
): Generator<{ content: string; path: string; name: string }> {
  const currentPath = join(path, fs.name);
  if (isDir(fs)) {
    for (const node of fs.nodes) {
      yield* walk(node, currentPath);
    }

    return;
  }

  yield {
    content: fs.content,
    path: currentPath.slice(1), // generates //path instead of /path
    name: fs.name,
  };
}
export const nodesToMap = (
  nodes: FileSystemNode[],
): Record<string, FileSystemNode> => {
  const maps: Record<string, FileSystemNode> = {};
  for (const entry of nodes) {
    maps[entry.name] = entry;
  }
  return maps;
};
export const mergeFs = (
  target: FileSystemNode,
  source: FileSystemNode,
): FileSystemNode => {
  if (target.name !== source.name) {
    return target;
  }
  if (isDir(target) && isDir(source)) {
    const nodes = [];

    const targetMap = nodesToMap(target.nodes);
    const sourceMap = nodesToMap(source.nodes);

    for (const [entryName, entry] of Object.entries(targetMap)) {
      if (sourceMap[entryName]) {
        nodes.push(mergeFs(entry, sourceMap[entryName]));
      } else {
        nodes.push(entry);
      }
    }
    for (const [entryName, entry] of Object.entries(sourceMap)) {
      if (targetMap[entryName]) {
        continue;
      } else {
        nodes.push(entry);
      }
    }
    return { ...target, nodes };
  } else if (!isDir(target) && !isDir(source)) {
    return target;
  } else {
    return target;
  }
};

export const write = (fs: FileSystemNode, path: string, data: string): void => {
  const segments = path.split("/").slice(1);
  const filename = segments.pop();

  let node = fs;
  for (const segment of segments) {
    if (!isDir(node)) {
      throw new Error("Path already taken");
    }

    const index = node.nodes.findIndex((node) => node.name === segment);
    const child = node.nodes[index] || { name: segment, nodes: [] };
    index === -1 && node.nodes.push(child);
    node = child;
  }

  if (!isDir(node)) {
    throw new Error("Path already taken");
  }

  const index = node.nodes.findIndex((x) => x.name === filename);
  const file = node.nodes[index] || { name: filename ?? "", content: "" };

  if (isDir(file)) {
    throw new Error("Not a file");
  }

  file.content = data;
  index === -1 && node.nodes.push(file);
};

export const remove = (fs: FileSystemNode, path: string): boolean => {
  const segments = path.split("/").slice(1);
  const filename = segments.pop();

  let node: FileSystemNode | undefined = fs;
  for (const segment of segments) {
    if (!node || !isDir(node)) {
      return false;
    }

    node = node.nodes.find((node) => node.name === segment);
  }

  if (!node || !isDir(node)) {
    return false;
  }

  const index = node.nodes.findIndex((x) => x.name === filename);

  if (index > -1) {
    node.nodes.splice(index, 1);
    return true;
  }

  return false;
};

export const read = (
  fs: FileSystemNode,
  path: string,
): string | null => {
  const segments = path.split("/").slice(1);
  const filename = segments.pop();

  let node: FileSystemNode | undefined = fs;
  for (const segment of segments) {
    if (!node || !isDir(node)) {
      return null;
    }

    node = node.nodes.find((node) => node.name === segment);
  }

  if (!node || !isDir(node)) {
    return null;
  }

  const file = node.nodes.find((x) => x.name === filename);

  if (!file || isDir(file)) {
    return null;
  }

  return file.content;
};
