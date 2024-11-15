import React, { useState } from 'react';
import BarChart from '../../components/D3Charts/BarChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';

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
  const [selectedTool, setSelectedTool] = useState(null); // Ensure this state and function exist

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        도구 기능별 사용 횟수
      </h1>
      <div className="w-full max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms />
          <CustomDatePicker />
          <ToolLists setSelectedTool={setSelectedTool} />{' '}
          {/* Pass the prop here */}
        </div>
        <div className="mx-auto max-w-7xl flex justify-center items-center border-2 border-black rounded-lg">
          <div className="mx-auto max-w-7xl">
            <BarChart data={sampleData} />
          </div>
        </div>
      </div>
    </div>
  );
}
