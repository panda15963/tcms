import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { FaAngleDown, FaCheck } from 'react-icons/fa6';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { menuItems } from './StatMenuItems';
import { useSelectedItem } from '../../../context/SelectedItemContext';

/**
 * 여러 클래스를 조건에 따라 조합하여 반환하는 함수
 * @param  {...string} classes - 클래스 이름들
 * @returns {string} 조합된 클래스 문자열
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * StatGraphsLists 컴포넌트 - 지도 API 선택과 데이터 요청 동기화를 담당
 * @param {function} requestData - 선택된 데이터와 동기화되는 외부 함수
 */
export default function StatGraphsLists({ requestData }) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const { setSelectedItem } = useSelectedItem(); // 선택된 항목 전역 상태 설정
  const navigate = useNavigate(); // 페이지 이동 훅
  const location = useLocation(); // 현재 경로 정보 훅

  /**
   * 메뉴 항목 메모이제이션 - 불필요한 재렌더링 방지
   */
  const items = useMemo(() => menuItems(t), [t]);

  /**
   * 현재 선택된 항목 상태
   */
  const [selected, setSelected] = useState(() => {
    // 로컬 스토리지에서 초기값 읽기
    const savedItem = localStorage.getItem('selectedItem');
    return savedItem ? JSON.parse(savedItem) : null;
  });

  /**
   * 요청 데이터 함수 메모이제이션 - 재렌더링 방지
   */
  const memoizedRequestData = useCallback(requestData, []);

  /**
   * 외부 요청 함수와 선택된 항목 동기화
   */
  useEffect(() => {
    if (typeof memoizedRequestData === 'function') {
      memoizedRequestData(selected); // 선택 항목 전달
    } else {
      console.error(
        'Expected `requestData` to be a function, but got:',
        typeof memoizedRequestData
      );
    }
  }, [selected, memoizedRequestData]);

  /**
   * 현재 경로에 따라 선택된 항목 동기화
   */
  useEffect(() => {
    const currentSelected = items.find(
      (item) => `/main/dashboard${item.link}` === location.pathname
    );

    if (!currentSelected && items[0]) {
      setSelected(items[0]);
      setSelectedItem(items[0]);

      // 현재 경로와 다른 경우에만 navigate 호출
      if (location.pathname !== `/main/dashboard${items[0].link}`) {
        navigate(`/main/dashboard${items[0].link}`);
      }
    } else if (currentSelected) {
      setSelected(currentSelected);
      setSelectedItem(currentSelected);
    }
  }, [location.pathname, items, setSelectedItem, navigate]);

  /**
   * 선택된 항목이 변경될 때 로컬 스토리지에 저장
   */
  useEffect(() => {
    if (selected) {
      localStorage.setItem('selectedItem', JSON.stringify(selected));
    }
  }, [selected]);

  /**
   * 지도 API 선택 변경 핸들러
   * @param {object} selectedMap - 선택된 지도 API 항목
   */
  const handleOnSelectMap = (selectedMap) => {
    setSelected(selectedMap); // 선택 상태 업데이트
    setSelectedItem(selectedMap); // 전역 상태 업데이트
    navigate(`/main/dashboard${selectedMap.link}`); // 선택된 항목으로 이동
  };

  return (
    <Listbox value={selected} onChange={handleOnSelectMap}>
      {({ open }) => (
        <div className="relative min-w-32">
          {/* 드롭다운 버튼 */}
          <ListboxButton className="relative w-80 cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
            <span className="block truncate">
              {selected ? selected.name : ''} {/* 선택된 항목 이름 표시 */}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FaAngleDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>

          {/* 드롭다운 목록 */}
          <Transition
            show={open}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-50 mt-1 w-80 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {items.map((statPage) => (
                <ListboxOption
                  key={statPage.id}
                  className={({ selected, active }) =>
                    classNames(
                      selected ? 'bg-indigo-600 text-white' : 'text-gray-900', // 선택된 항목 스타일
                      active && !selected ? 'bg-gray-100' : '', // 활성 상태 스타일
                      'relative cursor-default select-none py-2 pl-8 pr-4'
                    )
                  }
                  value={statPage}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={classNames(
                          selected ? 'font-bold text-white' : '', // 선택된 항목 강조
                          'block truncate'
                        )}
                      >
                        {statPage.name} {/* 통계 페이지 이름 */}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-white">
                          <FaCheck className="h-5 w-5" aria-hidden="true" />{' '}
                          {/* 체크 아이콘 */}
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
