import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import BarChart from '../../components/D3Charts/BarChart';

export default function UsageCounts() {
  const { t } = useTranslation();
  const location = useLocation();
  const initialData = location.state?.data?.result || [];
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const pcName = location.state?.pcname || '전체';
  const toolName = location.state?.toolname || '전체';

  // 데이터를 처리하여 null toolname을 안전하게 처리
  const processedData = data.map((item) => ({
    ...item,
    toolname: item.toolname ? item.toolname.replace(/\s+/g, '') : '', // null toolname 처리
  }));

  const filteredData = processedData.filter(
    (item) =>
      (toolName === '전체' || item.toolname === toolName) &&
      (pcName === '전체' || item.pc === pcName)
  );

  // 새로 고침 함수
  const handleReload = async () => {
    setIsLoading(true);
    try {
      const refreshedData = location.state?.data?.result || []; // 데이터를 새로 가져옴
      setData(refreshedData);
    } catch (error) {
      console.error('데이터 새로 고침 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // `location.state` 변경 시 데이터 초기화
  useEffect(() => {
    setData(location.state?.data?.result || []); // 새 데이터로 설정
  }, [location.state]);

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/* 도구 기능별 사용 횟수 */}
          {t('UsageCounts.UsageCounts')}
        </h1>
        <button
          onClick={handleReload}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 border border-black rounded-lg shadow ${
            isLoading ? 'bg-gray-300' : 'bg-white'
          } text-gray-900`}
        >
          {isLoading ? (
            <span>{t('UsageCounts.Loading')}</span> // 로딩 중 텍스트 표시
          ) : (
            <IoReloadSharp />
          )}
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }}
      >
        {filteredData.length > 0 ? (
          <BarChart data={filteredData} />
        ) : (
          <p>{t('UsageCounts.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
