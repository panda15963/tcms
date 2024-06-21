import { useState } from 'react';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

export default function TreeNode({ node, onCheck }) {
  const [expanded, setExpanded] = useState(false);

  const handleCheck = (e) => {
    if (onCheck) {
      onCheck(node, e.target.checked);
    }
  };

  return (
    <div className="pl-4 ">
      <div className="flex items-center">
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
        <input
          type="checkbox"
          checked={node.checked}
          onChange={handleCheck}
          className=""
        />
        <span className="px-2 text-gray-900 text-sm text-center flex items-center">
          {node.name}
        </span>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onCheck={onCheck} />
          ))}
        </div>
      )}
    </div>
  );
}
