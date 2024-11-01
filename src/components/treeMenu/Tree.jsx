import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TreeNode from './TreeNode';

const colors = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#00FFFF',
  '#FF00FF',
  '#FFA500',
  '#00FF80',
  '#7FFFFF',
  '#80D000',
  '#0080FF',
  '#FF0800',
  '#FFA700',
  '#80D100',
  '#807FFF',
  '#888888',
  '#00AA00',
  '#7FFF08',
  '#888800',
  '#008700',
];

const Tree = ({ data, onCheckedNodesChange, onNodeClick, routeColors }) => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState([]);
  const [checkedNodes, setCheckedNodes] = useState([]);

  const initializeTreeData = (data) => {
    const addIdsToData = (nodes) => {
      return nodes.map((node, index) => ({
        ...node,
        id: node.id || index + 1,
        checked: true,
        children: Array.isArray(node.children)
          ? addIdsToData(node.children)
          : [],
      }));
    };
    return Array.isArray(data) ? addIdsToData(data) : [];
  };

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const dataWithIdsAndChecked = initializeTreeData(data);
      setTreeData(dataWithIdsAndChecked);
    } else {
      setTreeData([]);
    }
  }, [data]);

  const updateNodeRecursively = (node, checked) => {
    return {
      ...node,
      checked,
      children: Array.isArray(node.children)
        ? node.children.map((child) => updateNodeRecursively(child, checked))
        : [],
    };
  };

  const updateParentNodeRecursively = (node) => {
    if (!Array.isArray(node.children) || node.children.length === 0)
      return node;
    const updatedChildren = node.children.map((child) =>
      updateParentNodeRecursively(child),
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
          const updatedChildNode = updateNodes(
            Array.isArray(currentNode.children) ? currentNode.children : [],
          );
          const updatedNode = { ...currentNode, children: updatedChildNode };
          updatedNodesMap.set(currentNode.id, updatedNode);
          return updatedNode;
        }
      });
    };

    const updatedTreeData = updateNodes(treeData);
    const finalTreeData = updatedTreeData.map((node) =>
      updateParentNodeRecursively(node, updatedNodesMap),
    );

    if (JSON.stringify(finalTreeData) !== JSON.stringify(treeData)) {
      setTreeData(finalTreeData);
    }
  };

  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const getCheckedNodes = (nodes) => {
    let checkedNodes = [];
    const traverse = (node) => {
      if (node.checked) {
        checkedNodes.push(node);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    };
    if (Array.isArray(nodes)) {
      nodes.forEach(traverse);
    }
    return checkedNodes;
  };

  const getRouteColor = (node) => {
    const colorIndex = (node.id - 1) % colors.length; // Adjusted to start from 0
    routeColors(colors[colorIndex])
    return colors[colorIndex];
  };

  useEffect(() => {
    const currentCheckedNodes = getCheckedNodes(treeData);
    if (JSON.stringify(currentCheckedNodes) !== JSON.stringify(checkedNodes)) {
      setCheckedNodes(currentCheckedNodes);
      onCheckedNodesChange(currentCheckedNodes);
    }
  }, [treeData, onCheckedNodesChange]);

  return (
    <div>
      {Array.isArray(treeData) && treeData.length > 0 ? (
        treeData.map((node, index) => (
          <TreeNode
            key={node.id}
            node={node}
            onCheck={handleCheck}
            onNodeClick={handleNodeClick}
            currentIndex={index}
            routeColor={getRouteColor(node)}
          />
        ))
      ) : (
        <div className="text-center py-5">
          <p className="text-gray-500">
            {t('LeftSideSlide.NoDataFound') || 'No data found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tree;
