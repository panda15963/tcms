import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Tree from '../treeMenu/Tree';

/**
 * 경로 목록
 * 왼쪽 사이드바
 */
export default function LeftSideSlide({
  data,
  onCheckedNodesChange,
  onClickedNode,
  onMapChange,
  routeColors,
}) {
  const [open, setOpen] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const { t } = useTranslation();

  const handleRouteColors = (colors) => {
    if (typeof routeColors === 'function') {
      routeColors(colors);
    }
  };

  const handleCheckedNodes = (nodes) => {
    onCheckedNodesChange(nodes);
  };

  const handleNodeClick = (node) => {
    onClickedNode(node);
  };

  const togglePanel = () => {
    setOpen(!open);
  };

  // Automatically open the panel and set treeData when new data is provided
  useEffect(() => {
    if (data && data.length > 0) {
      setOpen(true);
    }
  }, [data]);

  // Reset data to null when onMapChange occurs
  useEffect(() => {
    if (onMapChange) {
      // Map change detected, set data to null
      setRowsData([]); // Clear rows data
      setOpen(false); // Close the panel
    }
  }, [onMapChange]);

  // Apply filtering logic based on onMapChange
  useEffect(() => {
    if (onMapChange?.name === 'ROUTO' || onMapChange?.name === 'TMAP') {
      console.log('onMapChange is ROUTO or TMAP, applying filters.');

      // Filter logic
      const filteredByCountry = data.filter(
        (item) => item.country_str === 'KOR' || item.country_str === 'SAU'
      );

      const filteredByName = filteredByCountry.filter(
        (item) =>
          !item.file_name.includes('US') ||
          (item.country_str === 'SAU' && item.file_name.includes('KOR'))
      );

      setRowsData(filteredByName);

      // Open the panel only if filtered data exists
      if (filteredByName.length > 0) {
        setOpen(true);
      }
    } else {
      console.log(
        'onMapChange is not ROUTO or TMAP, keeping current panel state.'
      );
    }
  }, [data, onMapChange]);

  return (
    <div className="flex">
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-r-full bg-blue-900 hover:bg-blue_lapis"
            onClick={togglePanel}
          >
            <FaArrowCircleRight size={30} />
          </button>
        </div>
      )}

      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4 h-[800px] rounded-tr-lg">
          <div className="bg-blue-900 px-2 py-2 sm:px-3 shadow-xl rounded-tr-lg">
            <div className="flex items-center justify-between">
              <label className="flex text-base font-semibold leading-6 text-white">
                {/* 경로 목록 */}
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
            <Tree
              data={rowsData} // Use filtered data
              onCheckedNodesChange={handleCheckedNodes}
              onNodeClick={handleNodeClick}
              onMapChange={onMapChange}
              routeColors={handleRouteColors}
            />
          </div>
        </div>
      </Transition>
    </div>
  );
}
