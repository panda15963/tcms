import { Fragment, useState } from 'react';
import { Transition } from '@headlessui/react';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowCircleLeft } from 'react-icons/fa';
import { CiSquarePlus, CiSquareMinus } from 'react-icons/ci';

const rows = [
  // 메타 데이터 목록
  {
    id: 1,
    col1: 'Name',
    col2: 'Row 1, Col 2 ',
  },
  { id: 2, col1: 'Region', col2: 'AS' },
  { id: 3, col1: 'Country', col2: 'JPN' },
  { id: 4, col1: 'Creator', col2: 'Desktop-JOHN' },
  { id: 5, col1: 'Created Date', col2: '2023-12-27 15:44:51' },
  { id: 6, col1: 'Last Change Date', col2: '2023-12-27 15:44:51' },
  { id: 7, col1: 'Priority', col2: 'C' },
  {
    id: 8,
    col1: 'Feature Category',
    col2: 'None',
    children: [{ id: 9, col1: 'Feature', col2: 'None' }],
  },
  { id: 10, col1: 'Virtual', col2: 'True' },
  {
    id: 11,
    col1: 'TC',
    col2: '',
    children: [{ id: 12, col1: '-', col2: 'None' }],
  },
  { id: 13, col1: 'Target', col2: 'None' },
  { id: 14, col1: 'Summary', col2: '20231227_154444_JPN_Kizugawa' },
  {
    id: 15,
    col1: 'Departure',
    col2: 'Matsuo-jinja',
    children: [
      { id: 16, col1: 'Lon', col2: '135.820174' },
      { id: 17, col1: 'Lat', col2: '34.650981' },
    ],
  },
  {
    id: 18,
    col1: 'Destination',
    col2: '48, Minaminagaicho, Nara-shi, Nara',
    children: [
      { id: 19, col1: 'Lon', col2: '135.820174' },
      { id: 20, col1: 'Lat', col2: '34.650981' },
    ],
  },
  {
    id: 18,
    col1: 'VIA',
    col2: '',
    children: [
      {
        id: 19,
        col1: 'Address 1',
        col2: '69-6 Kawakamicho, Nara-shi, Nara 630-8202, Japan',
      },
      { id: 20, col1: 'LonLat 1', col2: '135.820174, 34.650981' },
    ],
  },
  {
    id: 18,
    col1: 'Distance',
    col2: '',
    children: [
      {
        id: 19,
        col1: 'Way 1',
        col2: '8.734 km',
      },
      { id: 20, col1: 'Way 2', col2: '6.845 km' },
    ],
  },
  {
    id: 18,
    col1: 'Trip Total Time',
    col2: '00:16:32',
  },
  {
    id: 18,
    col1: 'Trip Start Time',
    col2: '2023-12-27 15:44:51',
  },
  {
    id: 18,
    col1: 'Trip End Time',
    col2: '2023-12-27 16:01:23',
  },
  {
    id: 18,
    col1: 'Description',
    col2: '20231227_154444_JPN_Kizugawa-shi_E_JPN',
  },
  {
    id: 18,
    col1: 'Tag List',
    col2: 'etc',
    children: [
      {
        id: 19,
        col1: 'TAG 1',
        col2: 'etc',
      },
    ],
  },
  {
    id: 18,
    col1: 'File Name',
    col2: '20231227_154444_JPN_Kizugawa-shi_E_JPN',
  },
  {
    id: 18,
    col1: 'Passing Point',
    col2: 'etc',
    children: [
      {
        id: 19,
        col1: 'Address 2',
        col2: 'Kizugawa-shi',
      },
      {
        id: 19,
        col1: 'Address 3',
        col2: 'Nara-shi',
      },
      {
        id: 19,
        col1: 'Road Name 3',
        col2: 'Nara-shi',
      },
    ],
  },
  // 더 많은 행들...
];

export default function RightSideSlide() {
  const [open, setOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);

  /**
   * 행 확장/축소를 처리하는 함수
   * @param {number} id - 확장 또는 축소할 행의 id
   */
  const toggleRow = (id) => {
    setExpandedRows((pre) =>
      pre.includes(id) ? pre.filter((rowId) => rowId !== id) : [...pre, id],
    );
  };

  return (
    <div className="flex">
      {/* 패널 열기 버튼 */}
      {!open && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-10">
          <button
            className=" text-white px-2 py-4 rounded-l-full bg-blue_ncs hover:bg-blue_lapis"
            onClick={() => setOpen(true)}
          >
            <FaArrowCircleLeft size={22} />
          </button>
        </div>
      )}
      {/* 사이드바 */}
      <Transition
        show={open}
        enter="transform transition ease-in-out duration-500 sm:duration-700"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-500 sm:duration-700"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed inset-y-0 top-32 right-0 w-3/12 bg-stone-50 shadow-lg z-50 flex flex-col space-y-4">
          <div className="bg-blue_lapis px-2 py-2 sm:px-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold leading-6 text-white">
                로그 메타 데이터 리스트
              </span>
              <div className="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  className="relative rounded-md text-indigo-200 hover:text-white focus:outline-none hover:outline-none"
                  onClick={() => setOpen(false)}
                >
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Close panel</span>
                  <FaXmark className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-2 overflow-x-auto pb-5 scroll-smooth overflow-scroll ">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border  border-gray-300 bg-white text-left font-semibold text-sm text-gray-700"></th>
                  <th className="border border-gray-300 bg-gray-100 px-1 py-1 text-left font-semibold text-sm text-gray-700">
                    Meta List
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-1 py-1 text-left font-semibold text-sm text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <Fragment key={index}>
                    <tr>
                      <td className="flex text-center justify-center items-center bg-stone-100">
                        {/* 자식 요소가 있는 경우 행 확장/축소 버튼 */}
                        {row.children && (
                          <button
                            className="focus:outline-none"
                            onClick={() => toggleRow(index)}
                          >
                            {expandedRows.includes(index) ? (
                              <CiSquareMinus />
                            ) : (
                              <CiSquarePlus />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 text-xs font-normal text-gray-900 text-nowrap">
                        {row.col1}
                      </td>
                      <td className="border border-gray-300 px-2 text-xs font-normal text-gray-900 text-justify text-nowrap">
                        {row.col2}
                      </td>
                    </tr>
                    {/* 자식 요소가 확장된 경우 표시 */}
                    {row.children &&
                      expandedRows.includes(index) &&
                      row.children.map((child) => (
                        <tr key={child.id}>
                          <td className="bg-gray-100" />
                          <td className="border border-gray-300 ps-5 pr-2 text-xs font-normal text-gray-900">
                            {child.col1}
                          </td>
                          <td className="border border-gray-300 ps-5 pr-2 text-xs font-normal text-gray-900">
                            {child.col2}
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Transition>
    </div>
  );
}
