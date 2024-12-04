import { useState, useEffect, useMemo } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { menuItems } from '../dropdowns/statMenus/StatMenuItems';
import { useSelectedItem } from '../../context/SelectedItemContext';

/**
 * StatSideBar 컴포넌트 - 통계 메뉴를 관리하는 사이드바
 */
export default function StatSideBar() {
  const { t } = useTranslation(); // 다국어 지원을 위한 번역 훅
  const { selectedItem, setSelectedItem } = useSelectedItem(); // 현재 선택된 메뉴 항목 및 설정 함수
  const location = useLocation(); // 현재 URL 경로 정보
  const navigate = useNavigate(); // 페이지 이동을 위한 내비게이트 훅
  const [open, setOpen] = useState(false); // 사이드바 열림/닫힘 상태

  /**
   * 메뉴 항목을 메모이제이션하여 불필요한 재계산 방지
   */
  const items = useMemo(() => menuItems(t), [t]);

  /**
   * 현재 URL 경로를 기준으로 선택된 항목을 업데이트하거나 기본값 설정
   */
  useEffect(() => {
    const currentItem = items.find(
      (item) => `/main/dashboard${item.link}` === location.pathname
    );

    if (currentItem && currentItem.id !== selectedItem?.id) {
      setSelectedItem(currentItem); // 선택된 항목 업데이트
    } else if (!currentItem && items.length > 0) {
      navigate(`/main/dashboard${items[0].link}`); // 기본 메뉴 항목으로 이동
      setSelectedItem(items[0]); // 기본 선택 항목 설정
    }
  }, [location.pathname, items, selectedItem, navigate, setSelectedItem]);

  /**
   * 사이드바 열림/닫힘 상태 전환
   */
  const togglePanel = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  /**
   * 메뉴 항목 클릭 시 선택된 항목 설정 및 페이지 이동
   * @param {number} id - 선택된 항목 ID
   * @param {string} link - 선택된 항목의 링크 경로
   */
  const handleItemClick = (id, link) => {
    const item = items.find((i) => i.id === id);
    setSelectedItem(item); // 선택된 항목 설정
    navigate(`/main/dashboard${link}`); // 페이지 이동
    setOpen(false); // 항목 선택 후 사이드바 닫기
  };

  return (
    <div className="flex">
      {/* 사이드바가 닫혀 있을 때 오른쪽 화살표 버튼 표시 */}
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-r-full bg-blue-900 hover:bg-blue-700"
            onClick={togglePanel}
          >
            <FaArrowCircleRight size={30} />
          </button>
        </div>
      )}

      {/* 사이드바 열림/닫힘 애니메이션 */}
      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 left-0 w-3/12 bg-stone-50 shadow-lg z-40 flex flex-col space-y-4 h-[800px] rounded-tr-lg">
          {/* 사이드바 상단 메뉴 헤더 */}
          <div className="bg-blue-600 px-2 py-2 sm:px-3 shadow-xl rounded-tr-lg">
            <div className="flex items-center justify-between">
              <label className="flex font-semibold leading-6 text-left text-white">
                {t('StatSideBar.StatMenu')} {/* 'StatMenu' 번역된 텍스트 */}
              </label>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none"
                  onClick={togglePanel}
                >
                  <FaXmark className="h-6 w-6" aria-hidden="true" /> {/* 닫기 버튼 */}
                </button>
              </div>
            </div>
          </div>
          {/* 메뉴 항목 목록 */}
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-auto">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="w-full">
                  <button
                    onClick={() => handleItemClick(item.id, item.link)} // 항목 클릭 처리
                    className={`block w-full px-4 py-2 rounded-md text-left
          ${
            selectedItem?.id === item.id
              ? 'bg-black text-white font-bold' // 선택된 항목 스타일
              : 'text-black hover:bg-black hover:text-white' // 기본 및 호버 스타일
          }`}
                  >
                    {item.name} {/* 메뉴 항목 이름 */}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  );
}
