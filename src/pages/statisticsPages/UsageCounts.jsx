import React from 'react';
import { IoReloadSharp } from 'react-icons/io5';
import BarChart from '../../components/D3Charts/BarChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';

const sampleData = [
  { date: new Date('2023-01-01'), value: 100 },
  { date: new Date('2023-01-15'), value: 150 },
  { date: new Date('2023-02-01'), value: 200 },
  { date: new Date('2023-02-15'), value: 250 },
  { date: new Date('2023-03-01'), value: 180 },
  { date: new Date('2023-03-15'), value: 220 },
  { date: new Date('2023-04-01'), value: 300 },
  { date: new Date('2023-04-15'), value: 260 },
  { date: new Date('2023-05-01'), value: 310 },
  { date: new Date('2023-05-15'), value: 290 },
  { date: new Date('2023-06-01'), value: 330 },
];

export default function UsageCounts() {
  function handleReload() {
    console.log('reload');
  }

  function handleSearch() {
    console.log('search');
  }
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
          도구 기능별 사용 횟수
        </h1>
        <button
          onClick={handleReload}
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp className="mr-2" />
          새로 고침
        </button>
      </div>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms />
          <CustomDatePicker />
          <label className="text-sm font-bold">도구 선택 : </label>
          <ToolLists />
          <label className="text-sm font-bold">PC 선택 : </label>
          <PCLists />
          <div className="relative border border-black rounded-lg">
            <button
              type="button"
              onClick={handleSearch}
              className="w-24 h-9 flex items-center justify-center cursor-pointer rounded-md bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              조회
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl flex justify-center items-center border border-black rounded-lg">
          <div className="w-full max-w-7xl">
            <BarChart data={sampleData} />
          </div>
        </div>
      </div>
    </div>
  );
}
