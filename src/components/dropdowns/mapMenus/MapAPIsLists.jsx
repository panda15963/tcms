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

// 사용 가능한 지도 API 목록 (BAIDU는 주석 처리하여 비활성화)
const mapAPIs = [
  { id: 1, name: 'ROUTO' },
  { id: 2, name: 'TOMTOM' },
  { id: 3, name: 'GOOGLE' },
  { id: 4, name: 'HERE' },
  { id: 5, name: 'TMAP' },
  // { id: 6, name: 'BAIDU' },
];

/**
 * classNames 함수: 여러 클래스를 결합하는 유틸리티 함수
 * @param {...string} classes - 조건에 따라 결합할 클래스 이름들
 * @returns {string} 결합된 클래스 이름
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * MapAPIsLists 컴포넌트 - 지도 API 선택을 위한 드롭다운 컴포넌트
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {function} props.setSelectedAPI - 선택된 지도 API를 부모 컴포넌트에 전달하는 콜백 함수
 */
export default function MapAPIsLists({ setSelectedAPI }) {
  const location = useLocation(); // 현재 경로 정보를 얻기 위한 훅
  const [selected, setSelected] = useState(null); // 현재 선택된 지도 API 상태

  /**
   * 경로 변경 시, 경로에 맞는 지도 API를 선택
   * 경로의 마지막 부분을 추출해 지도 API 목록에서 검색
   */
  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase(); // 경로에서 마지막 부분을 대문자로 변환
    const initialSelected =
      mapAPIs.find((api) => api.name === path) || mapAPIs[0]; // 경로에 해당하는 API를 찾거나 기본값으로 첫 번째 API 설정
    setSelected(initialSelected); // 선택된 API 상태 업데이트
  }, [location.pathname]); // location.pathname이 변경될 때마다 실행

  /**
   * 선택된 지도 API를 상태로 업데이트
   * @param {object} selectedMap - 사용자가 선택한 지도 API
   */
  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap); // 선택 상태 업데이트
  };

  /**
   * 선택된 API가 변경될 때마다 부모 컴포넌트에 API를 전달
   */
  useEffect(() => {
    if (selected) {
      setSelectedAPI(selected); // 선택된 API를 부모 컴포넌트에 전달
    }
  }, [selected, setSelectedAPI]); // selected가 변경될 때 실행

  // 선택된 API가 없으면 null 반환
  if (!selected) return null;

  return (
    // Listbox를 사용하여 드롭다운 구현
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-36 ">
            {/* ListboxButton: 사용자가 선택한 항목을 보여주는 버튼 */}
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="block truncate">{selected.name}</span> {/* 선택된 API 이름 표시 */}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            {/* Transition 컴포넌트를 사용해 드롭다운 애니메이션 추가 */}
            <Transition
              show={open} // 드롭다운이 열릴 때만 표시
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {/* ListboxOptions: 드롭다운 옵션 목록 */}
              <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {mapAPIs.map((api) => (
                  <ListboxOption
                    key={api.id} // 옵션의 고유 키
                    className={({ selected, focus }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : '', // 선택된 항목 스타일
                        focus && !selected ? 'bg-gray-200' : '', // 포커스된 항목 스타일
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={api} // 선택된 값
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={classNames(
                            selected
                              ? 'font-bold text-white'
                              : 'text-gray-900', // 선택된 경우 텍스트 스타일
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