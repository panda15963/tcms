import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import LogTable from '../../components/tables/statTables/LogsTable';

export default function Logs() {
  const { t } = useTranslation();
  const location = useLocation();

  // 기본값 설정: location.state가 없을 경우 대비
  const initialData = location.state?.data || {};
  const pcName = location.state?.pcname || '전체';
  const toolName = (location.state?.toolname || '전체');
  const [data, setData] = useState(initialData.result || []);
  console.log('Initial Data:', initialData);
  console.log('data:', data);

  // 컴포넌트가 처음 로드될 때 데이터 초기화
  useEffect(() => {
    if (Array.isArray(initialData.result)) {
      setData([...initialData.result]);
    } else {
      setData([]);
    }
  }, []);

  useEffect(() => {
    setData(initialData.result || []); // Initialize data on component mount
  }, [location.state?.data]); // Listen to changes in `data` only

  const handleRefresh = () => {
    // 데이터 새로고침 (실제 데이터 페치로 교체 가능)
    if (Array.isArray(location.state?.result)) {
      setData([...location.state.result]);
      console.log('Data refreshed');
    } else {
      console.log('No new data found, keeping existing data');
    }
  };

  // toolname에서 공백 제거 및 데이터 가공
  const processedData = Array.isArray(data)
    ? data.map((item) => ({
        ...item,
        toolname:
          typeof item.toolname === 'string'
            ? item.toolname.replace(/\s+/g, '')
            : '',
      }))
    : [];

  // pcName과 toolName 기준으로 데이터 필터링
  const filteredData = processedData.filter(
    (item) =>
      (toolName === '전체' || item.toolname === toolName) &&
      (pcName === '전체' || item.pc === pcName)
  );

  // 디버깅용 데이터 출력
  useEffect(() => {
    console.log('Filtered Data:', filteredData);
    console.log('Processed Data:', processedData);
  }, [filteredData, processedData]);

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 px-4 sm:px-6 lg:px-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-center pb-4 text-gray-900">
          {/*도구 로그 확인*/}
          {t('Logs.ToolLogs')}
        </h1>
        <button
          onClick={handleRefresh} // 새로고침 버튼
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp />
        </button>
      </div>
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 레이아웃 높이 조정
      >
        {filteredData?.length ? (
          <LogTable data={filteredData} />
        ) : (
          <p>{t('Logs.NoDataFound')}</p>
        )}
      </div>
    </div>
  );
}
