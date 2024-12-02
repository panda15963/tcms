import React, { useState } from 'react';
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
    <div className="pl-2">
      <div className="flex items-center pb-2">
        {/* Show expand/collapse button if there are child nodes */}
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
        {/* Checkbox */}
        <input type="checkbox" checked={node.checked} onChange={handleCheck} />
        {/* Index */}
        <span className="ml-2 ">{currentIndex + 1}.</span>
        {/* Route Color Box */}
        <span
          className="w-4 h-4 ml-1"
          style={{
            backgroundColor: routeColor,
            display: 'inline-block',
            borderRadius: '3px',
            // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        ></span>
        {/* Display node name */}
        <span
          className="pl-2 text-sm flex items-center cursor-pointer hover:text-blue-500 hover:underline"
          onClick={handleFileClick} // Trigger node click handler
        >
          {node.file_name}
        </span>
      </div>
      {/* Render child nodes if expanded */}
      {expanded && node.children && node.children.length > 0 && (
        <div className="pl-4">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id}
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
