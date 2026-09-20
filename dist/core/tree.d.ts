/** Tree helpers for ApexTree: flattening, filtering, checkbox cascade and moves. */
export interface TreeNode {
    key: string;
    label?: string;
    icon?: string;
    data?: unknown;
    /** In lazy mode, marks a node as having no children so no toggle is offered. */
    leaf?: boolean;
    loading?: boolean;
    selectable?: boolean;
    styleClass?: string;
    children?: TreeNode[];
}
export interface FlatNode {
    node: TreeNode;
    depth: number;
    /** Key path from the root, so a move knows where a node came from. */
    path: number[];
    parent?: TreeNode;
    hasChildren: boolean;
}
export type CheckState = {
    checked?: boolean;
    partialChecked?: boolean;
};
/** Visible rows, in render order. Collapsed branches contribute nothing. */
export declare function flattenTree(nodes: TreeNode[] | undefined, expanded: Record<string, boolean>, 
/** Only a lazy tree offers a toggle for a node whose children are not loaded yet. */
lazy?: boolean, depth?: number, parent?: TreeNode, base?: number[]): FlatNode[];
export declare function eachNode(nodes: TreeNode[] | undefined, fn: (n: TreeNode, parent?: TreeNode) => void, parent?: TreeNode): void;
export declare function descendantsOf(node: TreeNode): TreeNode[];
/**
 * `lenient` keeps a matching branch's whole subtree; `strict` keeps only the
 * matching nodes and the ancestors needed to reach them.
 */
export declare function filterTree(nodes: TreeNode[] | undefined, query: string, fields: string[], mode: 'lenient' | 'strict'): TreeNode[];
/** Keys of every branch that survives a filter, so results open automatically. */
export declare function branchKeys(nodes: TreeNode[] | undefined): Record<string, boolean>;
/**
 * Recomputes checkbox state for the whole tree from a set of leaf decisions:
 * a parent is checked when all its children are, partial when only some are.
 */
export declare function cascadeChecks(nodes: TreeNode[] | undefined, keys: Record<string, CheckState>): Record<string, CheckState>;
/** Applies a checkbox click: the node and everything under it move together. */
export declare function setBranchChecked(nodes: TreeNode[] | undefined, node: TreeNode, on: boolean, keys: Record<string, CheckState>): Record<string, CheckState>;
export declare function allLeafKeys(nodes: TreeNode[] | undefined): string[];
/** Removes a node by path and inserts it at another; returns a new tree. */
export declare function moveNode(nodes: TreeNode[], from: number[], to: {
    path: number[];
    position: 'before' | 'after' | 'inside';
}): TreeNode[];
/** Removes the node at a path; returns a new tree. */
export declare function removeNode(nodes: TreeNode[], path: number[]): TreeNode[];
import { formatCell, type ColumnDef, type SortMeta } from './table';
/** A node's row fields live on `data`; columns read from there. */
export declare const rowOf: (node: TreeNode) => Record<string, unknown>;
/** Sorts siblings at every level, so the hierarchy is preserved. */
export declare function sortTree(nodes: TreeNode[], meta: SortMeta[], columns: ColumnDef[]): TreeNode[];
/**
 * Column and global filtering over a tree. In `lenient` mode a matching node keeps
 * its whole subtree; in `strict` only matching nodes survive, plus the ancestors
 * needed to reach them.
 */
export declare function filterTreeRows(nodes: TreeNode[], filters: Record<string, {
    value?: unknown;
    matchMode?: string;
}>, columns: ColumnDef[], mode?: 'lenient' | 'strict'): TreeNode[];
/** Footer aggregate over every node in the tree, or only the leaves. */
export declare function aggregateTree(nodes: TreeNode[], col: ColumnDef, fn: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct', leavesOnly?: boolean): number | null;
export { formatCell };
