import React, { useState } from 'react';
import LineChart from '../../components/D3Charts/LineChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import VersionLists from '../../components/dropdowns/statMenus/VersionLists';
import DateTerms from '../../components/calender/DateTerms';

export default function countsByVersion() {
  const [selectedTool, setSelectedTool] = useState(null);

  const sampleData = [
    { date: new Date('2022-05-10'), value: 85 },
    { date: new Date('2022-06-18'), value: 60 },
    { date: new Date('2022-07-25'), value: 120 },
    { date: new Date('2022-08-30'), value: 95 },
    { date: new Date('2022-10-05'), value: 140 },
    { date: new Date('2022-11-12'), value: 100 },
    { date: new Date('2023-01-20'), value: 175 },
    { date: new Date('2023-03-15'), value: 130 },
    { date: new Date('2023-04-22'), value: 155 },
    { date: new Date('2023-06-10'), value: 110 },
    { date: new Date('2023-08-01'), value: 145 },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        도구 실행 횟수(버전 별)
      </h1>
      <div className="w-full max-w-full bg-white shadow-md rounded-lg p-6 border-2 border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms />
          <CustomDatePicker />
          <VersionLists setSelectedTool={setSelectedTool} />
        </div>

        {/* Center the graph */}
        <div className="mx-auto max-w-7xl flex justify-center items-center border-2 border-black rounded-lg">
          <div className="mx-auto max-w-7xl">
            <LineChart
              data={sampleData}
              type={selectedTool?.name || 'Version A'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
