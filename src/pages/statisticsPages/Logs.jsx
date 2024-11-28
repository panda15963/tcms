import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LogTable from '../../components/tables/statTables/LogsTable';

export default function Logs() {
  const { t } = useTranslation();
  const location = useLocation();
  const [data, setData] = useState(location.state); // Use state to manage data

  const handleRefresh = () => {
    console.log('Refreshing data...', data);

    setData(null); // Clear data
    setTimeout(() => {
      setData(location.state); // Reset data to the initial state
    }, 500); // Simulate delay for refreshing
  };

  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
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
          {t('Logs.ToolLogs')}
        </h1>
        <button
          onClick={handleRefresh} // Attach manual refresh functionality
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp />
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // Optional: Adjust height for better alignment
      >
        {data?.result?.length ? (
          <LogTable data={data.result} />
        ) : (
          <p>{t('Logs.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
