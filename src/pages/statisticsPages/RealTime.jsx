import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import RealTimeUsageTable from '../../components/tables/statTables/RealTimeUsageTable';
import { LIVE_TC } from '../../components/StatRequestData';

export default function RealTime() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);

  // 데이터 가져오기 함수
  const fetchData = async () => {
    const { result: response } = await LIVE_TC();
    setData(response); 
  };

  // 컴포넌트 마운트 시 데이터 가져오기 및 갱신을 위한 인터벌 설정
  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 30000); // 30초마다 데이터 가져오기

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, []);

  // 수동 새로고침 핸들러
  const handleReload = async () => {
    await fetchData(); // 수동으로 데이터 다시 가져오기 실행
  };

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 p-8"
      style={{ height: '87.6vh' }}
    >
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {/* TC 기반 도구 실시간 사용 현황 */}
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
        style={{ height: '60vh' }} // 선택사항: 더 나은 정렬을 위한 높이 조정
      >
        <RealTimeUsageTable data={data} /> {/* 데이터를 props로 전달 */}
      </div>
    </div>
  );
}
