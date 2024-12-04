import { useState, useMemo } from 'react';
import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

/**
 * TableHeader
 * @description 테이블 헤더 정의
 * @param {Function} t - 다국어 번역 함수
 * @returns {Array} 테이블 헤더 배열
 */
const TableHeader = (t) => [
  { id: 1, name: t('StoreTable.StoreNames') },
  { id: 2, name: t('Common.Latitude') },
  { id: 3, name: t('Common.Longitude') },
];

/**
 * StoreTable
 * @description 지점 정보를 테이블 형태로 표시하는 컴포넌트
 * @param {Array} stores - 지점 데이터 배열
 * @param {Function} onDataReceive - 클릭된 지점 데이터를 부모 컴포넌트로 전달
 * @returns {JSX.Element} StoreTable 컴포넌트
 */
export default function StoreTable({ stores = [], onDataReceive }) {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const [storesPerPage] = useState(5); // 페이지당 표시할 지점 수
  const { t } = useTranslation(); // 다국어 번역 훅
  const columns = useMemo(() => TableHeader(t), [t]); // 테이블 헤더 정의

  const indexOfLastStore = currentPage * storesPerPage; // 현재 페이지의 마지막 지점 인덱스
  const indexOfFirstStore = indexOfLastStore - storesPerPage; // 현재 페이지의 첫 지점 인덱스
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore); // 현재 페이지에 표시할 지점
  const paginate = (pageNumber) => setCurrentPage(pageNumber); // 페이지 변경 핸들러

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(stores.length / storesPerPage); i++) {
    pageNumbers.push(i); // 페이지 번호 배열 생성
  }

  // 이전 페이지 이동
  const handlePrevious = () => paginate(Math.max(1, currentPage - 1));

  // 다음 페이지 이동
  const handleNext = () =>
    paginate(Math.min(pageNumbers.length, currentPage + 1));

  /**
   * 선택된 지점 데이터를 부모 컴포넌트로 전달
   * @param {Object} store - 선택된 지점 데이터
   */
  const getCoord = (store) => {
    onDataReceive(store); // 부모 컴포넌트에 데이터 전달
  };

  return (
    <div className="flow-root">
      {/* 테이블 렌더링 */}
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-100 border-2">
          <tr>
            {columns.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 border-2 text-center text-sm font-semibold text-black uppercase tracking-wider whitespace-nowrap"
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* 데이터가 없을 때 */}
          {stores.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="px-3 py-2 whitespace-nowrap text-center font-bold border-2 text-xs text-black"
              >
                {t('StoreTable.NoStores')}
              </td>
            </tr>
          )}

          {/* 지점 데이터 렌더링 */}
          {currentStores.map((store) => {
            const storeData = [
              store.name || store.title || 'N/A',
              typeof store.latitude === 'number'
                ? store.latitude.toFixed(6)
                : typeof store.position?.lat === 'number'
                ? store.position.lat.toFixed(6)
                : 'N/A',
              typeof store.longitude === 'number'
                ? store.longitude.toFixed(6)
                : typeof store.position?.lng === 'number'
                ? store.position.lng.toFixed(6)
                : 'N/A',
            ];

            return (
              <tr
                key={store.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => getCoord(store)}
              >
                {storeData.map((data, index) => (
                  <td
                    key={index}
                    className="px-3 py-2 whitespace-nowrap text-center border-2 text-xs text-black"
                  >
                    {data}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center font-bold justify-between border-gray-200 bg-white py-3 sm:px-6">
        {/* 지점 수 및 페이지 정보 */}
        {stores.length === 1 ? (
          <span className="text-sm px-5 text-gray-700">
            {t('StoreTable.OneStore')}
          </span>
        ) : stores.length === 0 ? (
          <span className="text-sm px-5 text-gray-700">
            {t('StoreTable.NoStores')}
          </span>
        ) : (
          <span className="text-sm px-5 text-gray-700">
            {t('StoreTable.PaginationText', {
              first: indexOfFirstStore + 1,
              last: Math.min(indexOfLastStore, stores.length),
              total: stores.length,
            })}
          </span>
        )}

        {/* 페이지 버튼 */}
        <nav aria-label="Pagination" className="flex items-center">
          <button
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-bold text-black bg-white border border-black ${
              indexOfFirstStore === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
            onClick={handlePrevious}
            disabled={indexOfFirstStore === 0}
          >
            <FaLongArrowAltLeft className="w-5 h-5 mr-2" />
            {t('StoreTable.PreviousButton')}
          </button>

          <div className="flex space-x-2">
            {pageNumbers.map((number) => (
              <button
                key={number}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-bold text-black bg-white border border-black ${
                  currentPage === number
                    ? 'bg-gray-400'
                    : 'hover:bg-slate-200'
                }`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-bold text-black bg-white border border-black ${
              indexOfLastStore >= stores.length
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-200'
            }`}
            onClick={handleNext}
            disabled={indexOfLastStore >= stores.length}
          >
            {t('StoreTable.NextButton')}
            <FaLongArrowAltRight className="w-5 h-5 ml-2" />
          </button>
        </nav>
      </div>
    </div>
  );
}
