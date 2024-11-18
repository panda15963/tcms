import React, { useEffect, useState } from 'react';
import LineChart from '../../components/D3Charts/LineChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import PCLists from '../../components/dropdowns/statMenus/PCLists';

const sampleData = [
  {
    id: 1,
    type: 'Tool 1',
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
    type: 'Tool 2',
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

  function handleOnSelectTerm(selectedTerm) {
    setDateTerm(selectedTerm);
  }

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        도구 실행 횟수(도구 별)
      </h1>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms terms={handleOnSelectTerm} />          
          <CustomDatePicker startsDate={setStartDate} endsDate={setEndDate} />
          <label className="text-sm font-bold">PC 선택 : </label>
          <PCLists />
        </div>
        <div className="mx-auto max-w-7xl flex justify-center items-center border border-black rounded-lg">
          <div className="w-full max-w-7xl">
            <LineChart data={sampleData} />
          </div>
        </div>
      </div>
    </div>
  );
}
