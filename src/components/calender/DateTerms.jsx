import { useEffect, useState, useMemo } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const dateTerms = (t) => [
  { id: 1, name: t('DateTerms.Day'), value: 'day' }, // 일별
  { id: 2, name: t('DateTerms.Week'), value: 'week' }, // 주별
  { id: 3, name: t('DateTerms.Month'), value: 'month' }, // 월별
];

// classNames function to combine multiple classes
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DateTerms({ terms = () => {} }) {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Memoize termsList to prevent re-creation on every render
  const termsList = useMemo(() => dateTerms(t), [t]);
  const [selected, setSelected] = useState(termsList[0]);

  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase();
    const initialSelected = termsList.find((api) => api.name === path) || termsList[0];
    setSelected(initialSelected);
  }, [location.pathname, termsList]);

  useEffect(() => {
    terms(selected);
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
                  {termsList.map((api) => (
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
