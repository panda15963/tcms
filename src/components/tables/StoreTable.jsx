import React, { useState } from 'react';

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
  const { stores } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [storesPerPage] = useState(10);

  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(stores.length / storesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePrevious =
    currentPage > 1 ? () => paginate(currentPage - 1) : () => paginate(1);
  const handleNext =
    currentPage < pageNumbers.length
      ? () => paginate(currentPage + 1)
      : () => paginate(pageNumbers.length);

  return (
    <div className="flow-root">
      <table className="min-w-full divide-y divide-gray-400 border-2 border-black border-b-2">
        <thead className="bg-gray-200 border-2 border-black">
          {tableHeader.map((header, index) => (
            <th
              key={header.key}
              className={`px-6 py-3 text-md font-bold text-center tracking-wider ${index < tableHeader.length - 1 ? 'border-r border-black' : ''}`}
            >
              {header.title}
            </th>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-400 border-black font-bold">
          {currentStores.map((store, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-black">
                {store.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-black">
                {store.latitude}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {store.longitude}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav
        aria-label="Pagination"
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstStore + 1}</span>{' '}
            to <span className="font-medium">{indexOfLastStore}</span> of{' '}
            <span className="font-medium">{stores.length}</span> results
          </p>
        </div>
        <div className="flex justify-between flex-1 sm:justify-end">
          <button
            className={`relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium text-gray-700 bg-white border border-gray-300 ${
              indexOfFirstStore === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handlePrevious}
            disabled={indexOfFirstStore === 0}
          >
            Previous
          </button>
          <button
            className={`relative inline-flex items-center px-4 py-2 ml-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 ${
              indexOfLastStore >= stores.length
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            onClick={handleNext}
            disabled={indexOfLastStore >= stores.length}
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
