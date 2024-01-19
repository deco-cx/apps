interface RadixTreeNode<DataType> {
    path: string;
    data?: DataType;
    edges: RadixTreeNode<DataType>[];
}

export interface SearchResult<DataType> {
    lastNode: RadixTreeNode<DataType>;
    path: string;
    match: boolean;
};

function search<DataType>(path: string, root: RadixTreeNode<DataType>, prefix = ""): SearchResult<DataType> {
    for (let i = 0; i < root.edges.length; i++) {
        const node = root.edges[i];
        if (!path.startsWith(node.path)) continue;
        return search(path.substring(node.path.length), node, prefix + node.path);
    }
    return {
        lastNode: root,
        path: prefix,
        match: path.length === 0,
    };
}

function insert<DataType>(path: string, data: DataType, root: RadixTreeNode<DataType>): void {
    const result = search(path, root);
    if (result.match) return; // already exists
    const nodePath = path.substring(result.path.length);
    let edgeIndex = -1;
    for (let i = 0; i < result.lastNode.edges.length; i++) {
        const edge = result.lastNode.edges[i];
        if (edge.path[0] === nodePath[0]) { // there is at most one edge with a common prefix
            edgeIndex = i;
            break;
        }
    }
    const node: RadixTreeNode<DataType> = {
        path: nodePath,
        edges: [],
    }
    if (edgeIndex !== -1) {
        const edges = result.lastNode.edges.splice(edgeIndex, 1);
        let prefixLength = 0;
        for (let i = 0; i < Math.min(edges[0].path.length, nodePath.length); i++) {
            if (edges[0].path[i] != nodePath[i]) break;
            prefixLength++;
        }
        edges[0].path = edges[0].path.substring(prefixLength);
        if (prefixLength !== nodePath.length) {
            node.path = nodePath.substring(0, prefixLength);
            edges.push({
                path: nodePath.substring(prefixLength),
                data,
                edges: [],
            });
        } else {
            node.data = data;
        }
        node.edges = edges;
    }
    result.lastNode.edges.push(node);
}

interface RadixTree<DataType> {
    insert(path: string, data: DataType): void;
    search(path: string): DataType | undefined;
    root: RadixTreeNode<DataType>;
};

export default function NewRadixTree<DataType>(): RadixTree<DataType> {
    const root = { path: '', edges: [] };
    return {
        root,
        search: (path: string): DataType | undefined => {
            const result = search<DataType>(path, root);
            if (result.match) return result.lastNode.data;
            return undefined;
        },
        insert: (path: string, data: DataType): void => {
            insert(path, data, root);
        }
    };
}
