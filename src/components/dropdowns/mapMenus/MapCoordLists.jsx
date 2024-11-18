import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';

// 좌표 유형을 정의한 배열
const mapCoords = [
  { id: 1, name: 'DEC' },
  { id: 2, name: 'DEG' },
  { id: 3, name: 'MMS' },
];

// classNames 함수는 여러 클래스를 결합할 때 유용함
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MapCoordLists({ chosenDisplayCoords = () => {} }) {
  /**
   * DEC / DEG / MMS 좌표 형식 선택 기능
   * chosenDisplayCoords는 선택된 좌표 유형을 부모 컴포넌트로 전달하기 위한 콜백 함수입니다.
   */
  const [selected, setSelected] = useState(mapCoords[0]); // 기본 선택된 좌표 유형은 'DEC'

  // 선택된 좌표 유형이 변경될 때마다 실행되어 부모 컴포넌트에 알림
  useEffect(() => {
    chosenDisplayCoords(selected); // 선택된 좌표 유형을 부모 컴포넌트에 전달
  }, [selected]); // selected 상태가 변경될 때마다 실행됨

  return (
    <>
      {/* Listbox는 드롭다운을 구현하는 컴포넌트 */}
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className="relative">
              {/* ListboxButton은 사용자가 선택할 수 있는 버튼 */}
              <ListboxButton
                className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 "
                style={{ paddingRight: '60px' }}
              >
                <span className="block truncate">{selected.name}</span>{' '}
                {/* 현재 선택된 좌표 유형 표시 */}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FaAngleDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>
              {/* Transition 컴포넌트를 이용해 드롭다운이 열리고 닫힐 때의 애니메이션 효과를 추가 */}
              <Transition
                show={open} // open 상태에 따라 드롭다운의 표시 여부를 제어
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {/* ListboxOptions는 드롭다운의 옵션들을 표시하는 컴포넌트 */}
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {mapCoords.map((mapCoord) => (
                    <ListboxOption
                      key={mapCoord.id} // 각 옵션의 고유 ID로 key 설정
                      className={({ focus }) =>
                        classNames(
                          focus ? 'bg-indigo-600 text-white' : '', // 포커스된 항목 스타일
                          !focus ? 'text-gray-900' : '', // 포커스되지 않은 항목 스타일
                          'relative cursor-default select-none py-2 pl-8 pr-4',
                        )
                      }
                      value={mapCoord} // 선택할 때 사용되는 값
                    >
                      {({ selected, focus }) => (
                        <>
                          {/* 좌표 유형 이름 표시 */}
                          <span
                            className={classNames(
                              selected ? 'font-bold' : '', // 선택된 항목은 굵은 글꼴로 표시
                              'block truncate',
                            )}
                          >
                            {mapCoord.name}
                          </span>
                          {/* 선택된 항목 옆에 체크 아이콘을 표시 */}
                          {selected ? (
                            <span
                              className={classNames(
                                focus ? 'text-white' : 'text-indigo-600', // 포커스 상태에 따라 아이콘 색상 변경
                                'absolute inset-y-0 left-0 flex items-center pl-1.5',
                              )}
                            >
                              <FaCheck className="h-5 w-3" aria-hidden="true" />
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
