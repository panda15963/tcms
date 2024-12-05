import { useEffect, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useNavigate, useLocation } from 'react-router-dom';
import routoLogo from '../../../assets/images/mapLogo/routo.png';
import googleLogo from '../../../assets/images/mapLogo/google.png';
import hereLogo from '../../../assets/images/mapLogo/here.png';
import baiduLogo from '../../../assets/images/mapLogo/baidu.png';
import tmapLogo from '../../../assets/images/mapLogo/tmap.png';
import tomtomLogo from '../../../assets/images/mapLogo/tomtom.png';

// 사용 가능한 지도 API 목록 주석 처리한 부분은 당분간 사용 금지
const mapAPIs = [
  { id: 1, name: 'ROUTO', logo: routoLogo },
  { id: 2, name: 'TOMTOM', logo: tomtomLogo },
  { id: 3, name: 'GOOGLE', logo: googleLogo },
  { id: 4, name: 'HERE', logo: hereLogo },
  { id: 5, name: 'TMAP', logo: tmapLogo },
  // { id: 6, name: 'BAIDU', logo: baiduLogo },
];

// classNames 함수는 여러 클래스를 결합할 때 유용함
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MapAPIsLists({ setSelectedAPI }) {
  /**
   * Google, Route, Tmap, TomTom, Baidu 지도 선택 기능을 제공하는 드롭다운 컴포넌트
   * setSelectedAPI는 선택된 API를 부모 컴포넌트로 전달하는 콜백 함수입니다.
   */
  const navigate = useNavigate(); // 네비게이션을 위한 useNavigate 훅 사용
  const location = useLocation(); // 현재 경로 정보를 얻기 위한 useLocation 훅 사용
  const [selected, setSelected] = useState(null); // 선택된 지도 API를 상태로 저장

  // 경로가 변경될 때마다 실행되어 경로에 맞는 지도 API를 선택합니다.
  useEffect(() => {
    const path = location.pathname.split('/').pop().toUpperCase(); // 현재 경로의 마지막 부분을 추출하여 대문자로 변환
    const initialSelected =
      mapAPIs.find((api) => api.name === path) || mapAPIs[0]; // 경로에 맞는 API를 찾거나 기본값으로 첫 번째 API 설정
    setSelected(initialSelected); // 선택된 API 상태 업데이트
  }, [location.pathname]); // 경로가 변경될 때마다 실행

  /**
   * 사용자가 지도 API를 선택했을 때 호출되는 함수
   * 선택된 API를 상태로 업데이트합니다.
   */
  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap);
  };

  // 선택된 API가 변경될 때마다 부모 컴포넌트로 해당 API를 전달합니다.
  useEffect(() => {
    if (selected) {
      setSelectedAPI(selected); // 선택된 API를 부모 컴포넌트에 전달
    }
  }, [selected, navigate]); // selected와 navigate가 변경될 때마다 실행

  // 선택된 API가 없으면 null 반환
  if (!selected) return null;

  return (
    // Listbox는 드롭다운을 구현하는 컴포넌트
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <>
          <div className="relative min-w-36 ">
            {/* ListboxButton: 사용자가 선택한 항목을 보여주는 버튼 */}
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <div className="flex items-center space-x-2">
                <img
                  src={selected.logo}
                  alt={selected.name}
                  className="h-5 w-5 mr-1"
                />
                <span className="block truncate">{selected.name}</span>{' '}
              </div>
              {/* 선택된 API 이름 표시 */}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <FaAngleDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>
            {/* Transition 컴포넌트를 이용해 드롭다운 애니메이션 효과를 추가 */}
            <Transition
              show={open} // 드롭다운이 열릴 때만 표시
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {/* ListboxOptions는 드롭다운의 옵션들을 표시하는 컴포넌트 */}
              <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {mapAPIs.map((api) => (
                  <ListboxOption
                    key={api.id}
                    className={({ selected, focus }) =>
                      classNames(
                        selected ? 'bg-indigo-600 text-white' : '', // Set background color and text color for selected item
                        focus && !selected ? 'bg-gray-200' : '', // Optional: highlight on focus if not selected
                        'relative cursor-default select-none py-2 pl-8 pr-4'
                      )
                    }
                    value={api}
                  >
                    {({ selected }) => (
                      <>
                        {/* <img
                          src={api.logo}
                          alt={api.name}
                          className="h-5 w-5 mr-2"
                        /> */}
                        <span
                          className={classNames(
                            selected ? 'font-bold text-white' : 'text-gray-900', // Set font-bold and white text for selected item
                            'block truncate'
                          )}
                        >
                          {api.name}
                        </span>
                        {selected && (
                          <span
                            className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-white" // Checkmark is also white
                          >
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
