import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import ConfigurationTable from '../../components/tables/statTables/ConfigurationTable';

export default function Configuration() {
  const { t } = useTranslation();
  const location = useLocation();
  const initialData = location.state?.data || {};
  const pcName = location.state?.pcname || '전체';
  const toolName = (location.state?.toolname || '전체').toUpperCase();
  const [data, setData] = useState(initialData.result || []);

  const handleReload = () => {
    console.log('Reloading data...');
    // Simulate reloading or fetching updated data
    const updatedData = location.state?.data || {}; // Replace this with actual data fetch if needed
    setData(updatedData.result || []);
  };

  useEffect(() => {
    setData(initialData.result || []); // Initialize data on component mount
  }, [location.state?.data]); // Listen to changes in `data` only

  // Process data to remove spaces from toolname
  const processedData = data.map((item) => ({
    ...item,
    toolname: item.toolname.replace(/\s+/g, ''), // Remove spaces from toolname
  }));

  const filteredData = processedData.filter(
    (item) =>
      (toolName === '전체' || item.toolname === toolName) &&
      (pcName === '전체' || item.pc === pcName)
  );

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/*도구 설정 정보 변경 사항*/}
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
        {filteredData.length ? (
          <ConfigurationTable data={filteredData} />
        ) : (
          <p>{t('Configuration.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
