import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import StatGraphsLists from '../dropdowns/statMenus/StatGraphsLists';
import { useTranslation } from 'react-i18next';
import CustomDatePicker from '../../components/calender/CustomDatePicker';
import DateTerms from '../../components/calender/DateTerms';
import ToolLists from '../../components/dropdowns/statMenus/ToolLists';
import PCLists from '../../components/dropdowns/statMenus/PCLists';
import {
  EXECUTION_COUNT_TOOL,
  EXECUTION_COUNT_VERSION,
  FUNCTION_COUNT,
  TOOL_LOGS,
  TOOL_SETTINGS,
  TOOLNAMES,
  PCNAMES,
} from '../StatRequestData.js';

export default function StatTopMenuBar() {
  // Define initial dates
  const initialStartDate = new Date();
  initialStartDate.setDate(initialStartDate.getDate() - 7); // 1 week ago
  const initialEndDate = new Date(); // Today
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '' });
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [dateTerm, setDateTerm] = useState({
    id: 1,
    name: t('DateTerms.Day'),
    value: 'day',
  }); // Default to "Day"
  const [toolNames, setToolNames] = useState([]);
  const [pcNames, setPcNames] = useState([]);
  const [selectedPC, setSelectedPC] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // 도구 사용 현황 메뉴 변경할때 조회
  useEffect(() => {
    handleSearch();
  }, [data]);

  const handleReset = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setDateTerm({ id: 1, name: t('DateTerms.Day'), value: 'day' });
    setResetTrigger((prev) => prev + 1);
  };

  const formatDateToLocalISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDisabled =
    data?.name === 'TC 기반 도구 실시간 사용 현황' ||
    data?.name === '실시간 도구 사용 정보';

  const handleOnSelectTerm = (selectedTerm) => {
    setDateTerm(selectedTerm);
  };

  // Fetch PC names
  useEffect(() => {
    const fetchPCNames = async () => {
      try {
        setPcNames(await PCNAMES());
      } catch (error) {
        console.error('Error fetching PC Names:', error);
      }
    };
    fetchPCNames();
  }, []); // Empty dependency array ensures this runs once on mount

  // Fetch Tool names
  useEffect(() => {
    const fetchToolNames = async () => {
      try {
        setToolNames(await TOOLNAMES());
      } catch (error) {
        console.error('Error fetching Tool Names:', error);
      }
    };
    fetchToolNames();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSearch = async () => {
    switch (data?.name) {
      case '도구 실행 횟수(도구 별)':
        const countsByTool = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: 'tool',
          toolname: '',
          pcname: '',
        };
        navigate('countsByTool', {
          state: await EXECUTION_COUNT_TOOL(countsByTool),
        });
        break;

      case '도구 실행 횟수(버전 별)':
        const CountsByVersion = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: 'version',
          toolname: 'TestCourseManagementSystem',
          pcname: '',
        };
        navigate('countsByVersion', {
          state: await EXECUTION_COUNT_VERSION(CountsByVersion),
        });
        break;
      case '도구 기능별 사용 횟수':
        const UsageCounts = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname: 'TestCourseManagementSystem',
          pcname: '',
        };
        navigate('usageFunctionCounts', {
          state: await FUNCTION_COUNT(UsageCounts),
        });
        break;
      case '도구 로그 확인':
        const Logs = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname: '',
          pcname: '',
        };
        navigate('logs', { state: await TOOL_LOGS(Logs) });
        break;
      case '도구 설정 정보 변경 사항':
        const Configuration = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname: '',
          pcname: '',
        };
        navigate('configuration', {
          state: await TOOL_SETTINGS(Configuration),
        });
        break;
      default:
        break;
    }
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto inset-x-0">
        <div className="relative scale-90 flex h-[52px] items-center justify-start gap-5">
          {/* Stat Menu */}
          <div className="flex items-center space-x-2">
            <label className="rounded-md py-2 text-sm font-bold text-white">
              {/* 도구 사용 현황 메뉴 */}
              {t('StatNavBar.StatMenu')}
            </label>
            <div>
              <StatGraphsLists requestData={setData} />
            </div>
          </div>

          {/* Date Terms & Custom Date Picker */}
          {/* 조회 기간 */}
          <div
            className="flex items-center space-x-4"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
            }}
          >
            <DateTerms terms={setDateTerm} initialTerm={dateTerm} />
            <CustomDatePicker
              startsDate={setStartDate}
              endsDate={setEndDate}
              startDate={startDate} // Pass current startDate
              endDate={endDate} // Pass current endDate
            />
          </div>
          {/* Tool Lists */}
          <div
            className="flex items-center space-x-4"
            style={{
              opacity:
                data?.name === '도구 실행 횟수(도구 별)' ||
                data?.name === 'TC 기반 도구 실시간 사용 현황' ||
                data?.name === '실시간 도구 사용 정보'
                  ? 0.5
                  : 1,
              pointerEvents:
                data?.name === '도구 실행 횟수(도구 별)' ||
                data?.name === 'TC 기반 도구 실시간 사용 현황' ||
                data?.name === '실시간 도구 사용 정보'
                  ? 'none'
                  : 'auto',
            }}
          >
            <label className="text-sm font-bold text-white">
              {/* 도구 선택 */}
              {t('StatNavBar.SelectTool')}
            </label>
            <ToolLists
              selectedTool={toolNames}
              setSelectedTool={setSelectedTool}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* PC Lists */}
          <div
            className="flex items-center space-x-4"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
            }}
          >
            <label className="text-sm font-bold text-white">
              {/* PC 선택 */}
              {t('StatNavBar.SelectPC')}
            </label>
            <PCLists
              selectedPC={pcNames}
              setSelectedPC={setSelectedPC}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* Search Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="rounded bg-white px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
              onClick={handleSearch}
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              {/* 조회 */}
              {t('StatNavBar.Search')}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="rounded bg-white px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              {/* 초기화 */}
              {t('StatNavBar.Reset')}
            </button>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
