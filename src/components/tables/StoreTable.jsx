import { useState } from 'react';
import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// 컴포넌트 정의
export default function StoreTable({ stores = [], onDataReceive }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [storesPerPage] = useState(5);
  const { t } = useTranslation();

  const TableHeader = [
    { id: 1, name: t('StoreTable.StoreNames') },
    { id: 2, name: t('Common.Latitude') },
    { id: 3, name: t('Common.Longitude') },
  ];

  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(stores.length / storesPerPage); i++) {
    pageNumbers.push(i); // 페이지 번호 목록을 배열에 추가
  }

  // 이전 페이지로 이동하는 핸들러
  const handlePrevious = () => paginate(Math.max(1, currentPage - 1));

  // 다음 페이지로 이동하는 핸들러
  const handleNext = () =>
    paginate(Math.min(pageNumbers.length, currentPage + 1));

  /**
   * 지점을 클릭했을 때 해당 지점의 좌표 데이터를 부모 컴포넌트로 전달합니다.
   * @param {Object} store - 클릭된 지점 데이터
   */
  const getCoord = (store) => {
    onDataReceive(store); // 부모 컴포넌트로 데이터 전달
  };

  return (
    <div className="flow-root">
      {/* 테이블 구조 */}
      <table className="min-w-full divide-y divide-gray-200 border-gray-300">
        <thead className="bg-gray-100 border-2">
          <tr>
            {/* 테이블 헤더 렌더링 */}
            {TableHeader.map((header) => (
              <th
                key={header.id}
                className="px-3 py-2 border-2 text-center text-xs font-bold text-black uppercase tracking-wider text-nowrap"
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* 검색 결과가 없을 경우 메시지 표시 */}
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

          {/* 테이블 데이터 렌더링 */}
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

      <div className="flex items-center font-bold justify-between border-gray-200 bg-white py-3 sm:px-6  ">
        {/* 검색된 지점 수 및 현재 페이지 정보 표시 */}
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
            }) ||
              `Showing ${indexOfFirstStore + 1} to ${Math.min(
                indexOfLastStore,
                stores.length,
              )} of ${stores.length} stores`}
          </span>
        )}

        {/* 페이지 네비게이션 */}
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between border-gray-200 bg-white py-3"
        >
          <div className="flex items-center">
            {/* 이전 버튼 */}
            <button
              className={`relative inline-flex items-center rounded-md px-4 py-2 -ml-px text-sm font-bold text-black bg-white border border-black ${
                indexOfFirstStore === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-200'
              } mr-4`}
              onClick={handlePrevious}
              disabled={indexOfFirstStore === 0}
            >
              <FaLongArrowAltLeft className="w-5 h-5 mr-2" />
              {t('StoreTable.PreviousButton')}
            </button>

            {/* 페이지 번호 버튼 */}
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

            {/* 다음 버튼 */}
            <button
              className={`relative inline-flex rounded-md items-center px-4 py-2 ml-4 text-sm font-bold text-black bg-white border border-black ${
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
          </div>
        </nav>
      </div>
    </div>
  );
}
