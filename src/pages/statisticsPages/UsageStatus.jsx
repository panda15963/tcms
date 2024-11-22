import React, { useState, useEffect } from 'react';
import UsageStatusTable from '../../components/tables/statTables/UsageStatusTable';
import { IoReloadSharp } from 'react-icons/io5';
import StatLogService from '../../service/StatLogService';

export default function UsageStatus() {
  const [data, setData] = useState(null); // State to store the API response
  const [loading, setLoading] = useState(false); // State to manage loading indicator

  // Fetch data function
  const LIVE_TOOL = async () => {
    setLoading(true); // Start loading
    try {
      const result = await StatLogService.LIVE_TOOL();
      setData(result.result);
    } catch (error) {
      console.error('Error fetching live TC data:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  // UseEffect to fetch data on component mount
  useEffect(() => {
    LIVE_TOOL(); // Automatically fetch data on initial render
  }, []);

  // Manual reload handler
  const handleReload = () => {
    LIVE_TOOL();
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          실시간 도구 사용 정보
        </h1>
        <button
          onClick={handleReload}
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp className="mr-2" />
          새로 고침
        </button>
      </div>
      <div className="w-10/12 max-w-full bg-white shadow-md rounded-lg p-6 border border-black">
      {loading ? (
        <p className="text-gray-500">Loading...</p> // Show loading indicator
      ) : (
        <div className="border border-black rounded-lg">
          <UsageStatusTable data={data} /> {/* Pass data as a prop */}
        </div>
      )}
      </div>
    </div>
  );
}
