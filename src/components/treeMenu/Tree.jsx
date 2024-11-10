import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TreeNode from './TreeNode';

const colors = [
  "#0000FF", // 파란색
  "#00FF00", // 초록색
  "#FF0000", // 빨간색
  "#00FFFF", // 청록색
  "#FFFF00", // 노란색
  "#FF00FF", // 자홍색
  "#0080FF", // 밝은 파란색
  "#80FF00", // 연두색
  "#ff0075", // 빨간색 비슷
  "#98ff98", // 연한 녹색
  "#FFA500", // 주황색
  "#8811FF", // 보라색
  "#8080FF", // 연한 보라색
  "#88FF80", // 밝은 연녹색
  "#ffae00", // 황금색
  "#008828", // 밝은 하늘색
  "#50664e", // 짙은 초록색
  "#790963", // 짙은 보라색
  "#32437a", // 짙은 파란색
  "#415e45" // 짙은 녹색
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
    routeColors(colors[colorIndex]);
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
