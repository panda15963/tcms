import React, { useState } from 'react';
import { IoReloadSharp } from 'react-icons/io5';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';
import ConfigurationTable from '../../components/tables/statTables/ConfigurationTable';
import StatLogService from '../../service/StatLogService';

export default function Configuration() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateTerm, setDateTerm] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false); // State to manage loading indicator

  const formatDateToLocalISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const requestData = {
    interval: dateTerm?.value || '',
    starttime: startDate ? formatDateToLocalISO(startDate) : '',
    endtime: endDate ? formatDateToLocalISO(endDate) : '',
    by: '',
    toolname: '',
  };

  // Fetch data function
  const TOOL_SETTINGS = async (inputCond) => {
    setLoading(true); // Start loading
    try {
      return await StatLogService.TOOL_SETTINGS({ cond: inputCond });
    } catch (error) {
      console.error('Error in TOOL_SETTINGS:', error);
      return null;
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleOnSelectTerm = (selectedTerm) => {
    setDateTerm(selectedTerm);
  };

  const handleReload = () => {
    setStartDate(null);
    setEndDate(null);
    setDateTerm(null);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    try {
      // Fetch execution count data
      const result = await TOOL_SETTINGS(requestData);

      if (!result || !result.result) {
        setSearchResults([]);
        return;
      }

      const { result: searchedResult } = result;

      if (Array.isArray(searchedResult)) {
        // Combine searchedResult with dateTerm
        const filteredResults = searchedResult.filter((item) => {
          // Extract only the date part from logtime (e.g., "2024-11-19")
          const logDate = item.logtime.split(' ')[0];
          const logDateObj = new Date(logDate);

          // Check if logDate falls within the selected startDate and endDate range
          if (startDate && logDateObj < new Date(startDate)) return false;
          if (endDate && logDateObj > new Date(endDate)) return false;

          return true;
        });

        const combinedResults = filteredResults.map((item) => ({
          ...item,
          dateTerm: dateTerm?.value || '', // Add dateTerm to each result item
        }));

        setSearchResults(combinedResults);
      } else {
        console.log('No results found.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching execution count:', error);
      setSearchResults([]);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-3xl font-bold text-center pb-4 text-gray-900">
          도구 설정 정보 변경 사항
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
              className="w-24 h-9 flex items-center justify-center cursor-pointer rounded-md bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
            >
              조회
            </button>
          </div>
        </div>
        <div className="w-full max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
          {loading ? (
            <p className="text-gray-500">Loading...</p> // Show loading indicator
          ) : (
            <div className="border border-black rounded-lg">
              <ConfigurationTable data={searchResults} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
