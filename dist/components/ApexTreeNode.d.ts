export interface TreeNode {
    key: string;
    label: string;
    icon?: string;
    image?: string;
    help?: string;
    disabled?: boolean;
    children?: TreeNode[];
}
export type TreeState = 'on' | 'off' | 'partial';
/** Recursive row renderer for ApexTreeSelect. */
declare const ApexTreeNode: any;
export default ApexTreeNode;
