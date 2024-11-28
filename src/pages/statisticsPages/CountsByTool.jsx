import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LineChart from '../../components/D3Charts/LineChart';

export default function CountsByTool() {
  const { t } = useTranslation();
  const location = useLocation();
  const [data, setData] = useState(location.state || { result: [] });
  const [isLoading, setIsLoading] = useState(false);

  // 새로 고침 함수
  const handleReload = async () => {
    console.log('Refreshing data...', data);
    setIsLoading(true); // 로딩 상태 설정
    try {
      // 데이터 로드 (여기서는 location.state를 재사용)
      const refreshedData = location.state || { result: [] }; // 실제 API 요청으로 대체 가능
      setData(refreshedData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };

  // 새로 고침 시마다 데이터 로드 초기화
  useEffect(() => {
    setData(location.state || { result: [] });
  }, [location.state]);

  // 30초마다 자동 새로 고침
  useEffect(() => {
    const interval = setInterval(() => {
      handleReload();
    }, 30000); // 30초

    // 컴포넌트 언마운트 시 인터벌 정리
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
        {data?.result?.length ? (
          <LineChart data={data.result} groupBy="tools" />
        ) : (
          <p>{t('CountsByTool.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
