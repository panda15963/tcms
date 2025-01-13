import { useEffect, useState } from 'react';
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
 * 여러 클래스를 조합하여 반환하는 함수
 * @param {...string} classes - 조건에 따라 적용할 클래스들
 * @returns {string} 조합된 클래스 문자열
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * ToolLists 컴포넌트 - 툴 선택을 관리하며 부모 상태와 동기화
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedTool - 선택된 툴 데이터
 * @param {function} props.setSelectedTool - 선택된 툴을 설정하는 함수
 * @param {any} props.resetTrigger - 선택 초기화를 트리거하는 값
 */
export default function ToolLists({
  selectedTool,
  setSelectedTool = () => {},
  resetTrigger,
  pageData,
  selectedToolName,
}) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const location = useLocation(); // 현재 URL 경로
  const [selected, setSelected] = useState(null); // 현재 선택된 툴 상태
  const [ToolList, setToolList] = useState([]); // 툴 목록 상태

  /**
   * `selectedTool.toolnametbl` 배열을 `ToolList` 형식으로 변환하고 중복 제거
   */
  useEffect(() => {
    if (selectedTool && Array.isArray(selectedTool.toolnametbl)) {
      const formattedToolList = selectedTool.toolnametbl.map((tool, index) => ({
        id: index + 2, // ID는 2부터 시작, ID 1은 "ALL"에 사용
        name: tool.toolname,
      }));

      // 중복 제거 (name 속성 기준)
      const uniqueToolList = Array.from(
        new Map(formattedToolList.map((item) => [item.name, item]))
      ).map(([, value]) => value);

      const updatedToolList =
        pageData !== '도구 실행 횟수(버전 별)' &&
        pageData !== '도구 기능별 사용 횟수'
          ? [{ id: 1, name: t('ToolList.All') }, ...uniqueToolList]
          : uniqueToolList;
      setToolList(updatedToolList);
      setSelected(updatedToolList[0]);
      setSelectedTool(updatedToolList[0]);
      if (typeof selectedToolName === 'function') {
        selectedToolName(uniqueToolList[0]);
      }
    }
  }, [selectedTool, pageData, t, setSelectedTool]);

  /**
   * 현재 URL 경로를 기준으로 선택된 툴을 업데이트하거나 기본값 설정
   */
  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase(); // URL 경로 마지막 부분 가져오기
    const initialSelected =
      ToolList.find((api) => api.name === path) || ToolList[0];
    setSelected(initialSelected);
    setSelectedTool(initialSelected); // 부모 상태와 동기화
  }, [location.pathname, ToolList, setSelectedTool]);

  /**
   * `resetTrigger` 변경 시 선택 초기화
   */
  useEffect(() => {
    if (ToolList.length > 0) {
      const defaultSelection = ToolList[0]; // 기본값은 "ALL"
      setSelected(defaultSelection);
      setSelectedTool(defaultSelection); // 부모 상태와 동기화
      if (typeof selectedToolName === 'function') {
        selectedToolName(defaultSelection);
      }
    }
  }, [resetTrigger, ToolList, setSelectedTool]);

  /**
   * 툴 선택 변경 핸들러
   * @param {object} selectedMap - 선택된 툴 데이터
   */
  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap); // 선택 상태 업데이트
    setSelectedTool(selectedMap); // 부모 상태와 동기화
    if (typeof selectedToolName === 'function') {
      selectedToolName(selectedMap);
    }
  };

  if (!selected) return null; // 선택된 툴이 없으면 렌더링하지 않음

  /**
   * 문자열을 지정된 길이로 자르고 말줄임표(...)를 추가
   * @param {string} str - 입력 문자열
   * @param {number} maxLength - 최대 길이
   * @returns {string} 줄여진 문자열
   */
  const truncate = (str, maxLength) =>
    str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-48 border border-black rounded-lg">
            {/* 드롭다운 버튼 */}
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:border-black sm:text-sm sm:leading-6">
              <span className="block truncate">
                {truncate(selected.name, 10)}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>
            {/* 드롭다운 옵션 */}
            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {ToolList.map((api) => (
                  <ListboxOption
                    key={api.id}
                    className={({ selected, focus }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : '',
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
                            selected ? 'font-bold text-white' : 'text-gray-900',
                            'block truncate'
                          )}
                        >
                          {truncate(api.name, 10)}
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
