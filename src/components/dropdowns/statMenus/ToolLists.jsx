import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';

const tools = [
  { id: 1, name: 'PC' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ToolLists({ setSelectedTool = () => {} }) {
  const location = useLocation();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase();
    const initialSelected = tools.find((api) => api.name === path) || tools[0];
    setSelected(initialSelected);
    if (setSelectedTool) setSelectedTool(initialSelected); // Safely call setSelectedTool if provided
  }, [location.pathname, setSelectedTool]);

  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap);
    if (setSelectedTool) setSelectedTool(selectedMap); // Safely call setSelectedTool if provided
  };

  if (!selected) return null;

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative w-48">
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none border border-black sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>
            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {tools.map((api) => (
                  <ListboxOption
                    key={api.id}
                    className={({ selected, active }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : '',
                        active && !selected ? 'bg-gray-200' : '',
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={api}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={classNames(
                            selected
                              ? 'font-bold text-white'
                              : 'text-gray-900',
                            'block truncate'
                          )}
                        >
                          {api.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-white">
                            <FaCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
