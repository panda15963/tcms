import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import StatGraphsLists from '../dropdowns/statMenus/StatGraphsLists'; // 통계 그래프 목록 컴포넌트
import { useTranslation } from 'react-i18next';
import CustomDatePicker from '../../components/calender/CustomDatePicker'; // 사용자 정의 날짜 선택기 컴포넌트
import DateTerms from '../../components/calender/DateTerms'; // 날짜 선택기 컴포넌트
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
  // 초기 날짜 설정
  const initialStartDate = new Date();
  initialStartDate.setDate(initialStartDate.getDate() - 7); // 1주 전 날짜로 설정
  const initialEndDate = new Date(); // 오늘 날짜로 설정

  const { t } = useTranslation(); // 다국어 번역을 위한 훅
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이트 훅

  // 상태 관리
  const [data, setData] = useState({ name: '' }); // 선택된 메뉴 데이터
  const [startDate, setStartDate] = useState(initialStartDate); // 시작 날짜
  const [endDate, setEndDate] = useState(initialEndDate); // 종료 날짜
  const [dateTerm, setDateTerm] = useState({
    id: 1,
    name: t('DateTerms.Day'), // 기본값은 '일 단위'
    value: 'day',
  });
  const [toolNames, setToolNames] = useState([]); // 도구 이름 목록
  const [pcNames, setPcNames] = useState([]); // PC 이름 목록
  const [selectedPC, setSelectedPC] = useState(null); // 선택된 PC
  const [selectedTool, setSelectedTool] = useState(null); // 선택된 도구
  const [resetTrigger, setResetTrigger] = useState(0); // 초기화 트리거

  // 메뉴 변경 시 검색 실행
  useEffect(() => {
    handleSearch();
  }, [data]);

  // 초기화 버튼 클릭 시 상태 초기화
  const handleReset = () => {
    setStartDate(initialStartDate); // 시작 날짜 초기화
    setEndDate(initialEndDate); // 종료 날짜 초기화
    setDateTerm({ id: 1, name: t('DateTerms.Day'), value: 'day' }); // 날짜 단위 초기화
    setResetTrigger((prev) => prev + 1); // 트리거 증가
  };

  // 날짜를 로컬 ISO 형식으로 변환
  const formatDateToLocalISO = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1 추가
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 특정 메뉴에서 버튼 비활성화 여부 결정
  const isDisabled =
    data?.name === 'TC 기반 도구 실시간 사용 현황' ||
    data?.name === '실시간 도구 사용 정보';

  // PC 이름 가져오기
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

  // 도구 이름 가져오기
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

  // 검색 실행
  const handleSearch = async () => {
    switch (data?.name) {
      case '도구 실행 횟수(도구 별)':
        // 도구 별 실행 횟수 요청 데이터 생성
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
            pcname: selectedPC?.name || '', // 선택된 PC 이름
            toolname: selectedTool?.name || '', // 선택된 도구 이름
          },
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
          state: {
            data: await EXECUTION_COUNT_VERSION(CountsByVersion),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
          },
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
          state: {
            data: await FUNCTION_COUNT(UsageCounts),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
          },
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
        navigate('logs', {
          state: {
            data: await TOOL_LOGS(Logs),
            pcname: selectedPC?.name || '',
            toolname: selectedTool?.name || '',
          },
        });
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
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto inset-x-0">
        <div className="relative scale-90 flex h-[52px] items-center justify-start gap-5">
          {/* 통계 메뉴 */}
          <div className="flex items-center space-x-2">
            <label className="rounded-md py-2 text-sm font-bold text-white">
              {t('StatNavBar.StatMenu')} {/* 통계 메뉴 라벨 */}
            </label>
            <div>
              <StatGraphsLists requestData={setData} /> {/* 통계 그래프 목록 */}
            </div>
          </div>

          {/* 조회 기간 */}
          <div
            className="flex items-center space-x-4"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
            }}
          >
            <DateTerms terms={setDateTerm} initialTerm={dateTerm} /> {/* 날짜 단위 */}
            <CustomDatePicker
              startsDate={setStartDate}
              endsDate={setEndDate}
              startDate={startDate}
              endDate={endDate}
            />
          </div>

          {/* 도구 선택 */}
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
              {t('StatNavBar.SelectTool')} {/* 도구 선택 라벨 */}
            </label>
            <ToolLists
              selectedTool={toolNames}
              setSelectedTool={setSelectedTool}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* PC 선택 */}
          <div
            className="flex items-center space-x-4"
            style={{
              opacity: isDisabled ? 0.5 : 1,
              pointerEvents: isDisabled ? 'none' : 'auto',
            }}
          >
            <label className="text-sm font-bold text-white">
              {t('StatNavBar.SelectPC')} {/* PC 선택 라벨 */}
            </label>
            <PCLists
              selectedPC={pcNames}
              setSelectedPC={setSelectedPC}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* 조회 및 초기화 버튼 */}
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
              {t('StatNavBar.Search')} {/* 조회 버튼 */}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded bg-white px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset"
              style={{
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto',
              }}
            >
              {t('StatNavBar.Reset')} {/* 초기화 버튼 */}
            </button>
          </div>
        </div>
      </div>
    </Disclosure>
  );
}