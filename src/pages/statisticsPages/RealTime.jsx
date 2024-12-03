import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoReloadSharp } from 'react-icons/io5';
import RealTimeUsageTable from '../../components/tables/statTables/RealTimeUsageTable';
import { LIVE_TC } from '../../components/StatRequestData';

export default function RealTime() {
  const { t } = useTranslation(); // 다국어 번역 훅
  const [data, setData] = useState(null); // 데이터 상태 관리

  /**
   * 데이터를 가져오는 함수
   * LIVE_TC API 호출 후 응답 데이터를 상태에 저장
   */
  const fetchData = async () => {
    const { result: response } = await LIVE_TC(); // LIVE_TC API 호출
    setData(response); // 응답 데이터를 상태에 설정
  };

  /**
   * 컴포넌트 마운트 시 초기 데이터 가져오기 및 30초 간격으로 자동 갱신 설정
   */
  useEffect(() => {
    fetchData(); // 컴포넌트가 처음 마운트될 때 데이터 가져오기
    const interval = setInterval(fetchData, 30000); // 30초마다 fetchData 호출

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  /**
   * 수동 새로고침 버튼 클릭 시 실행되는 핸들러
   */
  const handleReload = async () => {
    await fetchData(); // 수동으로 데이터 다시 가져오기 실행
  };

  return (
    <div
      className="flex flex-col items-center justify-start pt-20 bg-gray-100 p-8"
      style={{ height: '87.6vh' }} // 전체 화면 높이 설정
    >
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center w-10/12 max-w-full pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {/* TC 기반 도구 실시간 사용 현황 */}
          {t('RealTime.RealTimes')}
        </h1>
        <button
          onClick={handleReload} // 수동 새로고침 실행
          className="flex items-center px-4 py-2 border border-black bg-white text-gray-900 rounded-lg shadow"
        >
          <IoReloadSharp /> {/* 새로고침 아이콘 */}
        </button>
      </div>

      {/* 데이터 테이블 섹션 */}
      <div
        className="flex items-center justify-center w-10/12 max-w-full bg-white shadow-md rounded-lg p-4 border border-black"
        style={{ height: '60vh' }} // 테이블 높이 설정
      >
        <RealTimeUsageTable data={data} /> {/* 데이터를 props로 전달 */}
      </div>
    </div>
  );
}
