import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LineChart from '../../components/D3Charts/LineChart';

export default function CountsByVersion() {
  const { t } = useTranslation();
  const location = useLocation();
  const data = location.state || { result: [] };

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {t('CountsByVersion.CBV')}
        </h1>
        <button className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow">
          <IoReloadSharp />
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // Optional: Adjust height for better alignment
      >
        {data?.result?.length ? (
          <LineChart data={data.result} groupBy="versions" />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}
