import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';

const mapCoords = [
  { id: 1, name: 'DEC' },
  { id: 2, name: 'DEG' },
  { id: 3, name: 'MMS' },  
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MapCoordLists({ chosenDisplayCoords = () => {} }) {
  const [selected, setSelected] = useState(mapCoords[0]);

  useEffect(() => {
    chosenDisplayCoords(selected);
  }, [selected]);

  return (
    <>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative">
              <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
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
                  {mapCoords.map((mapCoord) => (
                    <ListboxOption
                      key={mapCoord.id}
                      className={({ focus }) =>
                        classNames(
                          focus ? 'bg-indigo-600 text-white' : '',
                          !focus ? 'text-gray-900' : '',
                          'relative cursor-default select-none py-2 pl-8 pr-4',
                        )
                      }
                      value={mapCoord}
                    >
                      {({ selected, focus }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate',
                            )}
                          >
                            {mapCoord.name}
                          </span>
                          {selected ? (
                            <span
                              className={classNames(
                                focus ? 'text-white' : 'text-indigo-600',
                                'absolute inset-y-0 left-0 flex items-center pl-1.5',
                              )}
                            >
                              <FaCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
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
    </>
  );
}
