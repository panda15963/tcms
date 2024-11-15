import React from 'react';
import RealTimeUsageTable from '../../components/tables/statTables/RealTimeUsageTable';

export default function RealTime() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 p-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        TC 기반 도구 실시간 사용 현황
      </h1>
      <div className="w-full max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="border border-black rounded-lg">
          <RealTimeUsageTable />
        </div>
      </div>
    </div>
  );
}
