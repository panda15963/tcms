import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';

// 좌표 유형 목록 정의
const mapCoords = [
  { id: 1, name: 'DEC' },
  { id: 2, name: 'DEG' },
  { id: 3, name: 'MMS' },
];

/**
 * 여러 클래스를 결합하여 반환하는 함수
 * @param {...string} classes - 조건에 따라 적용할 클래스들
 * @returns {string} 결합된 클래스 문자열
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * MapCoordLists 컴포넌트 - 좌표 유형 선택 드롭다운
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {function} props.chosenDisplayCoords - 선택된 좌표 유형을 부모 컴포넌트로 전달하는 함수
 */
export default function MapCoordLists({ chosenDisplayCoords = () => {} }) {
  const [selected, setSelected] = useState(mapCoords[0]); // 기본 선택값을 'DEC'로 설정

  /**
   * 선택된 좌표 유형이 변경될 때마다 부모 컴포넌트로 전달
   */
  useEffect(() => {
    chosenDisplayCoords(selected); // 선택된 좌표 유형을 부모로 전달
  }, [selected]); // 선택 상태가 변경될 때 실행

  return (
    <>
      {/* Listbox를 사용하여 드롭다운 구현 */}
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative">
              {/* ListboxButton: 현재 선택된 항목을 보여주는 버튼 */}
              <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-[60px] text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <span className="block w-10 overflow-hidden text-ellipsis whitespace-nowrap">
                  {selected.name}
                </span>
                {/* 선택된 좌표 유형 이름 표시 */}
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
                <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 z-20 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {mapCoords.map((mapCoord) => (
                    <ListboxOption
                      key={mapCoord.id} // 옵션의 고유 ID
                      className={({ focus }) =>
                        classNames(
                          focus ? 'bg-indigo-600 text-white' : '', // 포커스된 항목 스타일
                          !focus ? 'text-gray-900' : '', // 포커스되지 않은 항목 스타일
                          'relative cursor-default select-none py-2 pl-8 pr-4'
                        )
                      }
                      value={mapCoord} // 선택된 값
                    >
                      {({ selected, focus }) => (
                        <>
                          {/* 좌표 유형 이름 */}
                          <span
                            className={classNames(
                              selected ? 'font-bold' : '', // 선택된 항목은 굵게 표시
                              'block truncate'
                            )}
                          >
                            {mapCoord.name}
                          </span>
                          {/* 선택된 항목에는 체크 아이콘 표시 */}
                          {selected && (
                            <span
                              className={classNames(
                                focus ? 'text-white' : 'text-indigo-600', // 포커스 상태에 따라 색상 변경
                                'absolute inset-y-0 left-0 flex items-center pl-1.5'
                              )}
                            >
                              <FaCheck className="h-5 w-3" aria-hidden="true" />
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
    </>
  );
}
