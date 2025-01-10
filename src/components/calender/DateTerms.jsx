import React, { useEffect, useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

/**
 * 날짜 간격 옵션 생성 함수
 * @param {function} t - 다국어 번역 함수
 * @returns {Array} 날짜 간격 옵션 배열
 */
const dateTerms = (t) => [
  { id: 1, name: t('DateTerms.Day'), value: 'day' }, // 일 간격
  { id: 2, name: t('DateTerms.Week'), value: 'week' }, // 주 간격
  { id: 3, name: t('DateTerms.Month'), value: 'month' }, // 월 간격
];

/**
 * DateTerms 컴포넌트 - 날짜 간격 선택 드롭다운
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {function} props.terms - 선택된 날짜 간격을 부모 컴포넌트에 전달
 * @param {object} props.initialTerm - 초기 선택 날짜 간격
 */
export default function DateTerms({ terms, initialTerm }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const [termsList, setTermsList] = useState(dateTerms(t)); // 날짜 간격 옵션 상태
  const [selected, setSelected] = useState(initialTerm); // 현재 선택된 항목 상태

  /**
   * 다국어 번역 변경 시 날짜 간격 옵션 업데이트
   */
  useEffect(() => {
    const updatedTermsList = dateTerms(t);
    setTermsList(updatedTermsList);

    if (initialTerm) {
      const updatedSelected = updatedTermsList.find(
        (term) => term.value === initialTerm.value
      );
      if (updatedSelected) {
        setSelected(updatedSelected);
      }
    }
  }, [t, initialTerm]);

  /**
   * 초기 선택 항목 변경 시 상태 업데이트
   */
  useEffect(() => {
    setSelected(initialTerm);
  }, [initialTerm]);

  /**
   * 선택된 항목 변경 시 부모 컴포넌트로 전달
   */
  useEffect(() => {
    terms(selected);
  }, [selected]);

  return (
    <div className="flex items-center gap-2">
      {/* 조회 기간 레이블 */}
      <span className="text-sm font-semibold text-white">
        {t('DateTerms.DatePeriod')}
      </span>

      {/* 드롭다운 컴포넌트 */}
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative w-32">
              {' '}
              {/* 너비를 w-32로 확장 */}
              <Listbox.Button className="relative h-9 w-full cursor-default rounded-md bg-white py-1 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm">
                <span className="block truncate">{selected.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FaAngleDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              {/* 드롭다운 옵션 */}
              <Transition
                show={open}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-50 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                  {termsList.map((term) => (
                    <Listbox.Option
                      key={term.id}
                      value={term}
                      className={({ active }) =>
                        `${
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                        } relative cursor-pointer select-none py-2 pl-3 pr-10`
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
