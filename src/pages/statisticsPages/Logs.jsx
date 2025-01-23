import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LogTable from '../../components/tables/statTables/LogsTable';

export default function Logs() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const location = useLocation(); // React Router로 전달된 위치 정보

  const initialData = location.state?.data || {}; // 기본값: 빈 객체
  const pcName = location.state?.pcname || '전체'; // PC 이름 (기본값: "전체")
  const toolName = location.state?.toolname || '전체'; // 도구 이름 (기본값: "전체")
  const [data, setData] = useState(initialData.result || []); // 데이터 상태 관리

  /**
   * 컴포넌트 마운트 시 초기 데이터 설정
   */
  useEffect(() => {
    if (Array.isArray(initialData.result)) {
      setData([...initialData.result]); // 배열 데이터 복사하여 설정
    } else {
      setData([]); // 기본값으로 빈 배열 설정
    }
  }, []);

  /**
   * location.state 데이터 변경 시 데이터 업데이트
   */
  useEffect(() => {
    try {
      if (location.state?.data?.result) {
        const newData = Array.isArray(location.state.data.result)
          ? location.state.data.result
          : [];
        setData(newData);
        // 데이터를 localStorage에 저장
        localStorage.setItem('countsByToolData', JSON.stringify(newData));
      } else {
        // localStorage에서 데이터 불러오기
        const savedData = localStorage.getItem('countsByToolData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setData(Array.isArray(parsedData) ? parsedData : []);
        } else {
          setData([]); // 기본 빈 배열로 설정
        }
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
      setData([]); // 오류가 발생해도 빈 배열로 초기화
    }
  }, [location.key]);

  /**
   * 새로고침 버튼 클릭 시 데이터 새로고침
   * 실제 데이터 페칭 로직으로 대체 가능
   */
  const handleRefresh = () => {
    if (Array.isArray(location.state?.result)) {
      setData([...location.state.result]); // 데이터 복사하여 업데이트
      console.log('Data refreshed'); // 새로고침 확인 로그
    } else {
      console.log('No new data found, keeping existing data'); // 데이터 없음 로그
    }
  };

  /**
   * toolname에서 공백 제거 및 데이터 가공
   */
  const processedData = Array.isArray(data)
    ? data.map((item) => ({
        ...item,
        toolname:
          typeof item.toolname === 'string'
            ? item.toolname.replace(/\s+/g, '') // toolname에서 공백 제거
            : '',
      }))
    : [];

  /**
   * pcName과 toolName을 기준으로 데이터 필터링
   */
  const filteredData = processedData.filter(
    (item) =>
      (toolName === '전체' || pcName === 'All' || item.toolname === toolName) && // "전체" 또는 일치하는 도구 이름
      (pcName === '전체' || pcName === 'All' || item.pc === pcName) // "전체" 또는 일치하는 PC 이름
  );

  return (
    <div className="flex flex-col items-center justify-start py-20 border-spacing-4 px-4 sm:px-6 lg:px-8 h-[calc(100vh-102px)] z-[1]">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 로그 확인 */}
          {t('Logs.ToolLogs')}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh} // 새로고침 버튼
            className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
          >
            <IoReloadSharp /> {/* 새로고침 아이콘 */}
          </button>
        </div>
      </div>

      {/* 데이터 테이블 섹션 */}
      <div className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black h-[60vh]">
        <LogTable data={filteredData} />
      </div>
    </div>
  );
}
