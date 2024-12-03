import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useLocation } from 'react-router-dom';

/**
 * 여러 클래스를 결합하여 반환하는 함수
 * @param {...string} classes - 조건에 따라 적용할 클래스들
 * @returns {string} 결합된 클래스 문자열
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * PCLists 컴포넌트
 * - 선택 가능한 PC 목록을 제공하는 드롭다운
 * - "All" 옵션을 포함하여 URL 경로 또는 외부 상태와 동기화
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedPC - 선택된 PC 데이터
 * @param {function} props.setSelectedPC - 선택된 PC 상태를 업데이트하는 함수
 * @param {any} props.resetTrigger - 선택 초기화를 트리거하는 상태
 */
export default function PCLists({
  selectedPC,
  setSelectedPC = () => {},
  resetTrigger,
}) {
  const { t } = useTranslation(); // 다국어 지원을 위한 훅
  const location = useLocation(); // 현재 URL 경로 정보를 가져오는 훅
  const [selected, setSelected] = useState(null); // 현재 선택된 항목 상태
  const [PCList, setPCList] = useState([]); // 드롭다운 항목 목록

  /**
   * selectedPC.pcname 배열을 드롭다운 형식으로 변환
   * - "All" 옵션을 항상 첫 번째로 추가
   */
  useEffect(() => {
    if (selectedPC && Array.isArray(selectedPC.pcname)) {
      const formattedPCList = [
        { id: 1, name: t('PCList.All') }, // "All" 옵션
        ...selectedPC.pcname.map((name, index) => ({
          id: index + 2, // ID는 2부터 시작
          name,
        })),
      ];
      setPCList(formattedPCList); // 변환된 목록 상태 업데이트
    }
  }, [selectedPC, t]);

  /**
   * URL 경로 변경 시 현재 경로에 해당하는 PC 선택
   * - 기본값으로 "All"을 선택
   */
  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase(); // 경로에서 마지막 부분 추출
    const initialSelected =
      PCList.find((api) => api.name === path) || PCList[0]; // 경로에 해당하는 항목 또는 기본값
    setSelected(initialSelected); // 선택 상태 업데이트
    setSelectedPC(initialSelected); // 부모 상태와 동기화
  }, [location.pathname, PCList, setSelectedPC]);

  /**
   * resetTrigger 상태 변경 시 선택 초기화
   * - 기본값으로 "All" 선택
   */
  useEffect(() => {
    if (PCList.length > 0) {
      const defaultSelection = PCList[0]; // "All" 항목
      setSelected(defaultSelection);
      setSelectedPC(defaultSelection); // 부모 상태와 동기화
    }
  }, [resetTrigger, PCList, setSelectedPC]);

  /**
   * 선택 변경 시 로컬 상태와 부모 상태 업데이트
   * @param {object} selectedMap - 선택된 항목
   */
  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap); // 로컬 상태 업데이트
    setSelectedPC(selectedMap); // 부모 상태 업데이트
  };

  // 초기화되지 않은 상태에서는 null 반환
  if (!selected) return null;

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-52 border border-black rounded-lg">
            {/* 선택된 항목 표시 버튼 */}
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>
            {/* 드롭다운 애니메이션 */}
            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {PCList.map((api) => (
                  <ListboxOption
                    key={api.id} // 고유 ID
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
                        {/* 항목 이름 */}
                        <span
                          className={classNames(
                            selected ? 'font-bold text-white' : 'text-gray-900',
                            'block truncate'
                          )}
                        >
                          {api.name}
                        </span>
                        {/* 선택된 항목 체크 표시 */}
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
