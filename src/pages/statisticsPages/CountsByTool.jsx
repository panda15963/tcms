import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LineChart from '../../components/D3Charts/LineChart';

export default function CountsByTool() {
  const { t } = useTranslation();
  const location = useLocation();

  // 초기 데이터 설정, 항상 배열로 보장
  const initialData = Array.isArray(location.state?.data?.result)
    ? location.state?.data?.result
    : [];
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const pcName = location.state?.pcname || '전체';

  console.log(pcName);

  // 데이터 필터링
  const filteredData = Array.isArray(data)
    ? data.filter((item) => pcName === '전체' || item.pc === pcName) // pcName이 전체면 필터링하지 않음
    : [];

  console.log('PC Name:', pcName);
  console.log('Filtered Data:', filteredData);

  // 새로고침 함수
  const handleReload = async () => {
    console.log('Refreshing data...', data);
    setIsLoading(true);
    try {
      // 데이터 새로고침 (여기서는 location.state를 재사용)
      const refreshedData = Array.isArray(location.state?.data?.result)
        ? location.state?.data?.result
        : [];
      setData(refreshedData); // 배열로만 설정
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 초기화 시 데이터 설정
  useEffect(() => {
    const newData = Array.isArray(location.state?.data?.result)
      ? location.state?.data?.result
      : [];
    setData(newData);
  }, [location.state]);

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      handleReload();
    }, 30000);
    return () => clearInterval(interval);
  }, [location.state]);

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {t('CountsByTool.CBT')}
        </h1>
        <button
          onClick={handleReload}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 border border-black rounded-lg shadow ${
            isLoading ? 'bg-gray-300' : 'bg-white'
          } text-gray-900`}
        >
          {isLoading ? (
            <span>{t('CountsByTool.Loading')}</span>
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
          <LineChart data={filteredData} groupBy="tools" />
        ) : (
          <p>{t('UsageCounts.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
