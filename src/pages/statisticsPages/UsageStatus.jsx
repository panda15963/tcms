import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UsageStatusTable from '../../components/tables/statTables/UsageStatusTable';
import { IoReloadSharp } from 'react-icons/io5';
import { LIVE_TOOL } from '../../components/StatRequestData';

export default function UsageStatus() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  // Fetch data function
  const fetchData = async () => {
    const { result: response } = await LIVE_TOOL(); // Fetch data
    setData(response); // Set the LIVE_TOOL
  };

  // Fetch data on component mount and set up interval for refreshing
  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Fetch every 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Manual reload handler
  const handleReload = async () => {
    await fetchData(); // Manually trigger data reload
  };

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {/** 실시간 도구 사용 정보  */}
          {t('UsageInformation.ToolUsageInformation')}
        </h1>
        <button
          onClick={handleReload}
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp />
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // Optional: Adjust height for better alignment
      >
        <UsageStatusTable data={data} /> {/* Pass data as a prop */}
      </div>
    </div>
  );
}
