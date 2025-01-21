import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import StatGraphsLists from '../dropdowns/statMenus/StatGraphsLists'; // 통계 그래프 목록 컴포넌트
import { useTranslation } from 'react-i18next';
import CustomDatePicker from '../../components/calender/CustomDatePicker'; // 사용자 정의 날짜 선택기 컴포넌트
import ToolLists from '../../components/dropdowns/statMenus/ToolLists'; // 도구 선택 목록 컴포넌트
import PCLists from '../../components/dropdowns/statMenus/PCLists'; // PC 선택 목록 컴포넌트
import {
  EXECUTION_COUNT_TOOL,
  EXECUTION_COUNT_VERSION,
  FUNCTION_COUNT,
  TOOL_LOGS,
  TOOL_SETTINGS,
  TOOLNAMES,
  PCNAMES,
} from '../StatRequestData.js'; // 통계 요청 데이터 함수들 가져오기

export default function StatTopMenuBar() {
  const initialStartDate = new Date();
  initialStartDate.setDate(initialStartDate.getDate() - 7);
  const initialEndDate = new Date();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const defaultData = {
    id: 1,
    name: '도구 실행 횟수(도구 별)',
    link: '/countsByTool',
  };
  const [data, setData] = useState({ name: '' });
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [toolNames, setToolNames] = useState([]);
  const [pcNames, setPcNames] = useState([]);
  const [selectedPC, setSelectedPC] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [specialToolName, setSpecialToolName] = useState('');
  const dateRange = useMemo(() => {
    if (!startDate || !endDate) return { days: 0, weeks: 0 };

    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.ceil(diffDays / 7);

    return { days: diffDays, weeks: diffWeeks };
  }, [startDate, endDate]);

  const dateTerm =
    dateRange.weeks >= 52
      ? { id: 2, name: t('DateTerms.Month'), value: 'month' }
      : dateRange.days >= 60
      ? { id: 3, name: t('DateTerms.Week'), value: 'week' }
      : { id: 1, name: t('DateTerms.Day'), value: 'day' };

  useEffect(() => {
    // 페이지 이동 시 항상 기본값으로 설정
    if (location.pathname !== defaultData.link) {
      setData(defaultData);
    }
  }, []);

  useEffect(() => {
    if (data?.name) {
      handleSearch();
    }
  }, [data?.name]);

  const handleReset = () => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setResetTrigger((prev) => prev + 1);
  };

  const formatDateToLocalISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDisabled =
    data?.name === t('StatNavBar.TUSRT') ||
    data?.name === t('StatNavBar.RTTUI');

  useEffect(() => {
    const fetchPCNames = async () => {
      try {
        setPcNames(await PCNAMES());
      } catch (error) {
        console.error('Error fetching PC Names:', error);
      }
    };
    fetchPCNames();
  }, []);

  useEffect(() => {
    const fetchToolNames = async () => {
      try {
        setToolNames(await TOOLNAMES());
      } catch (error) {
        console.error('Error fetching Tool Names:', error);
      }
    };
    fetchToolNames();
  }, []);

  const handleSearch = useCallback(async () => {
    switch (data?.name) {
      /* 도구 실행 횟수(도구 별) */
      case t('StatNavBar.TECT'):
        const countsByTool = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: 'tool',
          toolname: '',
          pcname: '',
        };
        navigate('countsByTool', {
          state: {
            data: await EXECUTION_COUNT_TOOL(countsByTool),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
            dateTerm: dateTerm.name || '',
          },
        });
        break;
      /* 도구 실행 횟수(버전 별) */
      case t('StatNavBar.TECV'):
        const CountsByVersion = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: 'version',
          toolname:
            specialToolName?.name === '전체' || specialToolName?.name === 'All'
              ? 'TestCourseManagementSystem'
              : specialToolName?.name || '',
          pcname: '',
        };
        navigate('countsByVersion', {
          state: {
            data: await EXECUTION_COUNT_VERSION(CountsByVersion),
            pcname: selectedPC?.name || '',
            toolname: CountsByVersion.toolname,
            dateTerm: dateTerm?.name || '',
          },
        });
        break;
      /* 도구 기능별 사용 횟수 */
      case t('StatNavBar.TUCF'):
        const UsageCounts = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname:
            specialToolName?.name === '전체' ||
            specialToolName?.name === 'All' ||
            specialToolName?.name === undefined
              ? 'TestCourseManagementSystem'
              : specialToolName?.name || '',
          pcname:
            selectedPC?.name === '전체' || selectedPC?.name === 'All'
              ? ''
              : selectedPC?.name || '',
        };
        navigate('usageFunctionCounts', {
          state: {
            data: await FUNCTION_COUNT(UsageCounts),
            pcname: UsageCounts?.pcname || '',
            toolname: specialToolName?.name || '',
            dateTerm: dateTerm?.name || '',
          },
        });
        break;
      /* 도구 로그 확인 */
      case t('StatNavBar.CTL'):
        const Logs = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname: '',
          pcname: '',
        };
        navigate('logs', {
          state: {
            data: await TOOL_LOGS(Logs),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
          },
        });
        break;
      /* 도구 설정 정보 변경 사항 */
      case t('StatNavBar.TCIC'):
        const Configuration = {
          interval: dateTerm?.value || '',
          starttime: startDate ? formatDateToLocalISO(startDate) : '',
          endtime: endDate ? formatDateToLocalISO(endDate) : '',
          by: '',
          toolname: '',
          pcname: '',
        };
        navigate('configuration', {
          state: {
            data: await TOOL_SETTINGS(Configuration),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
          },
        });
        break;

      default:
        break;
    }
  }, [data, startDate, endDate, selectedPC, selectedTool]);

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto inset-x-0">
        <div className="relative scale-90 flex h-[52px] z-40 items-center justify-start gap-5">
          {/* 통계 메뉴 */}
          <div className="flex items-center h-[52px] space-x-2">
            <label
              className="rounded-md py-2 text-sm font-bold text-white"
              style={{ userSelect: 'none' }} // 드래그 방지
            >
              {t('StatNavBar.StatMenu')}
            </label>
            <div>
              <StatGraphsLists requestData={setData} />
            </div>
          </div>

          {/* 조회 기간 */}
          <div
            className="flex items-center h-[52px] space-x-4 cursor-default"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
              userSelect: 'none', // 부모 요소 드래그 방지
            }}
          >
            {/* 조회 기간 레이블 */}
            <div style={{ userSelect: 'none' }}>
              <span className="text-sm font-semibold text-white">
                {t('DateTerms.DatePeriod')}
              </span>
            </div>

            {/* CustomDatePicker 드래그 방지 */}
            <div style={{ userSelect: 'none' }}>
              <CustomDatePicker
                startsDate={setStartDate}
                endsDate={setEndDate}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>
          {/* 도구 선택 */}
          <div
            className="flex items-center h-[52px] space-x-4"
            style={{
              opacity:
                data?.name === t('StatNavBar.TECT') ||
                data?.name === t('StatNavBar.TCIC') ||
                data?.name === t('StatNavBar.RTTUI') ||
                data?.name === t('StatNavBar.TUSRT')
                  ? 0.5
                  : 1,
              pointerEvents:
                data?.name === t('StatNavBar.TECT') ||
                data?.name === t('StatNavBar.TCIC') ||
                data?.name === t('StatNavBar.RTTUI') ||
                data?.name === t('StatNavBar.TUSRT')
                  ? 'none'
                  : 'auto',
              userSelect: 'none', // 드래그 방지
            }}
          >
            <label
              className="text-sm font-bold text-white"
              style={{ userSelect: 'none' }}
            >
              {t('StatNavBar.SelectTool')}
            </label>
            <ToolLists
              selectedTool={toolNames}
              setSelectedTool={setSelectedTool}
              resetTrigger={resetTrigger}
              pageData={data?.name || ''}
              selectedToolName={setSpecialToolName}
            />
          </div>

          {/* PC 선택 */}
          <div
            className="flex items-center h-[52px] space-x-4"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
              userSelect: 'none', // 드래그 방지
            }}
          >
            <label
              className="text-sm font-bold text-white"
              style={{ userSelect: 'none' }}
            >
              {t('StatNavBar.SelectPC')}
            </label>
            <PCLists
              selectedPC={pcNames}
              setSelectedPC={setSelectedPC}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* 조회 및 초기화 버튼 */}
          <div className="flex items-center h-[52px] space-x-4">
            <button
              type="button"
              className="rounded bg-white px-2 cursor-default py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
              onClick={handleSearch}
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
                userSelect: 'none', // 드래그 방지
              }}
            >
              {t('StatNavBar.Search')}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded bg-white px-2 py-2 text-sm cursor-default font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
                userSelect: 'none', // 드래그 방지
              }}
            >
              {t('StatNavBar.Reset')}
            </button>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}
