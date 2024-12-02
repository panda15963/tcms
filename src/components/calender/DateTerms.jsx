import React, { useEffect, useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

const dateTerms = (t) => [
  { id: 1, name: t('DateTerms.Day'), value: 'day' },
  { id: 2, name: t('DateTerms.Week'), value: 'week' },
  { id: 3, name: t('DateTerms.Month'), value: 'month' },
];

export default function DateTerms({ terms, initialTerm }) {
  const { t } = useTranslation();
  const termsList = useMemo(() => dateTerms(t), [t]);
  const [selected, setSelected] = useState(initialTerm);

  useEffect(() => {
    setSelected(initialTerm); // Update when initialTerm changes
  }, [initialTerm]);

  useEffect(() => {
    terms(selected);
  }, [selected, terms]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-white">
        {/* 날짜 간격 주기 */}
        {/* {t('DateTerms.DatePeriod')} */}
        {/* 조회 기간 */}
        {t('DateTerms.Inquiryperiod')}
      </span>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative w-16 ">
              <Listbox.Button className="relative h-9 w-full cursor-default rounded-md bg-white py-1 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm ">
                <span className="block truncate">{selected.name}</span>
                <span className="pointer-events-none  absolute inset-y-0 right-0 flex items-center pr-2">
                  <FaAngleDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                  {termsList.map((term) => (
                    <Listbox.Option
                      key={term.id}
                      value={term}
                      className={({ active }) =>
                        `${
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                        }
                       relative cursor-pointer select-none py-2 pl-3 pr-10`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`${
                              selected ? 'font-bold' : 'font-normal'
                            } block truncate`}
                          >
                            {term.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaCheck
                                className="h-5 w-5 text-indigo-600"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
