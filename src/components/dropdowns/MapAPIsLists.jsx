import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useNavigate, useLocation } from 'react-router-dom';

const mapAPIs = [
  { id: 1, name: 'GOOGLE' },
  { id: 2, name: 'HERE' },
  { id: 3, name: 'ROUTO' },
  { id: 4, name: 'TMAP' },
  { id: 5, name: 'TOMTOM' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MapAPIsLists() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase();
    const initialSelected = mapAPIs.find((api) => api.name === path) || mapAPIs[0];
    setSelected(initialSelected);
  }, [location.pathname]);

  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap);
    console.log(
      '🚀 ~ MapAPIsLists ~ selected & selectedMap:',
      selected,
      selectedMap,
    );
  };

  useEffect(() => {
    if (selected) {
      if (selected.name !== 'GOOGLE') {
        navigate(`/main/${selected.name.toLowerCase()}`);
      } else {
        navigate(`/main`);
      }
    }
  }, [selected, navigate]);

  if (!selected) return null;

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-32">
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
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
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {mapAPIs.map((mapAPI) => (
                  <ListboxOption
                    key={mapAPI.id}
                    className={({ focus }) =>
                      classNames(
                        focus ? 'bg-indigo-600 text-white' : '',
                        !focus ? 'text-gray-900' : '',
                        'relative cursor-default select-none py-2 pl-8 pr-4',
                      )
                    }
                    value={mapAPI}
                  >
                    {({ selected, focus }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'block truncate',
                          )}
                        >
                          {mapAPI.name}
                        </span>
                        {selected ? (
                          <span
                            className={classNames(
                              focus ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 left-0 flex items-center pl-1.5',
                            )}
                          >
                            <CheckIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
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
  );
}
