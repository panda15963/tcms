import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import BarChart from '../../components/D3Charts/BarChart';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';
import StatLogService from '../../service/StatLogService';

export default function UsageCounts() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateTerm, setDateTerm] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true); // Start loading
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
          {/** 도구 기능별 사용 횟수  */}
          {t('UsageCounts.UsageCounts')}
        </h1>
        <button
          onClick={handleReload}
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp className="mr-2" />
          {/** 새로 고침  */}
          {t('UsageCounts.Refresh')}
        </button>
      </div>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black">
        <div className="my-4 flex justify-center items-center gap-4">
          <DateTerms terms={handleOnSelectTerm} />
          <CustomDatePicker startsDate={setStartDate} endsDate={setEndDate} />
          <label className="text-sm font-bold">
            {/** 도구 선택 */}
            {t('UsageCounts.SelectTool')} :{' '}
          </label>
          <ToolLists />
          <label className="text-sm font-bold">
            {/** PC 선택 */}
            {t('UsageCounts.SelectPC')} :{' '}
          </label>
          <PCLists />
          <div className="relative border border-black rounded-lg">
            <button
              type="button"
              onClick={handleSearch}
              className="w-24 h-9 flex items-center justify-center cursor-pointer rounded-md bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
            >
              {/** 조회 */}
              {t('UsageCounts.Search')}
            </button>
          </div>
        </div>
        {searchResults.length > 0 ? (
          <div className="mx-auto max-w-7xl flex justify-center items-center border border-black rounded-lg">
            <BarChart data={searchResults} />
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {loading ? t('UsageCounts.Loading') : t('UsageCounts.NoDataFound')}
          </p>
        )}
      </div>
    </div>
  );
}
