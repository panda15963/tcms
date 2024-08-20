import { useState } from 'react';
import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageProvider';

// 컴포넌트 정의
export default function StoreTable({ stores, onDataReceive }) {
  const { language } = useLanguage(); // 언어 설정을 가져옴 (영어/한국어)
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 관리
  const [storesPerPage] = useState(5); // 페이지당 표시할 지점 수 설정

  /**
   * 테이블 헤더를 정의하는 부분
   * 언어에 따라 헤더의 제목이 다르게 설정됩니다.
   */
  const tableHeader =
    language === 'ENG'
      ? [
          { title: 'Store Names', key: 'name' }, // 영어 버전의 첫 번째 컬럼 제목
          { title: 'Latitudes', key: 'latitude' }, // 영어 버전의 두 번째 컬럼 제목
          { title: 'Longitudes', key: 'longitude' }, // 영어 버전의 세 번째 컬럼 제목
        ]
      : [
          { title: '지점 이름', key: 'name' }, // 한국어 버전의 첫 번째 컬럼 제목
          { title: '위도', key: 'latitude' }, // 한국어 버전의 두 번째 컬럼 제목
          { title: '경도', key: 'longitude' }, // 한국어 버전의 세 번째 컬럼 제목
        ];

  /**
   * 라벨 설정
   * 현재 언어에 따라 표시되는 버튼 및 메시지 내용이 다릅니다.
   */
  const labels =
    language === 'ENG'
      ? {
          noResult: 'No search results',
          noStore: 'No stores(areas) found',
          oneStore: '1 store(area) found',
          previousButton: 'Previous',
          nextButton: 'Next',
          paginationText: (totalStores, firstStore, lastStore) =>
            `Showing ${firstStore} to ${lastStore} of ${totalStores} stores(areas).`,
        }
      : {
          noResult: '검색 결과가 없습니다.',
          noStore: '검색된 지점(지역)이 없습니다.',
          oneStore: '1개의 지점(지역)이 검색 되었습니다.',
          previousButton: '이전',
          nextButton: '다음',
          paginationText: (totalStores, firstStore, lastStore) =>
            `검색된 ${totalStores}개 중 ${firstStore} ~ ${lastStore}번째를 보여주고 있습니다.`,
        };

  // 현재 페이지에 표시할 지점 범위를 계산하는 부분
  const indexOfLastStore = currentPage * storesPerPage; // 현재 페이지의 마지막 지점 인덱스 계산
  const indexOfFirstStore = indexOfLastStore - storesPerPage; // 현재 페이지의 첫 번째 지점 인덱스 계산
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore); // 현재 페이지에 표시할 지점 목록 슬라이싱

  /**
   * 페이지 변경을 처리하는 함수
   * @param {number} pageNumber - 변경할 페이지 번호
   */
  const paginate = (pageNumber) => setCurrentPage(pageNumber); // 페이지 번호 변경

  /**
   * 총 페이지 수를 계산하여 페이지 번호 배열을 생성합니다.
   */
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
            {tableHeader.map((header) => (
              <th
                key={header.key}
                className={`px-6 py-3 border-2 text-center text-sm font-bold text-black tracking-wider`}
              >
                {header.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* 검색 결과가 없을 경우 메시지 표시 */}
          {currentStores.length === 0 ? (
            <tr>
              <td
                colSpan={tableHeader.length}
                className="text-center border-2 border-gray-300 px-6 py-4 text-sm text-black"
              >
                {stores.length === 0 ? labels.noStore : labels.noResult}
              </td>
            </tr>
          ) : (
            // 검색된 지점 데이터 렌더링
            currentStores.map((store) => (
              <tr
                key={store.id}
                onClick={() => getCoord(store)} // 클릭 시 해당 지점의 좌표를 부모 컴포넌트에 전달
                className="cursor-pointer hover:bg-gray-100"
              >
                {tableHeader.map((header) => (
                  <td
                    key={header.key}
                    className="px-6 py-4 whitespace-nowrap text-center border-2 text-sm text-black"
                  >
                    {store[header.key]} {/* 데이터 출력 */}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-gray-200 bg-white py-3 sm:px-6">
        {/* 검색된 지점 수 및 현재 페이지 정보 표시 */}
        {stores.length === 1 ? (
          <span className="text-sm px-5 text-gray-700">{labels.oneStore}</span>
        ) : stores.length === 0 ? (
          <span className="text-sm px-5 text-gray-700">{labels.noStore}</span>
        ) : (
          <span className="text-sm px-5 text-gray-700">
            {labels.paginationText(
              stores.length,
              indexOfFirstStore + 1,
              Math.min(indexOfLastStore, stores.length),
            )}
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
              {labels.previousButton}
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
              {labels.nextButton}
              <FaLongArrowAltRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
