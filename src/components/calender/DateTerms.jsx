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

const dateTerms = [
  { id: 1, name: '1 day' },
  { id: 2, name: '1 week' },
  { id: 3, name: '1 month' },
  { id: 4, name: '3 month' },
  { id: 5, name: '6 month' },
  { id: 6, name: '1 year' },
];

// classNames function to combine multiple classes
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DateTerms({ terms = () => {} }) {
  const location = useLocation();
  const [selected, setSelected] = useState(dateTerms[0]); // 기본 값을 dateTerms[0]으로 설정

  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase();
    const initialSelected = dateTerms.find((api) => api.name === path) || dateTerms[0];
    setSelected(initialSelected);
  }, [location.pathname]);

  useEffect(() => {
    terms(selected); // selected가 변경될 때마다 terms 함수 호출
  }, [selected, terms]);

  const handleOnSelectMap = (selectedTerm) => {
    setSelected(selectedTerm);
  };

  if (!selected) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">날짜 간격 주기 :</span>
      <Listbox value={selected} onChange={handleOnSelectMap}>
        {({ open }) => (
          <>
            <div className="relative w-48">
              <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none border border-black sm:text-sm sm:leading-6">
                <span className="block truncate old">{selected.name}</span>
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
                  {dateTerms.map((api) => (
                    <ListboxOption
                      key={api.id}
                      className={({ selected, focus }) =>
                        classNames(
                          selected ? 'bg-indigo-600 font-bold text-white' : '',
                          focus && !selected ? 'bg-gray-200' : '',
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
                                ? 'old text-white'
                                : 'old text-gray-900',
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
    </div>
  );
}
