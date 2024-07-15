import React, { useState } from 'react';
import { FaLongArrowAltLeft, FaLongArrowAltRight } from 'react-icons/fa';
import GoogleMap from '../../pages/GoogleMap';
const tableHeader = [
  {
    title: '지점 이름',
    key: 'name',
  },
  {
    title: '위도',
    key: 'latitude',
  },
  {
    title: '경도',
    key: 'longitude',
  },
];

export default function StoreTable(props) {
  const { stores, onDataReceive } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [storesPerPage] = useState(5);

  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(stores.length / storesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePrevious = () => paginate(Math.max(1, currentPage - 1));
  const handleNext = () =>
    paginate(Math.min(pageNumbers.length, currentPage + 1));

  const getCoord = (store) => {
    const { latitude, longitude } = store;
    onDataReceive(store);
    GoogleMap({
      lat: latitude,
      lng: longitude,
    });
  };

  return (
    <div className="flow-root">
      {stores.length === 1 ? (
        <span className="text-sm font-bold text-gray-700">
          {stores.length}개의 지역 또는 지점이 검색 되었습니다
        </span>
      ) : stores.length === 0 ? (
        <span className="text-sm font-bold text-gray-700">
          검색된 지역 또는 지점이 없습니다
        </span>
      ) : (
        <span className="text-sm font-bold text-gray-700">
          검색된 {stores.length}개 중 {indexOfFirstStore + 1} ~{' '}
          {Math.min(indexOfLastStore, stores.length)}번째를 보여주고 있습니다.
        </span>
      )}
      <table className="min-w-full divide-gray-400 border-black rounded-lg border">
        <thead className="bg-gray-300 divide-y-2 divide-solid">
          <tr>
            {tableHeader.map((header) => (
              <th
                key={header.key}
                className={`px-6 py-3 text-md font-bold text-center tracking-wider`}
              >
                {header.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-gray-400 border-black font-bold">
          {currentStores.length === 0 ? (
            <tr>
              <td colSpan={tableHeader.length} className="text-center">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            currentStores.map((store) => (
              <tr
                key={store.id}
                onClick={() => getCoord(store)}
                className="cursor-pointer hover:bg-gray-200"
              >
                {tableHeader.map((header) => (
                  <td
                    key={header.key}
                    className="px-6 py-4 whitespace-nowrap text-sm border border-black"
                  >
                    {store[header.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <nav
        aria-label="Pagination"
        className="flex items-center justify-between border-t border-gray-200 bg-white py-3"
      >
        <button
          className={`relative inline-flex items-center rounded-lg px-4 py-2 -ml-px text-sm font-bold text-black bg-white border border-black ${
            indexOfFirstStore === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
          onClick={handlePrevious}
          disabled={indexOfFirstStore === 0}
        >
          <FaLongArrowAltLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <table>
          <tbody>
            <tr>
              {pageNumbers.map((number) => (
                <td key={number}>
                  <button
                    className={`relative inline-flex items-center rounded-lg px-4 py-2 -ml-px text-sm font-bold text-black bg-white border border-black ${
                      currentPage === number
                        ? 'bg-gray-400'
                        : 'hover:bg-slate-200'
                    }`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <button
          className={`relative inline-flex rounded-lg items-center px-4 py-2 ml-2 text-sm font-bold text-black bg-white border border-black ${
            indexOfLastStore >= stores.length
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-200'
          }`}
          onClick={handleNext}
          disabled={indexOfLastStore >= stores.length}
        >
          Next
          <FaLongArrowAltRight className="w-5 h-5 ml-2" />
        </button>
      </nav>
    </div>
  );
}
