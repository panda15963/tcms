import React, { useState } from 'react';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

/**
 * TreeNode 컴포넌트
 * @description 트리 구조의 개별 노드를 렌더링하며, 체크 상태와 클릭 이벤트를 처리
 * @param {Object} node - 노드 데이터
 * @param {Function} onCheck - 체크박스 상태 변경 이벤트 핸들러
 * @param {Function} onNodeClick - 노드 클릭 이벤트 핸들러
 * @param {string|number} currentIndex - 현재 노드의 인덱스
 * @param {string} routeColor - 경로 색상
 * @returns {JSX.Element} TreeNode 컴포넌트
 */
export default function TreeNode({
  node,
  onCheck,
  onNodeClick,
  currentIndex,
  routeColor,
}) {
  const [expanded, setExpanded] = useState(false); // 노드 확장/축소 상태 관리

  /**
   * 체크박스 상태 변경 처리 함수
   * @param {Object} e - 이벤트 객체
   */
  const handleCheck = (e) => {
    if (onCheck) {
      onCheck(node, e.target.checked); // 체크 상태를 부모 컴포넌트로 전달
    }
  };

  /**
   * 노드 클릭 처리 함수
   */
  const handleFileClick = () => {
    if (onNodeClick) {
      onNodeClick(node); // 클릭된 노드를 부모 컴포넌트로 전달
    }
  };

  return (
    <div className="pl-2">
      <div className="flex items-center pb-2">
        {/* 자식 노드가 있는 경우 확장/축소 버튼 표시 */}
        {node.children && node.children.length > 0 && (
          <button
            className="focus:outline-none pr-2"
            onClick={() => setExpanded(!expanded)} // 확장/축소 상태 토글
          >
            {expanded ? (
              <CiSquareMinus size={16} /> // 확장된 상태: 마이너스 아이콘
            ) : (
              <CiSquarePlus size={16} /> // 축소된 상태: 플러스 아이콘
            )}
          </button>
        )}
        {/* 체크박스 */}
        <input type="checkbox" checked={node.checked} onChange={handleCheck} />
        {/* 인덱스 표시 */}
        <span className="ml-2 ">{currentIndex + 1}.</span>
        {/* 경로 색상 박스 */}
        <span
          className="w-4 h-4 ml-1 inline-block rounded-[3px] border border-[rgba(255,255,255,0.5)]"
          style={{ backgroundColor: routeColor }}
        />
        {/* 노드 이름 표시 */}
        <span
          className="pl-2 text-sm flex items-center cursor-pointer hover:text-blue-500 hover:underline"
          onClick={handleFileClick} // 노드 클릭 이벤트 트리거
        >
          {node.file_name}
        </span>
      </div>
      {/* 확장된 경우 자식 노드 렌더링 */}
      {expanded && node.children && node.children.length > 0 && (
        <div className="pl-4">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id} // 자식 노드의 고유 ID 설정
              node={child}
              onCheck={onCheck}
              onNodeClick={onNodeClick}
              currentIndex={`${currentIndex}.${index + 1}`}
              routeColor={routeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
