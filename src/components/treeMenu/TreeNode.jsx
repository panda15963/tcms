import { useState } from 'react';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

export default function TreeNode({
  node,
  onCheck,
  onNodeClick,
  currentIndex,
  routeColor,
}) {
  const [expanded, setExpanded] = useState(false); // Node expand/collapse state

  const handleCheck = (e) => {
    if (onCheck) {
      onCheck(node, e.target.checked);
    }
  };

  // Handle file click
  const handleFileClick = () => {
    if (onNodeClick) {
      onNodeClick(node); // Call the onNodeClick function with the clicked node
    }
  };

  return (
    <div className="pl-4">
      <div className="flex items-center pb-2">
        {/* 자식 노드가 있는 경우 확장/축소 버튼 표시 */}
        {node.children && node.children.length > 0 && (
          <button
            className="focus:outline-none pr-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <CiSquareMinus size={16} />
            ) : (
              <CiSquarePlus size={16} />
            )}
          </button>
        )}
        {/* 체크박스 */}
        <input type="checkbox" checked={node.checked} onChange={handleCheck} />
        {/* 번호 */}
        <span className="ml-2 font-bold">{currentIndex + 1}.</span>
        {/* Route Color 상자 */}
        <span
          className="w-4 h-4 ml-2"
          style={{
            backgroundColor: node.checked ? routeColor : '#ffffff',
            display: 'inline-block',
          }}
        ></span>
        {/* 노드 이름 표시 */}
        <span
          className="pl-2 text-sm flex font-bold items-center cursor-pointer hover:text-blue-500 hover:underline"
          onClick={handleFileClick} // Trigger node click handler
        >
          {node.file_name}
        </span>
      </div>
      {/* 자식 노드가 확장된 경우 자식 노드 렌더링 */}
      {expanded && node.children && node.children.length > 0 && (
        <div className="pl-4">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              onCheck={onCheck}
              onNodeClick={onNodeClick} // Pass the click handler down
              currentIndex={`${currentIndex}.${index + 1}`} // Update the currentIndex
              routeColor={routeColor} // Pass routeColor to child nodes if needed
            />
          ))}
        </div>
      )}
    </div>
  );
}
