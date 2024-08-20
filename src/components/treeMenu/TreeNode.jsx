import { useState } from 'react';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

export default function TreeNode({ node, onCheck }) {
  const [expanded, setExpanded] = useState(false); // 노드 확장/축소 상태 관리

  /**
   * 체크박스 클릭 시 체크 상태 변경을 부모 컴포넌트로 전달
   * @param {Object} e - 이벤트 객체
   */
  const handleCheck = (e) => {
    if (onCheck) {
      onCheck(node, e.target.checked); // 노드와 새로운 체크 상태를 부모로 전달
    }
  };

  return (
    <div className="pl-4">
      <div className="flex items-center">
        {/* 자식 노드가 있는 경우 확장/축소 버튼 표시 */}
        {node.children && node.children.length > 0 && (
          <button
            className="focus:outline-none pr-2"
            onClick={() => setExpanded(!expanded)} // 클릭 시 노드 확장/축소
          >
            {expanded ? (
              <CiSquareMinus size={16} /> // 확장된 경우 마이너스 아이콘
            ) : (
              <CiSquarePlus size={16} /> // 축소된 경우 플러스 아이콘
            )}
          </button>
        )}
        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={node.checked} // 현재 노드의 체크 상태에 따라 체크박스 표시
          onChange={handleCheck} // 체크박스 변경 시 handleCheck 호출
          className=""
        />
        {/* 노드 이름 표시 */}
        <span className="px-2 text-gray-900 text-sm text-center flex items-center">
          {node.name}
        </span>
      </div>
      {/* 자식 노드가 확장된 경우 자식 노드 렌더링 */}
      {expanded && node.children.length > 0 && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onCheck={onCheck} /> // 재귀적으로 자식 노드를 렌더링
          ))}
        </div>
      )}
    </div>
  );
}
