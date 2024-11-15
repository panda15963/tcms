import React, { useState } from 'react';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import LogTable from '../../components/tables/statTables/LogsTable';

export default function Logs() {
  const [selectedTool, setSelectedTool] = useState(null); // State for selected tool
  const [startDate, setStartDate] = useState(null); // State for start date
  const [endDate, setEndDate] = useState(null); // State for end date

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        도구 로그 확인
      </h1>
      <div className="w-full max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms />
          <CustomDatePicker
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <ToolLists setSelectedTool={setSelectedTool} />
        </div>
        <LogTable />
      </div>
    </div>
  );
}
