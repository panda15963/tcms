import { useEffect, useState } from 'react';
import TreeNode from './TreeNode';

const Tree = ({ data }) => {
  const [treeData, setTreeData] = useState(data); // 트리 데이터 상태 관리

  /**
   * 노드와 자식 노드의 체크 상태를 업데이트하는 재귀 함수
   * @param {Object} node - 업데이트할 노드
   * @param {boolean} checked - 체크 상태
   * @returns {Object} - 업데이트된 노드
   */
  const updateNodeRecursively = (node, checked) => {
    return {
      ...node,
      checked,
      children: node.children.map((child) =>
        updateNodeRecursively(child, checked),
      ),
    };
  };

  /**
   * 부모 노드의 체크 상태를 자식 노드에 따라 업데이트하는 재귀 함수
   * @param {Object} node - 업데이트할 부모 노드
   * @param {Map} nodesMap - 업데이트된 노드 정보를 저장할 Map 객체
   * @returns {Object} - 업데이트된 부모 노드
   */
  const updateParentNodeRecursively = (node, nodesMap) => {
    if (!node.children || node.children.length === 0) return node; // 자식 노드가 없는 경우 그대로 반환

    const updatedChildren = node.children.map((child) =>
      updateParentNodeRecursively(child, nodesMap),
    );

    // 모든 자식 노드가 체크된 경우 부모 노드를 체크 상태로 업데이트
    const allChecked = updatedChildren.every((child) => child.checked);
    return {
      ...node,
      checked: allChecked,
      children: updatedChildren,
    };
  };

  /**
   * 노드의 체크 상태를 처리하는 함수
   * @param {Object} node - 체크 상태가 변경된 노드
   * @param {boolean} checked - 새로운 체크 상태
   */
  const handleCheck = (node, checked) => {
    const updatedNodesMap = new Map(); // 업데이트된 노드 정보를 저장할 Map 객체

    const updateNodes = (nodes) => {
      return nodes.map((currentNode) => {
        if (currentNode.id === node.id) {
          const updatedNode = updateNodeRecursively(currentNode, checked); // 노드와 자식 노드의 체크 상태 업데이트
          updatedNodesMap.set(currentNode.id, updatedNode); // 업데이트된 노드 저장
          return updatedNode;
        } else {
          const updatedChildNode = updateNodes(currentNode.children || []); // 자식 노드 업데이트
          const updatedNode = {
            ...currentNode,
            children: updatedChildNode,
          };
          updatedNodesMap.set(currentNode.id, updatedNode); // 업데이트된 자식 노드 저장
          return updatedNode;
        }
      });
    };

    const updatedTreeData = updateNodes(treeData); // 트리 데이터 업데이트
    const finalTreeData = updatedTreeData.map((node) =>
      updateParentNodeRecursively(node, updatedNodesMap), // 부모 노드 상태 업데이트
    );

    setTreeData(finalTreeData); // 업데이트된 트리 데이터 설정
  };

  /**
   * 체크된 노드들을 가져오는 함수
   * @param {Array} nodes - 트리 노드 배열
   * @returns {Array} - 체크된 노드 목록
   */
  const getCheckedNodes = (nodes) => {
    let checkedNodes = [];
    const traverse = (node) => {
      if (node.checked) {
        checkedNodes.push(node); // 체크된 노드를 배열에 추가
      }
      if (node.children) {
        node.children.forEach(traverse); // 자식 노드 순회
      }
    };
    nodes.forEach(traverse); // 트리 데이터 순회
    return checkedNodes;
  };

  /**
   * 체크된 노드들을 콘솔에 출력하는 함수
   */
  const handleGetCheckedNodes = () => {
    const checkedNodes = getCheckedNodes(treeData); // 체크된 노드 가져오기
    console.log('Checked nodes: ', checkedNodes); // 체크된 노드 출력
  };

  // 트리 데이터가 변경될 때마다 체크된 노드를 가져옴
  useEffect(() => {
    handleGetCheckedNodes();
  }, [treeData]);

  return (
    <div>
      {treeData &&
        treeData.map((node) => (
          <TreeNode key={node.id} node={node} onCheck={handleCheck} /> // 각 노드를 TreeNode 컴포넌트로 렌더링
        ))}
    </div>
  );
};

export default Tree;
