import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import RealTimeUsageTable from '../../components/tables/statTables/RealTimeUsageTable';
import { LIVE_TC } from '../../components/StatRequestData'; // Import the API function

export default function RealTime() {
  const { t } = useTranslation();
  const [data, setData] = useState(null); // State to store the API response

  // Fetch data function
  const fetchData = async () => {
    const { result: response } = await LIVE_TC(); // Fetch data
    setData(response); // Set the data
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
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 p-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('RealTime.RealTimes')}
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
        <RealTimeUsageTable data={data} /> {/* Pass data as a prop */}
      </div>
    </div>
  );
}
