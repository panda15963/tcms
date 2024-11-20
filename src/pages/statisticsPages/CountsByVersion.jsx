import React, { useState } from 'react';
import { IoReloadSharp } from 'react-icons/io5';
import LineChart from '../../components/D3Charts/LineChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';

const sampleData = [
  {
    id: 1,
    type: 'Version 1',
    data: [
      { date: new Date('2024-01-01'), value: 120 },
      { date: new Date('2024-01-15'), value: 90 },
      { date: new Date('2024-02-01'), value: 160 },
      { date: new Date('2024-02-15'), value: 130 },
      { date: new Date('2024-03-01'), value: 210 },
      { date: new Date('2024-03-15'), value: 170 },
      { date: new Date('2024-04-01'), value: 240 },
      { date: new Date('2024-04-15'), value: 200 },
      { date: new Date('2024-05-01'), value: 260 },
      { date: new Date('2024-05-15'), value: 230 },
      { date: new Date('2024-06-01'), value: 190 },
      { date: new Date('2024-06-15'), value: 250 },
      { date: new Date('2024-07-01'), value: 280 },
      { date: new Date('2024-07-15'), value: 260 },
      { date: new Date('2024-08-01'), value: 300 },
      { date: new Date('2024-08-15'), value: 270 },
      { date: new Date('2024-09-01'), value: 320 },
      { date: new Date('2024-09-15'), value: 290 },
      { date: new Date('2024-10-01'), value: 340 },
      { date: new Date('2024-10-15'), value: 310 },
      { date: new Date('2024-11-01'), value: 360 },
      { date: new Date('2024-11-15'), value: 330 },
      { date: new Date('2024-12-01'), value: 380 },
      { date: new Date('2024-12-15'), value: 350 },
    ],
  },
  {
    id: 2,
    type: 'Version 2',
    data: [
      { date: new Date('2024-01-01'), value: 100 },
      { date: new Date('2024-01-15'), value: 80 },
      { date: new Date('2024-02-01'), value: 140 },
      { date: new Date('2024-02-15'), value: 120 },
      { date: new Date('2024-03-01'), value: 190 },
      { date: new Date('2024-03-15'), value: 150 },
      { date: new Date('2024-04-01'), value: 220 },
      { date: new Date('2024-04-15'), value: 180 },
      { date: new Date('2024-05-01'), value: 250 },
      { date: new Date('2024-05-15'), value: 210 },
      { date: new Date('2024-06-01'), value: 170 },
      { date: new Date('2024-06-15'), value: 230 },
      { date: new Date('2024-07-01'), value: 260 },
      { date: new Date('2024-07-15'), value: 240 },
      { date: new Date('2024-08-01'), value: 290 },
      { date: new Date('2024-08-15'), value: 260 },
      { date: new Date('2024-09-01'), value: 310 },
      { date: new Date('2024-09-15'), value: 280 },
      { date: new Date('2024-10-01'), value: 330 },
      { date: new Date('2024-10-15'), value: 300 },
      { date: new Date('2024-11-01'), value: 350 },
      { date: new Date('2024-11-15'), value: 320 },
      { date: new Date('2024-12-01'), value: 370 },
      { date: new Date('2024-12-15'), value: 340 },
    ],
  },
];

export default function CountsByTool() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateTerm, setDateTerm] = useState(null);

  const filteredDate = sampleData.map((data) => {
    if (startDate && endDate) {
      const adjustedStartDate = new Date(startDate.setHours(0, 0, 0, 0)); // Start of the day
      const adjustedEndDate = new Date(endDate.setHours(23, 59, 59, 999)); // End of the day

      return {
        ...data,
        data: data.data.filter(
          (item) =>
            item.date >= adjustedStartDate && item.date <= adjustedEndDate
        ),
      };
    }
    return data; // Return the original data if startDate or endDate is not set
  });

  function handleOnSelectTerm(selectedTerm) {
    setDateTerm(selectedTerm);
  }

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
          도구 실행 횟수(버전 별)
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
          <DateTerms terms={handleOnSelectTerm} />
          <CustomDatePicker startsDate={setStartDate} endsDate={setEndDate} />
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
          <LineChart data={filteredDate} />
        </div>
      </div>
    </div>
  );
}
