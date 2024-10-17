import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TreeNode from './TreeNode';

const Tree = ({ data, onCheckedNodesChange, onNodeClick, routeColors }) => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState([]);

  // Function to initialize tree data with ids and checked status
  const initializeTreeData = (data) => {
    const addIdsToData = (nodes) => {
      return nodes.map((node, index) => ({
        ...node,
        id: node.id || index + 1, // Assign an id based on index if no id exists
        checked: true, // Mark all nodes as checked initially
        children: node.children ? addIdsToData(node.children) : [],
      }));
    };

    return addIdsToData(data);
  };

  // Initialize tree data when component mounts or data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const dataWithIdsAndChecked = initializeTreeData(data);
      setTreeData(dataWithIdsAndChecked);
    }
  }, [data]);

  const updateNodeRecursively = (node, checked) => {
    return {
      ...node,
      checked, // Ensure the checked status is updated
      children: node.children.map((child) =>
        updateNodeRecursively(child, checked),
      ),
    };
  };

  const updateParentNodeRecursively = (node) => {
    if (!node.children || node.children.length === 0) return node;

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

    // 상태가 변경된 경우에만 업데이트
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
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return checkedNodes;
  };

  // Function to map colors only to checked nodes
  const handleGetCheckedNodes = () => {
    const checkedNodes = getCheckedNodes(treeData);
    onCheckedNodesChange(checkedNodes); // Pass only checked nodes
  };

  const checkedNodes = getCheckedNodes(treeData);

  useEffect(() => {
    handleGetCheckedNodes();
  }, [treeData]);

  return (
    <div>
      {treeData && treeData.length > 0 ? (
        treeData.map((node, index) => (
          <TreeNode
            key={node.id}
            node={node}
            onCheck={handleCheck}
            onNodeClick={handleNodeClick} // Pass the click handler down
            currentIndex={index} // Change index to reflect only the checked ones
            routeColor={
              node.checked
                ? routeColors[checkedNodes.indexOf(node) % routeColors.length]
                : '#ffffff'
            } // Assign color only to checked nodes
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
