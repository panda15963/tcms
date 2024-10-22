import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Tree from '../treeMenu/Tree';

export default function LeftSideSlide({
  data,
  onCheckedNodesChange,
  onClickedNode,
  onMapChange,
  routeColors, // Add routeColors to props
}) {
  const [open, setOpen] = useState(false); // State to manage whether the panel is open
  const [treeData, setTreeData] = useState([]); // Local state to manage tree data
  const { t } = useTranslation();

  // Function to handle checked nodes change
  const handleCheckedNodes = (nodes) => {
    onCheckedNodesChange(nodes); // Send the checked nodes back to MapLayout
  };

  // Function to handle clicked node
  const handleNodeClick = (node) => {
    onClickedNode(node); // Set the clicked node in state
  };

  const togglePanel = () => {
    setOpen(!open); // Toggle the panel manually
  };

  // useEffect to automatically open the panel when new data is provided and set treeData
  useEffect(() => {
    if (data && data.length > 0) {
      setOpen(true); // Open the panel when new data is provided
      setTreeData(data); // Set the data for the Tree component
    }
  }, [data]);

  useEffect(() => {
    if (onMapChange) {
      setOpen(false);
    }
  }, [onMapChange]);

  useEffect(() => {
    if (!open) {
      setTreeData([]); // Clear treeData when the panel closes
    }
  }, [open]);

  return (
    <div className="flex">
      {/* Panel open button */}
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-r-full bg-blue-700 hover:bg-blue_lapis"
            onClick={togglePanel}
          >
            <FaArrowCircleRight size={30} />
          </button>
        </div>
      )}

      {/* Sidebar with Transition */}
      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        {/* <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4"> */}
        <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4 h-[800px]">
          <div className="bg-blue-700 px-2 py-2 sm:px-3 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="flex text-base font-semibold leading-6 text-white">
                {t('LeftSideSlide.CourseList')}
              </label>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none hover:outline-none"
                  onClick={togglePanel}
                >
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Close panel</span>
                  <FaXmark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-auto">
            {/* Tree menu component */}
            <Tree
              data={treeData} // Use the local treeData state
              onCheckedNodesChange={handleCheckedNodes}
              onNodeClick={handleNodeClick} // Pass the onNodeClick handler to Tree
              onMapChange={onMapChange}
              routeColors={routeColors} // Pass routeColors to Tree component
            />
          </div>
        </div>
      </Transition>
    </div>
  );
}
