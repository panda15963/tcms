import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import Tree from '../treeMenu/Tree';

/**
 * 경로 목록 컴포넌트
 * - 왼쪽 사이드바에 경로 데이터와 필터링된 트리 데이터를 표시
 *
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {array} props.data - 트리에 표시할 경로 데이터
 * @param {function} props.onCheckedNodesChange - 체크된 노드 변경 핸들러
 * @param {function} props.onClickedNode - 노드 클릭 핸들러
 * @param {object} props.onMapChange - 지도 변경 이벤트 객체
 * @param {function} props.routeColors - 경로 색상 관리 함수
 */
export default function LeftSideSlide({
  data,
  onCheckedNodesChange,
  onClickedNode,
  onMapChange,
  routeColors,
}) {
  const [open, setOpen] = useState(false); // 사이드바 열림 상태
  const [rowsData, setRowsData] = useState([]); // 트리에 표시할 데이터
  const { t } = useTranslation(); // 다국어 지원

  /**
   * 경로 색상 관리 핸들러
   * - 외부에서 전달된 routeColors 함수 호출
   *
   * @param {array} colors - 경로 색상 배열
   */
  const handleRouteColors = (colors) => {
    if (typeof routeColors === 'function') {
      routeColors(colors);
    }
  };

  /**
   * 체크된 노드 변경 핸들러
   * - 부모 컴포넌트에 체크된 노드 전달
   *
   * @param {array} nodes - 체크된 노드 배열
   */
  const handleCheckedNodes = (nodes) => {
    onCheckedNodesChange(nodes);
  };

  /**
   * 노드 클릭 핸들러
   * - 부모 컴포넌트에 클릭된 노드 전달
   *
   * @param {object} node - 클릭된 노드 객체
   */
  const handleNodeClick = (node) => {
    onClickedNode(node);
  };

  /**
   * 패널 토글 핸들러
   * - 사이드바 열림/닫힘 상태 전환
   */
  const togglePanel = () => {
    setOpen(!open);
  };

  // 새로운 데이터가 제공되면 자동으로 패널 열기
  useEffect(() => {
    if (data && data.length > 0) {
      setOpen(true);
    }
  }, [data]);

  // 지도 변경 시 데이터 초기화
  useEffect(() => {
    if (onMapChange) {
      setRowsData([]); // 데이터 초기화
      setOpen(false); // 패널 닫기
    }
  }, [onMapChange]);

  // 지도 변경에 따라 필터링된 데이터 적용
  useEffect(() => {
    if (onMapChange?.name === 'ROUTO' || onMapChange?.name === 'TMAP') {
      console.log('onMapChange is ROUTO or TMAP, applying filters.');

      // 필터링 로직
      const filteredByCountry = data.filter(
        (item) => item.country_str === 'KOR' || item.country_str === 'SAU'
      );

      const filteredByName = filteredByCountry.filter(
        (item) =>
          !item.file_name.includes('US') ||
          (item.country_str === 'SAU' && item.file_name.includes('KOR'))
      );

      setRowsData(filteredByName); // 필터링된 데이터 저장

      // 필터링된 데이터가 존재하면 패널 열기
      if (filteredByName.length > 0) {
        setOpen(true);
      }
    } else {
      // 기본 데이터 설정
      setRowsData(data); // 전체 데이터를 rowsData에 설정

      // 데이터가 있으면 패널 열기
      if (data.length > 0) {
        setOpen(true);
      }
    }
  }, [data, onMapChange]);

  return (
    <div className="flex">
      {/* 사이드바가 닫혀 있을 때 패널 열기 버튼 */}
      {!open && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className="text-white px-2 py-3 rounded-r-full bg-blue-600 hover:bg-blue_lapis"
            onClick={togglePanel}
          >
            <FaArrowCircleRight size={30} />
          </button>
        </div>
      )}

      {/* 사이드바 패널 */}
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
          {/* 헤더 */}
          <div className="bg-blue-600 px-2 py-2 sm:px-3 shadow-xl rounded-tr-lg">
            <div className="flex items-center justify-between">
              <label className="flex text-base font-semibold leading-6 text-white">
                {t('LeftSideSlide.CourseList')} {/* 경로 목록 */}
              </label>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none hover:outline-none"
                  onClick={togglePanel}
                >
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Close panel</span>
                  <FaXmark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* 트리 메뉴 */}
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-auto">
            <Tree
              data={rowsData} // 필터링된 데이터 전달
              onCheckedNodesChange={handleCheckedNodes}
              onNodeClick={handleNodeClick}
              onMapChange={onMapChange}
              routeColors={handleRouteColors}
            />
          </div>
        </div>
      </Transition>
    </div>
  );
}
