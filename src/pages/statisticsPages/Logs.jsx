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
  const [timer, setTimer] = useState(30); // 30초 타이머

  /**
   * 타이머 로직
   * 타이머가 0에 도달하면 데이터를 자동으로 새로고침합니다
   */
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown); // 컴포넌트 언마운트 시 인터벌 정리
    } else {
      handleRefresh(); // 타이머가 0에 도달하면 데이터 새로고침 실행
    }
  }, [timer]);

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
    setData(initialData.result || []); // 새 데이터로 업데이트
  }, [location.state?.data]);

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
    setTimer(30); // Reset the timer on refresh
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
      (toolName === '전체' || item.toolname === toolName) && // 도구 이름 필터링
      (pcName === '전체' || item.pc === pcName) // PC 이름 필터링
  );

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }} // 페이지 높이 설정
    >
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 로그 확인 */}
          {t('Logs.ToolLogs')}
        </h1>
        <div className="flex items-center space-x-4">
          {/* 타이머 UI 표시 */}
          <div className="w-32 h-4 bg-gray-200 rounded border border-gray-500">
            <div
              className="h-full bg-blue-500 rounded border border-blue-500"
              style={{ width: `${(timer / 30) * 100}%` }} // 타이머 퍼센트 계산
            ></div>
          </div>
          <span className="text-gray-700">{timer}s</span> {/* 남은 시간 표시 */}
          <button
            onClick={handleRefresh} // 새로고침 버튼
            className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
          >
            <IoReloadSharp /> {/* 새로고침 아이콘 */}
          </button>
        </div>
      </div>

      {/* 데이터 테이블 섹션 */}
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 테이블 높이 설정
      >
        {filteredData?.length ? (
          // 필터링된 데이터가 있을 경우 테이블 렌더링
          <LogTable data={filteredData} />
        ) : (
          // 데이터가 없을 경우 "데이터 없음" 메시지 표시
          <p>{t('Logs.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
