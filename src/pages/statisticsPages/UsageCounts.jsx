import React, { useState } from 'react';
import { IoReloadSharp } from 'react-icons/io5';
import BarChart from '../../components/D3Charts/BarChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';
import StatLogService from '../../service/StatLogService';

export default function UsageCounts() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateTerm, setDateTerm] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

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
    toolname: 'TestCourseManagementSystem',
  };

  const FUNCTION_COUNT = async (inputCond) => {
    try {
      const result = await StatLogService.FUNCTION_COUNT({ cond: inputCond });
      if (typeof result === 'string') {
        const formattedResponse = result.replace(
          /ToolExecCountResponse\((.*?)\)/g,
          (_, content) =>
            `{${content
              .split(', ')
              .map((pair) => {
                const [key, value] = pair.split('=');
                const formattedValue =
                  value === 'null' || !isNaN(value) ? value : `"${value}"`;
                return `"${key}":${formattedValue}`;
              })
              .join(', ')}}`
        );
        return JSON.parse(formattedResponse);
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const handleOnSelectTerm = (selectedTerm) => {
    setDateTerm(selectedTerm);
  };

  const handleReload = () => {
    setStartDate(null);
    setEndDate(null);
    setDateTerm(null);
    setHasSearched(false);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    try {
      setHasSearched(true);

      // Fetch execution count data
      const { result: searchedResult } = await FUNCTION_COUNT(requestData);
      if (searchedResult && Array.isArray(searchedResult)) {
        // Combine searchedResult with dateTerm
        const combinedResults = searchedResult.map((item) => ({
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
        {hasSearched && searchResults.length > 0 ? (
          <div className="mx-auto max-w-7xl flex justify-center items-center border border-black rounded-lg">
            <BarChart data={searchResults} />
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {hasSearched
              ? '검색되지 않음'
              : '조건을 설정한 후 조회 버튼을 눌러주세요.'}
          </p>
        )}
      </div>
    </div>
  );
}
