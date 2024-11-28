import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import ConfigurationTable from '../../components/tables/statTables/ConfigurationTable';

export default function Configuration() {
  const { t } = useTranslation();
  const location = useLocation();
  const initialData = location.state; // Retrieve initial data from location.state
  const [data, setData] = useState(initialData);

  const handleReload = () => {
    // Simulate reloading or fetching updated data
    const updatedData = location.state; // Replace this with actual data fetch if needed
    setData(updatedData);
    console.log('Data reloaded:', updatedData);
  };

  // Automatically reload data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleReload();
    }, 30000); // 30 seconds interval

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [location.state]);

  useEffect(() => {
    setData(initialData); // Initialize data on component mount
  }, [initialData]);

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/** 도구 설정 정보 변경 사항 */}
          {t('Configuration.TSIM')}
        </h1>
        <button
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
          onClick={handleReload}
        >
          <IoReloadSharp />
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }}
      >
        {data?.result?.length ? (
          <ConfigurationTable data={data.result} />
        ) : (
          <p>{t('Configuration.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
