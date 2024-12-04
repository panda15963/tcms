import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TreeNode from './TreeNode';

// 사용 가능한 색상 배열
const colors = [
  '#0000FF', // 파란색
  '#00FF00', // 초록색
  '#FF0000', // 빨간색
  '#00FFFF', // 청록색
  '#FFFF00', // 노란색
  '#FF00FF', // 자홍색
  '#0080FF', // 밝은 파란색
  '#80FF00', // 연두색
  '#ff0075', // 빨간색 비슷
  '#98ff98', // 연한 녹색
  '#FFA500', // 주황색
  '#8811FF', // 보라색
  '#8080FF', // 연한 보라색
  '#88FF80', // 밝은 연녹색
  '#ffae00', // 황금색
  '#008828', // 밝은 하늘색
  '#50664e', // 짙은 초록색
  '#790963', // 짙은 보라색
  '#32437a', // 짙은 파란색
  '#415e45', // 짙은 녹색
];

/**
 * Tree 컴포넌트
 * @description 트리 구조 데이터를 렌더링하고, 체크된 노드와 클릭 이벤트를 관리
 * @param {Array} data - 트리 데이터
 * @param {Function} onCheckedNodesChange - 체크된 노드 변경 이벤트 핸들러
 * @param {Function} onNodeClick - 노드 클릭 이벤트 핸들러
 * @param {Function} routeColors - 경로 색상 관리 함수
 */
const Tree = ({ data, onCheckedNodesChange, onNodeClick, routeColors }) => {
  const { t } = useTranslation(); // 다국어 번역을 위한 훅
  const [treeData, setTreeData] = useState([]); // 트리 데이터 상태
  const [checkedNodes, setCheckedNodes] = useState([]); // 체크된 노드 상태

  /**
   * 트리 데이터 초기화
   * @param {Array} data - 입력된 트리 데이터
   * @returns {Array} 초기화된 트리 데이터
   */
  const initializeTreeData = (data) => {
    const addIdsAndColorsToData = (nodes, parentIndex = 0) => {
      return nodes.map((node, index) => {
        const colorIndex = (parentIndex + index) % colors.length; // 색상 인덱스 계산
        return {
          ...node,
          id: node.id || parentIndex + index + 1, // 고유 ID 설정
          color: colors[colorIndex], // 고유 색상 적용
          checked: true, // 기본 체크 상태
          children: Array.isArray(node.children)
            ? addIdsAndColorsToData(node.children, parentIndex + index)
            : [],
        };
      });
    };
    return Array.isArray(data) ? addIdsAndColorsToData(data) : [];
  };

  // 컴포넌트 마운트 시 트리 데이터 초기화
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const dataWithIdsAndChecked = initializeTreeData(data);
      setTreeData(dataWithIdsAndChecked);
    } else {
      setTreeData([]);
    }
  }, [data]);

  /**
   * 노드 상태를 재귀적으로 업데이트
   * @param {Object} node - 현재 노드
   * @param {boolean} checked - 체크 상태
   * @returns {Object} 업데이트된 노드
   */
  const updateNodeRecursively = (node, checked) => ({
    ...node,
    checked,
    children: Array.isArray(node.children)
      ? node.children.map((child) => updateNodeRecursively(child, checked))
      : [],
  });

  /**
   * 부모 노드 상태를 업데이트
   * @param {Object} node - 현재 노드
   * @returns {Object} 업데이트된 부모 노드
   */
  const updateParentNodeRecursively = (node) => {
    if (!Array.isArray(node.children) || node.children.length === 0) return node;
    const updatedChildren = node.children.map((child) =>
      updateParentNodeRecursively(child)
    );
    const allChecked = updatedChildren.every((child) => child.checked); // 모든 자식 노드가 체크 상태인지 확인
    return {
      ...node,
      checked: allChecked,
      children: updatedChildren,
    };
  };

  /**
   * 체크박스 상태 변경 처리
   * @param {Object} node - 체크된 노드
   * @param {boolean} checked - 체크 상태
   */
  const handleCheck = (node, checked) => {
    const updateNodes = (nodes) =>
      nodes.map((currentNode) =>
        currentNode.id === node.id
          ? updateNodeRecursively(currentNode, checked)
          : {
              ...currentNode,
              children: Array.isArray(currentNode.children)
                ? updateNodes(currentNode.children)
                : [],
            }
      );

    const updatedTreeData = updateNodes(treeData).map((node) =>
      updateParentNodeRecursively(node)
    );

    if (JSON.stringify(updatedTreeData) !== JSON.stringify(treeData)) {
      setTreeData(updatedTreeData);
    }
  };

  /**
   * 노드 클릭 처리
   * @param {Object} node - 클릭된 노드
   */
  const handleNodeClick = (node) => {
    if (onNodeClick) onNodeClick(node);
  };

  /**
   * 체크된 노드 목록 가져오기
   * @param {Array} nodes - 트리 데이터
   * @returns {Array} 체크된 노드 목록
   */
  const getCheckedNodes = (nodes) => {
    let checkedNodes = [];
    const traverse = (node) => {
      if (node.checked) checkedNodes.push(node);
      if (Array.isArray(node.children)) node.children.forEach(traverse);
    };
    nodes.forEach(traverse);
    return checkedNodes;
  };

  /**
   * 노드의 경로 색상 가져오기
   * @param {Object} node - 대상 노드
   * @returns {string} 색상
   */
  const getRouteColor = (node) => {
    const colorIndex = (node.id - 1) % colors.length; // 색상 인덱스 계산
    routeColors(colors[colorIndex]); // 부모 컴포넌트로 색상 전달
    return colors[colorIndex];
  };

  // 트리 데이터 변경 시 체크된 노드 업데이트
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
            {t('LeftSideSlide.NoDataFound') || 'No data found'} {/* 데이터 없음 표시 */}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tree;
