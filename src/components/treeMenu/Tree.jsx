import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TreeNode from './TreeNode';

const Tree = ({ data, onCheckedNodesChange, onNodeClick, routeColors }) => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState([]);
  const [checkedNodes, setCheckedNodes] = useState([]);

  // Function to initialize tree data with ids and checked status
  const initializeTreeData = (data) => {
    const addIdsToData = (nodes) => {
      return nodes.map((node, index) => ({
        ...node,
        id: node.id || index + 1, // Assign an id based on index if no id exists
        checked: true, // Mark all nodes as checked initially
        children: Array.isArray(node.children)
          ? addIdsToData(node.children)
          : [], // Ensure children is an array
      }));
    };

    return Array.isArray(data) ? addIdsToData(data) : []; // Initialize with empty array if data is not valid
  };

  // Initialize tree data when component mounts or data changes
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const dataWithIdsAndChecked = initializeTreeData(data);
      setTreeData(dataWithIdsAndChecked);
    } else {
      setTreeData([]); // Fallback to an empty array if data is not valid
    }
  }, [data]);

  const updateNodeRecursively = (node, checked) => {
    return {
      ...node,
      checked, // Ensure the checked status is updated
      children: Array.isArray(node.children)
        ? node.children.map((child) => updateNodeRecursively(child, checked))
        : [], // Ensure children is an array
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

    // Update the state only if there is a change
    if (JSON.stringify(finalTreeData) !== JSON.stringify(treeData)) {
      setTreeData(finalTreeData);
    }
  };

  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node); // Call the onNodeClick function with the clicked node
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

  // Function to map colors to checked nodes without changing the original order
  const getRouteColor = (node) => {
    if (node.checked && Array.isArray(routeColors) && routeColors.length > 0) {
      // Get the list of currently checked nodes
      const checkedNodes = treeData.filter((item) => item.checked);

      // Find the index of the node among the checked nodes
      const checkedIndex = checkedNodes.findIndex(
        (item) => item.id === node.id,
      );

      // Assign the color based on the index of the checked node
      return routeColors[checkedIndex % routeColors.length];
    }
    return '#ffffff'; // Default color for unchecked nodes
  };

  // Update checked nodes state when treeData changes
  useEffect(() => {
    const currentCheckedNodes = getCheckedNodes(treeData);
    if (JSON.stringify(currentCheckedNodes) !== JSON.stringify(checkedNodes)) {
      setCheckedNodes(currentCheckedNodes);
      onCheckedNodesChange(currentCheckedNodes); // Pass only checked nodes
    }
  }, [treeData, checkedNodes, onCheckedNodesChange]);

  return (
    <div>
      {Array.isArray(treeData) && treeData.length > 0 ? (
        treeData.map((node, index) => (
          <TreeNode
            key={node.id}
            node={node}
            onCheck={handleCheck}
            onNodeClick={handleNodeClick} // Pass the click handler down
            currentIndex={index} // Change index to reflect only the checked ones
            routeColor={getRouteColor(node)} // Use the new color function
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
