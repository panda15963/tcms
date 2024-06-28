import { useState } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaArrowCircleRight } from 'react-icons/fa';

import Tree from '../treeMenu/Tree';

const treeData = [
  {
    id: 1,
    name: 'Parent 1',
    checked: false,
    children: [
      {
        id: 2,
        name: 'Child 1-1',
        checked: false,
        children: [],
      },
      {
        id: 3,
        name: 'Child 1-2',
        checked: false,
        children: [
          {
            id: 4,
            name: 'Grandchild 1-2-1',
            checked: false,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Parent 2',
    checked: false,
    children: [],
  },
];

export default function LeftSideSlide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* Open button */}
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className=" text-white px-3 py-3 rounded-r-full bg-blue_ncs hover:bg-blue_lapis"
            onClick={() => setOpen(true)}
          >
            <FaArrowCircleRight />
          </button>
        </div>
      )}
      {/* Sidebar */}
      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4">
          <div className="bg-blue_lapis px-2 py-2 sm:px-3 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="flex text-base font-semibold leading-6 text-white">
                코스리스트
              </label>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md  text-indigo-200 hover:text-white focus:outline-none hover:outline-none "
                  onClick={() => setOpen(false)}
                >
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Close panel</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-auto">
            <Tree data={treeData} />
          </div>
        </div>
      </Transition>
    </div>
  );
}
