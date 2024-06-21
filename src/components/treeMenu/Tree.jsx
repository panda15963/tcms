import { useEffect, useState } from 'react';
import TreeNode from './TreeNode';

const Tree = ({ data }) => {
  const [treeData, setTreeData] = useState(data);

  const updateNodeRecursively = (node, checked) => {
    return {
      ...node,
      checked,
      children: node.children.map((child) =>
        updateNodeRecursively(child, checked),
      ),
    };
  };

  const updateParentNodeRecursively = (node, nodesMap) => {
    if (!node.children || node.children.length === 0) return node;

    const updatedChildren = node.children.map((child) =>
      updateParentNodeRecursively(child, nodesMap),
    );

    const allChecked = updatedChildren.every((child) => child.checked);
    return {
      ...node,
      checked: allChecked,
      children: updatedChildren,
    };
  };

  const handleCheck = (node, checked) => {
    const updatedNodesMap = new Map();

    const updateNodes = (nodes) => {
      return nodes.map((currentNode) => {
        if (currentNode.id === node.id) {
          const updatedNode = updateNodeRecursively(currentNode, checked);
          updatedNodesMap.set(currentNode.id, updatedNode);
          return updatedNode;
        } else {
          const updatedChildNode = updateNodes(currentNode.children || []);
          const updatedNode = {
            ...currentNode,
            children: updatedChildNode,
          };
          updatedNodesMap.set(currentNode.id, updatedNode);
          return updatedNode;
        }
      });
    };

    const updatedTreeData = updateNodes(treeData);
    const finalTreeData = updatedTreeData.map((node) =>
      updateParentNodeRecursively(node, updatedNodesMap),
    );

    setTreeData(finalTreeData);
  };

  const getCheckedNodes = (nodes) => {
    let checkedNodes = [];
    const traverse = (node) => {
      if (node.checked) {
        checkedNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return checkedNodes;
  };

  const handleGetCheckedNodes = () => {
    const checkedNodes = getCheckedNodes(treeData);
    console.log('Checked nodes: ', checkedNodes);
  };

  useEffect(() => {
    // console.log('TREE DATA => ', treeData);
    handleGetCheckedNodes();
  }, [treeData]);

  return (
    <div>
      {treeData &&
        treeData.map((node) => (
          <TreeNode key={node.id} node={node} onCheck={handleCheck} />
        ))}
    </div>
  );
};

export default Tree;
