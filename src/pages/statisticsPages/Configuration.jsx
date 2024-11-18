import React, { useState } from 'react';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';
import ConfigurationTable from '../../components/tables/statTables/ConfigurationTable';
import DateTerms from '../../components/calender/DateTerms';
import CustomDatePicker from '../../components/calender/CustomDatePicker';

export default function Configuration() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateTerm, setDateTerm] = useState(null);

  function handleOnSelectMap(selectedTerm) {
    setDateTerm(selectedTerm); // Update dateTerm directly
  }

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
        도구 설정 정보 변경 사항
      </h1>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms terms={handleOnSelectMap} />
          <CustomDatePicker
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          <label className="text-sm font-bold">도구 선택 : </label>
          <ToolLists />
          <label className="text-sm font-bold">PC 선택 : </label>
          <PCLists />
        </div>
        <div className="border border-black rounded-lg">
          <ConfigurationTable />
        </div>
      </div>
    </div>
  );
}
